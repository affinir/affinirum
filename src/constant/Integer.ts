import { Constant } from "../Constant.js";
import { Type } from "../Type.js";

export type IntegerEncoding = "int8" | "int16" | "int16le" | "int32" | "int32le" | "int64" | "int64le"
	| "nat8" | "nat16" | "nat16le" | "nat32" | "nat32le" | "nat64" | "nat64le";

export const encodeInteger = (value?: bigint, encoding: IntegerEncoding = "int64")=> {
	if (value == null) {
		return new Uint8Array(0).buffer;
	}
	let bits = "";
	for (let i = 0; i < encoding.length; ++i) {
		const c = encoding[i];
		if (c >= "0" && c <= "9") {
			bits += c;
		}
	}
	const dv = new DataView(new Uint8Array(Number.parseInt(bits) / 8).buffer);
	switch (encoding) {
		case "int8": dv.setInt8(0, Number(value)); break;
		case "int16": dv.setInt16(0, Number(value)); break;
		case "int16le": dv.setInt16(0, Number(value), true); break;
		case "int32": dv.setInt32(0, Number(value)); break;
		case "int32le": dv.setInt32(0, Number(value), true); break;
		case "nat8": dv.setUint8(0, Number(value)); break;
		case "nat16": dv.setUint16(0, Number(value)); break;
		case "nat16le": dv.setUint16(0, Number(value), true); break;
		case "nat32": dv.setUint32(0, Number(value)); break;
		case "nat32le": dv.setUint32(0, Number(value), true); break;
		case "int64": dv.setBigInt64(0, value); break;
		case "int64le": dv.setBigInt64(0, value, true); break;
		case "nat64": dv.setBigUint64(0, value); break;
		case "nat64le": dv.setBigUint64(0, value, true); break;
		default: throw new Error(`${encoding} encoding not supported`);
	}
	return dv.buffer;
};

const decodeInteger = (value?: ArrayBuffer, encoding: IntegerEncoding = "int64", byteOffset?: number)=> {
	if (value == null) {
		return undefined;
	}
	const dv = new DataView(value, byteOffset == null ? undefined : Number(byteOffset));
	switch (encoding) {
		case "int8": return BigInt(dv.getInt8(0));
		case "int16": return BigInt(dv.getInt16(0));
		case "int16le": return BigInt(dv.getInt16(0, true));
		case "int32": return BigInt(dv.getInt32(0));
		case "int32le": return BigInt(dv.getInt32(0, true));
		case "int64": return dv.getBigInt64(0);
		case "int64le": return dv.getBigInt64(0, true);
		case "nat8": return BigInt(dv.getUint8(0));
		case "nat16": return BigInt(dv.getUint16(0));
		case "nat16le": return BigInt(dv.getUint16(0, true));
		case "nat32": return BigInt(dv.getUint32(0));
		case "nat32le": return BigInt(dv.getUint32(0, true));
		case "nat64": return dv.getBigUint64(0);
		case "nat64le": return dv.getBigUint64(0, true);
		default: throw new Error(`${encoding} encoding not supported`);
	}
};

const typeIntegerOrArray = Type.union(Type.Integer, Type.arrayType([Type.Integer]));
const typeAggregator = Type.functionType(Type.Integer, [typeIntegerOrArray], true);

const funcSum = new Constant(
	(...values: (bigint | bigint[])[])=>
		BigInt.asIntN(64, values.flat().reduce((acc, val)=> acc + val, 0n)),
	typeAggregator,
);

const funcMin = new Constant(
	(...values: (bigint | bigint[])[])=>
		BigInt.asIntN(64, values.flat().reduce((min, val)=> val < min ? val : min)),
	typeAggregator,
);

const funcMax = new Constant(
	(...values: (bigint | bigint[])[])=>
		BigInt.asIntN(64, values.flat().reduce((max, val)=> val > max ? val : max)),
	typeAggregator,
);

const funcRandomInteger = new Constant(
	(value: bigint)=>
		value == null ? undefined : BigInt.asIntN(64, BigInt(Math.floor(Math.random() * Number(value)))),
	Type.functionType(Type.Integer, [Type.Integer]),
	false,
);

const funcDecodeInteger = new Constant(
	(value: ArrayBuffer, encoding: IntegerEncoding = "int64", byteOffset?: bigint)=>
		decodeInteger(value, encoding, byteOffset == null ? undefined : Number(byteOffset)),
	Type.functionType(Type.OptionalInteger, [Type.Buffer, Type.OptionalString, Type.OptionalInteger]),
);

const funcParseInteger = new Constant(
	(value: string)=>
		value ? BigInt.asIntN(64, BigInt(value)) : undefined,
	Type.functionType(Type.OptionalInteger, [Type.String]),
);

export const constInteger = {
	Sum: funcSum,
	Min: funcMin,
	Max: funcMax,
	Random: funcRandomInteger,
	Decode: funcDecodeInteger,
	Parse: funcParseInteger,
};
