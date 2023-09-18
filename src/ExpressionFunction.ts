import { ExpressionType, ExpressionValue,
	typeBoolean, typeNumber, typeString, typeArray, typeObject, typeFunction, typeVar } from './ExpressionType.js';

export class ExpressionFunction {

	constructor(
		protected _function: ( ...values: any[] ) => ExpressionValue,
		protected _argTypes: ExpressionType[],
		protected _type: ExpressionType,
		protected _inference?: ( index: number, type: string, mask: string ) => boolean
	) {}

	clone(): ExpressionFunction {
		return new ExpressionFunction( this._function, this._argTypes, this._type, this._inference );
	}

	get evaluate(): ( ...values: any[] ) => ExpressionValue {
		return this._function;
	}

	get arity(): number {
		return this._argTypes.length;
	}

	get argTypes(): ExpressionType[] {
		return this._argTypes;
	}

	get type(): ExpressionType {
		return this._type;
	}

	inference( index: number ): ( type: string, mask: string ) => boolean {
		return ( t: string, m: string ) => this._inference ? this._inference( index, t, m ) : true;
	}

}

export const funcOr = new ExpressionFunction(
	( ...args: ( boolean | boolean[] )[] ) =>
		args.flat().some( v => v ),
	[ new ExpressionType( 'boolean', 'array' ) ],
	typeBoolean,
);
export const funcAnd = new ExpressionFunction(
	( ...args: ( boolean | boolean[] )[] ) =>
		args.flat().every( v => v ),
	[ new ExpressionType( 'boolean', 'array' ) ],
	typeBoolean,
);
export const funcNot = new ExpressionFunction(
	( arg: boolean ) =>
		!arg,
	[ typeBoolean ],
	typeBoolean,
);
export const funcGt = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		arg1 > arg2,
	[ typeNumber, typeNumber ],
	typeBoolean,
);
export const funcLt = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		arg1 < arg2,
	[ typeNumber, typeNumber ],
	typeBoolean,
);
export const funcGe = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		arg1 >= arg2,
	[ typeNumber, typeNumber ],
	typeBoolean,
);
export const funcLe = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		arg1 <= arg2,
	[ typeNumber, typeNumber ],
	typeBoolean,
);
export const funcEq = new ExpressionFunction(
	( arg1: boolean | number | string, arg2: boolean | number | string ) =>
		ExpressionType.equate( arg1, arg2 ),
	[ typeVar, typeVar ],
	typeBoolean,
);
export const funcNe = new ExpressionFunction(
	( arg1: boolean | number | string, arg2: boolean | number | string ) =>
		!ExpressionType.equate( arg1, arg2 ),
	[ typeVar, typeVar ],
	typeBoolean,
);
export const funcLike = new ExpressionFunction(
	( arg1: string, arg2: string ) =>
		arg1.toLowerCase() === arg2.toLowerCase(),
	[ typeString, typeString ],
	typeBoolean,
);
export const funcUnlike = new ExpressionFunction(
	( arg1: string, arg2: string ) =>
		arg1.toLowerCase() !== arg2.toLowerCase(),
	[ typeString, typeString ],
	typeBoolean,
);
export const funcBeginof = new ExpressionFunction(
	( arg1: string, arg2: string ) =>
		arg2.startsWith( arg1 ),
	[ typeString, typeString ],
	typeBoolean,
);
export const funcEndof = new ExpressionFunction(
	( arg1: string, arg2: string ) =>
		arg2.endsWith( arg1 ),
	[ typeString, typeString ],
	typeBoolean,
);
export const funcPartof = new ExpressionFunction(
	( arg1: string, arg2: string ) =>
		arg2.includes( arg1 ),
	[ typeString, typeString ],
	typeBoolean,
);
export const funcSwitch = new ExpressionFunction(
	( arg1: boolean, arg2: ExpressionValue, arg3: ExpressionValue ) =>
		arg1 ? arg2 : arg3,
	[ typeBoolean, typeVar, typeVar ],
	typeVar,
	( index, vtype, vmask ) => index === 0 || vtype === vmask
);
export const funcNullco = new ExpressionFunction(
	( arg1: ExpressionValue, arg2: ExpressionValue ) =>
		arg1 ?? arg2,
	[ typeVar, typeVar ],
	typeVar,
	( index, vtype, vmask ) => vtype === vmask
);
export const funcAdd = new ExpressionFunction(
	( ...args: ( number | number[] | string | string[] )[] ) =>
		args.flat( Infinity ).reduce( ( acc: any, val: any ) => ( acc += val ) ),
	[ new ExpressionType( 'number', 'string', 'array' ) ],
	new ExpressionType( 'number', 'string' ),
	( index, vtype, vmask ) => vtype === 'array' || vtype === vmask
);
export const funcSub = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		arg1 - arg2,
	[ typeNumber, typeNumber ],
	typeNumber,
);
export const funcNeg = new ExpressionFunction(
	( arg: number ) =>
		-arg,
	[ typeNumber ],
	typeNumber,
);
export const funcMul = new ExpressionFunction(
	( ...args: ( number | number[] )[] ) =>
		args.flat( Infinity ).reduce( ( acc: any, val: any ) => ( acc *= val ) ),
	[ new ExpressionType( 'number', 'array' ) ],
	typeNumber,
);
export const funcDiv = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		arg1 / arg2,
	[ typeNumber, typeNumber ],
	typeNumber,
);
export const funcRem = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		arg1 % arg2,
	[ typeNumber, typeNumber ],
	typeNumber,
);
export const funcMod = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		( ( arg1 % arg2 ) + arg2 ) % arg2,
	[ typeNumber, typeNumber ],
	typeNumber,
);
export const funcPct = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		Math.round( arg1 * arg2 / 100 ),
	[ typeNumber, typeNumber ],
	typeNumber,
);
export const funcExp = new ExpressionFunction(
	( arg: number ) =>
		Math.exp( arg ),
	[ typeNumber ],
	typeNumber,
);
export const funcLog = new ExpressionFunction(
	( arg: number ) =>
		Math.log( arg ),
	[ typeNumber ],
	typeNumber,
);
export const funcPow = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		Math.pow( arg1, arg2 ),
	[ typeNumber, typeNumber ],
	typeNumber,
);
export const funcRt = new ExpressionFunction(
	( arg1: number, arg2: number ) =>
		Math.pow( arg1, 1 / arg2 ),
	[ typeNumber, typeNumber ],
	typeNumber,
);
export const funcSq = new ExpressionFunction(
	( arg: number ) =>
		arg * arg,
	[ typeNumber ],
	typeNumber,
);
export const funcSqrt = new ExpressionFunction(
	( arg: number ) =>
		Math.sqrt( arg ),
	[ typeNumber ],
	typeNumber,
);
export const funcAbs = new ExpressionFunction(
	( arg: number ) =>
		Math.abs( arg ),
	[ typeNumber ],
	typeNumber,
);
export const funcCeil = new ExpressionFunction(
	( arg: number ) =>
		Math.ceil( arg ),
	[ typeNumber ],
	typeNumber,
);
export const funcFloor = new ExpressionFunction(
	( arg: number ) =>
		Math.floor( arg ),
	[ typeNumber ],
	typeNumber,
);
export const funcRound = new ExpressionFunction(
	( arg: number ) =>
		Math.round( arg ),
	[ typeNumber ],
	typeNumber,
);
export const funcMax = new ExpressionFunction(
	( ...args: ( number | number[] )[] ) =>
		Math.max( ...args.flat() ),
	[ new ExpressionType( 'number', 'array' ) ],
	typeNumber,
);
export const funcMin = new ExpressionFunction(
	( ...args: ( number | number[] )[] ) =>
		Math.min( ...args.flat() ),
	[ new ExpressionType( 'number', 'array' ) ],
	typeNumber,
);
export const funcTrim = new ExpressionFunction(
	( arg: string ) =>
		arg.trim(),
	[ typeString ],
	typeString
);
export const funcLowercase = new ExpressionFunction(
	( arg: string ) =>
		arg.toLowerCase(),
	[ typeString ],
	typeString,
);
export const funcUppercase = new ExpressionFunction(
	( arg: string ) =>
		arg.toUpperCase(),
	[ typeString ],
	typeString,
);
export const funcSubstr = new ExpressionFunction(
	( arg: string, ...args: number[] ) =>
		arg.substring( args[ 0 ], args[ 1 ] ),
	[ typeString, typeNumber ],
	typeString,
);
export const funcChar = new ExpressionFunction(
	( arg1: string, arg2: number ) =>
		arg1.charAt( arg2 < 0 ? arg1.length + arg2 : arg2 ),
	[ typeString, typeNumber ],
	typeString,
);
export const funcCharcode = new ExpressionFunction(
	( arg1: string, arg2: number ) =>
		arg1.charCodeAt( arg2 < 0 ? arg1.length + arg2 : arg2 ),
	[ typeString, typeNumber ],
	typeNumber,
);
export const funcLen = new ExpressionFunction(
	( arg: string | ExpressionValue[] ) =>
		arg.length,
	[ new ExpressionType( 'string', 'array' ) ],
	typeNumber,
);
export const funcConcat = new ExpressionFunction(
	( ...args: ExpressionValue[] ) =>
		args,
	[ typeVar ],
	typeArray,
);
export const funcAt = new ExpressionFunction(
	( arg1: ExpressionValue[], arg2: number ) =>
		arg1[ arg2 < 0 ? arg1.length + arg2 : arg2 ],
	[ typeArray, typeNumber ],
	typeVar,
);
export const funcFlatten = new ExpressionFunction(
	( args: ExpressionValue[], arg: number ) =>
		( args as [] ).flat( arg ) as ExpressionValue,
	[ typeArray, typeNumber ],
	typeArray,
);
export const funcReverse = new ExpressionFunction(
	( arg: ExpressionValue[] ) =>
		[ ...arg ].reverse(),
	[ typeArray ],
	typeArray,
);
export const funcSlice = new ExpressionFunction(
	( args: ExpressionValue[], arg1: number, arg2: number ) =>
		args.slice( arg1, arg2 ) as ExpressionValue,
	[ typeArray, typeNumber, typeNumber ],
	typeArray,
);
export const funcFirst = new ExpressionFunction(
	( arg1: ExpressionValue[], arg2: ( v: ExpressionValue, i: number, a: ExpressionValue[] ) => boolean ) =>
		arg1.find( ( v, i, a ) => arg2( v, i, a ) ),
	[ typeArray, typeFunction ],
	typeVar,
);
export const funcLast = new ExpressionFunction(
	( arg1: ExpressionValue[], arg2: ( v: ExpressionValue, i: number, a: ExpressionValue[] ) => boolean ) =>
		[ ...arg1 ].reverse().find( ( v, i, a ) => arg2( v, i, a ) ),
	[ typeArray, typeFunction ],
	typeVar
);
export const funcFirstindex = new ExpressionFunction(
	( arg1: ExpressionValue[], arg2: ( v: ExpressionValue, i: number, a: ExpressionValue[] ) => boolean ) => {
		const ix = arg1.findIndex( ( v, i, a ) => arg2( v, i, a ) );
		return ix < 0 ? Number.NaN : ix;
	},
	[ typeArray, typeFunction ],
	typeNumber,
);
export const funcLastindex = new ExpressionFunction(
	( arg1: ExpressionValue[], arg2: ( v: ExpressionValue, i: number, a: ExpressionValue[] ) => boolean ) => {
		const ix = [ ...arg1 ].reverse().findIndex( ( v, i, a ) => arg2( v, i, a ) );
		return ix < 0 ? Number.NaN : ix;
	},
	[ typeArray, typeFunction ],
	typeNumber
);
export const funcMap = new ExpressionFunction(
	( arg1: ExpressionValue[], arg2: ( v: ExpressionValue, i: number, a: ExpressionValue[] ) => ExpressionValue ) =>
		arg1.map( ( v, i, a ) => arg2( v, i, a ) ),
	[ typeArray, typeFunction ],
	typeArray,
);
export const funcFilter = new ExpressionFunction(
	( arg1: ExpressionValue[], arg2: ( v: ExpressionValue, i: number, a: ExpressionValue[] ) => boolean ) =>
		arg1.filter( ( v, i, a ) => arg2( v, i, a ) ),
	[ typeArray, typeFunction ],
	typeArray,
);
export const funcAny = new ExpressionFunction(
	( arg1: ExpressionValue[], arg2: ( v: ExpressionValue, i: number, a: ExpressionValue[] ) => boolean ) =>
		arg1.some( ( v, i, a ) => arg2( v, i, a ) ),
	[ typeArray, typeFunction ],
	typeBoolean,
);
export const funcEvery = new ExpressionFunction(
	( arg1: ExpressionValue[], arg2: ( v: ExpressionValue, i: number, a: ExpressionValue[] ) => boolean ) =>
		arg1.every( ( v, i, a ) => arg2( v, i, a ) ),
	[ typeArray, typeFunction ],
	typeBoolean,
);
export const funcConstr = new ExpressionFunction(
	( ...args: ExpressionValue[][] ) => {
		const obj: Record<string, any> = {};
		for ( let i = 0; i < args.length; ++i ) {
			obj[ args[ i ]![ 0 ]!.toString() ] = args[ i ][ 1 ];
		}
		return obj;
	},
	[ typeArray ],
	typeObject,
);
export const funcBy = new ExpressionFunction(
	( arg1: object, arg2: string ) =>
		( arg1 as any )[ arg2 ],
	[ typeObject, typeString ],
	typeVar,
);
