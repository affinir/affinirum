import { Node } from "./Node.js";
import { ScriptSpan } from "../ScriptSpan.js";
import { Constant } from "../Constant.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class ConstantNode extends Node {

	constructor(
		span: ScriptSpan,
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

	override compile(type: Type): Node {
		this._constant.type = this.reduceType(type);
		return this;
	}

	override evaluate(_: CallFrame): Value {
		return this._constant.value;
	}

	override get constant(): boolean {
		return !this._constant.type.isVolatile;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} constant node`;
	}

}
