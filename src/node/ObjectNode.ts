import { Node } from '../Node.js';
import { ParserFrame } from '../ParserFrame.js';
import { ConstantNode } from './ConstantNode.js';
import { ValueType, Value, typeObject, typeString, typeUnknown } from '../ValueType.js';

export class ObjectNode extends Node {

	constructor(
		frame: ParserFrame,
		protected _subnodes: [Node, Node][],
	) {
		super(frame);
	}

	override get type(): ValueType {
		return typeObject;
	}

	override compile(type: ValueType): Node {
		this.reduceType(type);
		let constant = true;
		for (let i = 0; i < this._subnodes.length; ++i) {
			this._subnodes[i][0] = this._subnodes[i][0].compile(typeString);
			constant &&= this._subnodes[i][0].constant;
			this._subnodes[i][1] = this._subnodes[i][1].compile(typeUnknown);
			constant &&= this._subnodes[i][1].constant;
		}
		return constant ? new ConstantNode(this, this.evaluate()) : this;
	}

	override evaluate(): Value {
		const obj: { [ key: string ]: Value } = {};
		for (const [key, value] of this._subnodes) {
			obj[key.evaluate() as string] = value.evaluate();
		}
		return obj;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} object node`
			+ `, subnodes:\n${this._subnodes.map(([k, v])=> `${k.toString(ident + 1)}:\n${v.toString(ident + 1)}`).join('\n')}`;
	}

}
