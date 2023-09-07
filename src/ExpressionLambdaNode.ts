import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionLambda } from './ExpressionLambda.js';
import { ExpressionType, ExpressionValue } from './ExpressionType.js';

export class ExpressionLambdaNode extends ExpressionNode {

	constructor(
		protected _pos: number,
		protected _lambda: ExpressionLambda,
		protected _subnode: ExpressionNode,
	) {
		super( _pos );
	}

	get type(): ExpressionType {
		return this._lambda.type;
	}

	compile( type: ExpressionType ): ExpressionNode {
		if ( !type.isFunction ) {
			return this;
		}
		this._subnode = this._subnode.compile( this._lambda.type );
		return this;
	}

	evaluate(): ExpressionValue {
		return this._lambda.evaluate( this._subnode );
	}

}
