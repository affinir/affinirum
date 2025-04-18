import { toBufferString } from './Buffer.js';
import { Value } from '../ValueType.js';

export const isSign = (c: string)=> c === '+' || c === '-';
export const isAlpha = (c: string)=>  c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c === '_' ;
export const isNumeric = (c: string)=>  c >= '0' && c <= '9' ;
export const isAlphanumeric = (c: string)=> isAlpha(c) || isNumeric(c);
export const isHexadecimal = (c: string)=> isNumeric(c) || c >= 'a' && c <= 'f' || c >= 'A' && c <= 'F';
export const isQuotation = (c: string)=>  c === '\'' || c === '"' || c === '`' ;
export const isCaseSpaceEtc = (c: string)=> (c < 'a' || c > 'z') && (c < '0' || c > '9');

export const equalStrings = (value1: string, value2: string, ignoreCaseSpaceEtc?: boolean)=> {
	if (!ignoreCaseSpaceEtc) {
		return value1 === value2;
	}
	const str1 = value1.toLowerCase();
	const str2 = value2.toLowerCase();
	for (let i1 = 0, i2 = 0; i1 < str1.length && i2 < str2.length; ++i1, ++i2) {
		while (isCaseSpaceEtc(str1[i1]) && i1 < str1.length) {
			++i1;
		}
		while (isCaseSpaceEtc(str2[i2]) && i2 < str2.length) {
			++i2;
		}
		if (str1[i1] != str2[i2]) {
			return false;
		}
	}
	return true;
};

export const containsString = (value: string, search: string, startPos?: number, ignoreCaseSpaceEtc?: boolean)=> {
	if (!ignoreCaseSpaceEtc) {
		return value.includes(search, startPos);
	}
	const valueStr = value.toLowerCase();
	const searchStr = search.toLowerCase();
	if (valueStr.length < searchStr.length) {
		return false;
	}
	const pos = startPos == null ? 0 : startPos < 0 ? value.length + startPos : startPos;
	for (let i1 = pos, i2 = 0; i1 < valueStr.length && i2 < searchStr.length; ++i1, ++i2) {
		while (isCaseSpaceEtc(valueStr[i1]) && i1 < valueStr.length) {
			++i1;
		}
		while (isCaseSpaceEtc(searchStr[i2]) && i2 < searchStr.length) {
			++i2;
		}
		while (valueStr[i1] != searchStr[i2] && i1 < valueStr.length) {
			++i1;
		}
		if (valueStr[i1] != searchStr[i2] && i2 < searchStr.length) {
			return false;
		}
	}
	return true;
};

export const startsWithString = (value: string, search: string, startPos?: number, ignoreCaseSpaceEtc?: boolean)=> {
	if (!ignoreCaseSpaceEtc) {
		return value.startsWith(search, startPos);
	}
	const valueStr = value.toLowerCase();
	const searchStr = search.toLowerCase();
	if (valueStr.length < searchStr.length) {
		return false;
	}
	const pos = startPos == null ? 0 : startPos < 0 ? value.length + startPos : startPos;
	for (let i1 = pos, i2 = 0; i1 < valueStr.length && i2 < searchStr.length; ++i1, ++i2) {
		while (isCaseSpaceEtc(valueStr[i1]) && i1 < valueStr.length) {
			++i1;
		}
		while (isCaseSpaceEtc(searchStr[i2]) && i2 < searchStr.length) {
			++i2;
		}
		if (valueStr[i1] != searchStr[i2] && i2 < searchStr.length) {
			return false;
		}
	}
	return true;
};

export const endsWithString = (value: string, search: string, endPos?: number, ignoreCaseSpaceEtc?: boolean)=> {
	if (!ignoreCaseSpaceEtc) {
		return value.endsWith(search, endPos);
	}
	const valueStr = value.toLowerCase();
	const searchStr = search.toLowerCase();
	if (valueStr.length < searchStr.length) {
		return false;
	}
	const pos = endPos == null ? valueStr.length : endPos < 0 ? value.length + endPos : endPos;
	for (let i1 = pos - 1, i2 = searchStr.length - 1; i1 > -1 && i2 > -1; --i1, --i2) {
		while (isCaseSpaceEtc(valueStr[i1]) && i1 > -1) {
			--i1;
		}
		while (isCaseSpaceEtc(searchStr[i2]) && i2 > -1) {
			--i2;
		}
		if (valueStr[i1] != searchStr[i2] && i2 > -1) {
			return false;
		}
	}
	return true;
};

export const notate = (value: Value, whitespace?: string): string=> {
	if (value == null) {
		return 'null';
	}
	if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'bigint') {
		return value.toString();
	}
	if (value instanceof ArrayBuffer) {
		return `#${toBufferString(value)}#`;
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
		const lines = Object.entries(value).map(([k,v])=> `${prefix}"${k}":${separator}${notate(v, whitespace).split('\n').join(prefix)}`);
		return `[${lines.join(',')}${suffix}]`;
	}
	return 'function';
};
