import { Node } from "../Node.js";
import { ParserFrame } from "../ParserFrame.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { Jump } from "../Jump.js";
import { JumpException } from "../JumpException.js";

export class JumpNode extends Node {

	constructor(
		frame: ParserFrame,
		protected _jump: Jump,
		protected _subnode?: Node,
	) {
		super(frame);
	}

	override get type(): Type {
		return this._subnode?.type ?? Type.Void;
	}

	override compile(type: Type): Node {
		this._subnode = this._subnode?.compile(type);
		return this;
	}

	override evaluate(): Value {
		throw new JumpException(this._jump, this._subnode?.evaluate());
	}

	override toString(ident: number = 0): string {
		return this._subnode
			? `${super.toString(ident)} ${this._jump} node subnode:\n${this._subnode.toString(ident + 1)}`
			: `${super.toString(ident)} ${this._jump} node`;
	}

}
