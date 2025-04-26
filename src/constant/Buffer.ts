import { Constant } from '../Constant.js';
import { Type } from '../Type.js';

export const equateBuffers = (value1: ArrayBuffer, value2: ArrayBuffer)=> {
	if (value1.byteLength !== value2.byteLength) {
		return false;
	}
	const dv1 = new DataView(value1);
	const dv2 = new DataView(value2);
	const length = dv1.byteLength;
	for (let lfi = length - 3, i = 0; i < length;) {
		if (i < lfi) {
			if (dv1.getUint32(i) !== dv2.getUint32(i)) {
				return false;
			}
			i += 4;
		}
		else {
			if (dv1.getUint8(i) !== dv2.getUint8(i)) {
				return false;
			}
			++i;
		}
	}
	return true;
};

export const parseBuffer = (value?: string)=> {
	if (value == null) {
		return undefined;
	}
	const bytes = new Uint8Array(Math.ceil(value.length / 2));
	for (let i = 0, c = 0; c < value.length; ++i) {
		bytes[i] = Number.parseInt(value.slice(c, c += 2), 16);
	}
	return bytes.buffer;
};

export const formatBuffer = (value?: ArrayBuffer)=> {
	if (value == null) {
		return undefined;
	}
	const bytes = new Uint8Array(value);
	let str = '';
	for (let i = 0; i < bytes.byteLength; ++i) {
		str += bytes[i].toString(16).padStart(2, '0');
	}
	return str;
};

export const funcByte = new Constant(
	(value: ArrayBuffer, pos: number)=>
		value == null
			? undefined
			: value.slice(pos, pos + 1),
	Type.functionType(Type.Buffer, [Type.Buffer, Type.Number]),
);

const funcRandomBuffer = new Constant(
	(value: number)=>
		value == null || value < 0 ? undefined : crypto.getRandomValues(new Uint8Array(value)),
	Type.functionType(Type.Buffer, [Type.Number], false, false),
);

const funcFormatBuffer = new Constant(
	(value: ArrayBuffer | undefined)=>
		formatBuffer(value),
	Type.functionType(Type.OptionalString, [Type.OptionalBuffer]),
);

const funcParseBuffer = new Constant(
	(value: string)=>
		parseBuffer(value),
	Type.functionType(Type.OptionalBuffer, [Type.OptionalString]),
);

export const constBuffer = new Constant({
	Random: funcRandomBuffer.value,
	Format: funcFormatBuffer.value,
	Parse: funcParseBuffer.value,
}, Type.objectType({
	Random: funcRandomBuffer.type,
	Format: funcFormatBuffer.type,
	Parse: funcParseBuffer.type,
}))