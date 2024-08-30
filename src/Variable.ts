import { Type, Value, typeUnknown } from './Type.js';
import { FunctionSignature } from './FunctionSignature.js';

export class Variable {

	protected _value?: Value;

	constructor(
		protected _type: Type = typeUnknown,
		protected _signature?: FunctionSignature,
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

	get signature(): FunctionSignature | undefined {
		return this._signature;
	}

	set signature(value: FunctionSignature | undefined) {
		this._signature = value;
	}

}
