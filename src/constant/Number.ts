import { Constant } from "../Constant.js";
import { Type } from "../Type.js";

const castToInteger = (value: number)=> {
	if (Number.isNaN(value)) {
		return 0n;
	}
	if (value === Number.NEGATIVE_INFINITY) {
		return -0x8000000000000000n;
	}
	if (value === Number.POSITIVE_INFINITY) {
		return 0x7FFFFFFFFFFFFFFFn;
	}
	return BigInt.asIntN(64, BigInt(Math.trunc(value)));
};

const typeComparator = Type.functionType(Type.Boolean, [Type.Number, Type.Number]);
const typeOperator = Type.union(
	Type.functionType(Type.Float, [Type.Float, Type.Integer]),
	Type.functionType(Type.Float, [Type.Integer, Type.Float]),
	Type.functionType(Type.Integer, [Type.Integer, Type.Integer]),
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

export const funcSubtract = new Constant(
	(value: number | bigint, subtrahend: number | bigint)=>
		typeof value === "bigint" && typeof subtrahend === "bigint"
			? BigInt.asIntN(64, value - subtrahend)
			: Number(value) - Number(subtrahend),
	typeOperator,
);

export const funcMultiply = new Constant(
	(value1: number | bigint, value2: number | bigint)=>
		typeof value1 === "bigint" && typeof value2 === "bigint"
			? BigInt.asIntN(64, value1 * value2)
			: Number(value1) * Number(value2),
	typeOperator,
);

export const funcDivide = new Constant(
	(value: number | bigint, divisor: number | bigint)=>
		typeof value === "bigint" && typeof divisor === "bigint"
			? BigInt.asIntN(64, value / divisor)
			: Number(value) / Number(divisor),
	typeOperator,
);

export const funcRemainder = new Constant(
	(value: number | bigint, divisor: number | bigint)=>
		typeof value === "bigint" && typeof divisor === "bigint"
			? BigInt.asIntN(64, value % divisor)
			: Number(value) % Number(divisor),
	typeOperator,
);

export const funcModulo = new Constant(
	(value: number | bigint, divisor: number | bigint)=>
		typeof value === "bigint" && typeof divisor === "bigint"
			? BigInt.asIntN(64, (value % divisor + divisor) % divisor)
			: (Number(value) % Number(divisor) + Number(divisor)) % Number(divisor),
	typeOperator,
);

export const funcPower = new Constant(
	(value: number | bigint, exponent: number | bigint)=>
		typeof value === "bigint" && typeof exponent === "bigint"
			? BigInt.asIntN(64, value ** BigInt(exponent))
			: Number(value) ** Number(exponent),
	typeOperator,
);

export const funcRoot = new Constant(
	(value: number | bigint, exponent: number | bigint)=> {
		if (typeof value === "bigint" && typeof exponent === "bigint") {
			const e = BigInt(exponent);
			if (value < 0n && e % 2n === 0n) {
				return undefined;
			}
			if (value < 2n || e === 1n) {
				return value;
			}
			let low = 0n, high = value, result = 0n;
			while (low <= high) {
				const mid = low + high >> 1n;
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
		}
		return Math.pow(Number(value), 1 / Number(exponent));
	},
	typeOperator,
);

export const funcNegate = new Constant(
	(value: number | bigint)=>
		typeof value === "number" ? -value : BigInt.asIntN(64, -value),
	Type.union(
		Type.functionType(Type.Float, [Type.Float]),
		Type.functionType(Type.Integer, [Type.Integer]),
	)
);

export const funcCast = new Constant(
	(value: number | bigint)=>
		typeof value !== "number"
			? Number(value)
			: castToInteger(value),
	Type.union(
		Type.functionType(Type.Float, [Type.Integer]),
		Type.functionType(Type.Integer, [Type.Float]),
	)
);

export const funcCastToFloat = new Constant(
	(value: bigint)=>
		Number(value),
	Type.functionType(Type.Float, [Type.Integer]),
);

export const funcCastToInteger = new Constant(
	(value: number)=>
		castToInteger(value),
	Type.functionType(Type.Integer, [Type.Float]),
);
