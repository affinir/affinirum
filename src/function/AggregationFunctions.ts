import { FunctionType, FUNCTION_ARG_MAX } from '../FunctionType.js';
import { Constant } from '../Constant.js';
import { Value, typeNumber, typeArray, typeObject, typeNumberOrArray, typeArrayOrObject } from '../ValueType.js';

export const funcSum = new Constant(
	(...values: (number | number[])[])=>
		values.flat(FUNCTION_ARG_MAX).reduce((acc, val)=> acc + val, 0),
	new FunctionType(typeNumber, [typeNumberOrArray], 1, FUNCTION_ARG_MAX),
);

export const funcMin = new Constant(
	(...values: (number | number[])[])=>
		Math.min(Number.POSITIVE_INFINITY, ...values.flat(FUNCTION_ARG_MAX)),
	new FunctionType(typeNumber, [typeNumberOrArray], 1, FUNCTION_ARG_MAX),
);

export const funcMax = new Constant(
	(...values: (number | number[])[])=>
		Math.max(Number.NEGATIVE_INFINITY, ...values.flat(FUNCTION_ARG_MAX)),
	new FunctionType(typeNumber, [typeNumberOrArray], 1, FUNCTION_ARG_MAX),
);

export const funcRange = new Constant(
	(value1: number, value2: number)=> {
		const [min, max] = [Math.floor(Math.min(value1, value2)), Math.ceil(Math.max(value1, value2))];
		return [...Array(max - min).keys()].map((i)=> i + min);
	},
	new FunctionType(typeArray, [typeNumber, typeNumber]),
);

export const funcChain = new Constant(
	(...values: (Value[] | Value[][])[])=>
		(values as []).flat(FUNCTION_ARG_MAX).reduce((acc, val)=> [...acc, val], []),
	new FunctionType(typeArray, [typeArray], 1, FUNCTION_ARG_MAX),
);

export const funcMerge = new Constant(
	(...values: ({ [ key: string ]: Value } | { [ key: string ]: Value }[])[])=>
		values.flat(FUNCTION_ARG_MAX).reduce((acc, val)=> Object.assign(acc, val), {}),
	new FunctionType(typeObject, [typeArrayOrObject], 1, FUNCTION_ARG_MAX),
);
