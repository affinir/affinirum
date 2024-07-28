import { Type, Value,
	typeBoolean, typeNumber, typeString, typeArray, typeObject, typeFunction,
	typeOptionalBoolean, typeOptionalNumber, typeVariant, typeVoid } from './Type.js';

const FUNCTION_ARG_MAX = 16536;

export class ExpressionFunction {

	constructor(
		protected _function: (...values: any[])=> Value,
		protected _type: Type,
		protected _argTypes: Type[],
		protected _minArity?: number,
		protected _maxArity?: number,
		protected _typeInference?: (index: number, type: string, mask: string)=> boolean
	) {}

	clone(): ExpressionFunction {
		return new ExpressionFunction(this._function, this._type, this._argTypes, this._minArity, this._maxArity, this._typeInference);
	}

	get evaluate(): (...values: any[])=> Value {
		return this._function;
	}

	get minArity(): number {
		return this._minArity ?? this._argTypes.length;
	}

	get maxArity(): number {
		return this._maxArity ?? this._argTypes.length;
	}

	get argTypes(): Type[] {
		return this._argTypes;
	}

	get type(): Type {
		return this._type;
	}

	typeInference(index: number): (type: string, mask: string)=> boolean {
		return (t: string, m: string)=> this._typeInference ? this._typeInference(index, t, m) : true;
	}

}

export const funcNot = new ExpressionFunction(
	(arg: boolean)=>
		!arg,
	typeBoolean, [ typeBoolean ],
);
export const funcAnd = new ExpressionFunction(
	(...args: (boolean | boolean[])[])=>
		args.flat().every((v)=> v),
	typeBoolean, [ new Type('boolean', 'array') ], 2, FUNCTION_ARG_MAX,
);
export const funcOr = new ExpressionFunction(
	(...args: (boolean | boolean[])[])=>
		args.flat().some((v)=> v),
	typeBoolean, [ new Type('boolean', 'array') ], 2, FUNCTION_ARG_MAX,
);
export const funcGt = new ExpressionFunction(
	(arg1: number, arg2: number)=>
		arg1 > arg2,
	typeBoolean, [ typeNumber, typeNumber ],
);
export const funcLt = new ExpressionFunction(
	(arg1: number, arg2: number)=>
		arg1 < arg2,
	typeBoolean, [ typeNumber, typeNumber ],
);
export const funcGe = new ExpressionFunction(
	(arg1: number, arg2: number)=>
		arg1 >= arg2,
	typeBoolean, [ typeNumber, typeNumber ],
);
export const funcLe = new ExpressionFunction(
	(arg1: number, arg2: number)=>
		arg1 <= arg2,
	typeBoolean, [ typeNumber, typeNumber ],
);
export const funcEqual = new ExpressionFunction(
	(arg1: Value, arg2: Value)=>
		equal(arg1, arg2),
	typeBoolean, [ typeVariant, typeVariant ],
);
export const funcNotEqual = new ExpressionFunction(
	(arg1: Value, arg2: Value)=>
		!equal(arg1, arg2),
	typeBoolean, [ typeVariant, typeVariant ],
);
export const funcLike = new ExpressionFunction(
	(arg1: string, arg2: string)=>
		equalStrings(arg1, arg2, true),
	typeBoolean, [ typeString, typeString ],
);
export const funcNotLike = new ExpressionFunction(
	(arg1: string, arg2: string)=>
		!equalStrings(arg1, arg2, true),
	typeBoolean, [ typeString, typeString ],
);
export const funcIfThenElse = new ExpressionFunction(
	(arg1: boolean, arg2: Value, arg3: Value)=>
		arg1 ? arg2 : arg3,
	typeVariant, [ typeBoolean, typeVariant, typeVariant ], undefined, undefined,
	(index, vtype, vmask)=> index === 0 || vtype === vmask
);
export const funcNullco = new ExpressionFunction(
	(arg1: Value, arg2: Value)=>
		arg1 ?? arg2,
	typeVariant, [ typeVariant, typeVariant ], undefined, undefined,
	(index, vtype, vmask)=> vtype === vmask
);
export const funcAdd = new ExpressionFunction(
	(...args: (number | number[] | string | string[])[])=>
		(args.flat(Infinity) as number[] | string[]).reduce((acc: any, val: any)=> acc + val),
	new Type('number', 'string'), [ new Type('number', 'string', 'array') ], 1, FUNCTION_ARG_MAX,
	(index, vtype, vmask)=> vtype === 'array' || vtype === vmask
);
export const funcSub = new ExpressionFunction(
	(arg1: number, arg2: number)=>
		arg1 - arg2,
	typeNumber, [ typeNumber, typeNumber ],
);
export const funcNeg = new ExpressionFunction(
	(arg: number)=>
		-arg,
	typeNumber, [ typeNumber ],
);
export const funcMul = new ExpressionFunction(
	(...args: (number | number[])[])=>
		args.flat(Infinity).reduce((acc: any, val: any)=>  acc *= val),
	typeNumber,	[ new Type('number', 'array') ], 1, FUNCTION_ARG_MAX,
);
export const funcDiv = new ExpressionFunction(
	(arg1: number, arg2: number)=>
		arg1 / arg2,
	typeNumber, [ typeNumber, typeNumber ],
);
export const funcRem = new ExpressionFunction(
	(arg1: number, arg2: number)=>
		arg1 % arg2,
	typeNumber, [ typeNumber, typeNumber ],
);
export const funcMod = new ExpressionFunction(
	(arg1: number, arg2: number)=>
		(arg1 % arg2 + arg2) % arg2,
	typeNumber, [ typeNumber, typeNumber ],
);
export const funcPct = new ExpressionFunction(
	(arg1: number, arg2: number)=>
		Math.round(arg1 * arg2 / 100),
	typeNumber, [ typeNumber, typeNumber ],
);
export const funcExp = new ExpressionFunction(
	(arg: number)=>
		Math.exp(arg),
	typeNumber, [ typeNumber ],
);
export const funcLog = new ExpressionFunction(
	(arg: number)=>
		Math.log(arg),
	typeNumber, [ typeNumber ],
);
export const funcPow = new ExpressionFunction(
	(arg1: number, arg2: number)=>
		Math.pow(arg1, arg2),
	typeNumber, [ typeNumber, typeNumber ],
);
export const funcRt = new ExpressionFunction(
	(arg1: number, arg2: number)=>
		Math.pow(arg1, 1 / arg2),
	typeNumber, [ typeNumber, typeNumber ],
);
export const funcSq = new ExpressionFunction(
	(arg: number)=>
		arg * arg,
	typeNumber, [ typeNumber ],
);
export const funcSqrt = new ExpressionFunction(
	(arg: number)=>
		Math.sqrt(arg),
	typeNumber, [ typeNumber ],
);
export const funcAbs = new ExpressionFunction(
	(arg: number)=>
		Math.abs(arg),
	typeNumber, [ typeNumber ],
);
export const funcCeil = new ExpressionFunction(
	(arg: number)=>
		Math.ceil(arg),
	typeNumber, [ typeNumber ],
);
export const funcFloor = new ExpressionFunction(
	(arg: number)=>
		Math.floor(arg),
	typeNumber, [ typeNumber ],
);
export const funcRound = new ExpressionFunction(
	(arg: number)=>
		Math.round(arg),
	typeNumber, [ typeNumber ],
);
export const funcMax = new ExpressionFunction(
	(...args: (number | number[])[])=>
		Math.max(...args.flat()),
	typeNumber, [ new Type('number', 'array') ], 1, FUNCTION_ARG_MAX,
);
export const funcMin = new ExpressionFunction(
	(...args: (number | number[])[])=>
		Math.min(...args.flat()),
	typeNumber, [ new Type('number', 'array') ], 1, FUNCTION_ARG_MAX,
);
export const funcContains = new ExpressionFunction(
	(arg1: string, arg2: string, arg3?: number, arg4?: boolean)=>
		containsString(arg1, arg2, arg3, arg4),
	typeBoolean, [ typeString, typeString, typeOptionalNumber, typeOptionalBoolean ], 2, 4,
);
export const funcStartsWith = new ExpressionFunction(
	(arg1: string, arg2: string, arg3?: number, arg4?: boolean)=>
		startsWithString(arg1, arg2, arg3, arg4),
	typeBoolean, [ typeString, typeString, typeOptionalNumber, typeOptionalBoolean ], 2, 4,
);
export const funcEndsWith = new ExpressionFunction(
	(arg1: string, arg2: string, arg3?: number, arg4?: boolean)=>
		endsWithString(arg1, arg2, arg3, arg4),
	typeBoolean, [ typeString, typeString, typeOptionalNumber, typeOptionalBoolean ], 2, 4,
);
export const funcAlphanum = new ExpressionFunction(
	(arg: string)=> {
		const value = arg.toLowerCase();
		let result = '';
		for (let i = 0; i < value.length; ++i) {
			if (!isCaseSpaceEtc(arg[ i ])) {
				result += arg[ i ];
			}
		}
		return result;
	},
	typeString, [ typeString ],
);
export const funcTrim = new ExpressionFunction(
	(arg: string)=>
		arg.trim(),
	typeString, [ typeString ],
);
export const funcTrimStart = new ExpressionFunction(
	(arg: string)=>
		arg.trimStart(),
	typeString, [ typeString ],
);
export const funcTrimEnd = new ExpressionFunction(
	(arg: string)=>
		arg.trimEnd(),
	typeString, [ typeString ],
);
export const funcLowerCase = new ExpressionFunction(
	(arg: string)=>
		arg.toLowerCase(),
	typeString, [ typeString ],
);
export const funcUpperCase = new ExpressionFunction(
	(arg: string)=>
		arg.toUpperCase(),
	typeString, [ typeString ],
);
export const funcSubstr = new ExpressionFunction(
	(arg1: string, arg2: number, arg3?: number)=>
		arg1.substring(arg2, arg3),
	typeString, [ typeString, typeNumber, typeOptionalNumber ], 2, 3,
);
export const funcChar = new ExpressionFunction(
	(arg1: string, arg2: number)=>
		arg1.charAt(arg2 < 0 ? arg1.length + arg2 : arg2),
	typeString, [ typeString, typeNumber ],
);
export const funcCharCode = new ExpressionFunction(
	(arg1: string, arg2: number)=>
		arg1.charCodeAt(arg2 < 0 ? arg1.length + arg2 : arg2),
	typeNumber, [ typeString, typeNumber ],
);
export const funcLen = new ExpressionFunction(
	(arg: string | Value[])=>
		arg.length,
	typeNumber, [ new Type('string', 'array') ],
);
export const funcAt = new ExpressionFunction(
	(arg1: Value[], arg2: number)=>
		arg1[ arg2 < 0 ? arg1.length + arg2 : arg2 ],
	typeVariant, [ typeArray, typeNumber ],
);
export const funcConcat = new ExpressionFunction(
	(...args: Value[])=>
		args,
	typeArray, [ typeVariant ], 1, FUNCTION_ARG_MAX,
);
export const funcFlatten = new ExpressionFunction(
	(args: Value[], arg: number)=>
		(args as []).flat(arg) as Value,
	typeArray, [ typeArray, typeNumber ],
);
export const funcReverse = new ExpressionFunction(
	(arg: Value[])=>
		[ ...arg ].reverse(),
	typeArray, [ typeArray ],
);
export const funcSlice = new ExpressionFunction(
	(arg1: Value[], arg2?: number, arg3?: number)=>
		arg1.slice(arg2, arg3) as Value,
	typeArray, [ typeArray, typeOptionalNumber, typeOptionalNumber ], 1, 3,
);
export const funcRange = new ExpressionFunction(
	(arg1: number, arg2: number)=> {
		const [ min, max ] = [ Math.floor(Math.min(arg1, arg2)), Math.ceil(Math.max(arg1, arg2)) ];
		return [ ...Array(max - min).keys() ].map((i)=> i + min);
	},
	typeArray, [ typeNumber, typeNumber ],
);
export const funcFirst = new ExpressionFunction(
	(arg1: Value[], arg2: (v: Value, i: number, a: Value[])=> boolean)=>
		arg1.find((v, i, a)=> arg2(v, i, a)),
	typeVariant, [ typeArray, typeFunction ],
);
export const funcLast = new ExpressionFunction(
	(arg1: Value[], arg2: (v: Value, i: number, a: Value[])=> boolean)=>
		[ ...arg1 ].reverse().find((v, i, a)=> arg2(v, i, a)),
	typeVariant, [ typeArray, typeFunction ],
);
export const funcFirstIndex = new ExpressionFunction(
	(arg1: Value[], arg2: (v: Value, i: number, a: Value[])=> boolean)=> {
		const ix = arg1.findIndex((v, i, a)=> arg2(v, i, a));
		return ix < 0 ? Number.NaN : ix;
	},
	typeNumber, [ typeArray, typeFunction ],
);
export const funcLastIndex = new ExpressionFunction(
	(arg1: Value[], arg2: (v: Value, i: number, a: Value[])=> boolean)=> {
		const ix = [ ...arg1 ].reverse().findIndex((v, i, a)=> arg2(v, i, a));
		return ix < 0 ? Number.NaN : ix;
	},
	typeNumber, [ typeArray, typeFunction ],
);
export const funcIterate = new ExpressionFunction(
	(arg1: Value[], arg2: (v: Value, i: number, a: Value[])=> Value)=> {
		arg1.forEach((v, i, a)=> arg2(v, i, a));
		return undefined;
	},
	typeVoid, [ typeArray, typeFunction ],
);
export const funcMap = new ExpressionFunction(
	(arg1: Value[], arg2: (v: Value, i: number, a: Value[])=> Value)=>
		arg1.map((v, i, a)=> arg2(v, i, a)),
	typeArray, [ typeArray, typeFunction ],
);
export const funcFilter = new ExpressionFunction(
	(arg1: Value[], arg2: (v: Value, i: number, a: Value[])=> boolean)=>
		arg1.filter((v, i, a)=> arg2(v, i, a)),
	typeArray, [ typeArray, typeFunction ],
);
export const funcAny = new ExpressionFunction(
	(arg1: Value[], arg2: (v: Value, i: number, a: Value[])=> boolean)=>
		arg1.some((v, i, a)=> arg2(v, i, a)),
	typeBoolean, [ typeArray, typeFunction ],
);
export const funcEvery = new ExpressionFunction(
	(arg1: Value[], arg2: (v: Value, i: number, a: Value[])=> boolean)=>
		arg1.every((v, i, a)=> arg2(v, i, a)),
	typeBoolean, [ typeArray, typeFunction ],
);
export const funcConstruct = new ExpressionFunction(
	(...args: [ string, Value ][])=> {
		const obj: Record<string, any> = {};
		for (let i = 0; i < args.length; ++i) {
			obj[ args[ i ][ 0 ] ] = args[ i ][ 1 ];
		}
		return obj;
	},
	typeObject, [ typeArray ], 0, FUNCTION_ARG_MAX,
);
export const funcBy = new ExpressionFunction(
	(arg1: { [ key: string ]: Value }, arg2: string)=>
		(arg1 as any)[ arg2 ] as Value,
	typeVariant, [ typeObject, typeString ],
);
export const funcMerge = new ExpressionFunction(
	(...args: ({ [ key: string ]: Value } | { [ key: string ]: Value }[])[])=>
		args.flat(Infinity).reduce((acc, val)=> Object.assign(acc, val)),
	typeObject, [ new Type('object', 'array') ], 2, FUNCTION_ARG_MAX,
);
export const funcJson = new ExpressionFunction(
	(arg: string)=> JSON.parse(arg),
	new Type('number', 'string', 'array', 'object'), [ typeString ],
);


function equal(value1: Value, value2: Value): boolean {
	if (value1 == null || value2 == null) {
		return value1 == value2;
	}
	if (typeof value1 === 'boolean' || typeof value1 === 'number' || typeof value1 === 'string' || typeof value1 === 'function') {
		return value1 === value2;
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

function equalStrings(value1: string, value2: string, ignoreCaseSpaceEtc?: boolean): boolean {
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
}

function containsString(value: string, search: string, startPos?: number, ignoreCaseSpaceEtc?: boolean): boolean {
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
}

function startsWithString(value: string, search: string, startPos?: number, ignoreCaseSpaceEtc?: boolean): boolean {
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
}

function endsWithString(value: string, search: string, endPos?: number, ignoreCaseSpaceEtc?: boolean): boolean {
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
}

function isCaseSpaceEtc(c: string) {
	return (c < 'a' || c > 'z') && (c < '0' || c > '9');
}
