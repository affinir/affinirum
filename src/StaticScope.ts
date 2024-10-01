import { Variable } from './Variable.js';

export class StaticScope {

	protected _superscope?: StaticScope;
	protected _subscopes: StaticScope[] = [];
	protected _variables = new Map<string, Variable>();
	protected _locals = new Set<string>();

	has(name: string): boolean {
		return this._variables.has(name) || Boolean(this._superscope?.has(name));
	}

	get(name: string): Variable | undefined {
		return this._variables.get(name) ?? this._superscope?.get(name);
	}

	set(name: string, variable: Variable): StaticScope {
		this._superscope?.set(name, variable) ?? this._variables.set(name, variable);
		return this;
	}

	local(name: string, variable: Variable): StaticScope {
		this._variables.set(name, variable);
		this._locals.add(name);
		return this;
	}

	subscope(variables: Map<string, Variable>): StaticScope {
		const scope = new StaticScope();
		scope._superscope = this;
		this._subscopes.push(scope);
		for (const [name, variable] of variables) {
			scope.local(name, variable);
		}
		return scope;
	}

	variables(): Record<string, Variable> {
		const variables: Record<string, Variable> = {};
		for (const [name, variable] of this._variables) {
			if (!this._locals.has(name)) {
				variables[ name ] = variable;
			}
		}
		return variables;
	}

}
