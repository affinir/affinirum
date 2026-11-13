import { Constant } from "../Constant.js";
import { Type } from "../Type.js";
import { createInteger } from "./Integer.js";

export type StringEncoding = "utf8" | "sbcs" | "ucs2" | "ucs2le";

export const isAlphanumericSymbol = (c: string) => c >= "a" && c <= "z" || c >= "0" && c <= "9";
export const isTokenStartSymbol = (c: string) =>  c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c === "_" || c === "#" || c === "$";
export const isTokenSymbol = (c: string) => isTokenStartSymbol(c) || c >= "0" && c <= "9";
export const isHexadecimalSymbol = (c: string) => c >= "0" && c <= "9" || c >= "a" && c <= "f" || c >= "A" && c <= "F";

export const formatLiteralString = (value: string) => {
	let str = "\"";
	for (let i = 0; i < value.length; ++i) {
		const c = value.charAt(i);
		if (c === "\r") {
			str += "\\r";
		}
		else if (c === "\n") {
			str += "\\n";
		}
		else if (c === "\t") {
			str += "\\t";
		}
		else if (c === "\\" || c === "\"") {
			str += `\\${c}`;
		}
		else {
			str += c;
		}
	}
	return str + "\"";
};

export const parseLiteralString = (value: string, offset = 0) => {
	const q = value.charAt(offset);
	for (let i = offset + 1, str = ""; i < value.length; ++i) {
		const c = value.charAt(i);
		if (c === q) {
			return [str, i + 1] as const;
		}
		if (c === "\\") {
			if (++i === value.length) {
				break;
			}
			const nc = value.charAt(i);
			if (nc === "r") {
				str += "\r";
			}
			else if (nc === "n") {
				str += "\n";
			}
			else if (nc === "t") {
				str += "\t";
			}
			else {
				str += nc;
			}
		}
		else {
			str += c;
		}
	}
	throw new Error(`missing closing string quotation mark ${q}`);
};

export const replaceWith = (value?: string, replacement?: string, ...search: string[]) => {
	if (value == null) {
		return undefined;
	}
	let str = value;
	for (const s of search) {
		str = str.split(s).join(replacement ?? "");
	}
	return str;
};

export const equateStrings = (value1?: string, value2?: string, ignoreCaseSpaceEtc?: boolean) => {
	if (value1 == null && value2 == null) {
		return true;
	}
	if (value1 == null || value2 == null) {
		return false;
	}
	if (value1 === value2) {
		return true;
	}
	if (!ignoreCaseSpaceEtc) {
		return false;
	}
	for (let i1 = 0, i2 = 0; i1 < value1.length || i2 < value2.length;) {
		let code1 = 0, code2 = 0;
		while (i1 < value1.length && !code1) {
			code1 = alphanumericCode(value1, i1++);
		}
		while (i2 < value2.length && !code2) {
			code2 = alphanumericCode(value2, i2++);
		}
		if (code1 !== code2) {
			return false;
		}
	}
	return true;
};

const alphanumericCode = (value: string, index: number) => {
	let code = value.charCodeAt(index);
	if (code > 0x7f) {
		// Preserve Unicode lowercase mappings to ASCII, such as İ and K.
		code = value.charAt(index).toLowerCase().charCodeAt(0);
	}
	code |= 0x20;
	return code >= 0x61 && code <= 0x7a || code >= 0x30 && code <= 0x39 ? code : 0;
};

const createSearchPrefixes = (pattern: number[]) => {
	const prefixes = new Uint32Array(pattern.length);
	for (let i = 1, matched = 0; i < pattern.length; ++i) {
		while (matched > 0 && pattern[i] !== pattern[matched]) {
			matched = prefixes[matched - 1];
		}
		if (pattern[i] === pattern[matched]) {
			++matched;
		}
		prefixes[i] = matched;
	}
	return prefixes;
};

export const containsString = (value?: string, search?: string, startPos?: number, ignoreCaseSpaceEtc?: boolean) => {
	if (value == null) {
		return false;
	}
	if (search == null) {
		return true;
	}
	if (!ignoreCaseSpaceEtc) {
		return value.includes(search, startPos);
	}
	const pattern: number[] = [];
	for (let i = 0; i < search.length; ++i) {
		const code = alphanumericCode(search, i);
		if (code) {
			pattern.push(code);
		}
	}
	if (pattern.length === 0) {
		return true;
	}
	const pos = startPos == null ? 0 : startPos < 0 ? value.length + startPos : startPos;
	const start = Math.max(0, Math.trunc(pos) || 0);
	if (pattern.length > value.length - start) {
		return false;
	}
	// Build KMP fallback lengths only when a partial match first fails.
	let prefixes: Uint32Array | undefined;
	const first = pattern[0];
	for (let i = start, matched = 0; i < value.length; ++i) {
		if (matched === 0) {
			while (i < value.length) {
				const code = value.charCodeAt(i) | 0x20;
				if (code === first || code > 0x7f && alphanumericCode(value, i) === first) {
					break;
				}
				++i;
			}
			if (i === value.length) {
				return false;
			}
			if (pattern.length === 1) {
				return true;
			}
			matched = 1;
			continue;
		}
		let code = value.charCodeAt(i) | 0x20;
		if (code > 0x7f) {
			code = alphanumericCode(value, i);
		}
		if (code === pattern[matched]) {
			if (++matched === pattern.length) {
				return true;
			}
		}
		else if (matched > 0 && (code >= 0x61 && code <= 0x7a || code >= 0x30 && code <= 0x39)) {
			prefixes ??= createSearchPrefixes(pattern);
			do {
				matched = prefixes[matched - 1];
			} while (matched > 0 && code !== pattern[matched]);
			if (code === pattern[matched]) {
				++matched;
			}
		}
	}
	return false;
};

export const startsWithString = (value?: string, search?: string, startPos?: number, ignoreCaseSpaceEtc?: boolean) => {
	if (value == null) {
		return false;
	}
	if (search == null) {
		return true;
	}
	if (!ignoreCaseSpaceEtc) {
		return value.startsWith(search, startPos);
	}
	const pos = startPos == null ? 0 : startPos < 0 ? value.length + startPos : startPos;
	let valueIndex = Math.max(0, Math.trunc(pos) || 0);
	for (let i = 0; i < search.length; ++i) {
		const searchCode = alphanumericCode(search, i);
		if (!searchCode) {
			continue;
		}
		let valueCode = 0;
		while (valueIndex < value.length && !valueCode) {
			valueCode = alphanumericCode(value, valueIndex++);
		}
		if (valueCode !== searchCode) {
			return false;
		}
	}
	return true;
};

export const endsWithString = (value?: string, search?: string, endPos?: number, ignoreCaseSpaceEtc?: boolean) => {
	if (value == null) {
		return false;
	}
	if (search == null) {
		return true;
	}
	if (!ignoreCaseSpaceEtc) {
		return value.endsWith(search, endPos);
	}
	const pos = endPos == null ? value.length : endPos < 0 ? value.length + endPos : endPos;
	let valueIndex = Math.min(value.length, Math.max(0, Math.trunc(pos) || 0)) - 1;
	for (let i = search.length - 1; i >= 0; --i) {
		const searchCode = alphanumericCode(search, i);
		if (!searchCode) {
			continue;
		}
		let valueCode = 0;
		while (valueIndex >= 0 && !valueCode) {
			valueCode = alphanumericCode(value, valueIndex--);
		}
		if (valueCode !== searchCode) {
			return false;
		}
	}
	return true;
};

export const encodeString = (value: string, encoding: StringEncoding = "utf8") => {
	switch (encoding) {
		case "utf8": return new TextEncoder().encode(value).buffer;
		case "sbcs": break;
		case "ucs2": break;
		case "ucs2le": break;
		default: throw new Error(`${encoding} encoding not supported`);
	}
	if (encoding === "sbcs") {
		const dv = new Uint8Array(value.length);
		for (let i = 0; i < value.length; ++i) {
			dv[i] = value.charCodeAt(i);
		}
		return dv.buffer;
	}
	const dv = new DataView(new Uint16Array(value.length).buffer);
	const littleEndian = encoding.endsWith("le");
	for (let i = 0; i < value.length; ++i) {
		dv.setUint16(i << 1, value.charCodeAt(i), littleEndian);
	}
	return dv.buffer;
};

const decodeString = (value?: ArrayBuffer, encoding: StringEncoding = "utf8", byteOffset?: number, byteLength?: number) => {
	if (
		value == null ||
		byteOffset != null && byteOffset < 0 ||
		byteLength != null && byteLength < 0 ||
		value.byteLength < (byteOffset ?? 0) + (byteLength ?? 0)
	) {
		return undefined;
	}
	switch (encoding) {
		case "utf8": return new TextDecoder().decode(new DataView(value, byteOffset, byteLength));
		case "sbcs": break;
		case "ucs2": break;
		case "ucs2le": break;
		default: throw new Error(`${encoding} encoding not supported`);
	}
	const dv = new DataView(value, byteOffset, byteLength);
	if (encoding === "sbcs") {
		let str = "";
		for (let i = 0; i < dv.byteLength; ++i) {
			str += String.fromCharCode(dv.getUint8(i));
		}
		return str;
	}
	const littleEndian = encoding.endsWith("le");
	let str = "";
	for (let i = 0; i < dv.byteLength; i += 2) {
		if (dv.byteLength > i + 1) {
			str += String.fromCharCode(dv.getUint16(i, littleEndian));
		}
	}
	return str;
};

const typeStringEquator = Type.functionType([[Type.Boolean, [Type.String, Type.String]]]);
const typeStringComparator = Type.functionType([[Type.Boolean, [Type.String, Type.String, Type.OptionalInteger, Type.OptionalBoolean]]]);
const typeStringMutator = Type.functionType([[Type.String, [Type.String]]]);
const typeStringOrArray = Type.union(Type.String, Type.arrayType([Type.String]));

export const funcLike = new Constant(
	(value1: string, value2: string) =>
		equateStrings(value1, value2, true),
	typeStringEquator,
);

export const funcUnlike = new Constant(
	(value1: string, value2: string) =>
		!equateStrings(value1, value2, true),
	typeStringEquator,
);

export const funcStartsWith = new Constant(
	(value: string, search: string, start?: bigint, ignoreCaseSpaceEtc?: boolean) =>
		startsWithString(value, search, start == null ? undefined : Number(start), ignoreCaseSpaceEtc),
	typeStringComparator,
);

export const funcEndsWith = new Constant(
	(value: string, search: string, end?: bigint, ignoreCaseSpaceEtc?: boolean) =>
		endsWithString(value, search, end == null ? undefined : Number(end), ignoreCaseSpaceEtc),
	typeStringComparator,
);

export const funcChar = new Constant(
	(value: string, pos: bigint) =>
		value == null
			? undefined
			: value.charAt(pos < 0 ? value.length + Number(pos) : Number(pos)),
	Type.functionType([[Type.OptionalString, [Type.String, Type.Integer]]]),
);

export const funcCharCode = new Constant(
	(value: string, pos: bigint) =>
		value == null
			? undefined
			: createInteger(value.charCodeAt(pos < 0 ? value.length + Number(pos) : Number(pos))),
	Type.functionType([[Type.OptionalInteger, [Type.String, Type.Integer]]]),
);

export const funcTrim = new Constant(
	(value: string) =>
		value?.trim(),
	typeStringMutator,
);

export const funcTrimStart = new Constant(
	(value: string) =>
		value?.trimStart(),
	typeStringMutator,
);

export const funcTrimEnd = new Constant(
	(value: string) =>
		value?.trimEnd(),
	typeStringMutator,
);

export const funcLowerCase = new Constant(
	(value: string) =>
		value?.toLowerCase(),
	typeStringMutator,
);

export const funcUpperCase = new Constant(
	(value: string) =>
		value?.toUpperCase(),
	typeStringMutator,
);

export const funcSplit = new Constant(
	(value: string, separator: string = " ") =>
		value?.split(separator) ?? [],
	Type.functionType([[Type.arrayType([Type.String]), [Type.String, Type.OptionalString]]]),
);

export const funcReplaceWith = new Constant(
	(value: string, replacement: string, ...search: (string | string[])[]) =>
		replaceWith(value, replacement, ...search.flat()),
	Type.functionType([[Type.String, [Type.String, Type.String, Type.arrayType([typeStringOrArray])], true]]),
);

const funcAlphanum = new Constant(
	(value: string) => {
		if (!value) {
			return undefined;
		}
		const str = value.toLowerCase();
		let result = "";
		for (let i = 0; i < str.length; ++i) {
			if (isAlphanumericSymbol(str[i])) {
				result += value[i];
			}
		}
		return result;
	},
	typeStringMutator,
);

const funcRandomString = new Constant(
	(value: bigint) => {
		let str = "";
		const length = Number(value ?? 0);
		while (str.length < length) {
			str += Math.random().toString(36).slice(2);
		}
		return str.slice(0, length);
	},
	Type.functionType([[Type.String, [Type.Integer]]], true),
);

const funcDecodeString = new Constant(
	(value: ArrayBuffer | undefined, encoding: StringEncoding = "utf8", byteOffset?: bigint, byteLength?: bigint) =>
		decodeString(value, encoding, byteOffset == null ? undefined : Number(byteOffset), byteLength == null ? undefined : Number(byteLength)),
	Type.functionType([[Type.OptionalString, [Type.OptionalBuffer, Type.OptionalString, Type.OptionalInteger, Type.OptionalInteger]]]),
);

export const constString = Object.assign(Object.create(null), {
	Alphanum: funcAlphanum,
	Random: funcRandomString,
	Decode: funcDecodeString,
});
