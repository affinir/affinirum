import { ExpressionType } from './ExpressionType.js';

export class ExpressionTypeError extends TypeError {

	constructor(
		protected _pos: number,
		protected _nodeType: ExpressionType,
		protected _mismatchType: ExpressionType,
	) {
		super(`type mismatch error`);
	}

	get pos(): number {
		return this._pos;
	}

	get nodeType(): ExpressionType {
		return this._nodeType;
	}

	get mismatchType(): ExpressionType {
		return this._mismatchType;
	}

}
