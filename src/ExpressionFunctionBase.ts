import { ExpressionFunction } from './ExpressionFunction.js';
import { Value, typeBoolean, typeNumber, typeString, typeArray, typeOptionalBoolean, typeOptionalNumber, typeVariant } from './Type.js';

export const funcGreaterThan = new ExpressionFunction(
	(value1: number, value2: number)=>
		value1 > value2,
	typeBoolean, [ typeNumber, typeNumber ],
);

export const funcLessThan = new ExpressionFunction(
	(value1: number, value2: number)=>
		value1 < value2,
	typeBoolean, [ typeNumber, typeNumber ],
);

export const funcGreaterOrEqual = new ExpressionFunction(
	(value1: number, value2: number)=>
		value1 >= value2,
	typeBoolean, [ typeNumber, typeNumber ],
);

export const funcLessOrEqual = new ExpressionFunction(
	(value1: number, value2: number)=>
		value1 <= value2,
	typeBoolean, [ typeNumber, typeNumber ],
);
export const funcEqual = new ExpressionFunction(
	(value1: Value, value2: Value)=>
		equal(value1, value2),
	typeBoolean, [ typeVariant, typeVariant ],
);

export const funcNotEqual = new ExpressionFunction(
	(value1: Value, value2: Value)=>
		!equal(value1, value2),
	typeBoolean, [ typeVariant, typeVariant ],
);

export const funcLike = new ExpressionFunction(
	(value1: string, value2: string)=>
		equalStrings(value1, value2, true),
	typeBoolean, [ typeString, typeString ],
);

export const funcNotLike = new ExpressionFunction(
	(value1: string, value2: string)=>
		!equalStrings(value1, value2, true),
	typeBoolean, [ typeString, typeString ],
);

export const funcCoalesce = new ExpressionFunction(
	(value: Value, valueOtherwise: Value)=>
		value ?? valueOtherwise,
	typeVariant, [ typeVariant, typeVariant ], undefined, undefined,
	(index, vtype, vmask)=> vtype === vmask
);

export const funcSwitch = new ExpressionFunction(
	(condition: boolean, value1: Value, value2: Value)=>
		condition ? value1 : value2,
	typeVariant, [ typeBoolean, typeVariant, typeVariant ], undefined, undefined,
	(index, vtype, vmask)=> index === 0 || vtype === vmask
);

export const funcContains = new ExpressionFunction(
	(value: string, search: string, start?: number, ignoreCaseSpaceEtc?: boolean)=>
		containsString(value, search, start, ignoreCaseSpaceEtc),
	typeBoolean, [ typeString, typeString, typeOptionalNumber, typeOptionalBoolean ], 2, 4,
);

export const funcStartsWith = new ExpressionFunction(
	(value: string, search: string, start?: number, ignoreCaseSpaceEtc?: boolean)=>
		startsWithString(value, search, start, ignoreCaseSpaceEtc),
	typeBoolean, [ typeString, typeString, typeOptionalNumber, typeOptionalBoolean ], 2, 4,
);

export const funcEndsWith = new ExpressionFunction(
	(value: string, search: string, end?: number, ignoreCaseSpaceEtc?: boolean)=>
		endsWithString(value, search, end, ignoreCaseSpaceEtc),
	typeBoolean, [ typeString, typeString, typeOptionalNumber, typeOptionalBoolean ], 2, 4,
);

export const funcAlphanum = new ExpressionFunction(
	(value: string)=> {
		const lowerCase = value.toLowerCase();
		let result = '';
		for (let i = 0; i < lowerCase.length; ++i) {
			if (!isCaseSpaceEtc(value[ i ])) {
				result += value[ i ];
			}
		}
		return result;
	},
	typeString, [ typeString ],
);

export const funcTrim = new ExpressionFunction(
	(value: string)=>
		value.trim(),
	typeString, [ typeString ],
);

export const funcTrimStart = new ExpressionFunction(
	(value: string)=>
		value.trimStart(),
	typeString, [ typeString ],
);

export const funcTrimEnd = new ExpressionFunction(
	(value: string)=>
		value.trimEnd(),
	typeString, [ typeString ],
);

export const funcLowerCase = new ExpressionFunction(
	(value: string)=>
		value.toLowerCase(),
	typeString, [ typeString ],
);

export const funcUpperCase = new ExpressionFunction(
	(value: string)=>
		value.toUpperCase(),
	typeString, [ typeString ],
);

export const funcUnique = new ExpressionFunction(
	(value: Value[])=> {
		const result: Value[] = [];
		value.forEach((i)=> {
			if (result.every((v)=> !equal(v, i))) {
				result.push(i);
			}
		});
		return result;
	},
	typeArray, [ typeArray ],
);

export const funcIntersection = new ExpressionFunction(
	(value1: Value[], value2: Value[])=>
		value1.filter((i)=> value2.some((v)=> equal(v, i))),
	typeArray, [ typeArray, typeArray ],
);

export const funcDifference = new ExpressionFunction(
	(value1: Value[], value2: Value[])=>
		[ ...value1.filter((i)=> value2.every((v)=> !equal(v, i))), ...value2.filter((i)=> value1.every((v)=> !equal(v, i))) ],
	typeArray, [ typeArray, typeArray ],
);

const equal = (value1: Value, value2: Value)=> {
	if (value1 == null || value2 == null) {
		return value1 == value2;
	}
	if (typeof value1 === 'boolean' || typeof value1 === 'number' || typeof value1 === 'string' || typeof value1 === 'function') {
		return value1 === value2;
	}
	if (value1 instanceof ArrayBuffer && value2 instanceof ArrayBuffer) {
		return equalBuffers(value1, value2);
	}
	if (Array.isArray(value1) && Array.isArray(value2)) {
		if (value1.length === value2.length) {
			for (let i = 0; i < value1.length; ++i) {
				if (!equal(value1[ i ], value2[ i ])) {
					return false;
				}
			}
			return true;
		}
		return false;
	}
	const props = new Set([ ...Object.getOwnPropertyNames(value1), ...Object.getOwnPropertyNames(value2) ]);
	for (const prop of props) {
		if (!equal((value1 as any)[ prop ] as Value, (value2 as any)[ prop ] as Value)) {
			return false;
		}
	}
	return true;
}

const equalBuffers = (value1: ArrayBuffer, value2: ArrayBuffer)=> {
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

const isCaseSpaceEtc = (c: string)=> (c < 'a' || c > 'z') && (c < '0' || c > '9');

const equalStrings = (value1: string, value2: string, ignoreCaseSpaceEtc?: boolean)=> {
	if (!ignoreCaseSpaceEtc) {
		return value1 === value2;
	}
	const str1 = value1.toLowerCase();
	const str2 = value2.toLowerCase();
	for (let i1 = 0, i2 = 0; i1 < str1.length && i2 < str2.length; ++i1, ++i2) {
		while (isCaseSpaceEtc(str1[ i1 ]) && i1 < str1.length) {
			++i1;
		}
		while (isCaseSpaceEtc(str2[ i2 ]) && i2 < str2.length) {
			++i2;
		}
		if (str1[ i1 ] != str2[ i2 ]) {
			return false;
		}
	}
	return true;
};

const containsString = (value: string, search: string, startPos?: number, ignoreCaseSpaceEtc?: boolean)=> {
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
		while (isCaseSpaceEtc(valueStr[ i1 ]) && i1 < valueStr.length) {
			++i1;
		}
		while (isCaseSpaceEtc(searchStr[ i2 ]) && i2 < searchStr.length) {
			++i2;
		}
		while (valueStr[ i1 ] != searchStr[ i2 ] && i1 < valueStr.length) {
			++i1;
		}
		if (valueStr[ i1 ] != searchStr[ i2 ] && i2 < searchStr.length) {
			return false;
		}
	}
	return true;
};

const startsWithString = (value: string, search: string, startPos?: number, ignoreCaseSpaceEtc?: boolean)=> {
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
		while (isCaseSpaceEtc(valueStr[ i1 ]) && i1 < valueStr.length) {
			++i1;
		}
		while (isCaseSpaceEtc(searchStr[ i2 ]) && i2 < searchStr.length) {
			++i2;
		}
		if (valueStr[ i1 ] != searchStr[ i2 ] && i2 < searchStr.length) {
			return false;
		}
	}
	return true;
};

const endsWithString = (value: string, search: string, endPos?: number, ignoreCaseSpaceEtc?: boolean)=> {
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
		while (isCaseSpaceEtc(valueStr[ i1 ]) && i1 > -1) {
			--i1;
		}
		while (isCaseSpaceEtc(searchStr[ i2 ]) && i2 > -1) {
			--i2;
		}
		if (valueStr[ i1 ] != searchStr[ i2 ] && i2 > -1) {
			return false;
		}
	}
	return true;
};
