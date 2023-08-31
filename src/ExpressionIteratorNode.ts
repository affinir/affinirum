import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionValue, ExpressionType, typeArray, typeAny } from './ExpressionType.js';
import { ExpressionVariable } from './ExpressionVariable.js';

export class ExpressionIteratorNode extends ExpressionNode {

	protected _variable: ExpressionVariable;

	constructor(
		protected _pos: number,
		protected _name: string,
		protected _subnodes: ExpressionNode[],
	) {
		super( _pos );
		this._variable = new ExpressionVariable();
	}

	/*
	findScopeVariable( name: string ): ExpressionVariable | undefined {
		let variable = super.findScopeVariable( name );
		if ( variable ) {
			return variable;
		}
		for ( let i = 0; i < this._subnodes.length; ++i ) {
			variable = this._subnodes[ i ].findScopeVariable( name );
			if ( variable ) {
				this._variables.set( name, variable );
				return variable;
			}
		}
		return;
	}
	*/

	get type(): ExpressionType {
		return typeArray;
	}

	get subnodes(): ExpressionNode[] {
		return [];
	}

	compile( type: ExpressionType ): ExpressionNode {
		if ( !type.isArray ) {
			throw this;
		}
		this._subnodes[ 0 ]?.compile( typeArray );
		this._subnodes[ 1 ]?.compile( typeAny );
		return this;
	}

	evaluate(): ExpressionValue {
		return ( this._subnodes[ 0 ].evaluate() as [] ).map( iterator => {
			this._variable.value = iterator;
			return this._subnodes[ 1 ].evaluate();
		} );
	}

}
