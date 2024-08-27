import { ExpressionFunction, FUNCTION_ARG_MAX } from './ExpressionFunction.js';
import { typeNumber } from './Type.js';

export const funcAdd = new ExpressionFunction(
	(...values: number[])=>
		values.reduce((acc, val)=> acc + val),
	typeNumber, [ typeNumber ], 2, FUNCTION_ARG_MAX,
	(index, vtype, vmask)=> vtype === vmask,
);

export const funcSubtract = new ExpressionFunction(
	(value: number, subtrahend: number)=>
		value - subtrahend,
	typeNumber, [ typeNumber, typeNumber ],
);

export const funcNegate = new ExpressionFunction(
	(value: number)=>
		-value,
	typeNumber, [ typeNumber ],
);

export const funcMultiply = new ExpressionFunction(
	(...values: number[])=>
		values.reduce((acc: any, val: any)=> acc *= val),
	typeNumber,	[ typeNumber ], 2, FUNCTION_ARG_MAX,
);

export const funcDivide = new ExpressionFunction(
	(value: number, divisor: number)=>
		value / divisor,
	typeNumber, [ typeNumber, typeNumber ],
);

export const funcRemainder = new ExpressionFunction(
	(value: number, divisor: number)=>
		value % divisor,
	typeNumber, [ typeNumber, typeNumber ],
);

export const funcModulo = new ExpressionFunction(
	(value: number, divisor: number)=>
		(value % divisor + divisor) % divisor,
	typeNumber, [ typeNumber, typeNumber ],
);

export const funcPercentage = new ExpressionFunction(
	(value: number, part: number)=>
		Math.round(value * part / 100),
	typeNumber, [ typeNumber, typeNumber ],
);

export const funcExponent = new ExpressionFunction(
	(value: number)=>
		Math.exp(value),
	typeNumber, [ typeNumber ],
);

export const funcLogarithm = new ExpressionFunction(
	(value: number)=>
		Math.log(value),
	typeNumber, [ typeNumber ],
);

export const funcPower = new ExpressionFunction(
	(value: number, exponent: number)=>
		Math.pow(value, exponent),
	typeNumber, [ typeNumber, typeNumber ],
);

export const funcRoot = new ExpressionFunction(
	(value: number, exponent: number)=>
		Math.pow(value, 1 / exponent),
	typeNumber, [ typeNumber, typeNumber ],
);

export const funcSquare = new ExpressionFunction(
	(value: number)=>
		value * value,
	typeNumber, [ typeNumber ],
);

export const funcSqrt = new ExpressionFunction(
	(value: number)=>
		Math.sqrt(value),
	typeNumber, [ typeNumber ],
);

export const funcAbs = new ExpressionFunction(
	(value: number)=>
		Math.abs(value),
	typeNumber, [ typeNumber ],
);

export const funcCeil = new ExpressionFunction(
	(value: number)=>
		Math.ceil(value),
	typeNumber, [ typeNumber ],
);

export const funcFloor = new ExpressionFunction(
	(value: number)=>
		Math.floor(value),
	typeNumber, [ typeNumber ],
);

export const funcRound = new ExpressionFunction(
	(value: number)=>
		Math.round(value),
	typeNumber, [ typeNumber ],
);
