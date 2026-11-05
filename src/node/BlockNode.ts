import { Node } from "../Node.js";
import { ScriptSpan } from "../ScriptSpan.js";
import { Constant } from "../Constant.js";
import { ConstantNode } from "./ConstantNode.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";
import { Variable } from "../Variable.js";

export class BlockNode extends Node {

	constructor(
		span: ScriptSpan,
		protected _subnodes: Node[],
		protected readonly _variables: Variable[] = [],
	) {
		super(span);
	}

	override get type(): Type {
		return this._subnodes.length ? this._subnodes[this._subnodes.length - 1].type : Type.Void;
	}

	override compile(type: Type): Node {
		if (this._subnodes.length === 0) {
			this.reduceType(type);
			return new ConstantNode(this, Constant.Null);
		}
		let constant = true;
		for (let i = 0, last = this._subnodes.length - 1; i < this._subnodes.length; ++i) {
			this._subnodes[i] = this._subnodes[i].compile(i < last ? Type.Unknown : type);
			constant &&= this._subnodes[i].constant;
		}
		if (constant) {
			return new ConstantNode(this, new Constant(this.evaluate(new CallFrame()), this.type));
		}
		if (this._subnodes.length === 1 && this._variables.length === 0) {
			return this._subnodes[0];
		}
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		const subframe = this._variables.length ? frame.subframe(this._variables) : frame;
		let result: Value = undefined;
		for (const subnode of this._subnodes) {
			result = subnode.evaluate(subframe);
		}
		return result;
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map((s) => s.toString(ident + 1)).join("\n");
		return `${super.toString(ident)} block node subnodes:\n${subnodes}`;
	}

}
