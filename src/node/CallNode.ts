import { Node } from "../Node.js";
import { ParserFrame } from "../ParserFrame.js";
import { Constant } from "../Constant.js";
import { ConstantNode } from "./ConstantNode.js";
import { ArrayNode } from "./ArrayNode.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";

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
			this.throwError(`function ${this._fnode.type} does not take ${this._subnodes.length} arguments)`);
		}
		this._type = Type.union(...functionAtoms.map((i)=> i.retType));
	}

	override get type(): Type {
		return this._type;
	}

	override compile(type: Type): Node {
		this._fnode = this._fnode.compile(this._fnode.type);
		const functionAtoms = this._fnode.type.functionAtoms(type, this._subnodes.length);
		if (!functionAtoms.length) {
			this.throwError(`function ${this._fnode.type} does not take ${this._subnodes.length} arguments returning ${type})`);
		}
		this._type = Type.union(...functionAtoms.map((i)=> i.retType));
		/*
		if (this._subnodes.length < functionAtoms.minArity) {
			this.throwError(`function requires at least ${functionAtoms.minArity} arguments not ${this._subnodes.length}`);
		}
		if (this._subnodes.length > functionAtoms.maxArity) {
			this.throwError(`function requires at most ${functionAtoms.maxArity} arguments not ${this._subnodes.length}`);
		}
		*/
		if (this._fnode.constant) {
			let constant = true;
			for (let i = 0; i < this._subnodes.length; ++i) {
				const argType = Type.union(...functionAtoms.map((a)=> a.argType(i)));
				this._subnodes[i] = this._subnodes[i].compile(argType);
				constant &&= this._subnodes[i].constant;
			}
			return constant ? new ConstantNode(this, new Constant(this.evaluate(), this.type)) : this;
		}
		const arity = functionAtoms.filter((i)=> i.isVariadic).map((i)=> i.arity).reduce((acc, val)=> Math.max(acc, val), 0);
		if (arity > 0) {
			const frame = this._subnodes[arity - 1].starts();
			this._subnodes = this._subnodes.slice(0, arity - 1).concat(new ArrayNode(
				frame.ends(this._subnodes[this._subnodes.length - 1]),
				this._subnodes.slice(arity - 1)
			));
		}
		return this;
	}

	override evaluate(): Value {
		const func = (this._fnode.evaluate() as (...values: any[])=> Value);
		if (typeof func !== "function") {
			this.throwError(`function expected not ${Type.of(func)}`);
		}
		return func(...this._subnodes.map((node)=> node.evaluate()));
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map((s)=> s.toString(ident + 1)).join("\n");
		return `${super.toString(ident)} call node fnode:\n${this._fnode.toString(ident + 1)}\n`
			+ `${super.toString(ident)} call node subnodes:\n${subnodes}`;
	}

}
