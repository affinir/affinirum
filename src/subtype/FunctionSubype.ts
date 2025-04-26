import { IType, Type } from '../Type.js';
import { PrimitiveSubtype } from './PrimitiveSubtype.js';

export class FunctionSubtype implements IType {

	constructor(
		protected readonly _retType: Type,
		protected readonly _argTypes: Type[],
		protected readonly _variadic?: boolean,
		protected readonly _unstable?: boolean,
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
		return this._variadic ? Number.POSITIVE_INFINITY : this._argTypes.length;
	}

	types() {
		return [this._retType, ...this._argTypes];
	}

	argType(index: number) {
		return this._argTypes[index] ?? this._argTypes[this._argTypes.length - 1];
	}

	get unstable() {
		return this._unstable ?? false;
	}

	get variadic() {
		return this._variadic ?? false;
	}

	stable(): boolean {
		return !this._unstable && this.types().every((i)=> i.stable());
	}

	match(subtype: IType): boolean {
		if (subtype instanceof FunctionSubtype) {
			if (!this._retType.reduce(subtype._retType) || this.minArity > subtype.maxArity || this.maxArity < subtype.minArity) {
				return false;
			}
			for (let i = 0, argc = Math.max(this.minArity, subtype.minArity); i < argc; ++i) {
				if (!this.argType(i).reduce(subtype.argType(i))) {
					return false;
				}
			}
			return true;
		}
		return false;
	}

	weight(): number {
		return 0x100000000 + this.types().reduce((acc, i)=> acc + i.weight(), 0);
	}

	toString(): string {
		const argTypes = this._argTypes.map((i)=> i.toString()).join(',');
		return `{${this._retType.toString()}}(${argTypes}${this._variadic ? '...' : ''})${this._unstable ? '!!' : ''}`;
	}

}
