import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionVariable } from './ExpressionVariable.js';
import { ExpressionType, ExpressionValue } from './ExpressionType.js';

export class ExpressionVariableNode extends ExpressionNode {

	constructor(
		_pos: number,
		protected _variable: ExpressionVariable,
		protected _subnode?: ExpressionNode,
	) {
		super( _pos );
	}

	get type(): ExpressionType {
		return this._variable.type;
	}

	compile( type: ExpressionType ): ExpressionNode {
		this._subnode = this._subnode?.compile( type );
		const inferredType = this._variable.type.infer( this._subnode?.type ?? type );
		if ( !inferredType ) {
			this.throwTypeError( type );
		}
		this._variable.type = inferredType;
		return this;
	}

	evaluate(): ExpressionValue {
		return this._subnode ? this._variable.value = this._subnode.evaluate() : this._variable.value!;
	}

}
