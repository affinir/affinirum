import { ExpressionFunction, FUNCTION_ARG_MAX } from './ExpressionFunction.js';
import { Value, typeNumber, typeNumberOrArray, typeAdditive } from './Type.js';

export const funcAdd = new ExpressionFunction(
	(...values: (number | ArrayBufferLike | string | Value[] | { [ key: string ]: Value })[])=>
		typeof values[ 0 ] == 'number'
			? (values as number[]).reduce((a, v)=> a + v)
			: values[ 0 ] instanceof ArrayBuffer || values[ 0 ] instanceof SharedArrayBuffer
				? (values as ArrayBufferLike[]).reduce((a, v)=> concatBuffers(a, v))
				: typeof values[ 0 ] === 'string'
					? (values as string[]).reduce((a, v)=> a + v)
					: Array.isArray(values[ 0 ])
						? (values as Value[][]).reduce((a, v)=> [ ...a, ...v ])
						: (values as { [ key: string ]: Value }[]).reduce((a, v)=> Object.assign(a, v)),
	typeAdditive, [ typeAdditive ], 2, FUNCTION_ARG_MAX,
	(index, vtype, vmask)=> vtype === vmask,
);

export const funcSub = new ExpressionFunction(
	(value: number, subtrahend: number)=>
		value - subtrahend,
	typeNumber, [ typeNumber, typeNumber ],
);

export const funcNeg = new ExpressionFunction(
	(value: number)=>
		-value,
	typeNumber, [ typeNumber ],
);

export const funcMul = new ExpressionFunction(
	(...values: number[])=>
		values.reduce((acc: any, val: any)=> acc *= val),
	typeNumber,	[ typeNumber ], 2, FUNCTION_ARG_MAX,
);

export const funcDiv = new ExpressionFunction(
	(value: number, divisor: number)=>
		value / divisor,
	typeNumber, [ typeNumber, typeNumber ],
);

export const funcRem = new ExpressionFunction(
	(value: number, divisor: number)=>
		value % divisor,
	typeNumber, [ typeNumber, typeNumber ],
);

export const funcMod = new ExpressionFunction(
	(value: number, divisor: number)=>
		(value % divisor + divisor) % divisor,
	typeNumber, [ typeNumber, typeNumber ],
);

export const funcPct = new ExpressionFunction(
	(value: number, part: number)=>
		Math.round(value * part / 100),
	typeNumber, [ typeNumber, typeNumber ],
);

export const funcExp = new ExpressionFunction(
	(value: number)=>
		Math.exp(value),
	typeNumber, [ typeNumber ],
);

export const funcLog = new ExpressionFunction(
	(value: number)=>
		Math.log(value),
	typeNumber, [ typeNumber ],
);

export const funcPow = new ExpressionFunction(
	(value: number, exponent: number)=>
		Math.pow(value, exponent),
	typeNumber, [ typeNumber, typeNumber ],
);

export const funcRt = new ExpressionFunction(
	(value: number, exponent: number)=>
		Math.pow(value, 1 / exponent),
	typeNumber, [ typeNumber, typeNumber ],
);

export const funcSq = new ExpressionFunction(
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

export const funcSum = new ExpressionFunction(
	(...values: (number | number[])[])=>
		values.flat(FUNCTION_ARG_MAX).reduce((acc, val)=> acc + val, 0),
	typeNumber, [ typeNumberOrArray ], 1, FUNCTION_ARG_MAX,
);

export const funcMax = new ExpressionFunction(
	(...values: (number | number[])[])=>
		Math.max(Number.NEGATIVE_INFINITY, ...values.flat(FUNCTION_ARG_MAX)),
	typeNumber, [ typeNumberOrArray ], 1, FUNCTION_ARG_MAX,
);

export const funcMin = new ExpressionFunction(
	(...values: (number | number[])[])=>
		Math.min(Number.POSITIVE_INFINITY, ...values.flat(FUNCTION_ARG_MAX)),
	typeNumber, [ typeNumberOrArray ], 1, FUNCTION_ARG_MAX,
);

export const concatBuffers = (value1: ArrayBufferLike, value2: ArrayBufferLike)=> {
	const bytes = new Uint8Array(value1.byteLength + value2.byteLength);
	bytes.set(new Uint8Array(value1), 0);
	bytes.set(new Uint8Array(value2), value1.byteLength);
	return bytes.buffer;
};
