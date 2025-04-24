import { Node } from '../Node.js';
import { ParserFrame } from '../ParserFrame.js';
import { Constant } from '../Constant.js';
import { ConstantNode } from './ConstantNode.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';

export class ObjectNode extends Node {

	protected _type: Type;

	constructor(
		frame: ParserFrame,
		protected _subnodes: [Node, Node][],
	) {
		super(frame);
		this._type = Type.Object;
	}

	override get type(): Type {
		return this._type;
	}

	override compile(type: Type): Node {
		this._type = this.reduceType(type);
		let constant = true;
		for (let i = 0; i < this._subnodes.length; ++i) {
			this._subnodes[i][0] = this._subnodes[i][0].compile(Type.String);
			constant &&= this._subnodes[i][0].constant;
			this._subnodes[i][1] = this._subnodes[i][1].compile(Type.Unknown);
			constant &&= this._subnodes[i][1].constant;
		}
		return constant ? new ConstantNode(this, new Constant(this.evaluate(), this.type)) : this;
	}

	override evaluate(): Value {
		const obj: { [ key: string ]: Value } = {};
		for (const [key, value] of this._subnodes) {
			obj[key.evaluate() as string] = value.evaluate();
		}
		return obj;
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map(([k, v])=> `${k.toString(ident + 1)}:\n${v.toString(ident + 1)}`).join('\n');
		return `${super.toString(ident)} object node subnodes:\n${subnodes}`;
	}

}
