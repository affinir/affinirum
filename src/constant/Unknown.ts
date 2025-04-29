import { Constant } from '../Constant.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';
import { encodeFloat, formatFloat } from './Float.js';
import { encodeInteger } from './Integer.js';
import { equateBuffers, formatBuffer } from './Buffer.js';
import { encodeString } from './String.js';
import { formatTimestamp } from './Timestamp.js';

export const equate = (value1: Value, value2: Value)=> {
	if (value1 == null || value2 == null) {
		return value1 == value2;
	}
	if (typeof value1 !== typeof value2) {
		if (typeof value1 === 'number' && typeof value2 === 'bigint') {
			return value1 === Number(value2);
		}
		if (typeof value1 === 'bigint' && typeof value2 === 'number') {
			return Number.isInteger(value2) && value1 === BigInt(value2);
		}
		return false;
	}
	if (typeof value1 === 'number') {
		return isNaN(value1) && isNaN(value2 as number) ? true : value1 === value2;
	}
	if (typeof value1 === 'boolean' || typeof value1 === 'bigint' || typeof value1 === 'string' || typeof value1 === 'function') {
		return value1 === value2;
	}
	if (value1 instanceof Date && value2 instanceof Date) {
		return value1.getTime() === value2.getTime();
	}
	if (value1 instanceof ArrayBuffer && value2 instanceof ArrayBuffer) {
		return equateBuffers(value1, value2);
	}
	if (Array.isArray(value1) && Array.isArray(value2)) {
		if (value1.length === value2.length) {
			for (let i = 0; i < value1.length; ++i) {
				if (!equate(value1[i], value2[i])) {
					return false;
				}
			}
			return true;
		}
		return false;
	}
	const props = new Set([...Object.getOwnPropertyNames(value1), ...Object.getOwnPropertyNames(value2)]);
	for (const prop of props) {
		if (!equate((value1 as any)[prop] as Value, (value2 as any)[prop] as Value)) {
			return false;
		}
	}
	return true;
};

const format = (value: Value, radix?: number, separator: string = ''): string=>
	value == null
		? 'null'
		: typeof value === 'boolean'
			? value.toString()
			: value instanceof Date
				? formatTimestamp(value, radix ? Number(radix) : undefined)
				: typeof value === 'number'
					? formatFloat(value, radix ? Number(radix) : undefined)
					: typeof value === 'bigint'
						? value.toString(radix ? Number(radix) : undefined)
						: value instanceof ArrayBuffer
							? formatBuffer(value)
							: typeof value === 'string'
								? value
								: Array.isArray(value)
									? value.map((i)=> format(i, radix)).join(separator)
									: typeof value === 'object'
										? Object.entries(value).map(([k, v])=> `${format(k)}${radix}${format(v)}`).join(separator)
										: 'function';

const typeEquator = Type.functionType(Type.Boolean, [Type.Unknown, Type.Unknown]);

export const funcCoalesce = new Constant(
	(value: Value, valueOtherwise: Value)=>
		value ?? valueOtherwise,
	Type.union(
		Type.functionType(Type.Unknown, [Type.Unknown, Type.Unknown]),
		Type.functionType(Type.OptionalFloat, [Type.OptionalFloat, Type.OptionalFloat]),
		Type.functionType(Type.OptionalBoolean, [Type.OptionalBoolean, Type.OptionalBoolean]),
		Type.functionType(Type.OptionalTimestamp, [Type.OptionalTimestamp, Type.OptionalTimestamp]),
		Type.functionType(Type.OptionalInteger, [Type.OptionalInteger, Type.OptionalInteger]),
		Type.functionType(Type.OptionalBuffer, [Type.OptionalBuffer, Type.OptionalBuffer]),
		Type.functionType(Type.OptionalString, [Type.OptionalString, Type.OptionalString]),
		Type.functionType(Type.OptionalArray, [Type.OptionalArray, Type.OptionalArray]),
		Type.functionType(Type.OptionalObject, [Type.OptionalObject, Type.OptionalObject]),
		Type.functionType(Type.OptionalFunction, [Type.OptionalFunction, Type.OptionalFunction]),
	),
);

export const funcEqual = new Constant(
	(value1: Value, value2: Value)=>
		equate(value1, value2),
	typeEquator,
);

export const funcNotEqual = new Constant(
	(value1: Value, value2: Value)=>
		!equate(value1, value2),
	typeEquator,
);

export const funcEncode = new Constant(
	(value: number | bigint | string, encoding?: 'float32' | 'float32le' | 'float64' | 'float64le'
		| 'int8' | 'int16' | 'int16le' | 'int32' | 'int32le' | 'int64' | 'int64le'
		| 'uint8' | 'uint16' | 'uint16le' | 'uint32' | 'uint32le' | 'uint64' | 'uint64le'
		| 'utf8' | 'ucs2' | 'ucs2le')=> {
		return typeof value === 'number'
			? encodeFloat(value, encoding as 'float32' | 'float32le' | 'float64' | 'float64le' ?? 'float64')
			: typeof value === 'bigint'
				? encodeInteger(value, encoding as 'int8' | 'int16' | 'int16le' | 'int32' | 'int32le'
					| 'uint8' | 'uint16' | 'uint16le' | 'uint32' | 'uint32le' ?? 'int64')
				: typeof value === 'string'
					? encodeString(value, encoding as 'utf8' | 'ucs2' | 'ucs2le' ?? 'utf8')
					: new Uint8Array(0).buffer;
	},
	Type.union(
		Type.functionType(Type.Buffer, [Type.Float, Type.String]),
		Type.functionType(Type.Buffer, [Type.Integer, Type.String]),
		Type.functionType(Type.Buffer, [Type.String, Type.OptionalString]),
	),
);

export const funcFormat = new Constant(
	(value: boolean | Date | number | bigint | ArrayBuffer | Value[], radix?: bigint, separator: string = '')=>
		format(value, radix == null ? undefined : Number(radix), separator),
	Type.union(
		Type.functionType(Type.String, [Type.Boolean]),
		Type.functionType(Type.String, [Type.Timestamp]),
		Type.functionType(Type.String, [Type.Float, Type.OptionalInteger]),
		Type.functionType(Type.String, [Type.Integer, Type.OptionalInteger]),
		Type.functionType(Type.String, [Type.Buffer]),
		Type.functionType(Type.String, [Type.Array, Type.OptionalInteger, Type.OptionalString]),
		Type.functionType(Type.String, [Type.Object, Type.OptionalInteger, Type.OptionalString]),
	),
);
