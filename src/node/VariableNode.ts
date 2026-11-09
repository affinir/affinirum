import { AssignableNode } from "./AssignableNode.js";
import { ScriptSpan } from "../ScriptSpan.js";
import { Variable } from "../Variable.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class VariableNode extends AssignableNode {

	constructor(
		span: ScriptSpan,
		protected readonly _variable: Variable,
	) {
		super(span);
	}

	override get type(): Type {
		return this._variable.type;
	}

	override compile(type: Type): AssignableNode {
		this._variable.type = this.reduceType(type);
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		return frame.get(this._variable);
	}

	override resolver(frame: CallFrame): (value: Value) => Value {
		return (value: Value) => frame.set(this._variable, value);
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} variable node`;
	}

}
