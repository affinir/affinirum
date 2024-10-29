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
		for (let i = 0; i < this._subnodes.length; ++i) {
			this._subnodes[i] = this._subnodes[i].compile(typeUnknown);
		}
		if (this._subnodes.every((node)=> node.constant)) {
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
