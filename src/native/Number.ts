import { Constant } from "../Constant.js";
import { Type } from "../Type.js";
import { int64 } from "./Integer.js";

export const isSignSymbol = (c: string) => c === "+" || c === "-";
export const isNumericSymbol = (c: string) =>  c >= "0" && c <= "9" ;

export interface NumberFormatting {
	min_integer_digits?: number;
	min_fraction_digits?: number;
	max_fraction_digits?: number;
	min_significant_digits?: number;
	max_significant_digits?: number;
	notation?: "standard" | "scientific";
}

export const parseLiteralNumber = (value: string, offset = 0) => {
	let i = offset;
	let integer = true;
	while (isNumericSymbol(value.charAt(i))) {
		++i;
	}
	if (value.charAt(i) === ".") {
		++i;
		if (isNumericSymbol(value.charAt(i))) {
			++i;
			while (isNumericSymbol(value.charAt(i))) {
				++i;
			}
			integer = false;
		}
		else {
			--i;
		}
	}
	if (value.charAt(i) === "e") {
		++i;
		if (isNumericSymbol(value.charAt(i))
			|| isSignSymbol(value.charAt(i))) {
			++i;
			while (isNumericSymbol(value.charAt(i))) {
				++i;
			}
		}
		integer = false;
	}
	const str = value.slice(offset, i);
	return [integer ? int64(BigInt(str)) : parseFloat(str), i] as const;
};

const typeComparator = Type.functionType([[Type.Boolean, [Type.Number, Type.Number]]]);
const typeOperator = Type.functionType([
	[Type.Integer, [Type.Integer, Type.Integer]],
	[Type.Float, [Type.Float, Type.Number]],
	[Type.Float, [Type.Number, Type.Float]],
	[Type.Number, [Type.Number, Type.Number]],
]);

export const funcGreaterThan = new Constant(
	(value1: number | bigint, value2: number | bigint) =>
		value1 > value2,
	typeComparator,
);

export const funcLessThan = new Constant(
	(value1: number | bigint, value2: number | bigint) =>
		value1 < value2,
	typeComparator,
);

export const funcGreaterOrEqual = new Constant(
	(value1: number | bigint, value2: number | bigint) =>
		value1 >= value2,
	typeComparator,
);

export const funcLessOrEqual = new Constant(
	(value1: number | bigint, value2: number | bigint) =>
		value1 <= value2,
	typeComparator,
);

export const funcSubtract = new Constant(
	(value: number | bigint, subtrahend: number | bigint) =>
		typeof value === "bigint" && typeof subtrahend === "bigint"
			? int64(value - subtrahend)
			: Number(value) - Number(subtrahend),
	typeOperator,
);

export const funcMultiply = new Constant(
	(value1: number | bigint, value2: number | bigint) =>
		typeof value1 === "bigint" && typeof value2 === "bigint"
			? int64(value1 * value2)
			: Number(value1) * Number(value2),
	typeOperator,
);

export const funcDivide = new Constant(
	(value: number | bigint, divisor: number | bigint) =>
		typeof value === "bigint" && typeof divisor === "bigint"
			? int64(value / divisor)
			: Number(value) / Number(divisor),
	typeOperator,
);

export const funcRemainder = new Constant(
	(value: number | bigint, divisor: number | bigint) =>
		typeof value === "bigint" && typeof divisor === "bigint"
			? value % divisor
			: Number(value) % Number(divisor),
	typeOperator,
);

export const funcModulo = new Constant(
	(value: number | bigint, divisor: number | bigint) =>
		typeof value === "bigint" && typeof divisor === "bigint"
			? (value % divisor + divisor) % divisor
			: (Number(value) % Number(divisor) + Number(divisor)) % Number(divisor),
	typeOperator,
);

export const funcPower = new Constant(
	(value: number | bigint, exponent: number | bigint) =>
		typeof value === "bigint" && typeof exponent === "bigint"
			? int64(value ** exponent)
			: Number(value) ** Number(exponent),
	typeOperator,
);

export const funcRoot = new Constant(
	(value: number | bigint, exponent: number | bigint) => {
		if (exponent <= 0) {
			return undefined;
		}
		if (typeof value === "bigint" && typeof exponent === "bigint") {
			const negative = value < 0n;
			if (negative && exponent % 2n === 0n) {
				return undefined;
			}
			const magnitude = negative ? -value : value;
			if (magnitude <= 1n || exponent === 1n) {
				return value;
			}
			let low = 0n, high = magnitude, result = 0n;
			while (low <= high) {
				const mid = low + high >> 1n;
				const midPow = mid ** exponent;
				if (midPow === magnitude) {
					return negative ? -mid : mid;
				}
				else if (midPow < magnitude) {
					result = mid;
					low = mid + 1n;
				}
				else {
					high = mid - 1n;
				}
			}
			return negative ? -result : result;
		}
		const v = Number(value);
		const e = Number(exponent);
		const odd = typeof exponent === "bigint"
			? exponent % 2n !== 0n
			: Number.isInteger(exponent) && exponent % 2 !== 0;
		return (v < 0 || Object.is(v, -0)) && odd
			? -Math.pow(-v, 1 / e)
			: Math.pow(v, 1 / e);
	},
	Type.functionType([
		[Type.OptionalInteger, [Type.Integer, Type.Integer]],
		[Type.OptionalFloat, [Type.Float, Type.Number]],
		[Type.OptionalFloat, [Type.Number, Type.Float]],
		[Type.OptionalNumber, [Type.Number, Type.Number]],
	]),
);

export const funcNegate = new Constant(
	(value: number | bigint) =>
		value == null ? undefined : typeof value === "number" ? -value : int64(-value),
	Type.functionType([
		[Type.Float, [Type.Float]],
		[Type.Integer, [Type.Integer]],
		[Type.Number, [Type.Number]],
	])
);
