import { Type, Value } from './Type.js';

export const FUNCTION_ARG_MAX = 16536;

export class FunctionDefinition {

	constructor(
		protected _function: (...values: any[])=> Value,
		protected _type: Type,
		protected _argTypes: Type[],
		protected _minArity?: number,
		protected _maxArity?: number,
		protected _typeInference?: number,
	) {}

	clone(): FunctionDefinition {
		return new FunctionDefinition(this._function, this._type, this._argTypes, this._minArity, this._maxArity, this._typeInference);
	}

	get evaluate(): (...values: any[])=> Value {
		return this._function;
	}

	get minArity(): number {
		return this._minArity ?? this._argTypes.length;
	}

	get maxArity(): number {
		return this._maxArity ?? this._argTypes.length;
	}

	get type(): Type {
		return this._type;
	}

	argType(index: number) {
		return this._argTypes[ index ] ?? this._argTypes[ this._argTypes.length - 1 ];
	}

	argTypeInference(type: Type, index: number) {
		return this._typeInference && this._typeInference <= index ? this.argType(index).reduce(type) : this.argType(index);
	}

}
