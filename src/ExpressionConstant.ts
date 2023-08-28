import { ExpressionValueType } from './ExpressionType.js';

export class ExpressionConstant {

	constructor(
		protected _value: ExpressionValueType
	) {}

	get value(): ExpressionValueType {
		return this._value;
	}

}
