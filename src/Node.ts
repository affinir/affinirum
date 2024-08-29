import { ParserFrame } from './ParserFrame.js';
import { Type, Value } from './Type.js';

export abstract class Node extends ParserFrame {

	constructor(
		frame: ParserFrame,
	) {
		super(frame.expr, frame.start, frame.end);
	}

	toString(ident: number = 0): string {
		return ' '.repeat(ident) + `[${this._start}:${this.end}]`;
	}

	throwTypeError(type: Type): never {
		throw new NodeTypeError(this._start, this._end, this.type, type);
	}

	abstract type: Type;
	abstract compile(type: Type): Node;
	abstract evaluate(): Value;

}

export class NodeTypeError extends TypeError {

	constructor(
		protected _startPos: number,
		protected _endPos: number,
		protected _nodeType: Type,
		protected _mismatchType: Type,
	) {
		super(`type mismatch error`);
	}

	get startPos(): number {
		return this._startPos;
	}

	get endPos(): number {
		return this._endPos;
	}

	get nodeType(): Type {
		return this._nodeType;
	}

	get mismatchType(): Type {
		return this._mismatchType;
	}

}
