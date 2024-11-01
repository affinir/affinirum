import { FunctionDefinition, FUNCTION_ARG_MAX } from '../FunctionDefinition.js';
import { Value, typeBoolean, typeNumber, typeBuffer, typeString, typeArray, typeObject, typeFunction,
	typeOptionalNumber, typeOptionalArray, typeNumberOrString, typeOptionalArrayOrObject,
	typeEnumerable, typeIterable, typeUnknown } from '../Type.js';

export const funcAppend = new FunctionDefinition(
	(...values: (ArrayBuffer | string | Value[])[])=>
		values[0] instanceof ArrayBuffer
			? (values as ArrayBuffer[]).reduce((acc, val)=> concatBuffers(acc, val), new ArrayBuffer(0))
			: typeof values[0] === 'string'
				? (values as string[]).reduce((acc, val)=> acc + val, '')
				: (values as Value[][]).reduce((acc, val)=> [...acc, ...val], []),
	typeEnumerable, [typeEnumerable], 2, FUNCTION_ARG_MAX, 0,
);

export const funcLength = new FunctionDefinition(
	(value: ArrayBuffer | string | Value[] | { [ key: string ]: Value })=>
		value == null
			? undefined
			:	value instanceof ArrayBuffer
				? value.byteLength
				: typeof value === 'string' || Array.isArray(value)
					? value.length
					: Object.keys(value).length,
	typeNumber, [typeIterable],
);

export const funcSlice = new FunctionDefinition(
	(value: ArrayBuffer | string | Value[], start: number = 0, end?: number)=>
		value == null
			? undefined
			: value.slice(start, end) as Value,
	typeEnumerable, [typeEnumerable, typeOptionalNumber, typeOptionalNumber], 1, 3,
);

export const funcByte = new FunctionDefinition(
	(value: ArrayBuffer, pos: number)=>
		value == null
			? undefined
			: value.slice(pos, pos + 1),
	typeBuffer, [typeBuffer, typeNumber],
);

export const funcChar = new FunctionDefinition(
	(value: string, pos: number)=>
		value == null
			? undefined
			: value.charAt(pos < 0 ? value.length + pos : pos),
	typeString, [typeString, typeNumber],
);

export const funcCharCode = new FunctionDefinition(
	(value: string, pos: number)=>
		value == null
			? undefined
			: value.charCodeAt(pos < 0 ? value.length + pos : pos),
	typeNumber, [typeString, typeNumber],
);

export const funcEntries = new FunctionDefinition(
	(value: Value[] | { [ key: string ]: Value } | undefined)=>
		value == null
			? undefined
			: Array.isArray(value)
				? Object.entries(value).map((e)=> [Number(e[0]), e[1]])
				: Object.entries(value),
	typeOptionalArray, [typeOptionalArrayOrObject],
);

export const funcKeys = new FunctionDefinition(
	(value:  Value[] | { [ key: string ]: Value } | undefined)=>
		value == null
			? undefined
			: Array.isArray(value)
				? Object.keys(value).map((k)=> Number(k))
				: Object.keys(value),
	typeOptionalArray, [typeOptionalArrayOrObject],
);

export const funcValues = new FunctionDefinition(
	(value:  Value[] | { [ key: string ]: Value } | undefined)=>
		value == null
			? undefined
			: Object.values(value),
	typeOptionalArray, [typeOptionalArrayOrObject],
);

export const funcAt = new FunctionDefinition(
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
	typeUnknown, [typeOptionalArrayOrObject, typeNumberOrString],
);

export const funcFirst = new FunctionDefinition(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value?.find((v, i, a)=> predicate(v, i, a)),
	typeUnknown, [typeArray, typeFunction],
);

export const funcLast = new FunctionDefinition(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value?.reverse().find((v, i, a)=> predicate(v, i, a)),
	typeUnknown, [typeArray, typeFunction],
);

export const funcFirstIndex = new FunctionDefinition(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=> {
		if (value == null) {
			return undefined;
		}
		const ix = value.findIndex((v, i, a)=> predicate(v, i, a));
		return ix < 0 ? Number.NaN : ix;
	},
	typeNumber, [typeArray, typeFunction],
);

export const funcLastIndex = new FunctionDefinition(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=> {
		if (value == null) {
			return undefined;
		}
		const ix = [...value].reverse().findIndex((v, i, a)=> predicate(v, i, a));
		return ix < 0 ? Number.NaN : ix;
	},
	typeNumber, [typeArray, typeFunction],
);

export const funcEvery = new FunctionDefinition(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value?.every((v, i, a)=> predicate(v, i, a)),
	typeBoolean, [typeArray, typeFunction],
);

export const funcAny = new FunctionDefinition(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value?.some((v, i, a)=> predicate(v, i, a)),
	typeBoolean, [typeArray, typeFunction],
);

export const funcFlatten = new FunctionDefinition(
	(values: Value[], depth?: number)=>
		(values as [])?.flat(depth) as Value,
	typeArray, [typeArray, typeOptionalNumber], 1, 2,
);

export const funcReverse = new FunctionDefinition(
	(value: Value[])=>
		[...value].reverse(),
	typeArray, [typeArray],
);

export const funcTransform = new FunctionDefinition(
	(value: Value[], callback: (v: Value, i: number, a: Value[])=> Value)=>
		value?.map(callback),
	typeArray, [typeArray, typeFunction],
);

export const funcFilter = new FunctionDefinition(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value?.filter(predicate),
	typeArray, [typeArray, typeFunction],
);

export const funcReduce = new FunctionDefinition(
	(value: Value[], callback: (acc: Value, v: Value, i: number, arr: Value[])=> Value, initial?: Value)=>
		initial != null ? value?.reduce(callback, initial) : value?.reduce(callback),
	typeUnknown, [typeArray, typeFunction, typeUnknown], 2, 3,
);

export const funcCompose = new FunctionDefinition(
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
	typeObject, [typeArray, typeFunction],
);

export const concatBuffers = (value1: ArrayBuffer, value2: ArrayBuffer)=> {
	const bytes = new Uint8Array(value1.byteLength + value2.byteLength);
	bytes.set(new Uint8Array(value1), 0);
	bytes.set(new Uint8Array(value2), value1.byteLength);
	return bytes.buffer;
};
