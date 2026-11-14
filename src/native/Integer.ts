import { Constant } from "../Constant.js";
import { Type } from "../Type.js";

export type IntegerEncoding = "i8" | "i16" | "i16le" | "i32" | "i32le" | "i64" | "i64le"
	| "n8" | "n16" | "n16le" | "n32" | "n32le";

export const int64 = (value: bigint) => BigInt.asIntN(64, value);

export const createInteger = (value?: number) => {
	if (value == null || Number.isNaN(value)) {
		return undefined;
	}
	if (value === Number.NEGATIVE_INFINITY) {
		return -0x8000000000000000n;
	}
	if (value === Number.POSITIVE_INFINITY) {
		return 0x7FFFFFFFFFFFFFFFn;
	}
	return int64(BigInt(Math.trunc(value)));
};

export const encodeInteger = (value: bigint, encoding: IntegerEncoding = "i64") => {
	let bits = "";
	for (let i = 0; i < encoding.length; ++i) {
		const c = encoding[i];
		if (c >= "0" && c <= "9") {
			bits += c;
		}
	}
	const dv = new DataView(new Uint8Array(Number.parseInt(bits) / 8).buffer);
	switch (encoding) {
		case "i8": dv.setInt8(0, Number(BigInt.asIntN(8, value))); break;
		case "i16": dv.setInt16(0, Number(BigInt.asIntN(16, value))); break;
		case "i16le": dv.setInt16(0, Number(BigInt.asIntN(16, value)), true); break;
		case "i32": dv.setInt32(0, Number(BigInt.asIntN(32, value))); break;
		case "i32le": dv.setInt32(0, Number(BigInt.asIntN(32, value)), true); break;
		case "n8": dv.setUint8(0, Number(BigInt.asUintN(8, value))); break;
		case "n16": dv.setUint16(0, Number(BigInt.asUintN(16, value))); break;
		case "n16le": dv.setUint16(0, Number(BigInt.asUintN(16, value)), true); break;
		case "n32": dv.setUint32(0, Number(BigInt.asUintN(32, value))); break;
		case "n32le": dv.setUint32(0, Number(BigInt.asUintN(32, value)), true); break;
		case "i64": dv.setBigInt64(0, value); break;
		case "i64le": dv.setBigInt64(0, value, true); break;
		default: throw new Error(`${encoding} encoding not supported`);
	}
	return dv.buffer;
};

const decodeInteger = (value?: ArrayBuffer, encoding: IntegerEncoding = "i64", byteOffset?: number) => {
	if (value == null) {
		return undefined;
	}
	const offset = byteOffset ?? 0;
	if (offset < 0) {
		return undefined;
	}
	const dv = new DataView(value);
	switch (encoding) {
		case "i8": return value.byteLength < offset + 1
			? undefined
			: BigInt(dv.getInt8(offset));
		case "i16": return value.byteLength < offset + 2
			? undefined
			: BigInt(dv.getInt16(offset));
		case "i16le": return value.byteLength < offset + 2
			? undefined
			: BigInt(dv.getInt16(offset, true));
		case "i32": return value.byteLength < offset + 4
			? undefined
			: BigInt(dv.getInt32(offset));
		case "i32le": return value.byteLength < offset + 4
			? undefined
			: BigInt(dv.getInt32(offset, true));
		case "i64": return value.byteLength < offset + 8
			? undefined
			: dv.getBigInt64(offset);
		case "i64le": return value.byteLength < offset + 8
			? undefined
			: dv.getBigInt64(offset, true);
		case "n8": return value.byteLength < offset + 1
			? undefined
			: BigInt(dv.getUint8(offset));
		case "n16": return value.byteLength < offset + 2
			? undefined
			: BigInt(dv.getUint16(offset));
		case "n16le": return value.byteLength < offset + 2
			? undefined
			: BigInt(dv.getUint16(offset, true));
		case "n32": return value.byteLength < offset + 4
			? undefined
			: BigInt(dv.getUint32(offset));
		case "n32le": return value.byteLength < offset + 4
			? undefined
			: BigInt(dv.getUint32(offset, true));
		default: throw new Error(`${encoding} encoding not supported`);
	}
};

export const formatInteger = (value: bigint, formatting?: string) => {
	const int = int64(value);
	if (formatting) {
		const nformat = JSON.parse(`{${formatting}}`);
		if (typeof nformat === "object") {
			return new Intl.NumberFormat(undefined, {
				minimumIntegerDigits: nformat?.min_integer_digits,
				minimumFractionDigits: nformat?.min_fraction_digits,
				maximumFractionDigits: nformat?.max_fraction_digits,
				minimumSignificantDigits: nformat?.min_significant_digits,
				maximumSignificantDigits: nformat?.max_significant_digits,
				notation: nformat?.notation,
			}).format(int);
		}
	}
	return int.toString();
};

export const formatLiteralInteger = (value: bigint) => {
	return int64(value).toString();
};

const typeIntegerOrArray = Type.union(Type.Integer, Type.arrayType(Type.Integer));
const typeAggregator = Type.functionType([[Type.Integer, [Type.arrayType(typeIntegerOrArray)], true]]);

const funcSum = new Constant(
	(...values: (bigint | bigint[])[]) =>
		int64(values.flat().reduce((acc, val) => acc + val, 0n)),
	typeAggregator,
);

const funcMin = new Constant(
	(...values: (bigint | bigint[])[]) =>
		values.flat().reduce((min, val) => val < min ? val : min),
	typeAggregator,
);

const funcMax = new Constant(
	(...values: (bigint | bigint[])[]) =>
		values.flat().reduce((max, val) => val > max ? val : max),
	typeAggregator,
);

const funcRandomInteger = new Constant(
	(value: bigint) =>
		value == null ? undefined : BigInt(Math.floor(Math.random() * Number(value))),
	Type.functionType([[Type.Integer, [Type.Integer]]], true),
);

const funcDecodeInteger = new Constant(
	(value: ArrayBuffer | undefined, encoding: IntegerEncoding = "i64", byteOffset?: bigint) =>
		decodeInteger(value, encoding, byteOffset == null ? undefined : Number(byteOffset)),
	Type.functionType([[Type.OptionalInteger, [Type.OptionalBuffer, Type.OptionalString, Type.OptionalInteger]]]),
);

const funcParseInteger = new Constant(
	(value: string | undefined) => {
		try {
			return value ? int64(BigInt(value)) : undefined
		}
		catch {}
		return undefined;
	},
	Type.functionType([[Type.OptionalInteger, [Type.OptionalString]]]),
);

export const funcInteger = new Constant(
	(value: boolean | Date | number) =>
		createInteger(Number(value)) ?? 0n,
	Type.functionType([
		[Type.Integer, [Type.Boolean]],
		[Type.Integer, [Type.Timestamp]],
		[Type.Integer, [Type.Float]],
	]),
);

export const constInteger = Object.assign(Object.create(null), {
	Sum: funcSum,
	Min: funcMin,
	Max: funcMax,
	Random: funcRandomInteger,
	Decode: funcDecodeInteger,
	Parse: funcParseInteger,
});
