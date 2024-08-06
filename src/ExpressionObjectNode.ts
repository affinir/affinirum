import { Node } from './Node.js';
import { ExpressionConstantNode } from './ExpressionConstantNode.js';
import { ExpressionConstant } from './ExpressionConstant.js';
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
		let constant = true;
		for (const key in this._subnodes) {
			const subnode = this._subnodes[ key ] = this._subnodes[ key ].compile(typeVariant);
			constant &&= subnode instanceof ExpressionConstantNode && !subnode.type.isFunction;
		}
		if (constant) {
			return new ExpressionConstantNode(this._pos,
				new ExpressionConstant(this.evaluate()));
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
