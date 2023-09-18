import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionVariable } from './ExpressionVariable.js';
import { ExpressionType, ExpressionValue } from './ExpressionType.js';

export class ExpressionLambdaNode extends ExpressionNode {

	constructor(
		_pos: number,
		protected _args: ExpressionVariable[],
		protected _type: ExpressionType,
		protected _subnode: ExpressionNode,
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
		this._subnode = this._subnode.compile( this._type );
		return this;
	}

	evaluate(): ExpressionValue {
		return ( ...values: ExpressionValue[] ) => {
			this._args.forEach( ( arg, ix ) => arg.value = values[ ix ] );
			return this._subnode.evaluate();
		};
	}

}
