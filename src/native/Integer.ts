import { Constant } from "../Constant.js";
import { Type } from "../Type.js";

export type IntegerEncoding = "i8" | "i16" | "i16le" | "i32" | "i32le" | "i64" | "i64le"
	| "n8" | "n16" | "n16le" | "n32" | "n32le";

export const boundInteger = (value: bigint) => BigInt.asIntN(64, value);

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
	return boundInteger(BigInt(Math.trunc(value)));
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
		case "i8": dv.setInt8(0, Number(value)); break;
		case "i16": dv.setInt16(0, Number(value)); break;
		case "i16le": dv.setInt16(0, Number(value), true); break;
		case "i32": dv.setInt32(0, Number(value)); break;
		case "i32le": dv.setInt32(0, Number(value), true); break;
		case "n8": dv.setUint8(0, Number(value)); break;
		case "n16": dv.setUint16(0, Number(value)); break;
		case "n16le": dv.setUint16(0, Number(value), true); break;
		case "n32": dv.setUint32(0, Number(value)); break;
		case "n32le": dv.setUint32(0, Number(value), true); break;
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
	const dv = new DataView(value, byteOffset == null ? undefined : Number(byteOffset));
	switch (encoding) {
		case "i8": return BigInt(dv.getInt8(0));
		case "i16": return BigInt(dv.getInt16(0));
		case "i16le": return BigInt(dv.getInt16(0, true));
		case "i32": return BigInt(dv.getInt32(0));
		case "i32le": return BigInt(dv.getInt32(0, true));
		case "i64": return dv.getBigInt64(0);
		case "i64le": return dv.getBigInt64(0, true);
		case "n8": return BigInt(dv.getUint8(0));
		case "n16": return BigInt(dv.getUint16(0));
		case "n16le": return BigInt(dv.getUint16(0, true));
		case "n32": return BigInt(dv.getUint32(0));
		case "n32le": return BigInt(dv.getUint32(0, true));
		default: throw new Error(`${encoding} encoding not supported`);
	}
};

const typeIntegerOrArray = Type.union(Type.Integer, Type.arrayType([Type.Integer]));
const typeAggregator = Type.functionType(Type.Integer, [Type.arrayType([typeIntegerOrArray])], true);

const funcSum = new Constant(
	(values: (bigint | bigint[])[]) =>
		boundInteger(values.flat().reduce((acc, val) => acc + val, 0n)),
	typeAggregator,
);

const funcMin = new Constant(
	(values: (bigint | bigint[])[]) =>
		boundInteger(values.flat().reduce((min, val) => val < min ? val : min)),
	typeAggregator,
);

const funcMax = new Constant(
	(values: (bigint | bigint[])[]) =>
		boundInteger(values.flat().reduce((max, val) => val > max ? val : max)),
	typeAggregator,
);

const funcRandomInteger = new Constant(
	(value: bigint) =>
		value == null ? undefined : boundInteger(BigInt(Math.floor(Math.random() * Number(value)))),
	Type.functionType(Type.Integer, [Type.Integer]),
	false,
);

const funcDecodeInteger = new Constant(
	(value: ArrayBuffer | undefined, encoding: IntegerEncoding = "i64", byteOffset?: bigint) =>
		decodeInteger(value, encoding, byteOffset == null ? undefined : Number(byteOffset)),
	Type.functionType(Type.OptionalInteger, [Type.OptionalBuffer, Type.OptionalString, Type.OptionalInteger]),
);

const funcParseInteger = new Constant(
	(value: string | undefined) => {
		try {
			return value ? boundInteger(BigInt(value)) : undefined
		}
		catch {}
		return undefined;
	},
	Type.functionType(Type.OptionalInteger, [Type.OptionalString]),
);

export const funcInteger = new Constant(
	(value: boolean | Date | number) =>
		createInteger(Number(value)) ?? 0n,
	Type.union(
		Type.functionType(Type.Integer, [Type.Boolean]),
		Type.functionType(Type.Integer, [Type.Timestamp]),
		Type.functionType(Type.Integer, [Type.Float]),
	),
);

export const constInteger = Object.assign(Object.create(null), {
	Sum: funcSum,
	Min: funcMin,
	Max: funcMax,
	Random: funcRandomInteger,
	Decode: funcDecodeInteger,
	Parse: funcParseInteger,
});
