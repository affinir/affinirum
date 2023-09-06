import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionConstantNode } from './ExpressionConstantNode.js';
import { ExpressionVariableNode } from './ExpressionVariableNode.js';
import { ExpressionConstant } from './ExpressionConstant.js';
import { ExpressionFunction } from './ExpressionFunction.js';
import { ExpressionValue, ExpressionType, typeVar } from './ExpressionType.js';

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
		if ( !inferredType ) {
			throw this;
		}
		this._type = inferredType;
		let constant = true;
		for ( let i = 0; i < this._subnodes.length; ++i ) {
			const argType = this._function.argTypes[ i ] ?? this._function.argTypes.slice( -1 )[ 0 ];
			const inferredArgType = i === 0 && this._function.inference ? argType.infer( inferredType, this._function.inference ) : argType;
			if ( !inferredArgType ) {
				throw this;
			}
			const subnode = this._subnodes[ i ] = this._subnodes[ i ].compile( inferredArgType.isFunction ? typeVar : inferredArgType );
			constant &&= ( subnode instanceof ExpressionConstantNode && !subnode.type.isFunction );
		}
		if ( constant ) {
			return new ExpressionConstantNode( this._pos,
				new ExpressionConstant( this._function.evaluate( ...this._subnodes.map( node => node.evaluate() ) ) ) );
		}
		return this;
	}

	evaluate(): ExpressionValue {
		if ( this._function.argTypes.some( arg => arg.isFunction ) ) {
			const fnode = this._subnodes[ 2 ];
			const vnode = this._subnodes[ 1 ] as ExpressionVariableNode;
			return this._function.evaluate( this._subnodes[ 0 ].evaluate(), ( v: ExpressionValue, i: number, a: ExpressionValue[] ) => {
				if ( vnode ) {
					vnode.value = {
						value: v,
						index: i,
						array: a,
					};
				}
				return fnode.evaluate();
			} );
		}
		return this._function.evaluate( ...this._subnodes.map( node => node.evaluate() ) );
	}

}
