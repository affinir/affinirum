import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionType, ExpressionValue, typeObject, typeVar } from './ExpressionType.js';

export class ExpressionObjectNode extends ExpressionNode {

	constructor(
		_pos: number,
		protected _subnodes: { [ key: string ]: ExpressionNode },
	) {
		super(_pos);
	}

	get type(): ExpressionType {
		return typeObject;
	}

	compile(type: ExpressionType): ExpressionNode {
		if (!typeObject.infer(type)) {
			this.throwTypeError(type);
		}
		for (const key in this._subnodes) {
			this._subnodes[ key ] = this._subnodes[ key ].compile(typeVar);
		}
		return this;
	}

	evaluate(): ExpressionValue {
		const value: { [ key: string ]: ExpressionValue } = {};
		for (const key in this._subnodes) {
			value[ key ] = this._subnodes[ key ].evaluate();
		}
		return value;
	}

}
