import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionVariable } from './ExpressionVariable.js';
import { ExpressionType, ExpressionValue } from './ExpressionType.js';

export class ExpressionVariableNode extends ExpressionNode {

	constructor(
		_pos: number,
		protected _variable: ExpressionVariable,
	) {
		super( _pos );
	}

	get type(): ExpressionType {
		return this._variable.type;
	}

	refine( type: ExpressionType ): ExpressionNode {
		const inferredType = this._variable.type.infer( type );
		if ( !inferredType ) {
			this.throwTypeError( type );
		}
		this._variable.type = inferredType;
		return this;
	}

	evaluate(): ExpressionValue {
		return this._variable.value!;
	}

}
