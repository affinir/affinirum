import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class JumpNode extends Node {

	protected _action: "exit" | "next";

	constructor(
		span: ParserSpan,
		action: "exit" | "next",
	) {
		super(span);
		this._action = action;
	}

	get action() {
		return this._action;
	}

	override get type(): Type {
		return Type.Never;
	}

	override compile(): Node {
		return this;
	}

	override evaluate(_: CallFrame): Value {
		throw this;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} ${this._action} node`;
	}

}
