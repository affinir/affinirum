import { ExpressionType, ExpressionValue } from './ExpressionType.js';
import { ExpressionVariable } from './ExpressionVariable.js';
import { ExpressionNode } from './ExpressionNode.js';

export class ExpressionLambda {

	constructor(
		protected _args: ExpressionVariable[],
		protected _type: ExpressionType,
	) {}

	evaluate( node: ExpressionNode ): ( ...values: any[] ) => ExpressionValue {
		return ( ...values: ExpressionValue[] ) => {
			this._args.forEach( ( arg, ix ) => arg.value = values[ ix ] );
			return node.evaluate();
		};
	}

	get type(): ExpressionType {
		return this._type;
	}

}
