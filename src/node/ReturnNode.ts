import { Node } from "../Node.js";
import { ScriptSpan } from "../ScriptSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class ReturnNode extends Node {

	constructor(
		span: ScriptSpan,
		protected _scope: "global" | "function",
		protected _subnode: Node,
		protected _type: Type,
		protected _value?: Value,
	) {
		super(span);
	}

	get scope() {
		return this._scope;
	}

	get value() {
		return this._value;
	}

	override get type(): Type {
		return this._type;
	}

	override compile(): Node {
		this._subnode = this._subnode.compile(this._type);
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		this._value = this._subnode.evaluate(frame);
		throw this;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} ${this._scope} node subnode:\n${this._subnode.toString(ident + 1)}`;
	}

}
