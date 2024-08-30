import { Type } from './Type.js';

export class FunctionSignature {

	constructor(
		protected readonly _type: Type,
		protected readonly _argTypes: Type[],
		protected readonly _minArity?: number,
		protected readonly _maxArity?: number,
		protected readonly _typeInference?: number,
	) {}

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
