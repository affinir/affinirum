import { Node } from "./Node.js";
import { ScriptSpan } from "../ScriptSpan.js";
import { Constant } from "../Constant.js";
import { ConstantNode } from "./ConstantNode.js";
import { ArrayNode } from "./ArrayNode.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class CallNode extends Node {

	protected _type: Type;

	constructor(
		span: ScriptSpan,
		protected _fnode: Node,
		protected _subnodes: Node[],
	) {
		super(span);
		const functionAtoms = this._fnode.type.functionAtoms(Type.Unknown, this._subnodes.length);
		if (!functionAtoms.length) {
			this.throwError(`value of type ${this._fnode.type} cannot be called with ${this._subnodes.length} argument(s)`);
		}
		this._type = Type.union(...functionAtoms.map((i) => i.retType));
	}

	override get type(): Type {
		return this._type;
	}

	override compile(type: Type): Node {
		this._fnode = this._fnode.compile(this._fnode.type);
		const functionAtoms_ = this._fnode.type.functionAtoms(type, this._subnodes.length);
		let functionAtoms = functionAtoms_.filter((atom) =>
			!atom.isVariadic && this._subnodes.every((node, index) =>
				node.type.intersect(atom.paramType(index) ?? Type.Unknown)
			)
		);
		if (!functionAtoms.length) {
			functionAtoms = functionAtoms_.filter((atom) =>
				atom.isVariadic && this._subnodes.every((node, index) =>
					node.type.intersect(atom.paramType(index) ?? Type.Unknown)
				)
			);
		}
		if (!functionAtoms.length) {
			this.throwError(`value of type ${this._fnode.type} cannot be called with ${this._subnodes.length} argument(s) and return a type compatible with ${type}`);
		}
		this._type = Type.union(...functionAtoms.map((i) => i.retType));
		const variadicArity = functionAtoms[0].isVariadic
			? Math.max(...functionAtoms.map((atom) => atom.arity))
			: 0;
		if (variadicArity > 0) {
			const span = this._subnodes[variadicArity - 1].start();
			const vnodes = this._subnodes.splice(variadicArity - 1);
			this._subnodes.push(new ArrayNode(span.end(vnodes[vnodes.length - 1]), vnodes));
		}
		let constant = this._fnode.constant && !this._fnode.type.isVolatile;
		for (let i = 0; i < this._subnodes.length; ++i) {
			const argTypes = functionAtoms.map((a) => a.argType(i));
			const argType = variadicArity > 0 && i === variadicArity - 1
				? Type.arrayType([Type.union(...functionAtoms.map((a) => a.paramType(i) ?? Type.Unknown))])
				: Type.union(...argTypes.filter((t) => t != null));
			this._subnodes[i] = this._subnodes[i].compile(argType);
			constant &&= this._subnodes[i].constant;
		}
		if (constant && !this.type.intersect(Type.Reference)) {
			return new ConstantNode(this, new Constant(this.evaluate(new CallFrame()), this.type));
		}
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		const func = this._fnode.evaluate(frame) as (...values: any[]) => Value;
		if (typeof func !== "function") {
			this.throwError(`function expected not ${Type.of(func)}`);
		}
		return func(...this._subnodes.map((node) => node.evaluate(frame)));
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map((s) => s.toString(ident + 1)).join("\n");
		return `${super.toString(ident)} call node fnode:\n${this._fnode.toString(ident + 1)}\n`
			+ `${super.toString(ident)} call node subnodes:\n${subnodes}`;
	}

}
