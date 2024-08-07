import { ExpressionFunction, FUNCTION_ARG_MAX, isCaseSpaceEtc } from './ExpressionFunction.js';
import { Type, Value, typeNumber, typeString, typeArray, typeObject, typeFunction, typeOptionalNumber, typeVariant } from './Type.js';

export const funcLen = new ExpressionFunction(
	(value: ArrayBufferLike | string | Value[])=>
		value instanceof ArrayBuffer || value instanceof SharedArrayBuffer ? value.byteLength : value.length,
	typeNumber, [ new Type('buffer', 'string', 'array') ],
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

export const funcConcat = new ExpressionFunction(
	(...values: (Value | Value[])[])=>
		(values as []).flat(FUNCTION_ARG_MAX),
	typeArray, [ typeVariant ], 1, FUNCTION_ARG_MAX,
);

export const funcFlatten = new ExpressionFunction(
	(values: Value[], depth: number = FUNCTION_ARG_MAX)=>
		(values as []).flat(depth) as Value,
	typeArray, [ typeArray, typeOptionalNumber ], 1, 2,
);

export const funcReverse = new ExpressionFunction(
	(value: Value[])=>
		[ ...value ].reverse(),
	typeArray, [ typeArray ],
);

export const funcRange = new ExpressionFunction(
	(value1: number, value2: number)=> {
		const [ min, max ] = [ Math.floor(Math.min(value1, value2)), Math.ceil(Math.max(value1, value2)) ];
		return [ ...Array(max - min).keys() ].map((i)=> i + min);
	},
	typeArray, [ typeNumber, typeNumber ],
);

export const funcIterate = new ExpressionFunction(
	(value: Value[], callback: (v: Value, i: number, a: Value[])=> Value)=> {
		value.forEach((v, i, a)=> callback(v, i, a));
		return value;
	},
	typeArray, [ typeArray, typeFunction ],
);

export const funcMap = new ExpressionFunction(
	(value: Value[], callback: (v: Value, i: number, a: Value[])=> Value)=>
		value.map((v, i, a)=> callback(v, i, a)),
	typeArray, [ typeArray, typeFunction ],
);

export const funcFilter = new ExpressionFunction(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value.filter((v, i, a)=> predicate(v, i, a)),
	typeArray, [ typeArray, typeFunction ],
);

export const funcConstruct = new ExpressionFunction(
	(...values: [ string, Value ][])=> {
		const obj: Record<string, any> = {};
		for (let i = 0; i < values.length; ++i) {
			obj[ values[ i ][ 0 ] ] = values[ i ][ 1 ];
		}
		return obj;
	},
	typeObject, [ typeArray ], 0, FUNCTION_ARG_MAX,
);

export const funcMerge = new ExpressionFunction(
	(...values: ({ [ key: string ]: Value } | { [ key: string ]: Value }[])[])=>
		values.flat(FUNCTION_ARG_MAX).reduce((acc, val)=> Object.assign(acc, val)),
	typeObject, [ new Type('object', 'array') ], 1, FUNCTION_ARG_MAX,
);
