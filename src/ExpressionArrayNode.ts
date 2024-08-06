import { Node } from './Node.js';
import { ExpressionConstantNode } from './ExpressionConstantNode.js';
import { ExpressionConstant } from './ExpressionConstant.js';
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
		let constant = true;
		for (let i = 0; i < this._subnodes.length; ++i) {
			const subnode = this._subnodes[ i ] = this._subnodes[ i ].compile(typeVariant);
			constant &&= subnode instanceof ExpressionConstantNode && !subnode.type.isFunction;
		}
		if (constant) {
			return new ExpressionConstantNode(this._pos,
				new ExpressionConstant(this.evaluate()));
		}
		return this;
	}

	evaluate(): Value {
		return this._subnodes.map((s)=> s.evaluate());
	}

}
