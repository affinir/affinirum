import { FunctionType, FUNCTION_ARG_MAX } from '../FunctionType.js';
import { Constant } from '../Constant.js';
import { typeNumber } from '../ValueType.js';

export const funcAdd = new Constant(
	(...values: number[])=>
		values.reduce((acc, val)=> acc + val),
	new FunctionType(typeNumber, [typeNumber], 2, FUNCTION_ARG_MAX),
);

export const funcSubtract = new Constant(
	(value: number, subtrahend: number)=>
		value - subtrahend,
	new FunctionType(typeNumber, [typeNumber, typeNumber]),
);

export const funcNegate = new Constant(
	(value: number)=>
		-value,
	new FunctionType(typeNumber, [typeNumber]),
);

export const funcMultiply = new Constant(
	(...values: number[])=>
		values.reduce((acc: any, val: any)=> acc *= val),
	new FunctionType(typeNumber,	[typeNumber], 2, FUNCTION_ARG_MAX),
);

export const funcDivide = new Constant(
	(value: number, divisor: number)=>
		value / divisor,
	new FunctionType(typeNumber, [typeNumber, typeNumber]),
);

export const funcRemainder = new Constant(
	(value: number, divisor: number)=>
		value % divisor,
	new FunctionType(typeNumber, [typeNumber, typeNumber]),
);

export const funcModulo = new Constant(
	(value: number, divisor: number)=>
		(value % divisor + divisor) % divisor,
	new FunctionType(typeNumber, [typeNumber, typeNumber]),
);

export const funcExponent = new Constant(
	(value: number)=>
		Math.exp(value),
	new FunctionType(typeNumber, [typeNumber]),
);

export const funcLogarithm = new Constant(
	(value: number)=>
		Math.log(value),
	new FunctionType(typeNumber, [typeNumber]),
);

export const funcPower = new Constant(
	(value: number, exponent: number)=>
		Math.pow(value, exponent),
	new FunctionType(typeNumber, [typeNumber, typeNumber]),
);

export const funcRoot = new Constant(
	(value: number, exponent: number)=>
		Math.pow(value, 1 / exponent),
	new FunctionType(typeNumber, [typeNumber, typeNumber]),
);

export const funcAbs = new Constant(
	(value: number)=>
		Math.abs(value),
	new FunctionType(typeNumber, [typeNumber]),
);

export const funcCeil = new Constant(
	(value: number)=>
		Math.ceil(value),
	new FunctionType(typeNumber, [typeNumber]),
);

export const funcFloor = new Constant(
	(value: number)=>
		Math.floor(value),
	new FunctionType(typeNumber, [typeNumber]),
);

export const funcRound = new Constant(
	(value: number)=>
		Math.round(value),
	new FunctionType(typeNumber, [typeNumber]),
);
