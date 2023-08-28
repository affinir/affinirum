import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionConstant } from './ExpressionConstant.js';
import { ExpressionType, ExpressionValueType } from './ExpressionType.js';

export class ExpressionConstantNode implements ExpressionNode {

	constructor(
		protected _pos: number,
		protected _constant: ExpressionConstant
	) {}

	get pos(): number {
		return this._pos;
	}

	get type(): ExpressionType {
		return ExpressionType.of( this._constant.value );
	}

	compile( type: ExpressionType ): ExpressionNode {
		if ( type.infer( this.type ).invalid ) {
			throw this;
		}
		return this;
	}

	evaluate(): ExpressionValueType {
		return this._constant.value;
	}

}
