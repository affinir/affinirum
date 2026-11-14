import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { JumpNode } from "./JumpNode.js";
import { CallFrame } from "../CallFrame.js";

export class LoopNode extends Node {

	protected _cnode: Node;
	protected _subnode: Node;

	constructor(
		span: ParserSpan,
		cnode: Node,
		subnode: Node,
	) {
		super(span);
		this._cnode = cnode;
		this._subnode = subnode;
	}

	override get type(): Type {
		return this._cnode.type.isNever ? Type.Never : this._subnode.type.toOptional();
	}

	override satisfies(type: Type): boolean {
		return this.type.isNever || super.satisfies(type) && this._subnode.satisfies(type);
	}

	override compile(type = Type.Unknown): Node {
		this._cnode = this._cnode.compile(Type.Boolean);
		this._subnode = this._subnode.compile(this._cnode.type.isNever ? Type.Unknown : type);
		return super.compile(type);
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
