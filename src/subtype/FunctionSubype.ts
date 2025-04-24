import { ISubtype, Type } from '../Type.js';

export interface IFunctionSubtypeOptions {
	unstable?: boolean,
	variadic?: boolean,
}

export class FunctionSubtype implements ISubtype {

	constructor(
		protected readonly _retType: Type,
		protected readonly _argTypes: Type[],
		protected readonly _options?: IFunctionSubtypeOptions,
	) {
		let i = _argTypes.length - 1;
		while (i > 1) {
			if (!_argTypes[i--].isOptional && _argTypes[i].isOptional) {
				throw new Error('a required parameter follows an optional parameter');
			}
		}
	}

	get retType() {
		return this._retType;
	}

	get minArity() {
		return this._argTypes.filter((i)=> !i.isOptional).length;
	}

	get maxArity() {
		return this._options?.variadic ? Number.POSITIVE_INFINITY : this._argTypes.length;
	}

	types() {
		return [this._retType, ...this._argTypes];
	}

	argType(index: number) {
		return this._argTypes[index] ?? this._argTypes[this._argTypes.length - 1];
	}

	get unstable() {
		return this._options?.unstable ?? false;
	}

	get variadic() {
		return this._options?.variadic ?? false;
	}

	stable(): boolean {
		return !this._options?.unstable && this.types().every((i)=> i.stable);
	}

	match(subtype: ISubtype): boolean {
		if (subtype instanceof FunctionSubtype) {
			if (!this._retType.reduce(subtype._retType) || this.minArity > subtype.maxArity || this.maxArity < subtype.minArity) {
				return false;
			}
			for (let i = 0, argc = Math.max(this.minArity, subtype.minArity); i < argc; ++i) {
				if (!this._argTypes[i].reduce(subtype._argTypes[i])) {
					return false;
				}
			}
			return true;
		}
		return false;
	}

	order(): number {
		return 0x100000000 + this.types().reduce((acc, i)=> acc + i.order(), 0);
	}

	toString(): string {
		const argTypes = this._argTypes.map((i)=> i.toString()).join(', ');
		return `{${this._options?.unstable ? '!!' : ''}${this._retType.toString()}(${argTypes}${this._options?.variadic ? ',...' : ''})}`;
	}

}
