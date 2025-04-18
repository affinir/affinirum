import { ValueType, Value, typeUnknown } from './ValueType.js';
import { FunctionType } from './FunctionType.js';

export class Variable {

	protected _value?: Value;

	constructor(
		protected _type: ValueType = typeUnknown,
		protected _signature?: FunctionType,
	) {}

	get value(): Value | undefined {
		return this._value!;
	}

	set value(value: Value | undefined) {
		this._value = value;
	}

	get type(): ValueType {
		return this._type;
	}

	set type(type: ValueType) {
		this._type = type;
	}

	get signature(): FunctionType | undefined {
		return this._signature;
	}

	set signature(value: FunctionType | undefined) {
		this._signature = value;
	}

}
