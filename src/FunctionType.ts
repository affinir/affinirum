import { Type } from './Type.js';

export interface IFunctionTypeOptions {
	inference?: number,
	impure?: boolean,
	variadic?: boolean,
}

export class FunctionType {

	constructor(
		protected readonly _retType: Type,
		protected readonly _argTypes: Type[],
		protected readonly _options?: IFunctionTypeOptions,
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

	get isPure() {
		return !this._options?.impure;
	}

	isCompatible(ftype: FunctionType) {
		if (!this._retType.reduce(ftype._retType) || this.minArity > ftype.maxArity || this.maxArity < ftype.minArity) {
			return false;
		}
		for (let i = 0, argc = Math.max(this.minArity, ftype.minArity); i < argc; ++i) {
			if (!this._argTypes[i].reduce(ftype._argTypes[i])) {
				return false;
			}
		}
		return true;
	}

	argType(index: number, type?: Type) {
		const argType = this._argTypes[index] ?? this._argTypes[this._argTypes.length - 1];
		return type && this._options?.inference != null && this._options.inference <= index
			? argType.reduce(type)
			: argType;
	}

	toString(): string {
		return `function ${this._retType.toString()}(${this._argTypes.map((i)=> i.toString()).join(', ')}${this._options?.variadic ? ',...' : ''})`;
	}

}
