import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionVariable } from './ExpressionVariable.js';
import { ExpressionValueType, ExpressionType } from './ExpressionType.js';

export class ExpressionVariableNode implements ExpressionNode {

	constructor(
		protected _pos: number,
		protected _variable: ExpressionVariable,
	) {}

	get pos(): number {
		return this._pos;
	}

	get type(): ExpressionType {
		return this._variable.type;
	}

	compile( type: ExpressionType ): ExpressionNode {
		const inferredType = this._variable.type.infer( type );
		if ( inferredType.invalid ) {
			throw this;
		}
		this._variable.type = inferredType;
		return this;
	}

	evaluate(): ExpressionValueType {
		return this._variable.value!;
	}

}
