import { Constant } from '../Constant.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';
import { equate } from '../base/Unknown.js';
import { concatBuffers } from '../base/Buffer.js';

const typeNumberOrString = new Type('number', 'string');
const typeArrayOrObject = new Type('array', 'object');
const typeArrayOperator = Type.functionType(Type.Array, [Type.Array, Type.Array]);
const typeTransform = Type.functionType(Type.Unknown, [Type.Unknown, Type.OptionalNumber, Type.OptionalArray]);
const typePredicate = Type.functionType(Type.Boolean, [Type.Unknown, Type.OptionalNumber, Type.OptionalArray]);
const typeReducer = Type.functionType(Type.Unknown, [Type.Unknown, Type.Unknown, Type.OptionalNumber, Type.OptionalArray]);
const typeComposer = Type.functionType(Type.Object, [Type.Object, Type.String, Type.OptionalNumber, Type.OptionalArray]);
const typeItemFinder = Type.functionType(Type.Unknown, [Type.Array, typePredicate]);
const typeIndexFinder = Type.functionType(Type.Number, [Type.Array, typePredicate]);
const typeConditionFinder = Type.functionType(Type.Boolean, [Type.Array, typePredicate]);

export const funcUnique = new Constant(
	(value: Value[])=> {
		const result: Value[] = [];
		value.forEach((i)=> {
			if (result.every((v)=> !equate(v, i))) {
				result.push(i);
			}
		});
		return result;
	},
	Type.functionType(Type.Array, [Type.Array]),
);

export const funcIntersection = new Constant(
	(value1: Value[], value2: Value[])=>
		value1.filter((i)=> value2.some((v)=> equate(v, i))),
	typeArrayOperator,
);

export const funcDifference = new Constant(
	(value1: Value[], value2: Value[])=>
		[...value1.filter((i)=> value2.every((v)=> !equate(v, i))), ...value2.filter((i)=> value1.every((v)=> !equate(v, i)))],
	typeArrayOperator,
);

export const funcAppend = new Constant(
	(...values: (ArrayBuffer | string | Value[])[])=>
		values[0] instanceof ArrayBuffer
			? (values as ArrayBuffer[]).reduce((acc, val)=> concatBuffers(acc, val), new ArrayBuffer(0))
			: typeof values[0] === 'string'
				? (values as string[]).reduce((acc, val)=> acc + val, '')
				: (values as Value[][]).reduce((acc, val)=> [...acc, ...val], []),
	Type.functionType(Type.Enumerable, [Type.Enumerable], { inference: 0, variadic: true }),
);

export const funcLength = new Constant(
	(value: ArrayBuffer | string | Value[] | { [ key: string ]: Value })=>
		value == null
			? undefined
			:	value instanceof ArrayBuffer
				? value.byteLength
				: typeof value === 'string' || Array.isArray(value)
					? value.length
					: Object.keys(value).length,
	Type.functionType(Type.Number, [Type.Iterable]),
);

export const funcSlice = new Constant(
	(value: ArrayBuffer | string | Value[], start: number = 0, end?: number)=>
		value == null
			? undefined
			: value.slice(start, end) as Value,
	Type.functionType(Type.Enumerable, [Type.Enumerable, Type.OptionalNumber, Type.OptionalNumber], { inference: 0 }),
);

export const funcByte = new Constant(
	(value: ArrayBuffer, pos: number)=>
		value == null
			? undefined
			: value.slice(pos, pos + 1),
	Type.functionType(Type.Buffer, [Type.Buffer, Type.Number]),
);

export const funcChar = new Constant(
	(value: string, pos: number)=>
		value == null
			? undefined
			: value.charAt(pos < 0 ? value.length + pos : pos),
	Type.functionType(Type.String, [Type.String, Type.Number]),
);

export const funcCharCode = new Constant(
	(value: string, pos: number)=>
		value == null
			? undefined
			: value.charCodeAt(pos < 0 ? value.length + pos : pos),
	Type.functionType(Type.Number, [Type.String, Type.Number]),
);

export const funcEntries = new Constant(
	(value: Value[] | { [ key: string ]: Value } | undefined)=>
		value == null
			? undefined
			: Array.isArray(value)
				? Object.entries(value).map((e)=> [Number(e[0]), e[1]])
				: Object.entries(value),
	Type.functionType(Type.OptionalArray, [typeArrayOrObject]),
);

export const funcKeys = new Constant(
	(value:  Value[] | { [ key: string ]: Value } | undefined)=>
		value == null
			? undefined
			: Array.isArray(value)
				? Object.keys(value).map((k)=> Number(k))
				: Object.keys(value),
	Type.functionType(Type.OptionalArray, [typeArrayOrObject]),
);

export const funcValues = new Constant(
	(value:  Value[] | { [ key: string ]: Value } | undefined)=>
		value == null
			? undefined
			: Object.values(value),
	Type.functionType(Type.OptionalArray, [typeArrayOrObject]),
);

export const funcAt = new Constant(
	(value: Value[] | { [ key: string ]: Value } | undefined, index: number | string)=> {
		if (value == null) {
			return undefined;
		}
		else if (Array.isArray(value)) {
			const ix = Number(index);
			return value[ix < 0 ? value.length + ix : ix];
		}
		else {
			return value[String(index)];
		}
	},
	Type.functionType(Type.Unknown, [typeArrayOrObject, typeNumberOrString]),
);

export const funcFirst = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value?.find((v, i, a)=> predicate(v, i, a)),
	typeItemFinder,
);

export const funcLast = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value?.reverse().find((v, i, a)=> predicate(v, i, a)),
	typeItemFinder,
);

export const funcFirstIndex = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=> {
		if (value == null) {
			return undefined;
		}
		const ix = value.findIndex((v, i, a)=> predicate(v, i, a));
		return ix < 0 ? Number.NaN : ix;
	},
	typeIndexFinder,
);

export const funcLastIndex = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=> {
		if (value == null) {
			return undefined;
		}
		const ix = [...value].reverse().findIndex((v, i, a)=> predicate(v, i, a));
		return ix < 0 ? Number.NaN : ix;
	},
	typeIndexFinder,
);

export const funcEvery = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value?.every((v, i, a)=> predicate(v, i, a)),
	typeConditionFinder,
);

export const funcAny = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value?.some((v, i, a)=> predicate(v, i, a)),
	typeConditionFinder,
);

export const funcFlatten = new Constant(
	(values: Value[], depth?: number)=>
		(values as [])?.flat(depth) as Value,
	Type.functionType(Type.Array, [Type.Array, Type.OptionalNumber]),
);

export const funcReverse = new Constant(
	(value: Value[])=>
		[...value].reverse(),
	Type.functionType(Type.Array, [Type.Array]),
);

export const funcTransform = new Constant(
	(value: Value[], transform: (v: Value, i: number, a: Value[])=> Value)=>
		value?.map(transform),
	Type.functionType(Type.Array, [Type.Array, typeTransform]),
);

export const funcFilter = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value?.filter(predicate),
	Type.functionType(Type.Array, [Type.Array, typePredicate]),
);

export const funcReduce = new Constant(
	(value: Value[], reducer: (acc: Value, v: Value, i: number, arr: Value[])=> Value, initial?: Value)=>
		initial != null ? value?.reduce(reducer, initial) : value?.reduce(reducer),
	Type.functionType(Type.Unknown, [Type.Array, typeReducer, Type.Unknown]),
);

export const funcCompose = new Constant(
	(value: string[], callback: (acc: { [ key: string ]: Value }, v: string, i: number, arr: string[])=> { [ key: string ]: Value })=> {
		if (value == null) {
			return undefined;
		}
		const obj: Record<string, any> = {};
		for (let i = 0; i < value.length; ++i) {
			const key =  value[i];
			obj[key] = callback(obj, key, i, value);
		}
		return obj;
	},
	Type.functionType(Type.Object, [Type.Array, typeComposer]),
);
