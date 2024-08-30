import { FunctionDefinition, FUNCTION_ARG_MAX } from '../FunctionDefinition.js';
import { Value, typeBoolean, typeNumber, typeArray, typeObject, typeBooleanOrArray, typeNumberOrArray, typeArrayOrObject } from '../Type.js';

export const funcOr = new FunctionDefinition(
	(...values: (boolean | boolean[])[])=>
		values.flat(FUNCTION_ARG_MAX).some((v)=> v),
	typeBoolean, [ typeBooleanOrArray ], 2, FUNCTION_ARG_MAX,
);

export const funcAnd = new FunctionDefinition(
	(...values: (boolean | boolean[])[])=>
		values.flat(FUNCTION_ARG_MAX).every((v)=> v),
	typeBoolean, [ typeBooleanOrArray ], 2, FUNCTION_ARG_MAX,
);

export const funcNot = new FunctionDefinition(
	(value: boolean)=>
		!value,
	typeBoolean, [ typeBoolean ],
);

export const funcSum = new FunctionDefinition(
	(...values: (number | number[])[])=>
		values.flat(FUNCTION_ARG_MAX).reduce((acc, val)=> acc + val, 0),
	typeNumber, [ typeNumberOrArray ], 1, FUNCTION_ARG_MAX,
);

export const funcMax = new FunctionDefinition(
	(...values: (number | number[])[])=>
		Math.max(Number.NEGATIVE_INFINITY, ...values.flat(FUNCTION_ARG_MAX)),
	typeNumber, [ typeNumberOrArray ], 1, FUNCTION_ARG_MAX,
);

export const funcMin = new FunctionDefinition(
	(...values: (number | number[])[])=>
		Math.min(Number.POSITIVE_INFINITY, ...values.flat(FUNCTION_ARG_MAX)),
	typeNumber, [ typeNumberOrArray ], 1, FUNCTION_ARG_MAX,
);

export const funcRange = new FunctionDefinition(
	(value1: number, value2: number)=> {
		const [ min, max ] = [ Math.floor(Math.min(value1, value2)), Math.ceil(Math.max(value1, value2)) ];
		return [ ...Array(max - min).keys() ].map((i)=> i + min);
	},
	typeArray, [ typeNumber, typeNumber ],
);

export const funcChain = new FunctionDefinition(
	(...values: (Value[] | Value[][])[])=>
		(values as []).flat(FUNCTION_ARG_MAX).reduce((acc, val)=> [ ...acc, val ], []),
	typeArray, [ typeArray ], 1, FUNCTION_ARG_MAX,
);

export const funcMerge = new FunctionDefinition(
	(...values: ({ [ key: string ]: Value } | { [ key: string ]: Value }[])[])=>
		values.flat(FUNCTION_ARG_MAX).reduce((acc, val)=> Object.assign(acc, val), {}),
	typeObject, [ typeArrayOrObject ], 1, FUNCTION_ARG_MAX,
);
