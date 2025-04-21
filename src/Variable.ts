import { Value } from './Value.js';
import { Type } from './Type.js';

export class Variable {

	protected _value?: Value;

	constructor(
		protected _type: Type = Type.Unknown,
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
