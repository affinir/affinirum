import { Constant } from '../Constant.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';

const typeNumberOrArray = new Type('number', 'array');
const typeArrayOrObject = new Type('array', Type.DefaultObjectType);
const typeAggregator = Type.functionType(Type.Number, [typeNumberOrArray], { variadic: true });

export const funcSum = new Constant(
	(...values: (number | number[])[])=>
		values.flat().reduce((acc, val)=> acc + val, 0),
	typeAggregator,
);

export const funcMin = new Constant(
	(...values: (number | number[])[])=>
		Math.min(Number.POSITIVE_INFINITY, ...values.flat()),
	typeAggregator,
);

export const funcMax = new Constant(
	(...values: (number | number[])[])=>
		Math.max(Number.NEGATIVE_INFINITY, ...values.flat()),
	typeAggregator,
);

export const funcRange = new Constant(
	(value1: number, value2: number)=> {
		const [min, max] = [Math.floor(Math.min(value1, value2)), Math.ceil(Math.max(value1, value2))];
		return [...Array(max - min).keys()].map((i)=> i + min);
	},
	Type.functionType(Type.Array, [Type.Number, Type.Number]),
);

export const funcChain = new Constant(
	(...values: (Value[] | Value[][])[])=>
		(values as []).flat(2).reduce((acc, val)=> [...acc, val], []),
	Type.functionType(Type.Array, [Type.Array], { variadic: true }),
);

export const funcMerge = new Constant(
	(...values: ({ [ key: string ]: Value } | { [ key: string ]: Value }[])[])=>
		values.flat().reduce((acc, val)=> Object.assign(acc, val), {}),
	Type.functionType(Type.Object, [typeArrayOrObject], { variadic: true }),
);
