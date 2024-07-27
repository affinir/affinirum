import { ExpressionType, ExpressionValue } from './ExpressionType.js';

export class ExpressionConstant {

	constructor(
		protected _value: ExpressionValue
	) {}

	get value(): ExpressionValue {
		return this._value;
	}

	get type(): ExpressionType {
		return ExpressionType.of(this._value);
	}

}

export const constNull = new ExpressionConstant(undefined);
export const constTrue = new ExpressionConstant(true);
export const constFalse = new ExpressionConstant(false);
export const constNaN = new ExpressionConstant(Number.NaN);
export const constPosInf = new ExpressionConstant(Number.POSITIVE_INFINITY);
export const constNegInf = new ExpressionConstant(Number.NEGATIVE_INFINITY);
export const constEpsilon = new ExpressionConstant(2.718281828459045);
export const constPi = new ExpressionConstant(3.141592653589793);
