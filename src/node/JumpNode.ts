import { Node } from "../Node.js";
import { ScriptSpan } from "../ScriptSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { Jump } from "../Jump.js";
import { JumpException } from "../JumpException.js";
import { CallFrame } from "../CallFrame.js";

export class JumpNode extends Node {

	constructor(
		span: ScriptSpan,
		protected _jump: Jump,
		protected _subnode?: Node,
		protected _type?: Type,
	) {
		super(span);
	}

	override get type(): Type {
		return this._type ?? this._subnode?.type ?? Type.Void;
	}

	override compile(type: Type): Node {
		this._subnode = this._subnode?.compile(this._jump === "exit" || this._jump === "return"
			? this._type ?? Type.Unknown
			: type);
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		throw new JumpException(this._jump, this._subnode?.evaluate(frame));
	}

	override toString(ident: number = 0): string {
		return this._subnode
			? `${super.toString(ident)} ${this._jump} node subnode:\n${this._subnode.toString(ident + 1)}`
			: `${super.toString(ident)} ${this._jump} node`;
	}

}
