import { Node } from '../Node.js';
import { ParserFrame } from '../ParserFrame.js';
import { Constant } from '../Constant.js';
import { ConstantNode } from './ConstantNode.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';

export class ArrayNode extends Node {

	constructor(
		frame: ParserFrame,
		protected _subnodes: Node[],
	) {
		super(frame);
	}

	override get type(): Type {
		return Type.Array;
	}

	override compile(type: Type): Node {
		this.reduceType(type);
		let constant = true;
		for (let i = 0; i < this._subnodes.length; ++i) {
			this._subnodes[i] = this._subnodes[i].compile(Type.Unknown);
			constant &&= this._subnodes[i].constant;
		}
		return constant ? new ConstantNode(this, new Constant(this.evaluate(), this.type)) : this;
	}

	override evaluate(): Value {
		return this._subnodes.map((s)=> s.evaluate());
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} array node`
			+ `, subnodes:\n${this._subnodes.map((s)=> s.toString(ident + 1)).join('\n')}`;
	}

}
