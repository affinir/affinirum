import { Node } from './Node.js';
import { Type, Value, typeArray, typeVariant } from './Type.js';

export class ExpressionArrayNode extends Node {

	constructor(
		_pos: number,
		protected _subnodes: Node[],
	) {
		super(_pos);
	}

	get type(): Type {
		return typeArray;
	}

	compile(type: Type): Node {
		if (!typeArray.infer(type)) {
			this.throwTypeError(type);
		}
		this._subnodes = this._subnodes.map((s)=> s.compile(typeVariant));
		return this;
	}

	evaluate(): Value {
		return this._subnodes.map((s)=> s.evaluate());
	}

}
