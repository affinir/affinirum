import { Value } from "./Value.js";
import { Variable } from "./Variable.js";

export class Scope {

	protected readonly _subscopes: Scope[] = [];
	protected readonly _superscope?: Scope;
	protected readonly _variables: Map<string, Variable>;
	protected readonly _boundary: boolean;

	constructor(
		superscope?: Scope,
		variables?: Map<string, Variable>,
	) {
		superscope?._subscopes.push(this);
		this._superscope = superscope;
		this._variables = variables ?? new Map();
		this._boundary = Boolean(variables);
	}

	has(name: string): boolean {
		return this._variables.has(name) || Boolean(this._superscope?.has(name));
	}

	get(name: string): Variable | undefined {
		return this._variables.get(name) ?? this._superscope?.get(name);
	}

	set(name: string, variable: Variable): void {
		this._variables.set(name, variable);
	}

	subscope(variables?: Map<string, Variable>): Scope {
		return new Scope(this, variables);
	}

	enter(values = new Map<Variable, Value>()): Map<Variable, Value> {
		for (const variable of this._variables.values()) {
			values.set(variable, variable.value);
			variable.value = undefined;
		}
		for (const subscope of this._subscopes) {
			if (!subscope._boundary) {
				subscope.enter(values);
			}
		}
		return values;
	}

	leave(values: Map<Variable, Value>): void {
		for (const [variable, value] of values) {
			variable.value = value;
		}
	}

	clear(): void {
		for (const variable of this._variables.values()) {
			variable.value = undefined;
		}
		for (const subscope of this._subscopes) {
			subscope.clear();
		}
	}

}
