import { FunctionDefinition, FUNCTION_ARG_MAX } from '../FunctionDefinition.js';
import { typeBuffer, typeNumber } from '../Type.js';

export const funcAdd = new FunctionDefinition(
	(...values: number[])=>
		values.reduce((acc, val)=> acc + val),
	typeNumber, [typeNumber], 2, FUNCTION_ARG_MAX,
);

export const funcSubtract = new FunctionDefinition(
	(value: number, subtrahend: number)=>
		value - subtrahend,
	typeNumber, [typeNumber, typeNumber],
);

export const funcNegate = new FunctionDefinition(
	(value: number)=>
		-value,
	typeNumber, [typeNumber],
);

export const funcMultiply = new FunctionDefinition(
	(...values: number[])=>
		values.reduce((acc: any, val: any)=> acc *= val),
	typeNumber,	[typeNumber], 2, FUNCTION_ARG_MAX,
);

export const funcDivide = new FunctionDefinition(
	(value: number, divisor: number)=>
		value / divisor,
	typeNumber, [typeNumber, typeNumber],
);

export const funcRemainder = new FunctionDefinition(
	(value: number, divisor: number)=>
		value % divisor,
	typeNumber, [typeNumber, typeNumber],
);

export const funcModulo = new FunctionDefinition(
	(value: number, divisor: number)=>
		(value % divisor + divisor) % divisor,
	typeNumber, [typeNumber, typeNumber],
);

export const funcExponent = new FunctionDefinition(
	(value: number)=>
		Math.exp(value),
	typeNumber, [typeNumber],
);

export const funcLogarithm = new FunctionDefinition(
	(value: number)=>
		Math.log(value),
	typeNumber, [typeNumber],
);

export const funcPower = new FunctionDefinition(
	(value: number, exponent: number)=>
		Math.pow(value, exponent),
	typeNumber, [typeNumber, typeNumber],
);

export const funcRoot = new FunctionDefinition(
	(value: number, exponent: number)=>
		Math.pow(value, 1 / exponent),
	typeNumber, [typeNumber, typeNumber],
);

export const funcAbs = new FunctionDefinition(
	(value: number)=>
		Math.abs(value),
	typeNumber, [typeNumber],
);

export const funcCeil = new FunctionDefinition(
	(value: number)=>
		Math.ceil(value),
	typeNumber, [typeNumber],
);

export const funcFloor = new FunctionDefinition(
	(value: number)=>
		Math.floor(value),
	typeNumber, [typeNumber],
);

export const funcRound = new FunctionDefinition(
	(value: number)=>
		Math.round(value),
	typeNumber, [typeNumber],
);

export const funcRandomNumber = new FunctionDefinition(
	(value: number)=>
		value == null ? undefined : Math.random() * value,
	typeNumber, [typeNumber],
);

export const funcRandomInteger = new FunctionDefinition(
	(value: number)=>
		value == null ? undefined : Math.floor(Math.random() * value),
	typeNumber, [typeNumber],
);

export const funcRandomBuffer = new FunctionDefinition(
	(value: number)=>
		value == null ? undefined : crypto.getRandomValues(new Uint8Array(value)),
	typeBuffer, [typeNumber],
);
