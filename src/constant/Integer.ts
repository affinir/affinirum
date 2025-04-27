import { Constant } from '../Constant.js';
import { Type } from '../Type.js';

const typeIntegerOrArray = Type.union(Type.Integer, Type.arrayType([Type.Integer]));
const typeAggregator = Type.functionType(Type.Integer, [typeIntegerOrArray], true);

const funcSum = new Constant(
	(...values: (bigint | bigint[])[])=>
		values.flat().reduce((acc, val)=> acc + val, 0n),
	typeAggregator,
);

const funcMin = new Constant(
	(...values: (bigint | bigint[])[])=>
		values.flat().reduce((max, val)=> val > max ? val : max),
	typeAggregator,
);

const funcMax = new Constant(
	(...values: (bigint | bigint[])[])=>
		values.flat().reduce((min, val)=> val < min ? val : min),
	typeAggregator,
);

const funcRandomInteger = new Constant(
	(value: bigint)=>
		value == null ? undefined : BigInt(Math.floor(Math.random() * Number(value))),
	Type.functionType(Type.Integer, [Type.Integer]),
	false,
);

export const constInteger = {
	Sum: funcSum,
	Min: funcMin,
	Max: funcMax,
	Random: funcRandomInteger,
};
