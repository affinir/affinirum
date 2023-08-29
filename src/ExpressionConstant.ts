import { ExpressionValueType } from './ExpressionType.js';

export class ExpressionConstant {

	constructor(
		protected _value: ExpressionValueType
	) {}

	get value(): ExpressionValueType {
		return this._value;
	}

}

export const constTrue = new ExpressionConstant( true );
export const constFalse = new ExpressionConstant( false );
export const constNan = new ExpressionConstant( Number.NaN );
export const constPi = new ExpressionConstant( 3.141592653589793 );
export const constEpsilon = new ExpressionConstant( 2.718281828459045 );
