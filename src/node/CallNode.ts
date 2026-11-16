import { Node } from "./Node.js";
import { InvocationNode } from "./InvocationNode.js";
import { ParserSpan } from "../ParserSpan.js";
import { Constant } from "../Constant.js";
import { ConstantNode } from "./ConstantNode.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class CallNode extends InvocationNode {

	protected _fnode: Node;
	protected _subnodes: Node[];
	protected readonly _optional: boolean;
	protected _type: Type;

	constructor(
		span: ParserSpan,
		fnode: Node,
		subnodes: Node[],
		optional: boolean = false,
	) {
		super(span);
		this._fnode = fnode;
		this._subnodes = subnodes;
		this._optional = optional;
		const argc = subnodes.length;
		const signatures = fnode.type.functionAtoms().flatMap((atom) =>
			atom.signatures
		).filter((signature) =>
			signature.minArity <= argc && argc <= signature.maxArity
		);
		if (!signatures.length) {
			this.throwError(`value of type ${fnode.type} cannot be called with ${argc} argument(s)`);
		}
		this._type = Type.union(...signatures.map((signature) => signature.retType));
	}

	override get type(): Type {
		return this._type;
	}

	override compile(type = Type.Unknown): Node {
		this._fnode = this._fnode.compile(Type.Function);
		this._type = this.compileArguments(this._optional ? this._optionalType(this._fnode.type) : this._fnode.type, this._subnodes);
		super.compile(type);
		if (this._fnode.constant && !this._fnode.type.isVolatileFunction
			&& this._subnodes.every((node) => node.constant) && !this.type.intersects(Type.Reference)) {
			return new ConstantNode(this, new Constant(this.evaluate(new CallFrame()), this.type));
		}
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		const func = this._fnode.evaluate(frame);
		if (typeof func !== "function") {
			this.throwError(`function expected not ${Type.of(func)}`);
		}
		const args = this._subnodes.map((node) => node.evaluate(frame));
		return this._optional && args[0] == null ? undefined : frame.define(func(...args), this.type);
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map((s) => s.toString(ident + 1)).join("\n");
		return `${super.toString(ident)} call node fnode:\n${this._fnode.toString(ident + 1)}\n`
			+ `${super.toString(ident)} call node subnodes:\n${subnodes}`;
	}

	protected _optionalType(type: Type): Type {
		return Type.union(...type.functionAtoms().map((atom) => Type.functionType(
			atom.signatures.map((signature) => {
				const argTypes = [...signature.argTypes];
				if (signature.isVariadic && signature.arity === 1) {
					argTypes.unshift(argTypes[0].arrayAtomValType().toOptional());
				}
				else if (argTypes.length) {
					argTypes[0] = argTypes[0].toOptional();
				}
				return [signature.retType.toOptional(), argTypes, signature.isVariadic];
			}),
			atom.isVolatile,
		)));
	}

}
