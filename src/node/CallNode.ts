import { Node } from "../Node.js";
import { ParserFrame } from "../ParserFrame.js";
import { Constant } from "../Constant.js";
import { ConstantNode } from "./ConstantNode.js";
import { ArrayNode } from "./ArrayNode.js";
import { Value, normalize } from "../Value.js";
import { Type } from "../Type.js";
import { JumpException } from "../JumpException.js";

export class CallNode extends Node {

	protected _type: Type;

	constructor(
		frame: ParserFrame,
		protected _fnode: Node,
		protected _subnodes: Node[],
	) {
		super(frame);
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
		let functionAtoms = functionAtoms_.filter((atom) => !atom.isVariadic);
		if (!functionAtoms.length || !this._subnodes.every((node, index) =>
			node.type.intersect(Type.union(...functionAtoms.map((atom) => atom.paramType(index) ?? Type.Unknown)))
		)) {
			functionAtoms = functionAtoms_.filter((atom) => atom.isVariadic);
		}
		if (!functionAtoms.length || !this._subnodes.every((node, index) =>
			node.type.intersect(Type.union(...functionAtoms.map((atom) => atom.paramType(index) ?? Type.Unknown)))
		)) {
			this.throwError(`value of type ${this._fnode.type} cannot be called with ${this._subnodes.length} argument(s) and return a type compatible with ${type}`);
		}
		this._type = Type.union(...functionAtoms.map((i) => i.retType));
		const arity = functionAtoms[0].isVariadic
			? Math.max(...functionAtoms.map((atom) => atom.arity))
			: 0;
		if (arity > 0) {
			const frame = this._subnodes[arity - 1].starts();
			const vnodes = this._subnodes.splice(arity - 1);
			this._subnodes.push(new ArrayNode(frame.ends(vnodes[vnodes.length - 1]), vnodes));
		}
		let constant = this._fnode.constant;
		for (let i = 0; i < this._subnodes.length; ++i) {
			const argTypes = functionAtoms.map((a) => a.argType(i));
			const argType = Type.union(...argTypes.filter((t) => t != null));
			this._subnodes[i] = this._subnodes[i].compile(argType);
			constant &&= this._subnodes[i].constant;
		}
		if (constant) {
			return new ConstantNode(this, new Constant(this.evaluate(), this.type));
		}
		return this;
	}

	override evaluate(): Value {
		const func = this._fnode.evaluate() as (...values: any[]) => Value;
		if (typeof func !== "function") {
			this.throwError(`function expected not ${Type.of(func)}`);
		}
		try {
			return normalize(func(...this._subnodes.map((node) => node.evaluate())));
		}
		catch (e) {
			if (e instanceof JumpException) {
				if (e.jump === "return") {
					return normalize(e.value);
				}
				if (e.jump === "stop" || e.jump === "next") {
					throw this.throwError(`unexpected ${e.jump} jump`);
				}
			}
			throw e;
		}
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map((s) => s.toString(ident + 1)).join("\n");
		return `${super.toString(ident)} call node fnode:\n${this._fnode.toString(ident + 1)}\n`
			+ `${super.toString(ident)} call node subnodes:\n${subnodes}`;
	}

}
