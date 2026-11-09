import { Node } from "./Node.js";
import { AssignableNode } from "./AssignableNode.js";
import { ScriptSpan } from "../ScriptSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class AssignmentNode extends Node {

	constructor(
		span: ScriptSpan,
		protected _anode: AssignableNode,
		protected _subnode: Node,
	) {
		super(span);
	}

	override get type(): Type {
		return this._anode.type;
	}

	override compile(type: Type): Node {
		this._subnode = this._subnode.compile(type);
		this._anode = this._anode.compile(this._subnode.type);
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		return this._anode.resolver(frame)(this._subnode.evaluate(frame));
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} assignment node anode:\n${this._anode.toString(ident + 1)}\n`
			+ `${super.toString(ident)} assignment node subnode:\n${this._subnode.toString(ident + 1)}`;
	}

}
