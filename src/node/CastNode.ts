import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { Type } from "../Type.js";
import { Value } from "../Value.js";
import { CallFrame } from "../CallFrame.js";

export class CastNode extends Node {

	protected _subnode: Node;
	protected readonly _type: Type;

	constructor(
		span: ParserSpan,
		subnode: Node,
		type: Type,
	) {
		super(span);
		this._subnode = subnode;
		this._type = type;
	}

	override get type(): Type {
		return this._subnode.type.isNever ? Type.Never : this._type;
	}

	override compile(type = Type.Unknown): Node {
		this._subnode = this._subnode.compile(Type.Unknown);
		if (!this._subnode.type.isNever && !this._subnode.type.intersects(this._type)) {
			this.throwError(`cannot cast type ${this._subnode.type} to type ${this._type}`);
		}
		return super.compile(type);
	}

	override evaluate(frame: CallFrame): Value {
		const value = this._subnode.evaluate(frame);
		if (!this._type.acceptsValue(value)) {
			this.throwError(`cannot cast value of type ${Type.of(value)} to type ${this._type}`);
		}
		return value;
	}

	override get constant(): boolean {
		return this._subnode.constant;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} cast node target type ${this._type}:\n${this._subnode.toString(ident + 1)}`;
	}

}
