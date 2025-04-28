import { Constant } from '../Constant.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';
import { equateBuffers } from './Buffer.js';

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

const typeAggregatable = Type.union(Type.Numeric, Type.Enumerable);
const typeEquator = Type.functionType(Type.Boolean, [Type.Unknown, Type.Unknown]);
const typeComparator = Type.functionType(Type.Boolean, [Type.Numeric, Type.Numeric]);
const typeOperator = Type.functionTypeInference(2, Type.Numeric, [Type.Numeric, Type.Numeric]);

export const funcCoalesce = new Constant(
	(value: Value, valueOtherwise: Value)=>
		value ?? valueOtherwise,
	Type.functionTypeInference(2, Type.Unknown, [Type.Unknown, Type.Unknown]),
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

export const funcGreaterThan = new Constant(
	(value1: number | bigint, value2: number | bigint)=>
		value1 > value2,
	typeComparator,
);

export const funcLessThan = new Constant(
	(value1: number | bigint, value2: number | bigint)=>
		value1 < value2,
	typeComparator,
);

export const funcGreaterOrEqual = new Constant(
	(value1: number | bigint, value2: number | bigint)=>
		value1 >= value2,
	typeComparator,
);

export const funcLessOrEqual = new Constant(
	(value1: number | bigint, value2: number | bigint)=>
		value1 <= value2,
	typeComparator,
);

export const funcAdd = new Constant(
	(...values: number[] | bigint[] | ArrayBuffer[] | string[] | Value[][])=> {
		if (typeof values[0] === 'number') {
			return (values as number[]).reduce((acc, val)=> acc + Number(val), 0);
		}
		if (typeof values[0] === 'bigint') {
			return (values as bigint[]).reduce((acc, val)=> BigInt.asIntN(64, acc + BigInt(val)), 0n);
		}
		if (values[0] instanceof ArrayBuffer) {
			const length = (values as ArrayBuffer[]).reduce((acc, val)=> acc + val.byteLength, 0);
			const bytes = new Uint8Array(length);
			for (let offset = 0, i = 0; i < values.length; ++i) {
				const val = values[i] as ArrayBuffer;
				bytes.set(new Uint8Array(val), offset);
				offset += val.byteLength;
			}
			return bytes.buffer;
		}
		if (typeof values[0] === 'string') {
			return (values as string[]).reduce((acc, val)=> acc + val, '');
		}
		return (values as Value[][]).reduce((acc, val)=> {
			acc.push(...val);
			return acc;
		}, []);
	},
	Type.functionTypeInference(1, typeAggregatable, [typeAggregatable, typeAggregatable], true),
);

export const funcSubtract = new Constant(
	(value: number | bigint, subtrahend: number | bigint)=>
		typeof value === 'number'
			? value - Number(subtrahend)
			: BigInt.asIntN(64, value - BigInt(subtrahend)),
	typeOperator,
);

export const funcMultiply = new Constant(
	(...values: number[] | bigint[])=>
		typeof values[0] === 'number'
			? values.map((i)=> Number(i)).reduce((acc, val)=> acc *= val)
			: values.map((i)=> BigInt(i)).reduce((acc, val)=> BigInt.asIntN(64, acc *= val)),
	Type.functionTypeInference(1, Type.Numeric, [Type.Numeric, Type.Numeric], true),
);

export const funcDivide = new Constant(
	(value: number | bigint, divisor: number | bigint)=>
		typeof value === 'number'
			? value / Number(divisor)
			: BigInt.asIntN(64, value / BigInt(divisor)),
	typeOperator,
);

export const funcRemainder = new Constant(
	(value: number | bigint, divisor: number | bigint)=>
		typeof value === 'number'
			? value % Number(divisor)
			: BigInt.asIntN(64, value % BigInt(divisor)),
	typeOperator,
);

export const funcModulo = new Constant(
	(value: number | bigint, divisor: number | bigint)=>
		typeof value === 'number'
			? (value % Number(divisor) + Number(divisor)) % Number(divisor)
			: BigInt.asIntN(64, (value % BigInt(divisor) + BigInt(divisor)) % BigInt(divisor)),
	typeOperator,
);

export const funcPower = new Constant(
	(value: number | bigint, exponent: number | bigint)=>
		typeof value === 'number'
			? value ** Number(exponent)
			: BigInt.asIntN(64, value ** BigInt(exponent)),
	typeOperator,
);

export const funcRoot = new Constant(
	(value: number | bigint, exponent: number | bigint)=> {
		if (typeof value === 'number') {
			return Math.pow(value, 1 / Number(exponent));
		}
		const e = BigInt(exponent);
		if (value < 0n && e % 2n === 0n) {
			return undefined;
		}
		if (value < 2n || e === 1n) {
			return value;
		}
		let low = 0n, high = value, result = 0n;
		while (low <= high) {
			const mid = (low + high) >> 1n;
			const midPow = mid ** e;
			if (midPow === value) {
				return mid;
			}
			else if (midPow < value) {
				result = mid;
				low = mid + 1n;
			}
			else {
				high = mid - 1n;
			}
		}
		return BigInt.asIntN(64, result);
	},
	typeOperator,
);

export const funcNegate = new Constant(
	(value: number | bigint)=>
		typeof value === 'number' ? -value : BigInt.asIntN(64, -value),
	Type.functionTypeInference(1, Type.Numeric, [Type.Numeric]),
);
