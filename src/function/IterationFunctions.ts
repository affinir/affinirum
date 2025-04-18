import { equal } from '../base/Unknown.js';
import { concatBuffers } from '../base/Buffer.js';
import { FunctionType, FUNCTION_ARG_MAX } from '../FunctionType.js';
import { Constant } from '../Constant.js';
import { Value, typeUnknown, typeBoolean, typeNumber, typeBuffer, typeString, typeArray, typeObject, typeFunction,
	typeOptionalNumber, typeOptionalArray, typeNumberOrString, typeOptionalArrayOrObject,
	typeEnumerable, typeIterable } from '../ValueType.js';

export const funcUnique = new Constant(
	(value: Value[])=> {
		const result: Value[] = [];
		value.forEach((i)=> {
			if (result.every((v)=> !equal(v, i))) {
				result.push(i);
			}
		});
		return result;
	},
	new FunctionType(typeArray, [typeArray]),
);

export const funcIntersection = new Constant(
	(value1: Value[], value2: Value[])=>
		value1.filter((i)=> value2.some((v)=> equal(v, i))),
	new FunctionType(typeArray, [typeArray, typeArray]),
);

export const funcDifference = new Constant(
	(value1: Value[], value2: Value[])=>
		[...value1.filter((i)=> value2.every((v)=> !equal(v, i))), ...value2.filter((i)=> value1.every((v)=> !equal(v, i)))],
	new FunctionType(typeArray, [typeArray, typeArray]),
);

export const funcAppend = new Constant(
	(...values: (ArrayBuffer | string | Value[])[])=>
		values[0] instanceof ArrayBuffer
			? (values as ArrayBuffer[]).reduce((acc, val)=> concatBuffers(acc, val), new ArrayBuffer(0))
			: typeof values[0] === 'string'
				? (values as string[]).reduce((acc, val)=> acc + val, '')
				: (values as Value[][]).reduce((acc, val)=> [...acc, ...val], []),
	new FunctionType(typeEnumerable, [typeEnumerable], 2, FUNCTION_ARG_MAX, 0),
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
	new FunctionType(typeNumber, [typeIterable]),
);

export const funcSlice = new Constant(
	(value: ArrayBuffer | string | Value[], start: number = 0, end?: number)=>
		value == null
			? undefined
			: value.slice(start, end) as Value,
	new FunctionType(typeEnumerable, [typeEnumerable, typeOptionalNumber, typeOptionalNumber], 1, 3),
);

export const funcByte = new Constant(
	(value: ArrayBuffer, pos: number)=>
		value == null
			? undefined
			: value.slice(pos, pos + 1),
	new FunctionType(typeBuffer, [typeBuffer, typeNumber]),
);

export const funcChar = new Constant(
	(value: string, pos: number)=>
		value == null
			? undefined
			: value.charAt(pos < 0 ? value.length + pos : pos),
	new FunctionType(typeString, [typeString, typeNumber]),
);

export const funcCharCode = new Constant(
	(value: string, pos: number)=>
		value == null
			? undefined
			: value.charCodeAt(pos < 0 ? value.length + pos : pos),
	new FunctionType(typeNumber, [typeString, typeNumber]),
);

export const funcEntries = new Constant(
	(value: Value[] | { [ key: string ]: Value } | undefined)=>
		value == null
			? undefined
			: Array.isArray(value)
				? Object.entries(value).map((e)=> [Number(e[0]), e[1]])
				: Object.entries(value),
	new FunctionType(typeOptionalArray, [typeOptionalArrayOrObject]),
);

export const funcKeys = new Constant(
	(value:  Value[] | { [ key: string ]: Value } | undefined)=>
		value == null
			? undefined
			: Array.isArray(value)
				? Object.keys(value).map((k)=> Number(k))
				: Object.keys(value),
	new FunctionType(typeOptionalArray, [typeOptionalArrayOrObject]),
);

export const funcValues = new Constant(
	(value:  Value[] | { [ key: string ]: Value } | undefined)=>
		value == null
			? undefined
			: Object.values(value),
	new FunctionType(typeOptionalArray, [typeOptionalArrayOrObject]),
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
	new FunctionType(typeUnknown, [typeOptionalArrayOrObject, typeNumberOrString]),
);

export const funcFirst = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value?.find((v, i, a)=> predicate(v, i, a)),
	new FunctionType(typeUnknown, [typeArray, typeFunction]),
);

export const funcLast = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value?.reverse().find((v, i, a)=> predicate(v, i, a)),
	new FunctionType(typeUnknown, [typeArray, typeFunction]),
);

export const funcFirstIndex = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=> {
		if (value == null) {
			return undefined;
		}
		const ix = value.findIndex((v, i, a)=> predicate(v, i, a));
		return ix < 0 ? Number.NaN : ix;
	},
	new FunctionType(typeNumber, [typeArray, typeFunction]),
);

export const funcLastIndex = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=> {
		if (value == null) {
			return undefined;
		}
		const ix = [...value].reverse().findIndex((v, i, a)=> predicate(v, i, a));
		return ix < 0 ? Number.NaN : ix;
	},
	new FunctionType(typeNumber, [typeArray, typeFunction]),
);

export const funcEvery = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value?.every((v, i, a)=> predicate(v, i, a)),
	new FunctionType(typeBoolean, [typeArray, typeFunction]),
);

export const funcAny = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value?.some((v, i, a)=> predicate(v, i, a)),
	new FunctionType(typeBoolean, [typeArray, typeFunction]),
);

export const funcFlatten = new Constant(
	(values: Value[], depth?: number)=>
		(values as [])?.flat(depth) as Value,
	new FunctionType(typeArray, [typeArray, typeOptionalNumber], 1, 2),
);

export const funcReverse = new Constant(
	(value: Value[])=>
		[...value].reverse(),
	new FunctionType(typeArray, [typeArray]),
);

export const funcTransform = new Constant(
	(value: Value[], callback: (v: Value, i: number, a: Value[])=> Value)=>
		value?.map(callback),
	new FunctionType(typeArray, [typeArray, typeFunction]),
);

export const funcFilter = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value?.filter(predicate),
	new FunctionType(typeArray, [typeArray, typeFunction]),
);

export const funcReduce = new Constant(
	(value: Value[], callback: (acc: Value, v: Value, i: number, arr: Value[])=> Value, initial?: Value)=>
		initial != null ? value?.reduce(callback, initial) : value?.reduce(callback),
	new FunctionType(typeUnknown, [typeArray, typeFunction, typeUnknown], 2, 3),
);

export const funcCompose = new Constant(
	(value: string[], callback: (acc: { [ key: string ]: Value }, v: string, i: number)=> { [ key: string ]: Value })=> {
		if (value == null) {
			return undefined;
		}
		const obj: Record<string, any> = {};
		for (let i = 0; i < value.length; ++i) {
			const key =  value[i];
			obj[key] = callback(obj, key, i);
		}
		return obj;
	},
	new FunctionType(typeObject, [typeArray, typeFunction]),
);
