import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { Constant } from "../Constant.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class ConstantNode extends Node {

	protected readonly _constant: Constant;

	constructor(
		span: ParserSpan,
		constant: Constant,
	) {
		super(span);
		this._constant = constant;
	}

	get value(): Value {
		return this._constant.value;
	}

	override get type(): Type {
		return this._constant.type;
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
