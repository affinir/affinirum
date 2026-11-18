import { Type } from "./Type.js";
import { LocalVariable } from "./Variable.js";

export class LexicalScope {

	protected readonly _superscope?: LexicalScope;
	protected readonly _subscopes: LexicalScope[] = [];
	protected readonly _variables: Map<string, LocalVariable>;
	protected readonly _type: Type;
	readonly inFunction: boolean;
	inLoop: boolean;

	constructor(
		superscope?: LexicalScope,
		variables?: Map<string, LocalVariable>,
		type?: Type,
		boundary = false,
	) {
		superscope?._subscopes.push(this);
		this._superscope = superscope;
		this._variables = variables ?? new Map();
		this._type = type ?? superscope?.type ?? Type.Any;
		this.inFunction = boundary || Boolean(superscope?.inFunction);
		this.inLoop = !boundary && Boolean(superscope?.inLoop);
	}

	has(name: string): boolean {
		return this._variables.has(name) || Boolean(this._superscope?.has(name));
	}

	get(name: string): LocalVariable | undefined {
		return this._variables.get(name) ?? this._superscope?.get(name);
	}

	set(name: string, variable: LocalVariable): void {
		this._variables.set(name, variable);
	}

	subscope(variables?: Map<string, LocalVariable>, type?: Type, boundary = false): LexicalScope {
		return new LexicalScope(this, variables, type, boundary);
	}

	variables(): IterableIterator<LocalVariable> {
		return this._variables.values();
	}

	get type(): Type {
		return this._type;
	}

}
