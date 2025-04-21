import { Value } from './Value.js';
import { IType, Type } from './Type.js';

export class Variable {

	protected _value?: Value;

	constructor(
		protected _type: IType = Type.Unknown,
	) {}

	get value(): Value | undefined {
		return this._value!;
	}

	set value(value: Value | undefined) {
		this._value = value;
	}

	get type(): IType {
		return this._type;
	}

	set type(type: IType) {
		this._type = type;
	}

}
