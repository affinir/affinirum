import { ExpressionFunction, FUNCTION_ARG_MAX, isCaseSpaceEtc } from './ExpressionFunction.js';
import { Type, Value, typeBoolean, typeNumber, typeString, typeArray, typeFunction,
	typeOptionalBoolean, typeOptionalNumber, typeVariant } from './Type.js';

export const funcNot = new ExpressionFunction(
	(value: boolean)=>
		!value,
	typeBoolean, [ typeBoolean ],
);

export const funcAnd = new ExpressionFunction(
	(...values: (boolean | boolean[])[])=>
		values.flat(FUNCTION_ARG_MAX).every((v)=> v),
	typeBoolean, [ new Type('boolean', 'array') ], 2, FUNCTION_ARG_MAX,
);

export const funcOr = new ExpressionFunction(
	(...values: (boolean | boolean[])[])=>
		values.flat(FUNCTION_ARG_MAX).some((v)=> v),
	typeBoolean, [ new Type('boolean', 'array') ], 2, FUNCTION_ARG_MAX,
);

export const funcGt = new ExpressionFunction(
	(value1: number, value2: number)=>
		value1 > value2,
	typeBoolean, [ typeNumber, typeNumber ],
);

export const funcLt = new ExpressionFunction(
	(value1: number, value2: number)=>
		value1 < value2,
	typeBoolean, [ typeNumber, typeNumber ],
);

export const funcGe = new ExpressionFunction(
	(value1: number, value2: number)=>
		value1 >= value2,
	typeBoolean, [ typeNumber, typeNumber ],
);

export const funcLe = new ExpressionFunction(
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

export const funcNullco = new ExpressionFunction(
	(value: Value, valueOtherwise: Value)=>
		value ?? valueOtherwise,
	typeVariant, [ typeVariant, typeVariant ], undefined, undefined,
	(index, vtype, vmask)=> vtype === vmask
);

export const funcIfThenElse = new ExpressionFunction(
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

export const funcEvery = new ExpressionFunction(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value.every((v, i, a)=> predicate(v, i, a)),
	typeBoolean, [ typeArray, typeFunction ],
);

export const funcAny = new ExpressionFunction(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value.some((v, i, a)=> predicate(v, i, a)),
	typeBoolean, [ typeArray, typeFunction ],
);

export const equal = (value1: Value, value2: Value)=> {
	if (value1 == null || value2 == null) {
		return value1 == value2;
	}
	if (typeof value1 === 'boolean' || typeof value1 === 'number' || typeof value1 === 'string' || typeof value1 === 'function') {
		return value1 === value2;
	}
	if ((value1 instanceof ArrayBuffer || value1 instanceof SharedArrayBuffer) && (value2 instanceof ArrayBuffer || value2 instanceof SharedArrayBuffer)) {
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

export const equalBuffers = (value1: ArrayBufferLike, value2: ArrayBufferLike)=> {
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

export const equalStrings = (value1: string, value2: string, ignoreCaseSpaceEtc?: boolean)=> {
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
