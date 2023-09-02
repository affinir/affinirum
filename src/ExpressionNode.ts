import { ExpressionValue, ExpressionType } from './ExpressionType.js';
import { ExpressionVariable } from './ExpressionVariable.js';

export abstract class ExpressionNode {

	constructor(
		protected _pos: number,
	) {}

	get pos(): number {
		return this._pos;
	}

	abstract type: ExpressionType;
	abstract compile( types: ExpressionType ): ExpressionNode;
	abstract evaluate(): ExpressionValue;

}
