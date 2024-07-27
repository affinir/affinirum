import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionType, ExpressionValue, typeArray, typeVar } from './ExpressionType.js';

export class ExpressionArrayNode extends ExpressionNode {

	constructor(
		_pos: number,
		protected _subnodes: ExpressionNode[],
	) {
		super(_pos);
	}

	get type(): ExpressionType {
		return typeArray;
	}

	compile(type: ExpressionType): ExpressionNode {
		if (!typeArray.infer(type)) {
			this.throwTypeError(type);
		}
		this._subnodes = this._subnodes.map((s)=> s.compile(typeVar));
		return this;
	}

	evaluate(): ExpressionValue {
		return this._subnodes.map((s)=> s.evaluate());
	}

}
