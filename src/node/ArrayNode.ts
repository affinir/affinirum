import { Node } from '../Node.js';
import { ParserFrame } from '../ParserFrame.js';
import { ConstantNode } from './ConstantNode.js';
import { ValueType, Value, typeArray, typeUnknown } from '../ValueType.js';

export class ArrayNode extends Node {

	constructor(
		frame: ParserFrame,
		protected _subnodes: Node[],
	) {
		super(frame);
	}

	override get type(): ValueType {
		return typeArray;
	}

	override compile(type: ValueType): Node {
		this.reduceType(type);
		let constant = true;
		for (let i = 0; i < this._subnodes.length; ++i) {
			this._subnodes[i] = this._subnodes[i].compile(typeUnknown);
			constant &&= this._subnodes[i].constant;
		}
		return constant ? new ConstantNode(this, this.evaluate()) : this;
	}

	override evaluate(): Value {
		return this._subnodes.map((s)=> s.evaluate());
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} array node`
			+ `, subnodes:\n${this._subnodes.map((s)=> s.toString(ident + 1)).join('\n')}`;
	}

}
