import { Node } from '../Node.js';
import { ParserFrame } from '../ParserFrame.js';
import { Constant } from '../Constant.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';

export class ConstantNode extends Node {

	constructor(
		frame: ParserFrame,
		protected readonly _constant: Constant,
		protected _subnode?: Node,
	) {
		super(frame);
	}

	override get type(): Type {
		return this._constant.type;
	}

	override compile(type: Type): Node {
		this._constant.type = this.reduceType(type);
		this._subnode = this._subnode?.compile(Type.Unknown);
		return this;
	}

	override evaluate(): Value {
		return this._constant.value;
	}

	override get constant(): boolean {
		return !this._subnode && this._constant.type.stable;
	}

	override toString(ident: number = 0): string {
		return this._subnode
			? `${super.toString(ident)} constant node subnode:\n${this._subnode.toString(ident + 1)}`
			: `${super.toString(ident)} constant node`;
	}

}
