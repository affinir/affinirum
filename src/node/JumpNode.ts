import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class JumpNode extends Node {

	constructor(
		span: ParserSpan,
		protected _action: "exit" | "next",
	) {
		super(span);
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
