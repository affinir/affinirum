import { Node } from '../Node.js';
import { ParserFrame } from '../ParserFrame.js';
import { Constant } from '../Constant.js';
import { ConstantNode } from './ConstantNode.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';

export class BlockNode extends Node {

	constructor(
		frame: ParserFrame,
		protected _subnodes: Node[],
	) {
		super(frame);
	}

	override get type(): Type {
		return this._subnodes[this._subnodes.length - 1].type;
	}

	override compile(type: Type): Node {
		let constant = true;
		for (let i = 0, last = this._subnodes.length - 1; i < this._subnodes.length; ++i) {
			this._subnodes[i] = this._subnodes[i].compile(i < last ? Type.Unknown : type);
			constant &&= this._subnodes[i].constant;
		}
		return constant ? new ConstantNode(this, new Constant(this.evaluate(), this.type)) : this;
	}

	override evaluate(): Value {
		return this._subnodes.map((s)=> s.evaluate())[this._subnodes.length - 1];
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map((s)=> s.toString(ident + 1)).join('\n');
		return `${super.toString(ident)} block node subnodes:\n${subnodes}`;
	}

}
