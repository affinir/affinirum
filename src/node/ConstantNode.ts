import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { Constant } from "../Constant.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class ConstantNode extends Node {

	constructor(
		span: ParserSpan,
		protected readonly _constant: Constant,
	) {
		super(span);
	}

	get value(): Value {
		return this._constant.value;
	}

	override get type(): Type {
		return this._constant.type;
	}

	override compile(): Node {
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		return frame.define(this._constant.value, this.type);
	}

	override get constant(): boolean {
		return !this._constant.type.isVolatileFunction;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} constant node`;
	}

}
