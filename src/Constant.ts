import { FunctionType } from './FunctionType.js';
import { Value, typeUnknown } from './ValueType.js';

export class Constant {

	constructor(
		protected readonly _value: Value,
		protected readonly _signature?: FunctionType,
	) {}

	get value() {
		return this._value;
	}

	get signature() {
		return this._signature;
	}

	toString() {
		return this._signature?.toString() ?? typeUnknown.toString();
	}

}
