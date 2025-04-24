import { Constant } from '../Constant.js';
import { Type } from '../Type.js';

const typeNumberOrArray = Type.union(Type.Number, Type.Array);
const typeAggregator = Type.functionType(Type.Number, [typeNumberOrArray], { variadic: true });
const typeNumberTransform = Type.functionType(Type.Number, [Type.Number]);

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

const funcRandomNumber = new Constant(
	(value: number)=>
		value == null ? undefined : Math.random() * value,
	Type.functionType(Type.Number, [Type.Number], { unstable: true }),
);

const funcEncodeNumber = new Constant(
	(value: number, encoding: 'int8' | 'int16' | 'int16le' | 'int32' | 'int32le'
			| 'uint8' | 'uint16' | 'uint16le' | 'uint32' | 'uint32le'
			| 'float32' | 'float32le' | 'float64' | 'float64le')=> {
		if (value == null) {
			return undefined;
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
			case 'int8': dv.setInt8(0, value); break;
			case 'int16': dv.setInt16(0, value); break;
			case 'int16le': dv.setInt16(0, value, true); break;
			case 'int32': dv.setInt32(0, value); break;
			case 'int32le': dv.setInt32(0, value, true); break;
			case 'uint8': dv.setUint8(0, value); break;
			case 'uint16': dv.setUint16(0, value); break;
			case 'uint16le': dv.setUint16(0, value, true); break;
			case 'uint32': dv.setUint32(0, value); break;
			case 'uint32le': dv.setUint32(0, value, true); break;
			case 'float32': dv.setFloat32(0, value); break;
			case 'float32le': dv.setFloat32(0, value, true); break;
			case 'float64': dv.setFloat64(0, value); break;
			case 'float64le': dv.setFloat64(0, value, true); break;
			default: throw new Error(`${encoding} encoding not supported`);
		}
		return dv.buffer;
	},
	Type.functionType(Type.Buffer, [Type.Number, Type.String]),
);

const funcDecodeNumber = new Constant(
	(value: ArrayBuffer, encoding: 'int8' | 'int16' | 'int16le' | 'int32' | 'int32le'
			| 'uint8' | 'uint16' | 'uint16le' | 'uint32' | 'uint32le'
			| 'float32' | 'float32le' | 'float64' | 'float64le', byteOffset?: number)=> {
		if (value == null) {
			return undefined;
		}
		const dv = new DataView(value, byteOffset);
		switch (encoding) {
			case 'int8': return dv.getInt8(0);
			case 'int16': return dv.getInt16(0);
			case 'int16le': return dv.getInt16(0, true);
			case 'int32': return dv.getInt32(0);
			case 'int32le': return dv.getInt32(0, true);
			case 'uint8': return dv.getUint8(0);
			case 'uint16': return dv.getUint16(0);
			case 'uint16le': return dv.getUint16(0, true);
			case 'uint32': return dv.getUint32(0);
			case 'uint32le': return dv.getUint32(0, true);
			case 'float32': return dv.getFloat32(0);
			case 'float32le': return dv.getFloat32(0, true);
			case 'float64': return dv.getFloat64(0);
			case 'float64le': return dv.getFloat64(0, true);
			default: throw new Error(`${encoding} encoding not supported`);
		}
	},
	Type.functionType(Type.Number, [Type.Buffer, Type.String, Type.OptionalNumber]),
);

const funcFormatNumber = new Constant(
	(value: number | undefined, radix?: number)=>
		value?.toString(radix),
	Type.functionType(Type.OptionalString, [Type.OptionalNumber]),
);

const funcParseNumber = new Constant(
	(value: string | undefined)=>
		value ? Number.parseFloat(value) : undefined,
	Type.functionType(Type.OptionalNumber, [Type.OptionalString]),
);

export const constNumber = new Constant({
	NAN: Number.NaN,
	PositiveInfinity: Number.POSITIVE_INFINITY,
	NegativeInfinity: Number.NEGATIVE_INFINITY,
	Epsilon: Number.EPSILON,
	Sum: funcSum.value,
	Min: funcMin.value,
	Max: funcMax.value,
	Exponent: funcExponent.value,
	Logarithm: funcLogarithm.value,
	Abs: funcAbs.value,
	Ceil: funcCeil.value,
	Floor: funcFloor.value,
	Round: funcRound.value,
	Random: funcRandomNumber.value,
	Encode: funcEncodeNumber.value,
	Decode: funcDecodeNumber.value,
	Format: funcFormatNumber.value,
	Parse: funcParseNumber.value,
}, Type.objectType({
	NAN: Type.Number,
	PositiveInfinity: Type.Number,
	NegativeInfinity: Type.Number,
	Epsilon: Type.Number,
	Sum: funcSum.type,
	Min: funcMin.type,
	Max: funcMax.type,
	Exponent: funcExponent.type,
	Logarithm: funcLogarithm.type,
	Abs: funcAbs.type,
	Ceil: funcCeil.type,
	Floor: funcFloor.type,
	Round: funcRound.type,
	Random: funcRandomNumber.type,
	Encode: funcEncodeNumber.type,
	Decode: funcDecodeNumber.type,
	Format: funcFormatNumber.type,
	Parse: funcParseNumber.type,
}));
