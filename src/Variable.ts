import { Value } from './Value.js';
import { Type } from './Type.js';

export class Variable {

	protected _value?: Value;

	constructor(
		protected _type = Type.Unknown,
		protected _constant = false,
	) {}

	get value() {
		return this._value;
	}

	set value(value: Value | undefined) {
		this._value = value;
	}

	get type() {
		return this._type;
	}

	set type(type: Type) {
		this._type = type;
	}

	get constant() {
		return this._constant;
	}

}
