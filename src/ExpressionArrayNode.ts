import { Node } from './Node.js';
import { ExpressionConstantNode } from './ExpressionConstantNode.js';
import { ExpressionConstant } from './ExpressionConstant.js';
import { Type, Value, typeArray, typeVariant } from './Type.js';

export class ExpressionArrayNode extends Node {

	constructor(
		_startPos: number,
		_endPos: number,
		protected _subnodes: Node[],
	) {
		super(_startPos, _endPos);
	}

	override get type(): Type {
		return typeArray;
	}

	override toString(ident: number): string {
		return `${super.toString(ident)} array node, subnodes:\n${this._subnodes.map((s)=> s.toString(ident + 1)).join('\n')}`;
	}

	override compile(type: Type): Node {
		if (!typeArray.infer(type)) {
			this.throwTypeError(type);
		}
		let constant = true;
		for (let i = 0; i < this._subnodes.length; ++i) {
			const subnode = this._subnodes[ i ] = this._subnodes[ i ].compile(typeVariant);
			constant &&= subnode instanceof ExpressionConstantNode && !subnode.type.isFunction;
		}
		if (constant) {
			return new ExpressionConstantNode(this._startPos, this._endPos, new ExpressionConstant(this.evaluate()));
		}
		return this;
	}

	override evaluate(): Value {
		return this._subnodes.map((s)=> s.evaluate());
	}

}
