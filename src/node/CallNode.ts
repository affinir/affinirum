import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { Constant } from "../Constant.js";
import { ConstantNode } from "./ConstantNode.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class CallNode extends Node {

	protected _type: Type;

	constructor(
		span: ParserSpan,
		protected _fnode: Node,
		protected _subnodes: Node[],
	) {
		super(span);
		const argc = this._subnodes.length;
		const signatures = this._fnode.type.functionAtoms().flatMap((atom) =>
			atom.signatures
		).filter((signature) =>
			signature.minArity <= argc && argc <= signature.maxArity
		);
		if (!signatures.length) {
			this.throwError(`value of type ${this._fnode.type} cannot be called with ${argc} argument(s)`);
		}
		this._type = Type.union(...signatures.map((signature) => signature.retType));
	}

	override get type(): Type {
		return this._type;
	}

	override compile(): Node {
		this._fnode = this._fnode.compile(Type.Function);
		const functionType = this._fnode.type;
		const functionAtoms = functionType.functionAtoms();
		const singleSignature = functionType.isAtom && functionAtoms[0]?.signatures.length === 1;
		const strictArguments = functionAtoms.length > 1 || singleSignature && !(this._fnode instanceof ConstantNode);
		const argc = this._subnodes.length;
		let signatures = functionAtoms.flatMap((atom) => atom.signatures)
			.filter((signature) => signature.minArity <= argc && argc <= signature.maxArity);
		let hints = signatures.filter((signature) =>
			this._subnodes.every((node, index) => node.type.isNever || node.type.intersect(signature.paramType(index) ?? Type.Unknown))
		);
		const compiledArgTypes: Type[] = [];
		let constant = this._fnode.constant && !this._fnode.type.isVolatileFunction;
		for (let i = 0; i < argc && signatures.length; ++i) {
			const hint = Type.union(...(hints.length ? hints : signatures).map((signature) => signature.paramType(i) ?? Type.Unknown));
			this._subnodes[i] = this._subnodes[i].compile(hint);
			const compiledArgType = this._subnodes[i].type;
			compiledArgTypes.push(compiledArgType);
			constant &&= this._subnodes[i].constant;
			signatures = signatures.filter((signature) => {
				const parameterType = signature.paramType(i) ?? Type.Unknown;
				return compiledArgType.isNever || (strictArguments
					? this._subnodes[i].acceptType(parameterType)
					: compiledArgType.intersect(parameterType));
			});
			hints = hints.filter((signature) => signatures.includes(signature));
		}
		const never = this._fnode.type.isNever || compiledArgTypes.some((type) => type.isNever);
		signatures = signatures.filter((signature) => {
			const index = signature.isVariadic ? signature.arity - 1 : -1;
			if (never || index < 0) {
				return true;
			}
			const args = Type.arrayType(compiledArgTypes.slice(index));
			const tail = signature.argType(index) ?? Type.Unknown;
			return functionAtoms.length > 1 ? tail.accept(args) : args.intersect(tail);
		});
		const matchesEveryFunction = functionAtoms.every((atom) => atom.signatures.some((signature) => signatures.includes(signature)));
		if (!signatures.length || !never && !matchesEveryFunction) {
			this.throwError(`value of type ${this._fnode.type} cannot be called with ${argc} argument(s)`);
		}
		for (let i = 0; i < argc; ++i) {
			const node = this._subnodes[i];
			const parameterType = Type.union(...signatures.map((signature) => signature.paramType(i) ?? Type.Unknown));
			if (parameterType.accept(node.type)) {
				node.validateType(parameterType);
			}
		}
		this._type = never ? Type.Never : Type.union(...signatures.map((signature) => signature.retType));
		if (constant && !this.type.intersect(Type.Reference)) {
			return new ConstantNode(this, new Constant(this.evaluate(new CallFrame()), this.type));
		}
		return this;
	}

	override evaluate(frame: CallFrame, values?: readonly Value[]): Value {
		const func = this._fnode.evaluate(frame) as (...values: any[]) => Value;
		if (typeof func !== "function") {
			this.throwError(`function expected not ${Type.of(func)}`);
		}
		const result = func(...this._subnodes.map((node, index) =>
			values && index < values.length ? values[index] : node.evaluate(frame)
		));
		return frame.define(result, this.type);
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map((s) => s.toString(ident + 1)).join("\n");
		return `${super.toString(ident)} call node fnode:\n${this._fnode.toString(ident + 1)}\n`
			+ `${super.toString(ident)} call node subnodes:\n${subnodes}`;
	}

}
