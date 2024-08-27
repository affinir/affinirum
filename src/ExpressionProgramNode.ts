import { Node } from './Node.js';
import { ExpressionConstantNode } from './ExpressionConstantNode.js';
import { ExpressionConstant } from './ExpressionConstant.js';
import { Type, Value, typeVariant } from './Type.js';

export class ExpressionProgramNode extends Node {

	constructor(
		_startPos: number,
		_endPos: number,
		protected _subnodes: Node[],
	) {
		super(_startPos, _endPos);
	}

	override get type(): Type {
		return this._subnodes[ this._subnodes.length - 1 ].type;
	}

	override toString(ident: number): string {
		return `${super.toString(ident)} program node, subnodes:\n${this._subnodes.map((s)=> s.toString(ident + 1)).join('\n')}`;
	}

	override compile(type: Type): Node {
		let constant = true;
		for (let i = 0, li = this._subnodes.length - 1; i < this._subnodes.length; ++i) {
			const subnode = this._subnodes[ i ] = this._subnodes[ i ].compile(i < li ? typeVariant : type);
			constant &&= subnode instanceof ExpressionConstantNode && !subnode.type.isFunction;
		}
		if (constant) {
			return new ExpressionConstantNode(this._startPos, this._endPos, new ExpressionConstant(this.evaluate()));
		}
		return this;
	}

	override evaluate(): Value {
		return this._subnodes.map((s)=> s.evaluate())[ this._subnodes.length - 1 ];
	}

}
