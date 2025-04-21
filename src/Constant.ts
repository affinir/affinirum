import { Value } from './Value.js';
import { IType, Type } from './Type.js';

export class Constant {

	constructor(
		protected readonly _value: Value,
		protected _type: IType = Type.of(_value),
	) {}

	get value() {
		return this._value;
	}

	get type(): IType {
		return this._type;
	}

	static EmptyArray = new Constant([]);
	static EmptyObject = new Constant({});

}
