import { ExpressionType, ExpressionValue } from './ExpressionType.js';
import { ExpressionTypeError } from './ExpressionTypeError.js';

export abstract class ExpressionNode {

	constructor(
		protected _pos: number,
	) {}

	get pos(): number {
		return this._pos;
	}

	throwTypeError( type: ExpressionType ): never {
		throw new ExpressionTypeError( this._pos, this.type, type );
	}

	abstract type: ExpressionType;
	abstract compile( type: ExpressionType ): ExpressionNode;
	abstract evaluate(): ExpressionValue;

}
