import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class FinalNode extends Node {

	protected _value: Value;

	constructor(
		span: ParserSpan,
		protected _level: "result" | "return",
		protected _subnode: Node,
		protected readonly _expectedType: Type,
	) {
		super(span);
	}

	get level() {
		return this._level;
	}

	get value() {
		return this._value;
	}

	get valueType() {
		return this._subnode.type;
	}

	override get type(): Type {
		return Type.Never;
	}

	override compile(): Node {
		this._subnode = this._subnode.compile(this._expectedType);
		this._subnode.validateType(this._expectedType);
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		this._value = this._subnode.evaluate(frame);
		throw this;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} ${this._level} node subnode:\n${this._subnode.toString(ident + 1)}`;
	}

}
