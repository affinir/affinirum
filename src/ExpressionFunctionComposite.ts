import { ExpressionFunction, FUNCTION_ARG_MAX } from './ExpressionFunction.js';
import { Value, typeBoolean, typeNumber, typeBuffer, typeString, typeArray, typeFunction,
	typeOptionalNumber, typeOptionalString, typeNumberOrString, typeArrayOrObject, typeEnumerable, typeIterable, typeVariant } from './Type.js';

export const funcLength = new ExpressionFunction(
	(value: ArrayBuffer | string | Value[] | { [ key: string ]: Value })=>
		value == null
			? undefined
			:	value instanceof ArrayBuffer
				? value.byteLength
				: typeof value === 'string' || Array.isArray(value)
					? value.length
					: Object.keys(value).length,
	typeNumber, [ typeIterable ],
);

export const funcSlice = new ExpressionFunction(
	(value: ArrayBuffer | string | Value[], start: number = 0, end?: number)=>
		value == null
			? undefined
			: value.slice(start, end) as Value,
	typeEnumerable, [ typeEnumerable, typeOptionalNumber, typeOptionalNumber ], 1, 3,
);

export const funcByte = new ExpressionFunction(
	(value: ArrayBuffer, pos: number)=>
		value == null
			? undefined
			: value.slice(pos, pos + 1),
	typeBuffer, [ typeBuffer, typeNumber ],
);

export const funcChar = new ExpressionFunction(
	(value: string, pos: number)=>
		value == null
			? undefined
			: value.charAt(pos < 0 ? value.length + pos : pos),
	typeString, [ typeString, typeNumber ],
);

export const funcCharCode = new ExpressionFunction(
	(value: string, pos: number)=>
		value == null
			? undefined
			: value.charCodeAt(pos < 0 ? value.length + pos : pos),
	typeNumber, [ typeString, typeNumber ],
);

export const funcEntries = new ExpressionFunction(
	(value:  Value[] | { [ key: string ]: Value })=>
		value == null
			? undefined
			: Array.isArray(value)
				? Object.entries(value).map((e)=> [ Number(e[ 0 ]), e[ 1 ] ])
				: Object.entries(value),
	typeArray, [ typeArrayOrObject ],
);

export const funcKeys = new ExpressionFunction(
	(value:  Value[] | { [ key: string ]: Value })=>
		value == null
			? undefined
			: Array.isArray(value)
				? Object.keys(value).map((k)=> Number(k))
				: Object.keys(value),
	typeArray, [ typeArrayOrObject ],
);

export const funcValues = new ExpressionFunction(
	(value:  Value[] | { [ key: string ]: Value })=>
		value == null
			? undefined
			: Object.values(value),
	typeArray, [ typeArrayOrObject ],
);

export const funcAt = new ExpressionFunction(
	(value: Value[] | { [ key: string ]: Value }, index: number | string)=> {
		if (value == null) {
			return undefined;
		}
		else if (Array.isArray(value)) {
			const ix = Number(index);
			return value[ ix < 0 ? value.length + ix : ix ];
		}
		else {
			return value[ String(index) ];
		}
	},
	typeVariant, [ typeArrayOrObject, typeNumberOrString ],
);

export const funcFirstValid = new ExpressionFunction(
	(value: Value[] | { [ key: string ]: Value })=>
		value ? Object.values(value).find((v)=> v != null) : undefined,
	typeVariant, [ typeArrayOrObject ],
);

export const funcFirst = new ExpressionFunction(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value.find((v, i, a)=> predicate(v, i, a)),
	typeVariant, [ typeArray, typeFunction ],
);

export const funcLast = new ExpressionFunction(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value.reverse().find((v, i, a)=> predicate(v, i, a)),
	typeVariant, [ typeArray, typeFunction ],
);

export const funcFirstIndex = new ExpressionFunction(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=> {
		const ix = value.findIndex((v, i, a)=> predicate(v, i, a));
		return ix < 0 ? Number.NaN : ix;
	},
	typeNumber, [ typeArray, typeFunction ],
);

export const funcLastIndex = new ExpressionFunction(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=> {
		const ix = [ ...value ].reverse().findIndex((v, i, a)=> predicate(v, i, a));
		return ix < 0 ? Number.NaN : ix;
	},
	typeNumber, [ typeArray, typeFunction ],
);

export const funcEvery = new ExpressionFunction(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value.every((v, i, a)=> predicate(v, i, a)),
	typeBoolean, [ typeArray, typeFunction ],
);

export const funcAny = new ExpressionFunction(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value.some((v, i, a)=> predicate(v, i, a)),
	typeBoolean, [ typeArray, typeFunction ],
);

export const funcChain = new ExpressionFunction(
	(value: (ArrayBuffer | ArrayBuffer[])[])=>
		value.flat(FUNCTION_ARG_MAX).map((b)=> new Uint8Array(b)),
	typeBuffer, [ typeArray ],
);

export const funcJoin = new ExpressionFunction(
	(value: (string | string[])[], separator: string = ' ')=>
		value.flat(FUNCTION_ARG_MAX).join(separator),
	typeString, [ typeArray, typeOptionalString ], 1, 2,
);

export const funcFlatten = new ExpressionFunction(
	(values: Value[], depth?: number)=>
		(values as []).flat(depth) as Value,
	typeArray, [ typeArray, typeOptionalNumber ], 1, 2,
);

export const funcReverse = new ExpressionFunction(
	(value: Value[])=>
		[ ...value ].reverse(),
	typeArray, [ typeArray ],
);

export const funcMap = new ExpressionFunction(
	(value: Value[], callback: (v: Value, i: number, a: Value[])=> Value)=>
		value.map(callback),
	typeArray, [ typeArray, typeFunction ],
);

export const funcFilter = new ExpressionFunction(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value.filter(predicate),
	typeArray, [ typeArray, typeFunction ],
);

export const funcIterate = new ExpressionFunction(
	(value: Value[], callback: (v: Value, i: number, a: Value[])=> Value)=> {
		value.forEach(callback);
		return value;
	},
	typeArray, [ typeArray, typeFunction ],
);

export const funcReduce = new ExpressionFunction(
	(value: Value[], callback: (acc: Value, v: Value, i: number, arr: Value[])=> Value, initial?: Value)=>
		initial != null ? value.reduce(callback, initial) : value.reduce(callback),
	typeVariant, [ typeArray, typeFunction, typeVariant ], 2, 3,
);
