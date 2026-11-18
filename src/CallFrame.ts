import { Type } from "./Type.js";
import type { Value } from "./Value.js";
import type { Variable } from "./Variable.js";

export class CallFrame {

	protected readonly _stop?: { deadline?: Date };
	protected readonly _superframe?: CallFrame;
	protected readonly _values: Map<Variable, Value>;
	protected readonly _types: WeakMap<object, Type[]>;

	constructor(
		superframe?: CallFrame | Date,
		variables: Iterable<Variable> = [],
	) {
		if (superframe instanceof CallFrame) {
			this._superframe = superframe;
			this._stop = superframe._stop;
		}
		else if (superframe instanceof Date) {
			this._stop = { deadline: superframe };
		}
		this._values = new Map();
		for (const variable of variables) {
			this._values.set(variable, undefined);
		}
		this._types = this._superframe?._types ?? new WeakMap();
	}

	timer(): void {
		const deadline = this._stop?.deadline;
		if (deadline && new Date() > deadline) {
			throw new Error("execution timeout");
		}
	}

	clearTimer(): void {
		if (this._stop) {
			this._stop.deadline = undefined;
		}
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
		if (this._superframe instanceof CallFrame) {
			return this._superframe.set(variable, value);
		}
		throw new Error("variable is not declared in call frame");
	}

	get(variable: Variable): Value {
		if (this._values.has(variable)) {
			return this._values.get(variable);
		}
		if (this._superframe instanceof CallFrame) {
			return this._superframe.get(variable);
		}
		throw new Error("variable is not declared in call frame");
	}

	define(value: Value, type: Type): Value {
		if (type.isAny || typeof value !== "object" || Type.isPrimitive(value) || Type.isFunction(value)) {
			return value;
		}
		const types = this._types.get(value);
		if (!types) {
			this._types.set(value, [type]);
		}
		else if (!types.some((i) => i.equals(type))) {
			types.push(type);
		}
		return value;
	}

	definitions(value: object): readonly Type[] {
		return this._types.get(value) ?? [];
	}

}
