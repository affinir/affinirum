import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionVariable } from './ExpressionVariable.js';
import { ExpressionType, ExpressionValue } from './ExpressionType.js';

export class ExpressionClosureNode extends ExpressionNode {

	constructor(
		_pos: number,
		protected _variables: ExpressionVariable[],
		protected _type: ExpressionType,
		protected _subnodes: ExpressionNode[],
	) {
		super( _pos );
	}

	get type(): ExpressionType {
		return this._type;
	}

	compile( type: ExpressionType ): ExpressionNode {
		if ( !type.isFunction ) {
			return this;
		}
		this._subnodes = this._subnodes.map( s => s.compile( this._type ) );
		return this;
	}

	evaluate(): ExpressionValue {
		return ( ...values: ExpressionValue[] ) => {
			this._variables.forEach( ( arg, ix ) => arg.value = values[ ix ] );
			return this._subnodes.map( s => s.evaluate() )[ this._subnodes.length - 1 ];
		};
	}

}
