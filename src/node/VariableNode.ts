import { Node } from "./Node.js";
import { ScriptSpan } from "../ScriptSpan.js";
import { Variable } from "../Variable.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class VariableNode extends Node {

	constructor(
		span: ScriptSpan,
		protected readonly _variable: Variable,
		protected _subnode?: Node,
	) {
		super(span);
	}

	override get type(): Type {
		return this._variable.type;
	}

	override compile(type: Type): Node {
		this._subnode = this._subnode?.compile(type);
		this._variable.type = this.reduceType(this._subnode?.type ?? type);
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		return this._subnode
			? frame.set(this._variable, this._subnode.evaluate(frame))
			: frame.get(this._variable);
	}

	override toString(ident: number = 0): string {
		return this._subnode
			? `${super.toString(ident)} variable node subnode:\n${this._subnode.toString(ident + 1)}`
			: `${super.toString(ident)} variable node`;
	}

}
