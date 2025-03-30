import { FunctionDefinition } from '../FunctionDefinition.js';
import { Value, typeUnknown, typeNumber, typeBuffer, typeString, typeArray,
	typeOptionalBoolean, typeOptionalNumber, typeOptionalBuffer, typeOptionalString, typeNumberOrString, typeJson } from '../Type.js';

export const funcToUniversalTime = new FunctionDefinition(
	(value: number | string)=> {
		const v = parseDate(value);
		return v ? [v.getUTCFullYear(), v.getUTCMonth() + 1, v.getUTCDate(),
			v.getUTCHours(), v.getUTCMinutes(), v.getUTCSeconds(), v.getUTCMilliseconds()] : undefined;
	},
	typeArray, [typeNumberOrString],
);

export const funcFromUniversalTime = new FunctionDefinition(
	(value: number[])=>
		Date.UTC(value[0] ?? 1970, (value[1] ?? 1) - 1, value[2] ?? 1, value[3] ?? 0, value[4] ?? 0, value[5] ?? 0, value[6] ?? 0),
	typeNumber, [typeArray],
);

export const funcToLocalTime = new FunctionDefinition(
	(value: number | string)=> {
		const v = parseDate(value);
		return v ? [v.getFullYear(), v.getMonth() + 1, v.getDate(),
			v.getHours(), v.getMinutes(), v.getSeconds(), v.getMilliseconds()] : undefined;
	},
	typeArray, [typeNumberOrString],
);

export const funcFromLocalTime = new FunctionDefinition(
	(value: number[])=>
		new Date(value[0] ?? 1970, (value[1] ?? 1) - 1, value[2] ?? 1, value[3] ?? 0, value[4] ?? 0, value[5] ?? 0, value[6] ?? 0).getTime(),
	typeNumber, [typeArray],
);

export const funcToUniversalTimeMonthIndex = new FunctionDefinition(
	(value: number | string)=> parseDate(value)?.getUTCMonth(),
	typeNumber, [typeNumberOrString],
);

export const funcToLocalTimeMonthIndex = new FunctionDefinition(
	(value: number | string)=> parseDate(value)?.getMonth(),
	typeNumber, [typeNumberOrString],
);

export const funcToUniversalTimeWeekdayIndex = new FunctionDefinition(
	(value: number | string)=> parseDate(value)?.getUTCDay(),
	typeNumber, [typeNumberOrString],
);

export const funcToLocalTimeWeekdayIndex = new FunctionDefinition(
	(value: number | string)=> parseDate(value)?.getDay(),
	typeNumber, [typeNumberOrString],
);

export const funcToTimeString = new FunctionDefinition(
	(value: number | string)=> parseDate(value)?.toISOString(),
	typeString, [typeNumberOrString],
);

export const funcFromTimeString = new FunctionDefinition(
	(value: string)=> parseDate(value)?.getTime(),
	typeNumber, [typeString],
);

export const funcToNumberBuffer = new FunctionDefinition(
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
	typeBuffer, [typeNumber, typeString],
);

export const funcFromNumberBuffer = new FunctionDefinition(
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
	typeNumber, [typeBuffer, typeString, typeOptionalNumber], 2, 3,
);

export const funcToStringBuffer = new FunctionDefinition(
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
	typeBuffer, [typeString, typeOptionalString], 1, 2,
);

export const funcFromStringBuffer = new FunctionDefinition(
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
	typeString, [typeBuffer, typeOptionalString, typeOptionalNumber, typeOptionalNumber], 1, 4,
);

export const funcToBooleanString = new FunctionDefinition(
	(value: boolean | undefined)=>
		value?.toString(),
	typeOptionalString, [typeOptionalBoolean],
);

export const funcFromBooleanString = new FunctionDefinition(
	(value: string | undefined)=>
		value ? value.toLowerCase() === 'true' : undefined,
	typeOptionalBoolean, [typeOptionalString],
);

export const funcToNumberString = new FunctionDefinition(
	(value: number | undefined, radix?: number)=>
		value?.toString(radix),
	typeOptionalString, [typeOptionalNumber], 1, 2,
);

export const funcFromNumberString = new FunctionDefinition(
	(value: string | undefined)=>
		value ? Number.parseFloat(value) : undefined,
	typeOptionalNumber, [typeOptionalString],
);

export const funcToBufferString = new FunctionDefinition(
	(value: ArrayBuffer | undefined)=>
		stringifyBuffer(value),
	typeOptionalString, [typeOptionalBuffer],
);

export const funcFromBufferString = new FunctionDefinition(
	(value: string)=>
		parseBuffer(value),
	typeOptionalBuffer, [typeOptionalString],
);

export const funcToJsonString = new FunctionDefinition(
	(value: undefined | boolean | number | string | [] | { [ key: string ]: Value }, whitespace?: string)=>
		value ? JSON.stringify(value, undefined, whitespace) : undefined,
	typeOptionalString, [typeJson, typeOptionalString], 1, 2,
)

export const funcFromJsonString = new FunctionDefinition(
	(value: undefined | string)=>
		value ? JSON.parse(value) as Value : undefined,
	typeJson, [typeOptionalString],
)

export const funcToText = new FunctionDefinition(
	(value: Value, whitespace?: string)=> textifyValue(value, whitespace),
	typeString, [typeUnknown], 1, 2,
);

export function parseDate(value?: number | string) {
	if (value == null) {
		return undefined;
	}
	const date = new Date(value);
	return isNaN(date.getTime()) ? undefined : date;
}

export function parseBuffer(value?: string) {
	if (value == null) {
		return undefined;
	}
	const bytes = new Uint8Array(Math.ceil(value.length / 2));
	for (let i = 0, c = 0; c < value.length; ++i) {
		bytes[i] = Number.parseInt(value.slice(c, c += 2), 16);
	}
	return bytes.buffer;
}

export function stringifyBuffer(value?: ArrayBuffer) {
	if (value == null) {
		return undefined;
	}
	const bytes = new Uint8Array(value);
	let str = '';
	for (let i = 0; i < bytes.byteLength; ++i) {
		str += bytes[i].toString(16).padStart(2, '0');
	}
	return str;
}

export function textifyValue(value: Value, whitespace?: string): string {
	const str = value == null
		? 'null'
		: typeof value === 'boolean'
			? value.toString()
			: typeof value === 'number'
				? value.toString()
				: value instanceof ArrayBuffer
					? `#${stringifyBuffer(value)}#`
					: typeof value === 'string'
						? `"${value}"`
						: undefined;
	if (str != null) {
		return str;
	}
	const prefix = whitespace ? '\n' + whitespace : '';
	const suffix = whitespace ? '\n' : '';
	if (Array.isArray(value)) {
		const lines = (value as []).map((i)=> `${prefix}${textifyValue(i, whitespace).split('\n').join(prefix)}`);
		return `[${lines.join(',')}${suffix}]`;
	}
	if (typeof value === 'object') {
		const separator = whitespace ? ' ' : '';
		const lines = Object.entries(value).map(([k,v])=> `${prefix}"${k}":${separator}${textifyValue(v, whitespace).split('\n').join(prefix)}`);
		return `[${lines.join(',')}${suffix}]`;
	}
	return 'function';
}
