import { ValueType } from './ValueType.js';

export const FUNCTION_ARG_MAX = 16536;

export class FunctionType {

	constructor(
		protected readonly _type: ValueType,
		protected readonly _argTypes: ValueType[],
		protected readonly _minArity?: number,
		protected readonly _maxArity?: number,
		protected readonly _typeInference?: number,
		protected readonly _pure = true,
	) {}

	get pure() {
		return this._pure;
	}

	get minArity(): number {
		return this._minArity ?? this._argTypes.length;
	}

	get maxArity(): number {
		return this._maxArity ?? this._argTypes.length;
	}

	get type(): ValueType {
		return this._type;
	}

	argType(index: number) {
		return this._argTypes[index] ?? this._argTypes[this._argTypes.length - 1];
	}

	argTypeInference(type: ValueType, index: number) {
		return this._typeInference && this._typeInference <= index ? this.argType(index).reduce(type) : this.argType(index);
	}

	toString() {
		return `${this._type.toString()}(${this._argTypes.map((i)=> i.toString()).join(', ')})`;
	}

}
