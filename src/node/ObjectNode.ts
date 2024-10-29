import { Node } from '../Node.js';
import { ParserFrame } from '../ParserFrame.js';
import { ConstantNode } from './ConstantNode.js';
import { Type, Value, typeObject, typeString, typeUnknown } from '../Type.js';

export class ObjectNode extends Node {

	constructor(
		frame: ParserFrame,
		protected _subnodes: [Node, Node][],
	) {
		super(frame);
	}

	override get type(): Type {
		return typeObject;
	}

	override compile(type: Type): Node {
		this.reduceType(type);
		for (let i = 0; i < this._subnodes.length; ++i) {
			this._subnodes[i][0] = this._subnodes[i][0].compile(typeString);
			this._subnodes[i][1] = this._subnodes[i][1].compile(typeUnknown);
		}
		if (this._subnodes.flat().every((node)=> node.constant)) {
			return new ConstantNode(this, this.evaluate());
		}
		return this;
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
