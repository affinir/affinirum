import { Constant } from "../Constant.js";
import { Type } from "../Type.js";

export type FloatEncoding = "f32" | "f32le" | "f64" | "f64le";

export const encodeFloat = (value: number, encoding: FloatEncoding = "f64") => {
	let bits = "";
	for (let i = 0; i < encoding.length; ++i) {
		const c = encoding[i];
		if (c >= "0" && c <= "9") {
			bits += c;
		}
	}
	const dv = new DataView(new Uint8Array(Number.parseInt(bits) / 8).buffer);
	switch (encoding) {
		case "f32": dv.setFloat32(0, value); break;
		case "f32le": dv.setFloat32(0, value, true); break;
		case "f64": dv.setFloat64(0, value); break;
		case "f64le": dv.setFloat64(0, value, true); break;
		default: throw new Error(`${encoding} encoding not supported`);
	}
	return dv.buffer;
};

const decodeFloat = (value?: ArrayBuffer, encoding: FloatEncoding = "f64", byteOffset?: number) => {
	if (value == null) {
		return undefined;
	}
	const dv = new DataView(value, byteOffset);
	switch (encoding) {
		case "f32": return dv.getFloat32(0);
		case "f32le": return dv.getFloat32(0, true);
		case "f64": return dv.getFloat64(0);
		case "f64le": return dv.getFloat64(0, true);
		default: throw new Error(`${encoding} encoding not supported`);
	}
};

const typeNumberOrArray = Type.union(Type.Number, Type.arrayType([Type.Number]));
const typeAggregator = Type.functionType(Type.Float, [Type.arrayType([typeNumberOrArray])], true);
const typeTransform = Type.functionType(Type.Float, [Type.Number]);

const funcSum = new Constant(
	(values: (number | number[] | bigint | bigint[])[]) =>
		values.flat().reduce((acc: number, val) => acc + Number(val), 0),
	typeAggregator,
);

const funcMin = new Constant(
	(values: (number | number[] | bigint | bigint[])[]) =>
		Math.min(Number.POSITIVE_INFINITY, ...values.flat().map((i) => Number(i))),
	typeAggregator,
);

const funcMax = new Constant(
	(values: (number | number[] | bigint | bigint[])[]) =>
		Math.max(Number.NEGATIVE_INFINITY, ...values.flat().map((i) => Number(i))),
	typeAggregator,
);

const funcExponent = new Constant(
	(value: number | bigint) =>
		Math.exp(Number(value)),
	typeTransform,
);

const funcLogarithm = new Constant(
	(value: number | bigint) =>
		Math.log(Number(value)),
	typeTransform,
);

const funcAbs = new Constant(
	(value: number | bigint) =>
		Math.abs(Number(value)),
	typeTransform,
);

const funcCeil = new Constant(
	(value: number | bigint) =>
		Math.ceil(Number(value)),
	typeTransform,
);

const funcFloor = new Constant(
	(value: number | bigint) =>
		Math.floor(Number(value)),
	typeTransform,
);

const funcRound = new Constant(
	(value: number | bigint) =>
		Math.round(Number(value)),
	typeTransform,
);

const funcTruncate = new Constant(
	(value: number | bigint) =>
		Math.trunc(Number(value)),
	typeTransform,
);

const funcRandomFloat = new Constant(
	(value: number | bigint) =>
		value == null ? undefined : Math.random() * Number(value),
	typeTransform,
	false,
);

const funcDecodeFloat = new Constant(
	(value: ArrayBuffer | undefined, encoding: FloatEncoding = "f64", byteOffset?: bigint) =>
		decodeFloat(value, encoding, byteOffset == null ? undefined : Number(byteOffset)),
	Type.functionType(Type.OptionalFloat, [Type.OptionalBuffer, Type.OptionalString, Type.OptionalInteger]),
);

const funcParseFloat = new Constant(
	(value: string | undefined) =>
		value ? Number.parseFloat(value) : undefined,
	Type.functionType(Type.OptionalFloat, [Type.OptionalString]),
);

export const funcFloat = new Constant(
	(value: boolean | Date | bigint) =>
		Number(value),
	Type.union(
		Type.functionType(Type.Float, [Type.Boolean]),
		Type.functionType(Type.Float, [Type.Timestamp]),
		Type.functionType(Type.Float, [Type.Integer]),
	),
);

export const constFloat = Object.assign(Object.create(null), {
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
});
