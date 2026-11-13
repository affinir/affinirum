import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { Type } from "../Type.js";
import { Value } from "../Value.js";
import { CallFrame } from "../CallFrame.js";

export class CastNode extends Node {

	constructor(
		span: ParserSpan,
		protected _subnode: Node,
		protected readonly _target: Type,
	) {
		super(span);
	}

	override get type(): Type {
		return this._subnode.type.isNever ? Type.Never : this._target;
	}

	override compile(): Node {
		this._subnode = this._subnode.compile(Type.Unknown);
		if (!this._subnode.type.isNever && !this._subnode.type.intersect(this._target)) {
			this.throwError(`cannot cast type ${this._subnode.type} to ${this._target}`);
		}
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		const value = this._subnode.evaluate(frame);
		if (!this._target.acceptValue(value)) {
			this.throwError(`cannot cast value of type ${Type.of(value)} to ${this._target}`);
		}
		return value;
	}

	override get constant(): boolean {
		return this._subnode.constant;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} cast node target <${this._target}>:\n${this._subnode.toString(ident + 1)}`;
	}

}
