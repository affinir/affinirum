import { Constant } from '../Constant.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';
import { equate } from '../base/Unknown.js';
import { equateStrings, containsString, startsWithString, endsWithString } from '../base/String.js';

const typeComparator = Type.functionType(Type.Boolean, [Type.Number, Type.Number]);
const typeEquator = Type.functionType(Type.Boolean, [Type.Unknown, Type.Unknown]);
const typeStringEquator = Type.functionType(Type.Boolean, [Type.String, Type.String]);
const typeStringComparator = Type.functionType(Type.Boolean, [Type.String, Type.String, Type.OptionalNumber, Type.OptionalBoolean]);

export const funcCoalesce = new Constant(
	(value: Value, valueOtherwise: Value)=>
		value ?? valueOtherwise,
	Type.functionType(Type.Unknown, [Type.Unknown, Type.Unknown], { inference: 0 }),
);

export const funcGreaterThan = new Constant(
	(value1: number, value2: number)=>
		value1 > value2,
	typeComparator,
);

export const funcLessThan = new Constant(
	(value1: number, value2: number)=>
		value1 < value2,
	typeComparator,
);

export const funcGreaterOrEqual = new Constant(
	(value1: number, value2: number)=>
		value1 >= value2,
	typeComparator,
);

export const funcLessOrEqual = new Constant(
	(value1: number, value2: number)=>
		value1 <= value2,
	typeComparator,
);

export const funcEqual = new Constant(
	(value1: Value, value2: Value)=>
		equate(value1, value2),
	typeEquator,
);

export const funcNotEqual = new Constant(
	(value1: Value, value2: Value)=>
		!equate(value1, value2),
	typeEquator,
);

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
	(value: string, search: string, start?: number, ignoreCaseSpaceEtc?: boolean)=>
		containsString(value, search, start, ignoreCaseSpaceEtc),
	typeStringComparator,
);

export const funcStartsWith = new Constant(
	(value: string, search: string, start?: number, ignoreCaseSpaceEtc?: boolean)=>
		startsWithString(value, search, start, ignoreCaseSpaceEtc),
	typeStringComparator,
);

export const funcEndsWith = new Constant(
	(value: string, search: string, end?: number, ignoreCaseSpaceEtc?: boolean)=>
		endsWithString(value, search, end, ignoreCaseSpaceEtc),
	typeStringComparator,
);
