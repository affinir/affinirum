import { Constant } from '../Constant.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';
import { equateBuffers, concatBuffers } from './Buffer.js';

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

export const funcAdd = new Constant(
	(value1: number | bigint | ArrayBuffer | string | Value[], value2: number | bigint | ArrayBuffer | string | Value[])=> {
		if (typeof value1 === 'bigint' && typeof value2 === 'bigint') {
			return BigInt.asIntN(64, value1 + value2);
		}
		if (value1 instanceof ArrayBuffer && value2 instanceof ArrayBuffer) {
			return concatBuffers(value1, value2);
		}
		if (Array.isArray(value1) && Array.isArray(value2)) {
			return value1.concat(value2);
		}
		if (typeof value1 === 'number' || typeof value2 === 'number') {
			return Number(value1) + Number(value2);
		}
		return String(value1) + String(value2);
	},
	Type.union(
		Type.functionType(Type.Float, [Type.Float, Type.Integer]),
		Type.functionType(Type.Float, [Type.Integer, Type.Float]),
		Type.functionType(Type.Integer, [Type.Integer, Type.Integer]),
		Type.functionType(Type.Buffer, [Type.Buffer, Type.Buffer]),
		Type.functionType(Type.String, [Type.String, Type.String]),
		Type.functionType(Type.Array, [Type.Array, Type.Array]),
	),
);
