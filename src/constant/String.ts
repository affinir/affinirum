import { Constant } from '../Constant.js';
import { Type } from '../Type.js';

export const isSign = (c: string)=> c === '+' || c === '-';
export const isAlpha = (c: string)=>  c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c === '_' ;
export const isNumeric = (c: string)=>  c >= '0' && c <= '9' ;
export const isAlphanumeric = (c: string)=> isAlpha(c) || isNumeric(c);
export const isDateSymbol = (c: string)=> isNumeric(c) || c === '-';
export const isTimeSymbol = (c: string)=> isNumeric(c) || c === ':';
export const isDateTimeSeparator = (c: string)=> c === 'T' || c === ' ' || c === '@';
export const isHexadecimal = (c: string)=> isNumeric(c) || c >= 'a' && c <= 'f' || c >= 'A' && c <= 'F';
export const isQuotation = (c: string)=>  c === '\'' || c === '"' || c === '`' ;
export const isCaseSpaceEtc = (c: string)=> (c < 'a' || c > 'z') && (c < '0' || c > '9');

export const equateStrings = (value1: string, value2: string, ignoreCaseSpaceEtc?: boolean)=> {
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

export const encodeString = (value: string, encoding: 'utf8' | 'ucs2' | 'ucs2le' = 'utf8')=> {
	if (value == null) {
		return new Uint8Array(0).buffer;
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
};

const decodeString = (value: ArrayBuffer, encoding: 'utf8' | 'ucs2' | 'ucs2le' = 'utf8', byteOffset?: bigint, byteLength?: bigint)=> {
	if (value == null) {
		return undefined;
	}
	const offset = byteOffset == null ? undefined : Number(byteOffset);
	const length = byteLength == null ? undefined : Number(byteLength);
	if (encoding === 'utf8') {
		return new TextDecoder().decode(new DataView(value, offset, length));
	}
	else {
		const dv = new DataView(value, offset, length);
		const lessOrEqual = encoding.endsWith('le');
		let str = '';
		for (let i = 0; i < dv.byteLength; i += 2) {
			str += String.fromCharCode(dv.getUint16(i, lessOrEqual));
		}
		return str;
	}
};

const typeStringEquator = Type.functionType(Type.Boolean, [Type.String, Type.String]);
const typeStringComparator = Type.functionType(Type.Boolean, [Type.String, Type.String, Type.OptionalInteger, Type.OptionalBoolean]);
const typeStringMutator = Type.functionType(Type.String, [Type.String]);

export const funcLike = new Constant(
	(value1: string, value2: string)=>
		equateStrings(value1, value2, true),
	typeStringEquator,
);

export const funcUnlike = new Constant(
	(value1: string, value2: string)=>
		!equateStrings(value1, value2, true),
	typeStringEquator,
);

export const funcContains = new Constant(
	(value: string, search: string, start?: bigint, ignoreCaseSpaceEtc?: boolean)=>
		containsString(value, search, start == null ? undefined : Number(start), ignoreCaseSpaceEtc),
	typeStringComparator,
);

export const funcStartsWith = new Constant(
	(value: string, search: string, start?: bigint, ignoreCaseSpaceEtc?: boolean)=>
		startsWithString(value, search, start == null ? undefined : Number(start), ignoreCaseSpaceEtc),
	typeStringComparator,
);

export const funcEndsWith = new Constant(
	(value: string, search: string, end?: bigint, ignoreCaseSpaceEtc?: boolean)=>
		endsWithString(value, search, end == null ? undefined : Number(end), ignoreCaseSpaceEtc),
	typeStringComparator,
);

export const funcChar = new Constant(
	(value: string, pos: bigint)=>
		value == null
			? undefined
			: value.charAt(pos < 0 ? value.length + Number(pos) : Number(pos)),
	Type.functionType(Type.OptionalString, [Type.String, Type.Integer]),
);

export const funcCharCode = new Constant(
	(value: string, pos: bigint)=>
		value == null
			? undefined
			: value.charCodeAt(pos < 0 ? value.length + Number(pos) : Number(pos)),
	Type.functionType(Type.OptionalInteger, [Type.String, Type.Float]),
);

export const funcAlphanum = new Constant(
	(value: string)=> {
		const lowerCase = value.toLowerCase();
		let result = '';
		for (let i = 0; i < lowerCase.length; ++i) {
			if (!isCaseSpaceEtc(value[i])) {
				result += value[i];
			}
		}
		return result;
	},
	typeStringMutator,
);

export const funcTrim = new Constant(
	(value: string)=>
		value.trim(),
	typeStringMutator,
);

export const funcTrimStart = new Constant(
	(value: string)=>
		value.trimStart(),
	typeStringMutator,
);

export const funcTrimEnd = new Constant(
	(value: string)=>
		value.trimEnd(),
	typeStringMutator,
);

export const funcLowerCase = new Constant(
	(value: string)=>
		value.toLowerCase(),
	typeStringMutator,
);

export const funcUpperCase = new Constant(
	(value: string)=>
		value.toUpperCase(),
	typeStringMutator,
);

export const funcSplit = new Constant(
	(value: string, separator: string = ' ')=>
		value.split(separator),
	Type.functionType(Type.arrayType([Type.String]), [Type.String, Type.OptionalString]),
);

const funcRandomString = new Constant(
	(value: bigint)=> {
		let str = '';
		while (str.length < value) {
			str += Math.random().toString(36).slice(2);
		}
		return str.slice(0, Number(value));
	},
	Type.functionType(Type.String, [Type.Integer]),
	false,
);

const funcDecodeString = new Constant(
	(value: ArrayBuffer, encoding: 'utf8' | 'ucs2' | 'ucs2le' = 'utf8', byteOffset?: bigint, byteLength?: bigint)=>
		decodeString(value, encoding, byteOffset, byteLength),
	Type.functionType(Type.OptionalString, [Type.Buffer, Type.OptionalString, Type.OptionalInteger, Type.OptionalInteger]),
);

export const constString = {
	Random: funcRandomString,
	Decode: funcDecodeString,
};
