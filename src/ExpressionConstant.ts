import { Type, Value } from './Type.js';

export class ExpressionConstant {

	constructor(
		protected _value: Value
	) {}

	get value(): Value {
		return this._value;
	}

	get type(): Type {
		return Type.of(this._value);
	}

}

export const constNull = new ExpressionConstant(undefined);
export const constTrue = new ExpressionConstant(true);
export const constFalse = new ExpressionConstant(false);
export const constNAN = new ExpressionConstant(Number.NaN);
export const constPOSINF = new ExpressionConstant(Number.POSITIVE_INFINITY);
export const constNEGINF = new ExpressionConstant(Number.NEGATIVE_INFINITY);
export const constEPSILON = new ExpressionConstant(2.718281828459045);
export const constPI = new ExpressionConstant(3.141592653589793);
