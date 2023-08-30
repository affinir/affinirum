import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionConstant } from './ExpressionConstant.js';
import { ExpressionConstantNode } from './ExpressionConstantNode.js';
import { ExpressionFunction } from './ExpressionFunction.js';
import { ExpressionValueType, ExpressionType } from './ExpressionType.js';

export class ExpressionFunctionNode extends ExpressionNode {

	protected _type: ExpressionType;

	constructor(
		protected _pos: number,
		protected _function: ExpressionFunction,
		protected _subnodes: ExpressionNode[],
	) {
		super( _pos );
		this._type = _function.type;
	}

	get type(): ExpressionType {
		return this._type;
	}

	compile( type: ExpressionType ): ExpressionNode {
		const inferredType = this._function.type.infer( type );
		if ( inferredType.invalid ) {
			throw this;
		}
		this._type = inferredType;
		let constant = true;
		for ( let i = 0; i < this._subnodes.length; ++i ) {
			const argType = this._function.argTypes[ i ] ?? this._function.argTypes.slice( -1 )[ 0 ];
			const inferredArgType = this._function.inference ? this._function.inference( i, argType, inferredType ) : argType;
			const subnode = this._subnodes[ i ] = this._subnodes[ i ].compile( inferredArgType );
			constant &&= ( subnode instanceof ExpressionConstantNode );
		}
		if ( constant ) {
			return new ExpressionConstantNode( this._pos,
				new ExpressionConstant( this._function.evaluate( ...this._subnodes.map( node => node.evaluate() ) ) ) );
		}
		return this;
	}

	evaluate(): ExpressionValueType {
		return this._function.evaluate( ...this._subnodes.map( node => node.evaluate() ) );
	}

}
