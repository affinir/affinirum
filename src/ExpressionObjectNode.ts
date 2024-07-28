import { Node } from './Node.js';
import { Type, Value, typeObject, typeVariant } from './Type.js';

export class ExpressionObjectNode extends Node {

	constructor(
		_pos: number,
		protected _subnodes: { [ key: string ]: Node },
	) {
		super(_pos);
	}

	get type(): Type {
		return typeObject;
	}

	compile(type: Type): Node {
		if (!typeObject.infer(type)) {
			this.throwTypeError(type);
		}
		for (const key in this._subnodes) {
			this._subnodes[ key ] = this._subnodes[ key ].compile(typeVariant);
		}
		return this;
	}

	evaluate(): Value {
		const value: { [ key: string ]: Value } = {};
		for (const key in this._subnodes) {
			value[ key ] = this._subnodes[ key ].evaluate();
		}
		return value;
	}

}
