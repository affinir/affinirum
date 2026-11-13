import { Type } from "./Type.js";
import type { Value } from "./Value.js";
import type { Variable } from "./Variable.js";

export class CallFrame {

	protected readonly _superframe?: CallFrame;
	protected readonly _values: Map<Variable, Value>;
	protected readonly _types: WeakMap<object, Type[]>;

	constructor(
		superframe?: CallFrame,
		variables: Iterable<Variable> = [],
	) {
		this._superframe = superframe;
		this._values = new Map();
		for (const variable of variables) {
			this._values.set(variable, undefined);
		}
		this._types = superframe?._types ?? new WeakMap();
	}

	subframe(variables: Iterable<Variable>): CallFrame {
		return new CallFrame(this, variables);
	}

	add(variable: Variable, value: Value = undefined): Value {
		this._values.set(variable, value);
		this.define(value, variable.type);
		return value;
	}

	set(variable: Variable, value: Value): Value {
		if (this._values.has(variable)) {
			return this.add(variable, value);
		}
		if (this._superframe) {
			return this._superframe.set(variable, value);
		}
		throw new Error("variable is not declared in call frame");
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

	define(value: Value, type: Type) {
		if (type.isUnknown || typeof value !== "object" || Type.isPrimitive(value) || Type.isFunction(value)) {
			return value;
		}
		const types = this._types.get(value);
		if (!types) {
			this._types.set(value, [type]);
		}
		else if (!types.some((i) => i.equate(type))) {
			types.push(type);
		}
		return value;
	}

	definitions(value: object): readonly Type[] {
		return this._types.get(value) ?? [];
	}

}
