import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { JumpNode } from "./JumpNode.js";
import { CallFrame } from "../CallFrame.js";

export class LoopNode extends Node {

	constructor(
		span: ParserSpan,
		protected _cnode: Node,
		protected _subnode: Node,
	) {
		super(span);
	}

	override get type(): Type {
		return this._cnode.type.isNever ? Type.Never : this._subnode.type.toOptional();
	}

	override acceptType(type: Type): boolean {
		return this.type.isNever || super.acceptType(type) && this._subnode.acceptType(type);
	}

	override validateType(type: Type): void {
		super.validateType(type);
		if (!this.type.isNever) {
			this._subnode.validateType(type);
		}
	}

	override compile(hint: Type): Node {
		this._cnode = this._cnode.compile(Type.Boolean);
		this._cnode.validateType(this._cnode.type.isOptional ? Type.OptionalBoolean : Type.Boolean);
		this._subnode = this._subnode.compile(hint);
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		let result: Value = undefined;
		while (this._cnode.evaluate(frame)) {
			try {
				result = this._subnode.evaluate(frame);
			}
			catch (e) {
				if (e instanceof JumpNode) {
					if (e.action === "exit") {
						break;
					}
					if (e.action === "next") {
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
