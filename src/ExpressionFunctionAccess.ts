import { ExpressionFunction } from './ExpressionFunction.js';
import { Value, typeNumber, typeBuffer, typeString, typeArray, typeObject, typeFunction, typeOptionalNumber, typeIterable, typeVariant } from './Type.js';

export const funcSubbuf = new ExpressionFunction(
	(value: ArrayBufferLike, start: number = 0, end?: number)=>
		value.slice(start, end),
	typeBuffer, [ typeBuffer, typeNumber, typeOptionalNumber ], 1, 3,
);

export const funcByte = new ExpressionFunction(
	(value: ArrayBufferLike, pos: number)=>
		value.slice(pos, pos + 1),
	typeBuffer, [ typeBuffer, typeNumber ],
);

export const funcSubstr = new ExpressionFunction(
	(value: string, start: number = 0, end?: number)=>
		value.substring(start, end),
	typeString, [ typeString, typeNumber, typeOptionalNumber ], 1, 3,
);

export const funcChar = new ExpressionFunction(
	(value: string, pos: number)=>
		value.charAt(pos < 0 ? value.length + pos : pos),
	typeString, [ typeString, typeNumber ],
);

export const funcCharCode = new ExpressionFunction(
	(value: string, pos: number)=>
		value.charCodeAt(pos < 0 ? value.length + pos : pos),
	typeNumber, [ typeString, typeNumber ],
);

export const funcSlice = new ExpressionFunction(
	(value: Value[], start: number = 0, end?: number)=>
		value.slice(start, end) as Value,
	typeArray, [ typeArray, typeOptionalNumber, typeOptionalNumber ], 1, 3,
);

export const funcFirst = new ExpressionFunction(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value.find((v, i, a)=> predicate(v, i, a)),
	typeVariant, [ typeArray, typeFunction ],
);

export const funcLast = new ExpressionFunction(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		[ ...value ].reverse().find((v, i, a)=> predicate(v, i, a)),
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

export const funcAt = new ExpressionFunction(
	(value: Value[], index: number)=>
		value[ index < 0 ? value.length + index : index ],
	typeVariant, [ typeArray, typeNumber ],
);

export const funcBy = new ExpressionFunction(
	(value: { [ key: string ]: Value }, property: string)=>
		(value as any)[ property ] as Value,
	typeVariant, [ typeObject, typeString ],
);

export const funcLen = new ExpressionFunction(
	(value: ArrayBufferLike | string | Value[] | { [ key: string ]: Value })=>
		value instanceof ArrayBuffer || value instanceof SharedArrayBuffer
			? value.byteLength
			: typeof value === 'string' || Array.isArray(value)
				? value.length
				: Object.keys(value).length,
	typeNumber, [ typeIterable ],
);
