import { Node } from "../Node.js";
import { ScriptSpan } from "../ScriptSpan.js";
import { Constant } from "../Constant.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class ConstantNode extends Node {

	constructor(
		span: ScriptSpan,
		protected readonly _constant: Constant,
		protected _subnode?: Node,
		protected readonly _factory?: (frame: CallFrame) => Value,
	) {
		super(span);
	}

	override get type(): Type {
		return this._constant.type;
	}

	override compile(type: Type): Node {
		this._constant.type = this.reduceType(type);
		this._subnode = this._subnode?.compile(this._constant.type.functionAtomRetType(type));
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		return this._factory ? this._factory(frame) : this._constant.value;
	}

	override get constant(): boolean {
		return !this._factory && !this._subnode && this._constant.deterministic;
	}

	override toString(ident: number = 0): string {
		return this._subnode
			? `${super.toString(ident)} constant node subnode:\n${this._subnode.toString(ident + 1)}`
			: `${super.toString(ident)} constant node`;
	}

}
