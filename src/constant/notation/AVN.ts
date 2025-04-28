import { Constant } from '../../Constant.js';
import { Value } from '../../Value.js';
import { Type } from '../../Type.js';
import { formatBuffer } from '../Buffer.js';

export const notate = (value: Value, whitespace?: string): string=> {
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
	const prefix = whitespace ? '\n' + whitespace : '';
	const suffix = whitespace ? '\n' : '';
	if (Array.isArray(value)) {
		const lines = (value as []).map((i)=> `${prefix}${notate(i, whitespace).split('\n').join(prefix)}`);
		return `[${lines.join(',')}${suffix}]`;
	}
	if (typeof value === 'object') {
		const separator = whitespace ? ' ' : '';
		const lines = Object.entries(value).map(([k, v])=> `${prefix}"${k}":${separator}${notate(v, whitespace).split('\n').join(prefix)}`);
		return `[${lines.join(',')}${suffix}]`;
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
