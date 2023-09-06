import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionVariable } from './ExpressionVariable.js';
import { ExpressionValue, ExpressionType } from './ExpressionType.js';

export class ExpressionVariableNode extends ExpressionNode {

	constructor(
		protected _pos: number,
		protected _variable: ExpressionVariable,
	) {
		super( _pos );
	}

	get type(): ExpressionType {
		return this._variable.type;
	}

	get value(): ExpressionValue {
		return this._variable.value!;
	}

	set value( value: ExpressionValue ) {
		this._variable.value = value;
	}

	compile( type: ExpressionType ): ExpressionNode {
		const inferredType = this._variable.type.infer( type );
		if ( !inferredType ) {
			throw this;
		}
		this._variable.type = inferredType;
		return this;
	}

	evaluate(): ExpressionValue {
		return this._variable.value!;
	}

}
