import type { Value } from "./Value.js";
import type { Variable } from "./Variable.js";

export class CallFrame {

	protected readonly _superframe?: CallFrame;
	protected readonly _values = new Map<Variable, Value>();

	constructor(
		superframe?: CallFrame,
		variables: Iterable<Variable> = [],
	) {
		this._superframe = superframe;
		for (const variable of variables) {
			this.add(variable);
		}
	}

	subframe(variables: Iterable<Variable>): CallFrame {
		return new CallFrame(this, variables);
	}

	add(variable: Variable, value: Value = undefined): void {
		this._values.set(variable, value);
	}

	get(variable: Variable): Value {
		if (this._values.has(variable)) {
			return this._values.get(variable);
		}
		if (this._superframe) {
			return this._superframe.get(variable);
		}
		throw new Error("variable is not declared in call frame");
	}

	set(variable: Variable, value: Value): Value {
		if (this._values.has(variable)) {
			this._values.set(variable, value);
			return value;
		}
		if (this._superframe) {
			return this._superframe.set(variable, value);
		}
		throw new Error("variable is not declared in call frame");
	}

}
