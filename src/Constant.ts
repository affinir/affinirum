import { Value } from './Value.js';
import { Type } from './Type.js';

export class Constant {

	constructor(
		protected readonly _value: Value,
		protected _type: Type = Type.of(_value),
	) {}

	get value() {
		return this._value;
	}

	get type() {
		return this._type;
	}

	set type(type: Type) {
		this._type = type;
	}

	static EmptyArray = new Constant([]);
	static EmptyObject = new Constant({});

}
