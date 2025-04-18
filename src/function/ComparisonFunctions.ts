import { equal } from '../base/Unknown.js';
import { equalStrings, containsString, startsWithString, endsWithString } from '../base/String.js';
import { FunctionType, FUNCTION_ARG_MAX } from '../FunctionType.js';
import { Constant } from '../Constant.js';
import { Value, typeUnknown, typeBoolean, typeNumber, typeString, typeOptionalBoolean, typeOptionalNumber } from '../ValueType.js';

export const funcGreaterThan = new Constant(
	(value1: number, value2: number)=>
		value1 > value2,
	new FunctionType(typeBoolean, [typeNumber, typeNumber]),
);

export const funcLessThan = new Constant(
	(value1: number, value2: number)=>
		value1 < value2,
	new FunctionType(typeBoolean, [typeNumber, typeNumber]),
);

export const funcGreaterOrEqual = new Constant(
	(value1: number, value2: number)=>
		value1 >= value2,
	new FunctionType(typeBoolean, [typeNumber, typeNumber]),
);

export const funcLessOrEqual = new Constant(
	(value1: number, value2: number)=>
		value1 <= value2,
	new FunctionType(typeBoolean, [typeNumber, typeNumber]),
);

export const funcEqual = new Constant(
	(value1: Value, value2: Value)=>
		equal(value1, value2),
	new FunctionType(typeBoolean, [typeUnknown, typeUnknown]),
);

export const funcNotEqual = new Constant(
	(value1: Value, value2: Value)=>
		!equal(value1, value2),
	new FunctionType(typeBoolean, [typeUnknown, typeUnknown]),
);

export const funcLike = new Constant(
	(value1: string, value2: string)=>
		equalStrings(value1, value2, true),
	new FunctionType(typeBoolean, [typeString, typeString]),
);

export const funcUnlike = new Constant(
	(value1: string, value2: string)=>
		!equalStrings(value1, value2, true),
	new FunctionType(typeBoolean, [typeString, typeString]),
);

export const funcContains = new Constant(
	(value: string, search: string, start?: number, ignoreCaseSpaceEtc?: boolean)=>
		containsString(value, search, start, ignoreCaseSpaceEtc),
	new FunctionType(typeBoolean, [typeString, typeString, typeOptionalNumber, typeOptionalBoolean], 2, 4),
);

export const funcStartsWith = new Constant(
	(value: string, search: string, start?: number, ignoreCaseSpaceEtc?: boolean)=>
		startsWithString(value, search, start, ignoreCaseSpaceEtc),
	new FunctionType(typeBoolean, [typeString, typeString, typeOptionalNumber, typeOptionalBoolean], 2, 4),
);

export const funcEndsWith = new Constant(
	(value: string, search: string, end?: number, ignoreCaseSpaceEtc?: boolean)=>
		endsWithString(value, search, end, ignoreCaseSpaceEtc),
	new FunctionType(typeBoolean, [typeString, typeString, typeOptionalNumber, typeOptionalBoolean], 2, 4),
);
