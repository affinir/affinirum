import { Node } from "../Node.js";
import { ParserFrame } from "../ParserFrame.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { JumpException } from "../JumpException.js";

export class LoopNode extends Node {

	constructor(
		frame: ParserFrame,
		protected _cnode: Node,
		protected _subnode: Node,
	) {
		super(frame);
	}

	override get type(): Type {
		return this._subnode.type;
	}

	override compile(type: Type): Node {
		this._cnode = this._cnode.compile(Type.Boolean);
		this._subnode = this._subnode.compile(type);
		return this;
	}

	override evaluate(): Value {
		let result: Value = undefined;
		while (this._cnode.evaluate()) {
			try {
				result = this._subnode.evaluate();
			}
			catch (e) {
				if (e instanceof JumpException) {
					if (e.jump === "stop") {
						break;
					}
					if (e.jump === "next") {
						continue;
					}
				}
				throw e;
			}
		}
		return result;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} loop node cnode:\n${this._cnode.toString(ident + 1)}\n`
			+ `${super.toString(ident)} loop node subnode:\n${this._subnode.toString(ident + 1)}`;
	}

}
