import { Node } from '../Node.js';
import { ParserFrame } from '../ParserFrame.js';
import { ConstantNode } from './ConstantNode.js';
import { Type, Value, typeArray, typeUnknown } from '../Type.js';

export class ArrayNode extends Node {

	constructor(
		frame: ParserFrame,
		protected _subnodes: Node[],
	) {
		super(frame);
	}

	override get type(): Type {
		return typeArray;
	}

	override compile(type: Type): Node {
		this.reduceType(type);
		let constant = true;
		for (let i = 0; i < this._subnodes.length; ++i) {
			const subnode = this._subnodes[i] = this._subnodes[i].compile(typeUnknown);
			constant &&= subnode.constant;
		}
		if (constant) {
			return new ConstantNode(this, this.evaluate());
		}
		return this;
	}

	override evaluate(): Value {
		return this._subnodes.map((s)=> s.evaluate());
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} array node`
			+ `, subnodes:\n${this._subnodes.map((s)=> s.toString(ident + 1)).join('\n')}`;
	}

}
