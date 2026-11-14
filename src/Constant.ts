import { Value } from "./Value.js";
import { Type } from "./Type.js";

export class Constant {

	protected readonly _value: Value;
	protected _type: Type;

	constructor(
		value: Value,
		type: Type = Type.of(value),
	) {
		this._value = value;
		this._type = type;
	}

	get value() {
		return this._value;
	}

	get type() {
		return Type.isPrimitive(this._value) ? Type.of(this._value) : this._type;
	}

	set type(type: Type) {
		this._type = type;
	}

	static Null = new Constant(undefined);

}
