import { Node } from './Node.js';
import { ExpressionConstant } from './ExpressionConstant.js';
import { Type, Value } from './Type.js';

export class ExpressionConstantNode extends Node {

	constructor(
		_pos: number,
		protected _constant: ExpressionConstant,
	) {
		super(_pos);
	}

	get type(): Type {
		return this._constant.type;
	}

	compile(type: Type): Node {
		if (!type.infer(this.type)) {
			this.throwTypeError(type);
		}
		return this;
	}

	evaluate(): Value {
		return this._constant.value;
	}

}
