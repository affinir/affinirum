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
		values.flat().reduce((min, val)=> val < min ? val : min),
	typeAggregator,
);

const funcMax = new Constant(
	(...values: (bigint | bigint[])[])=>
		values.flat().reduce((max, val)=> val > max ? val : max),
	typeAggregator,
);

const funcRandomInteger = new Constant(
	(value: bigint)=>
		value == null ? undefined : BigInt(Math.floor(Math.random() * Number(value))),
	Type.functionType(Type.Integer, [Type.Integer]),
	false,
);

const funcFormatInteger = new Constant(
	(value: bigint, radix?: bigint)=>
		value?.toString(radix ? Number(radix) : undefined) ?? '',
	Type.functionType(Type.String, [Type.Integer, Type.OptionalInteger]),
);

const funcParseInteger = new Constant(
	(value: string)=>
		value ? BigInt(value) : undefined,
	Type.functionType(Type.OptionalInteger, [Type.String]),
);

export const constInteger = {
	Sum: funcSum,
	Min: funcMin,
	Max: funcMax,
	Random: funcRandomInteger,
	Format: funcFormatInteger,
	Parse: funcParseInteger,
};
