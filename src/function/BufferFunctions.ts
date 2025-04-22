import { Constant } from '../Constant.js';
import { Type } from '../Type.js';

export const funcEncodeNumber = new Constant(
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

export const funcDecodeNumber = new Constant(
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

export const funcEncodeString = new Constant(
	(value: string, encoding: 'utf8' | 'ucs2' | 'ucs2le' = 'utf8')=> {
		if (value == null) {
			return undefined;
		}
		if (encoding === 'utf8') {
			return new TextEncoder().encode(value).buffer;
		}
		else {
			const dv = new DataView(new Uint16Array(value.length).buffer);
			const lessOrEqual = encoding.endsWith('le');
			for (let i = 0; i < value.length; ++i) {
				dv.setUint16(i << 1, value.charCodeAt(i), lessOrEqual);
			}
			return dv.buffer;
		}
	},
	Type.functionType(Type.Buffer, [Type.String, Type.OptionalString]),
);

export const funcDecodeString = new Constant(
	(value: ArrayBuffer, encoding: 'utf8' | 'ucs2' | 'ucs2le' = 'utf8', byteOffset?: number, byteLength?: number)=> {
		if (value == null) {
			return undefined;
		}
		if (encoding === 'utf8') {
			return new TextDecoder().decode(new DataView(value, byteOffset, byteLength));
		}
		else {
			const dv = new DataView(value, byteOffset, byteLength);
			const lessOrEqual = encoding.endsWith('le');
			let str = '';
			for (let i = 0; i < dv.byteLength; i += 2) {
				str += String.fromCharCode(dv.getUint16(i, lessOrEqual));
			}
			return str;
		}
	},
	Type.functionType(Type.String, [Type.Buffer, Type.OptionalString, Type.OptionalNumber, Type.OptionalNumber]),
);
