import { Value } from "./Value.js";
import { Type } from "./Type.js";

export class Constant {

	constructor(
		protected readonly _value: Value,
		protected _type: Type = Type.of(_value),
		protected readonly _deterministic: boolean = true,
	) {}

	get value() {
		return this._value;
	}

	get type() {
		return Type.isPrimitiveType(this._value) ? Type.of(this._value) : this._type;
	}

	set type(type: Type) {
		this._type = type;
	}

	get deterministic() {
		return this._deterministic;
	}

	static Null = new Constant(undefined);
	static EmptyArray = new Constant([]);
	static EmptyObject = new Constant({});
	static EmptyFunction = new Constant(()=> undefined, Type.functionType(undefined, [], false));

}
