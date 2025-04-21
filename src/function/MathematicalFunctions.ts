import { Constant } from '../Constant.js';
import { Type } from '../Type.js';

const typeNumberTransform = Type.functionType(Type.Number, [Type.Number]);
const typeNumberOperator = Type.functionType(Type.Number, [Type.Number, Type.Number]);
const typeVariadicNumberOperator = Type.functionType(Type.Number, [Type.Number, Type.Number], { variadic: true });

export const funcAdd = new Constant(
	(...values: number[])=>
		values.reduce((acc, val)=> acc + val),
	typeVariadicNumberOperator,
);

export const funcSubtract = new Constant(
	(value: number, subtrahend: number)=>
		value - subtrahend,
	typeNumberOperator,
);

export const funcNegate = new Constant(
	(value: number)=>
		-value,
	typeNumberTransform,
);

export const funcMultiply = new Constant(
	(...values: number[])=>
		values.reduce((acc: any, val: any)=> acc *= val),
	typeVariadicNumberOperator,
);

export const funcDivide = new Constant(
	(value: number, divisor: number)=>
		value / divisor,
	typeNumberOperator,
);

export const funcRemainder = new Constant(
	(value: number, divisor: number)=>
		value % divisor,
	typeNumberOperator,
);

export const funcModulo = new Constant(
	(value: number, divisor: number)=>
		(value % divisor + divisor) % divisor,
	typeNumberOperator,
);

export const funcExponent = new Constant(
	(value: number)=>
		Math.exp(value),
	typeNumberTransform,
);

export const funcLogarithm = new Constant(
	(value: number)=>
		Math.log(value),
	typeNumberTransform,
);

export const funcPower = new Constant(
	(value: number, exponent: number)=>
		Math.pow(value, exponent),
	typeNumberOperator,
);

export const funcRoot = new Constant(
	(value: number, exponent: number)=>
		Math.pow(value, 1 / exponent),
	typeNumberOperator,
);

export const funcAbs = new Constant(
	(value: number)=>
		Math.abs(value),
	typeNumberTransform,
);

export const funcCeil = new Constant(
	(value: number)=>
		Math.ceil(value),
	typeNumberTransform,
);

export const funcFloor = new Constant(
	(value: number)=>
		Math.floor(value),
	typeNumberTransform,
);

export const funcRound = new Constant(
	(value: number)=>
		Math.round(value),
	typeNumberTransform,
);
