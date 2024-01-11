import { ExpressionType, ExpressionValue,
	typeBoolean, typeNumber, typeString, typeArray, typeObject, typeFunction,
	typeOptionalBoolean, typeOptionalNumber,
	typeVar } from './ExpressionType.js';

const FUNCTION_ARG_MAX = 16536;

export class ExpressionFunction {

	constructor(
		protected _function: ( ...values: any[] ) => ExpressionValue,
		protected _type: ExpressionType,
		protected _argTypes: ExpressionType[],
		protected _minArity?: number,
		protected _maxArity?: number,
		protected _typeInference?: ( index: number, type: string, mask: string ) => boolean
	) {}

	clone(): ExpressionFunction {
		return new ExpressionFunction( this._function, this._type, this._argTypes, this._minArity, this._maxArity, this._typeInference );
	}

	get evaluate(): ( ...values: any[] ) => ExpressionValue {
		return this._function;
	}

	get minArity(): number {
		return this._minArity ?? this._argTypes.length;
	}

	get maxArity(): number {
		return this._maxArity ?? this._argTypes.length;
	}

	get argTypes(): ExpressionType[] {
		return this._argTypes;
	}

	get type(): ExpressionType {
		return this._type;
	}

	typeInference( index: number ): ( type: string, mask: string ) => boolean {
		return ( t: string, m: string ) => this._typeInference ? this._typeInference( index, t, m ) : true;
	}

}

export const funcNot = new ExpressionFunction(
	( arg: boolean ) =>
		!arg,
	typeBoolean, [ typeBoolean ],
);
export const funcAnd = new ExpressionFunction(
	( ...args: ( boolean | boolean[] )[] ) =>
		args.flat().every( v => v ),
	typeBoolean, [ new ExpressionType( 'boolean', 'array' ) ], 2, FUNCTION_ARG_MAX,
);
export const funcOr = new ExpressionFunction(
	( ...args: ( boolean | boolean[] )[] ) =>
		args.flat().some( v => v ),
	typeBoolean, [ new ExpressionType( 'boolean', 'array' ) ], 2, FUNCTION_ARG_MAX,
);
export const funcGt = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		arg1 > arg2,
	typeBoolean, [ typeNumber, typeNumber ],
);
export const funcLt = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		arg1 < arg2,
	typeBoolean, [ typeNumber, typeNumber ],
);
export const funcGe = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		arg1 >= arg2,
	typeBoolean, [ typeNumber, typeNumber ],
);
export const funcLe = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		arg1 <= arg2,
	typeBoolean, [ typeNumber, typeNumber ],
);
export const funcEqual = new ExpressionFunction(
	( arg1: ExpressionValue, arg2: ExpressionValue ) =>
		ExpressionType.equal( arg1, arg2 ),
	typeBoolean, [ typeVar, typeVar ],
);
export const funcNotEqual = new ExpressionFunction(
	( arg1: ExpressionValue, arg2: ExpressionValue ) =>
		!ExpressionType.equal( arg1, arg2 ),
	typeBoolean, [ typeVar, typeVar ],
);
export const funcLike = new ExpressionFunction(
	( arg1: string, arg2: string ) =>
		ExpressionType.equalStrings( arg1, arg2, true ),
	typeBoolean, [ typeString, typeString ],
);
export const funcNotLike = new ExpressionFunction(
	( arg1: string, arg2: string ) =>
		!ExpressionType.equalStrings( arg1, arg2, true ),
	typeBoolean, [ typeString, typeString ],
);
export const funcContains = new ExpressionFunction(
	( arg1: string, arg2: string, arg3?: number, arg4?: boolean ) =>
		ExpressionType.containsString( arg1, arg2, arg3, arg4 ),
	typeBoolean, [ typeString, typeString, typeOptionalNumber, typeOptionalBoolean ], 2, 4,
);
export const funcBeginsWith = new ExpressionFunction(
	( arg1: string, arg2: string, arg3?: number, arg4?: boolean ) =>
		ExpressionType.beginsWithString( arg1, arg2, arg3, arg4 ),
	typeBoolean, [ typeString, typeString, typeOptionalNumber, typeOptionalBoolean ], 2, 4,
);
export const funcEndsWith = new ExpressionFunction(
	( arg1: string, arg2: string, arg3?: number, arg4?: boolean ) =>
		ExpressionType.endsWithString( arg1, arg2, arg3, arg4 ),
	typeBoolean, [ typeString, typeString, typeOptionalNumber, typeOptionalBoolean ], 2, 4,
);
export const funcSwitch = new ExpressionFunction(
	( arg1: boolean, arg2: ExpressionValue, arg3: ExpressionValue ) =>
		arg1 ? arg2 : arg3,
	typeVar, [ typeBoolean, typeVar, typeVar ], undefined, undefined,
	( index, vtype, vmask ) => index === 0 || vtype === vmask
);
export const funcNullco = new ExpressionFunction(
	( arg1: ExpressionValue, arg2: ExpressionValue ) =>
		arg1 ?? arg2,
	typeVar, [ typeVar, typeVar ], undefined, undefined,
	( index, vtype, vmask ) => vtype === vmask
);
export const funcAdd = new ExpressionFunction(
	( ...args: ( number | number[] | string | string[] )[] ) =>
		args.flat( Infinity ).reduce( ( acc: any, val: any ) => ( acc += val ) ),
	new ExpressionType( 'number', 'string' ), [ new ExpressionType( 'number', 'string', 'array' ) ], 1, FUNCTION_ARG_MAX,
	( index, vtype, vmask ) => vtype === 'array' || vtype === vmask
);
export const funcSub = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		arg1 - arg2,
	typeNumber, [ typeNumber, typeNumber ],
);
export const funcNeg = new ExpressionFunction(
	( arg: number ) =>
		-arg,
	typeNumber, [ typeNumber ],
);
export const funcMul = new ExpressionFunction(
	( ...args: ( number | number[] )[] ) =>
		args.flat( Infinity ).reduce( ( acc: any, val: any ) => ( acc *= val ) ),
	typeNumber,	[ new ExpressionType( 'number', 'array' ) ], 1, FUNCTION_ARG_MAX,
);
export const funcDiv = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		arg1 / arg2,
	typeNumber, [ typeNumber, typeNumber ],
);
export const funcRem = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		arg1 % arg2,
	typeNumber, [ typeNumber, typeNumber ],
);
export const funcMod = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		( ( arg1 % arg2 ) + arg2 ) % arg2,
	typeNumber, [ typeNumber, typeNumber ],
);
export const funcPct = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		Math.round( arg1 * arg2 / 100 ),
	typeNumber, [ typeNumber, typeNumber ],
);
export const funcExp = new ExpressionFunction(
	( arg: number ) =>
		Math.exp( arg ),
	typeNumber, [ typeNumber ],
);
export const funcLog = new ExpressionFunction(
	( arg: number ) =>
		Math.log( arg ),
	typeNumber, [ typeNumber ],
);
export const funcPow = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		Math.pow( arg1, arg2 ),
	typeNumber, [ typeNumber, typeNumber ],
);
export const funcRt = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		Math.pow( arg1, 1 / arg2 ),
	typeNumber, [ typeNumber, typeNumber ],
);
export const funcSq = new ExpressionFunction(
	( arg: number ) =>
		arg * arg,
	typeNumber, [ typeNumber ],
);
export const funcSqrt = new ExpressionFunction(
	( arg: number ) =>
		Math.sqrt( arg ),
	typeNumber, [ typeNumber ],
);
export const funcAbs = new ExpressionFunction(
	( arg: number ) =>
		Math.abs( arg ),
	typeNumber, [ typeNumber ],
);
export const funcCeil = new ExpressionFunction(
	( arg: number ) =>
		Math.ceil( arg ),
	typeNumber, [ typeNumber ],
);
export const funcFloor = new ExpressionFunction(
	( arg: number ) =>
		Math.floor( arg ),
	typeNumber, [ typeNumber ],
);
export const funcRound = new ExpressionFunction(
	( arg: number ) =>
		Math.round( arg ),
	typeNumber, [ typeNumber ],
);
export const funcMax = new ExpressionFunction(
	( ...args: ( number | number[] )[] ) =>
		Math.max( ...args.flat() ),
	typeNumber, [ new ExpressionType( 'number', 'array' ) ], 1, FUNCTION_ARG_MAX,
);
export const funcMin = new ExpressionFunction(
	( ...args: ( number | number[] )[] ) =>
		Math.min( ...args.flat() ),
	typeNumber, [ new ExpressionType( 'number', 'array' ) ], 1, FUNCTION_ARG_MAX,
);
export const funcTrim = new ExpressionFunction(
	( arg: string ) =>
		arg.trim(),
	typeString, [ typeString ],
);
export const funcLowerCase = new ExpressionFunction(
	( arg: string ) =>
		arg.toLowerCase(),
	typeString, [ typeString ],
);
export const funcUpperCase = new ExpressionFunction(
	( arg: string ) =>
		arg.toUpperCase(),
	typeString, [ typeString ],
);
export const funcSubstr = new ExpressionFunction(
	( arg1: string, arg2: number, arg3?: number ) =>
		arg1.substring( arg2, arg3 ),
	typeString, [ typeString, typeNumber, typeOptionalNumber ], 2, 3,
);
export const funcChar = new ExpressionFunction(
	( arg1: string, arg2: number ) =>
		arg1.charAt( arg2 < 0 ? arg1.length + arg2 : arg2 ),
	typeString, [ typeString, typeNumber ],
);
export const funcCharCode = new ExpressionFunction(
	( arg1: string, arg2: number ) =>
		arg1.charCodeAt( arg2 < 0 ? arg1.length + arg2 : arg2 ),
	typeNumber, [ typeString, typeNumber ],
);
export const funcLen = new ExpressionFunction(
	( arg: string | ExpressionValue[] ) =>
		arg.length,
	typeNumber, [ new ExpressionType( 'string', 'array' ) ],
);
export const funcConcat = new ExpressionFunction(
	( ...args: ExpressionValue[] ) =>
		args,
	typeArray, [ typeVar ], 1, FUNCTION_ARG_MAX,
);
export const funcAt = new ExpressionFunction(
	( arg1: ExpressionValue[], arg2: number ) =>
		arg1[ arg2 < 0 ? arg1.length + arg2 : arg2 ],
	typeVar, [ typeArray, typeNumber ],
);
export const funcFlatten = new ExpressionFunction(
	( args: ExpressionValue[], arg: number ) =>
		( args as [] ).flat( arg ) as ExpressionValue,
	typeArray, [ typeArray, typeNumber ],
);
export const funcReverse = new ExpressionFunction(
	( arg: ExpressionValue[] ) =>
		[ ...arg ].reverse(),
	typeArray, [ typeArray ],
);
export const funcSlice = new ExpressionFunction(
	( arg1: ExpressionValue[], arg2?: number, arg3?: number ) =>
		arg1.slice( arg2, arg3 ) as ExpressionValue,
	typeArray, [ typeArray, typeOptionalNumber, typeOptionalNumber ], 1, 3,
);
export const funcFirst = new ExpressionFunction(
	( arg1: ExpressionValue[], arg2: ( v: ExpressionValue, i: number, a: ExpressionValue[] ) => boolean ) =>
		arg1.find( ( v, i, a ) => arg2( v, i, a ) ),
	typeVar, [ typeArray, typeFunction ],
);
export const funcLast = new ExpressionFunction(
	( arg1: ExpressionValue[], arg2: ( v: ExpressionValue, i: number, a: ExpressionValue[] ) => boolean ) =>
		[ ...arg1 ].reverse().find( ( v, i, a ) => arg2( v, i, a ) ),
	typeVar, [ typeArray, typeFunction ],
);
export const funcFirstIndex = new ExpressionFunction(
	( arg1: ExpressionValue[], arg2: ( v: ExpressionValue, i: number, a: ExpressionValue[] ) => boolean ) => {
		const ix = arg1.findIndex( ( v, i, a ) => arg2( v, i, a ) );
		return ix < 0 ? Number.NaN : ix;
	},
	typeNumber, [ typeArray, typeFunction ],
);
export const funcLastIndex = new ExpressionFunction(
	( arg1: ExpressionValue[], arg2: ( v: ExpressionValue, i: number, a: ExpressionValue[] ) => boolean ) => {
		const ix = [ ...arg1 ].reverse().findIndex( ( v, i, a ) => arg2( v, i, a ) );
		return ix < 0 ? Number.NaN : ix;
	},
	typeNumber, [ typeArray, typeFunction ],
);
export const funcMap = new ExpressionFunction(
	( arg1: ExpressionValue[], arg2: ( v: ExpressionValue, i: number, a: ExpressionValue[] ) => ExpressionValue ) =>
		arg1.map( ( v, i, a ) => arg2( v, i, a ) ),
	typeArray, [ typeArray, typeFunction ],
);
export const funcFilter = new ExpressionFunction(
	( arg1: ExpressionValue[], arg2: ( v: ExpressionValue, i: number, a: ExpressionValue[] ) => boolean ) =>
		arg1.filter( ( v, i, a ) => arg2( v, i, a ) ),
	typeArray, [ typeArray, typeFunction ],
);
export const funcAny = new ExpressionFunction(
	( arg1: ExpressionValue[], arg2: ( v: ExpressionValue, i: number, a: ExpressionValue[] ) => boolean ) =>
		arg1.some( ( v, i, a ) => arg2( v, i, a ) ),
	typeBoolean, [ typeArray, typeFunction ],
);
export const funcEvery = new ExpressionFunction(
	( arg1: ExpressionValue[], arg2: ( v: ExpressionValue, i: number, a: ExpressionValue[] ) => boolean ) =>
		arg1.every( ( v, i, a ) => arg2( v, i, a ) ),
	typeBoolean, [ typeArray, typeFunction ],
);
export const funcConstruct = new ExpressionFunction(
	( ...args: ExpressionValue[][] ) => {
		const obj: Record<string, any> = {};
		for ( let i = 0; i < args.length; ++i ) {
			obj[ args[ i ]![ 0 ]!.toString() ] = args[ i ][ 1 ];
		}
		return obj;
	},
	typeObject, [ typeArray ], 0, FUNCTION_ARG_MAX,
);
export const funcJoin = new ExpressionFunction(
	( ...args: ( object | object[] )[] ) =>
		args.flat( Infinity ).reduce( ( acc: object, val: object ) => Object.assign( acc, val ) ),
	typeObject, [ new ExpressionType( 'object', 'array' ) ], 2, FUNCTION_ARG_MAX,
);
export const funcBy = new ExpressionFunction(
	( arg1: object, arg2: string ) =>
		( arg1 as any )[ arg2 ],
	typeVar, [ typeObject, typeString ],
);
