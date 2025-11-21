import { Constant } from "../Constant.js";
import { Type } from "../Type.js";

export type RealEncoding = "real32" | "real32le" | "real64" | "real64le";

export const encodeReal = (value?: number, encoding: RealEncoding = "real64")=> {
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
		case "real32": dv.setFloat32(0, value); break;
		case "real32le": dv.setFloat32(0, value, true); break;
		case "real64": dv.setFloat64(0, value); break;
		case "real64le": dv.setFloat64(0, value, true); break;
		default: throw new Error(`${encoding} encoding not supported`);
	}
	return dv.buffer;
};

const decodeReal = (value?: ArrayBuffer, encoding: RealEncoding = "real64", byteOffset?: number)=> {
	if (value == null) {
		return undefined;
	}
	const dv = new DataView(value, byteOffset);
	switch (encoding) {
		case "real32": return dv.getFloat32(0);
		case "real32le": return dv.getFloat32(0, true);
		case "real64": return dv.getFloat64(0);
		case "real64le": return dv.getFloat64(0, true);
		default: throw new Error(`${encoding} encoding not supported`);
	}
};

export const formatReal = (value: number, radix?: number)=>
	value.toString(radix) + (Number.isInteger(value) ? ".0" : "");

const typeNumberOrArray = Type.union(Type.Real, Type.arrayType([Type.Real]));
const typeAggregator = Type.functionType(Type.Real, [typeNumberOrArray], true);
const typeTransform = Type.functionType(Type.Real, [Type.Real]);

const funcSum = new Constant(
	(...values: (number | number[])[])=>
		values.flat().reduce((acc, val)=> acc + Number(val), 0),
	typeAggregator,
);

const funcMin = new Constant(
	(...values: (number | number[])[])=>
		Math.min(Number.POSITIVE_INFINITY, ...values.flat().map((i)=> Number(i))),
	typeAggregator,
);

const funcMax = new Constant(
	(...values: (number | number[])[])=>
		Math.max(Number.NEGATIVE_INFINITY, ...values.flat().map((i)=> Number(i))),
	typeAggregator,
);

const funcExponent = new Constant(
	(value: number)=>
		Math.exp(Number(value)),
	typeTransform,
);

const funcLogarithm = new Constant(
	(value: number)=>
		Math.log(Number(value)),
	typeTransform,
);

const funcAbs = new Constant(
	(value: number)=>
		Math.abs(Number(value)),
	typeTransform,
);

const funcCeil = new Constant(
	(value: number)=>
		Math.ceil(Number(value)),
	typeTransform,
);

const funcFloor = new Constant(
	(value: number)=>
		Math.floor(Number(value)),
	typeTransform,
);

const funcRound = new Constant(
	(value: number)=>
		Math.round(Number(value)),
	typeTransform,
);

const funcTruncate = new Constant(
	(value: number)=>
		Math.trunc(Number(value)),
	typeTransform,
);

const funcRandomFloat = new Constant(
	(value: number)=>
		value == null ? undefined : Math.random() * Number(value),
	Type.functionType(Type.Real, [Type.Real]),
	false,
);

const funcDecodeFloat = new Constant(
	(value: ArrayBuffer, encoding: RealEncoding = "real64", byteOffset?: bigint)=>
		decodeReal(value, encoding, byteOffset == null ? undefined : Number(byteOffset)),
	Type.functionType(Type.OptionalReal, [Type.Buffer, Type.OptionalString, Type.OptionalInteger]),
);

const funcParseFloat = new Constant(
	(value: string)=>
		value ? Number.parseFloat(value) : undefined,
	Type.functionType(Type.OptionalReal, [Type.String]),
);

export const constFloat = {
	NAN: new Constant(Number.NaN),
	PositiveInfinity: new Constant(Number.POSITIVE_INFINITY),
	NegativeInfinity: new Constant(Number.NEGATIVE_INFINITY),
	Epsilon: new Constant(Number.EPSILON),
	Sum: funcSum,
	Min: funcMin,
	Max: funcMax,
	Exponent: funcExponent,
	Logarithm: funcLogarithm,
	Abs: funcAbs,
	Ceil: funcCeil,
	Floor: funcFloor,
	Round: funcRound,
	Truncate: funcTruncate,
	Random: funcRandomFloat,
	Decode: funcDecodeFloat,
	Parse: funcParseFloat,
};
