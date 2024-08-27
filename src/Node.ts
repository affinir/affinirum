import { Type, Value } from './Type.js';

export abstract class Node {

	constructor(
		protected _startPos: number,
		protected _endPos: number,
	) {}

	get startPos(): number {
		return this._startPos;
	}

	get endPos(): number {
		return this._endPos;
	}

	toString(ident: number = 0): string {
		return ' '.repeat(ident) + `[${this._startPos}:${this.endPos}]`;
	}

	throwTypeError(type: Type): never {
		throw new NodeTypeError(this._startPos, this._endPos, this.type, type);
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
