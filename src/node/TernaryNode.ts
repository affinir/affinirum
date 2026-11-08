import { Node } from "./Node.js";
import { Constant } from "../Constant.js";
import { ConstantNode } from "./ConstantNode.js";
import { ScriptSpan } from "../ScriptSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class TernaryNode extends Node {

	protected _type: Type;

	constructor(
		span: ScriptSpan,
		protected _cnode: Node,
		protected _subnodes: Node[],
	) {
		super(span);
		if (_subnodes.length !== 2) {
			this.throwError(`switch requires 2 subnodes not ${_subnodes.length}`);
		}
		this._type = Type.union(...this._subnodes.map((i) => i.type));
	}

	override get type(): Type {
		return Type.union(...this._subnodes.map((i) => i.type));
	}

	override compile(type: Type): Node {
		this._cnode = this._cnode.compile(Type.Boolean);
		this._type = type;
		let constant = this._cnode.constant;
		for (let i = 0; i < this._subnodes.length; ++i) {
			this._subnodes[i] = this._subnodes[i].compile(type);
			constant &&= this._subnodes[i].constant;
		}
		if (constant) {
			return new ConstantNode(this, new Constant(this.evaluate(new CallFrame()), this.type));
		}
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		return this._cnode.evaluate(frame)
			? this._subnodes[0].evaluate(frame)
			: this._subnodes[1].evaluate(frame);
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map((s) => s.toString(ident + 1)).join("\n");
		return `${super.toString(ident)} switch node cnode:\n${this._cnode.toString(ident + 1)}\n`
			+ `${super.toString(ident)} switch node subnodes:\n${subnodes}`;
	}

}
