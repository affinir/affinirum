import { Constant } from '../Constant.js';
import { Type } from '../Type.js';

const typeNumberOrArray = Type.union(Type.Float, Type.arrayType([Type.Float]));
const typeAggregator = Type.functionType(Type.Float, [typeNumberOrArray], true);
const typeNumberTransform = Type.functionType(Type.Float, [Type.Float]);

const funcSum = new Constant(
	(...values: (number | number[])[])=>
		values.flat().reduce((acc, val)=> acc + val, 0),
	typeAggregator,
);

const funcMin = new Constant(
	(...values: (number | number[])[])=>
		Math.min(Number.POSITIVE_INFINITY, ...values.flat()),
	typeAggregator,
);

const funcMax = new Constant(
	(...values: (number | number[])[])=>
		Math.max(Number.NEGATIVE_INFINITY, ...values.flat()),
	typeAggregator,
);

const funcExponent = new Constant(
	(value: number)=>
		Math.exp(value),
	typeNumberTransform,
);

const funcLogarithm = new Constant(
	(value: number)=>
		Math.log(value),
	typeNumberTransform,
);

const funcAbs = new Constant(
	(value: number)=>
		Math.abs(value),
	typeNumberTransform,
);

const funcCeil = new Constant(
	(value: number)=>
		Math.ceil(value),
	typeNumberTransform,
);

const funcFloor = new Constant(
	(value: number)=>
		Math.floor(value),
	typeNumberTransform,
);

const funcRound = new Constant(
	(value: number)=>
		Math.round(value),
	typeNumberTransform,
);

const funcRandomFloat = new Constant(
	(value: number)=>
		value == null ? undefined : Math.random() * value,
	Type.functionType(Type.Float, [Type.Float]),
	false,
);

const funcEncodeFloat = new Constant(
	(value: number, encoding: 'float32' | 'float32le' | 'float64' | 'float64le')=> {
		if (value == null) {
			return new Uint8Array(0).buffer;
		}
		let bits = '';
		for (let i = 0; i < encoding.length; ++i) {
			const c = encoding[i];
			if (c >= '0' && c <= '9') {
				bits += c;
			}
		}
		const dv = new DataView(new Uint8Array(Number.parseInt(bits) / 8).buffer);
		switch (encoding) {
			case 'float32': dv.setFloat32(0, value); break;
			case 'float32le': dv.setFloat32(0, value, true); break;
			case 'float64': dv.setFloat64(0, value); break;
			case 'float64le': dv.setFloat64(0, value, true); break;
			default: throw new Error(`${encoding} encoding not supported`);
		}
		return dv.buffer;
	},
	Type.functionType(Type.Buffer, [Type.Float, Type.String]),
);

const funcDecodeFloat = new Constant(
	(value: ArrayBuffer, encoding: 'float32' | 'float32le' | 'float64' | 'float64le', byteOffset?: bigint)=> {
		if (value == null) {
			return undefined;
		}
		const dv = new DataView(value, byteOffset == null ? undefined : Number(byteOffset));
		switch (encoding) {
			case 'float32': return dv.getFloat32(0);
			case 'float32le': return dv.getFloat32(0, true);
			case 'float64': return dv.getFloat64(0);
			case 'float64le': return dv.getFloat64(0, true);
			default: throw new Error(`${encoding} encoding not supported`);
		}
	},
	Type.functionType(Type.OptionalFloat, [Type.Buffer, Type.String, Type.OptionalInteger]),
);

const funcFormatFloat = new Constant(
	(value: number, radix?: bigint)=>
		value?.toString(radix ? Number(radix) : undefined) ?? '',
	Type.functionType(Type.String, [Type.Float, Type.OptionalInteger]),
);

const funcParseFloat = new Constant(
	(value: string)=>
		value ? Number.parseFloat(value) : undefined,
	Type.functionType(Type.OptionalFloat, [Type.String]),
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
	Random: funcRandomFloat,
	Encode: funcEncodeFloat,
	Decode: funcDecodeFloat,
	Format: funcFormatFloat,
	Parse: funcParseFloat,
};
