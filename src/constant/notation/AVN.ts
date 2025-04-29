import { Constant } from '../../Constant.js';
import { Value } from '../../Value.js';
import { Type } from '../../Type.js';
import { formatBuffer } from '../Buffer.js';

export const notate = (value: Value, separator?: string, whitespace?: string): string=> {
	if (value == null) {
		return 'null';
	}
	if (typeof value === 'number') {
		return value.toString() + (Number.isInteger(value) ? '.0' : '');
	}
	if (typeof value === 'boolean') {
		return value.toString();
	}
	if (value instanceof Date) {
		return `@${value.toISOString()}`;
	}
	if (typeof value === 'bigint') {
		return value.toString();
	}
	if (value instanceof ArrayBuffer) {
		return `#${formatBuffer(value)}`;
	}
	if (typeof value === 'string') {
		return `"${value}"`;
	}
	if (Array.isArray(value)) {
		const [prefix, suffix] = whitespace ? ['\n' + whitespace, '\n'] : ['', ''];
		const lines = value.map((i)=> `${prefix}${notate(i, whitespace).split('\n').join(prefix)}`);
		return `[${lines.join(separator)}${suffix}]`;
	}
	if (typeof value === 'object') {
		const [prefix, suffix] = whitespace ? ['\n' + whitespace, '\n'] : ['', ''];
		const lines = Object.entries(value).map(([k, v])=> `${prefix}"${k}":${notate(v, whitespace).split('\n').join(prefix)}`);
		return `[${lines.join(separator)}${suffix}]`;
	}
	return 'function';
};

const funcFormatAVN = new Constant(
	(value: Value, whitespace?: string)=> notate(value, whitespace),
	Type.functionType(Type.String, [Type.Unknown, Type.OptionalString]),
);

export const constAVN = {
	Format: funcFormatAVN,
};
