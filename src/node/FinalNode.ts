import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class FinalNode extends Node {

	protected _level: "result" | "return";
	protected _subnode: Node;
	protected readonly _type: Type;
	protected _value: Value;

	constructor(
		span: ParserSpan,
		level: "result" | "return",
		subnode: Node,
		type: Type,
	) {
		super(span);
		this._level = level;
		this._subnode = subnode;
		this._type = type;
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
		this._subnode = this._subnode.compile(this._type);
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
