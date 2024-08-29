import { Type, Value, typeUnknown } from './Type.js';

export class Variable {

	constructor(
		protected _value: Value | undefined = undefined,
		protected _type: Type = typeUnknown,
	) {}

	get value(): Value | undefined {
		return this._value!;
	}

	set value(value: Value | undefined) {
		this._value = value;
	}

	get type(): Type {
		return this._type;
	}

	set type(type: Type) {
		this._type = type;
	}

}
