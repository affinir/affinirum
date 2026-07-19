import { Constant } from "../Constant.js";
import { Type } from "../Type.js";

export type BufferFormatting = "hex" | "base64";
export const EmptyBuffer = new ArrayBuffer(0);

const ZERO = "0".charCodeAt(0), NINE = "9".charCodeAt(0);
const UPPER_A = "A".charCodeAt(0), UPPER_F = "F".charCodeAt(0);
const LOWER_A = "a".charCodeAt(0), LOWER_F = "f".charCodeAt(0);

export const parseBoundedInteger = (input: string, base: 10 | 16, min: number, max: number): number=> {
	if (input.length === 0) {
		throw new Error(`Invalid IP component: ${input}`);
	}
	let value = 0;
	for (let i = 0; i < input.length; i++) {
		const code = input.charCodeAt(i);
		let digit: number;
		if (code >= ZERO && code <= NINE) {
			digit = code - ZERO;
		}
		else if (base === 16 && code >= UPPER_A && code <= UPPER_F) {
			digit = code - UPPER_A + 10;
		}
		else if (base === 16 && code >= LOWER_A && code <= LOWER_F) {
			digit = code - LOWER_A + 10;
		}
		else {
			throw new Error(`Invalid IP component: ${input}`);
		}
		value = value * base + digit;
	}
	if (value < min || value > max) {
		throw new Error(`Invalid IP component: ${input}`);
	}
	return value;
}

export const equateBuffers = (value1: ArrayBuffer, value2: ArrayBuffer)=> {
	if (value1.byteLength !== value2.byteLength) {
		return false;
	}
	const dv1 = new DataView(value1);
	const dv2 = new DataView(value2);
	const length = dv1.byteLength;
	const fastSearchLength = length - 3;
	for (let i = 0; i < length;) {
		if (i < fastSearchLength) {
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

export const containsBuffer = (value: ArrayBuffer, search: ArrayBuffer, startPos?: number)=> {
	if (value.byteLength < search.byteLength) {
		return false;
	}
	if (search.byteLength === 0) {
		return true;
	}
	const pos = startPos == null ? 0 : startPos < 0 ? value.byteLength + startPos : startPos;
	if (pos > value.byteLength - search.byteLength) {
		return false;
	}
	const dvv = new DataView(value);
	const dvs = new DataView(search);
	const searchLength = value.byteLength - search.byteLength;
	const fastSearchLength = search.byteLength - search.byteLength % 4;
	for (let i = pos; i <= searchLength; ++i) {
		let matched = true;
		let ii = 0;
		for (; ii < fastSearchLength; ii += 4) {
			if (dvv.getUint32(i + ii) !== dvs.getUint32(ii)) {
				matched = false;
				break;
			}
		}
		for (; matched && ii < search.byteLength; ++ii) {
			if (dvv.getUint8(i + ii) !== dvs.getUint8(ii)) {
				matched = false;
				break;
			}
		}
		if (matched) {
			return true;
		}
	}
	return false;
};

export const concatBuffers = (value1: ArrayBuffer, value2: ArrayBuffer)=> {
	const bytes = new Uint8Array(value1.byteLength + value2.byteLength);
	bytes.set(new Uint8Array(value1), 0);
	bytes.set(new Uint8Array(value2), value1.byteLength);
	return bytes.buffer;
};

export const formatBuffer = (value: ArrayBuffer, formatting: BufferFormatting = "hex")=> {
	if (formatting === "base64") {
		let binary = "";
		const bytes = new Uint8Array(value);
		const chunkSize = 0x4000;
		for (let i = 0; i < bytes.length; i += chunkSize) {
			const chunk = bytes.subarray(i, i + chunkSize);
			binary += String.fromCharCode(...chunk);
		}
		return btoa(binary);
	}
	else if (formatting === "hex") {
		const bytes = new Uint8Array(value);
		let str = "";
		for (let i = 0; i < bytes.byteLength; ++i) {
			str += bytes[i].toString(16).padStart(2, "0");
		}
		return str;
	}
	throw new Error(`${formatting} formatting not supported`);
};

export const parseBuffer = (value?: string)=> {
	if (value == null) {
		return undefined;
	}
	const bytes = new Uint8Array(Math.ceil(value.length / 2));
	for (let i = 0, c = 0; c < value.length; ++i) {
		bytes[i] = parseBoundedInteger(value.slice(c, c += 2), 16, 0, 0xff);
	}
	return bytes.buffer;
};

export const funcByte = new Constant(
	(value: ArrayBuffer, pos: bigint)=>
		value == null
			? undefined
			: value.slice(Number(pos), Number(pos) + 1),
	Type.functionType(Type.OptionalBuffer, [Type.Buffer, Type.Integer]),
);

const funcRandomBuffer = new Constant(
	(value: bigint)=>
		value == null || value <= 0n ? new Uint8Array(0).buffer : crypto.getRandomValues(new Uint8Array(Number(value))).buffer,
	Type.functionType(Type.Buffer, [Type.Integer]),
	false,
);

const funcParseBuffer = new Constant(
	(value: string | undefined)=>
		parseBuffer(value),
	Type.functionType(Type.OptionalBuffer, [Type.OptionalString]),
);

export const constBuffer = {
	Random: funcRandomBuffer,
	Parse: funcParseBuffer,
};
