import { Variable } from "./Variable.js";

export class LexicalScope {

	protected readonly _superscope?: LexicalScope;
	protected readonly _subscopes: LexicalScope[] = [];
	protected readonly _variables: Map<string, Variable>;
	protected readonly _boundary: boolean;

	constructor(
		superscope?: LexicalScope,
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

	subscope(variables?: Map<string, Variable>): LexicalScope {
		return new LexicalScope(this, variables);
	}

	variables(): IterableIterator<Variable> {
		return this._variables.values();
	}

}
