import { Node } from "../Node.js";
import { ScriptSpan } from "../ScriptSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class JumpNode extends Node {

	constructor(
		span: ScriptSpan,
		protected _action: "exit" | "next",
	) {
		super(span);
	}

	get action() {
		return this._action;
	}

	override compile(_: Type): Node {
		return this;
	}

	override evaluate(_: CallFrame): Value {
		throw this;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} ${this._action} node`;
	}

}
