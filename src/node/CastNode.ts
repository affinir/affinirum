import { Node } from "../Node.js";
import { ParserFrame } from "../ParserFrame.js";
import { Type } from "../Type.js";
import { Value } from "../Value.js";

export class CastNode extends Node {

	protected _type: Type;

	constructor(
		frame: ParserFrame,
		protected _subnode: Node,
		protected readonly _target: Type,
	) {
		super(frame);
		this._type = _target;
	}

	override get type(): Type {
		return this._type;
	}

	override compile(type: Type): Node {
		this._subnode = this._subnode.compile(Type.Unknown);
		if (!this._subnode.type.intersect(this._target)) {
			this.throwError(`cannot cast type ${this._subnode.type} to ${this._target}`);
		}
		this._type = this._target;
		this._type = this.reduceType(type);
		return this;
	}

	override evaluate(): Value {
		const value = this._subnode.evaluate();
		if (!this._type.acceptValue(value)) {
			this.throwError(`cannot cast value of type ${Type.of(value)} to ${this._type}`);
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
