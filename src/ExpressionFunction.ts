import { ExpressionObjectType, ExpressionValueType, ExpressionType,
	typeBoolean, typeNumber, typeString,
	typeAnyArray, typeAny, inferenceByConstituency } from './ExpressionType.js';

export class ExpressionFunction {

	constructor(
		protected _function: ( ...values: any[] ) => ExpressionValueType,
		protected _argTypes: ExpressionType[],
		protected _type: ExpressionType,
		protected _inference?: ( ix: number, type: ExpressionType, mask: ExpressionType ) => ExpressionType
	) {}

	clone(): ExpressionFunction {
		return new ExpressionFunction( this._function, this._argTypes, this._type, this._inference );
	}

	evaluate( ...values: any[] ): ExpressionValueType {
		return this._function( ...values );
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

	get inference(): ( ( ix: number, type: ExpressionType, mask: ExpressionType ) => ExpressionType ) | undefined {
		return this._inference;
	}

}

export const funcAnd = new ExpressionFunction(
	( ...args: ( boolean | boolean[] )[] ) => args.flat().every( v => v ),
	[ new ExpressionType( [ 'boolean', 'boolean[]' ] ) ],
	typeBoolean
);
export const funcOr = new ExpressionFunction(
	( ...args: ( boolean | boolean[] )[] ) => args.flat().some( v => v ),
	[ new ExpressionType( [ 'boolean', 'boolean[]' ] ) ],
	typeBoolean
);
export const funcNot = new ExpressionFunction(
	( arg: boolean ) => !arg,
	[ typeBoolean ],
	typeBoolean
);
export const funcGt = new ExpressionFunction(
	( arg1: number, arg2: number ) => arg1 > arg2,
	[ typeNumber, typeNumber ],
	typeBoolean
);
export const funcLt = new ExpressionFunction(
	( arg1: number, arg2: number ) => arg1 < arg2,
	[ typeNumber, typeNumber ],
	typeBoolean
);
export const funcGe = new ExpressionFunction(
	( arg1: number, arg2: number ) => arg1 >= arg2,
	[ typeNumber, typeNumber ],
	typeBoolean
);
export const funcLe = new ExpressionFunction(
	( arg1: number, arg2: number ) => arg1 <= arg2,
	[ typeNumber, typeNumber ],
	typeBoolean
);
export const funcEq = new ExpressionFunction(
	( arg1: boolean | number | string, arg2: boolean | number | string ) => ExpressionType.equate( arg1, arg2 ),
	[ typeAny, typeAny ],
	typeBoolean
);
export const funcNe = new ExpressionFunction(
	( arg1: boolean | number | string, arg2: boolean | number | string ) => !ExpressionType.equate( arg1, arg2 ),
	[ typeAny, typeAny ],
	typeBoolean
);
export const funcLike = new ExpressionFunction(
	( arg1: string, arg2: string ) => arg1.toLowerCase() === arg2.toLowerCase(),
	[ typeString, typeString ],
	typeBoolean
);
export const funcUnlike = new ExpressionFunction(
	( arg1: string, arg2: string ) => arg1.toLowerCase() !== arg2.toLowerCase(),
	[ typeString, typeString ],
	typeBoolean
);
export const funcBeginof = new ExpressionFunction(
	( arg1: string, arg2: string ) => arg2.startsWith( arg1 ),
	[ typeString, typeString ],
	typeBoolean
);
export const funcEndof = new ExpressionFunction(
	( arg1: string, arg2: string ) => arg2.endsWith( arg1 ),
	[ typeString, typeString ],
	typeBoolean
);
export const funcPartof = new ExpressionFunction(
	( arg1: string, arg2: string ) => arg2.includes( arg1 ),
	[ typeString, typeString ],
	typeBoolean
);
export const funcAdd = new ExpressionFunction(
	( ...args: ( number | number[] )[] | ( string | string[] )[] ) => args.flat().reduce( ( acc: any, val: any ) => acc += val ),
	[ new ExpressionType( [ 'number', 'string', 'number[]', 'string[]' ] ) ],
	new ExpressionType( [ 'number', 'string' ] ),
	inferenceByConstituency
);
export const funcSub = new ExpressionFunction(
	( arg1: number, arg2: number ) => arg1 - arg2,
	[ typeNumber, typeNumber ],
	typeNumber
);
export const funcNeg = new ExpressionFunction(
	( arg: number ) => -arg,
	[ typeNumber ],
	typeNumber
);
export const funcMul = new ExpressionFunction(
	( ...args: ( number | number[] )[] ) => args.flat().reduce( ( acc, val ) => acc *= val ),
	[ new ExpressionType( [ 'number', 'number[]' ] ) ],
	typeNumber
);
export const funcDiv = new ExpressionFunction(
	( arg1: number, arg2: number ) => arg1 / arg2,
	[ typeNumber, typeNumber ],
	typeNumber
);
export const funcRem = new ExpressionFunction(
	( arg1: number, arg2: number ) => arg1 % arg2,
	[ typeNumber, typeNumber ],
	typeNumber
);
export const funcMod = new ExpressionFunction(
	( arg1: number, arg2: number ) => ( ( arg1 % arg2 ) + arg2 ) % arg2,
	[ typeNumber, typeNumber ],
	typeNumber
);
export const funcPct = new ExpressionFunction(
	( arg1: number, arg2: number ) => Math.round( arg1 * arg2 / 100 ),
	[ typeNumber, typeNumber ],
	typeNumber
);
export const funcExp = new ExpressionFunction(
	( arg: number ) => Math.exp( arg ),
	[ typeNumber ],
	typeNumber
);
export const funcLog = new ExpressionFunction(
	( arg: number ) => Math.log( arg ),
	[ typeNumber ],
	typeNumber
);
export const funcPow = new ExpressionFunction(
	( arg1: number, arg2: number ) => Math.pow( arg1, arg2 ),
	[ typeNumber, typeNumber ],
	typeNumber
);
export const funcRt = new ExpressionFunction(
	( arg1: number, arg2: number ) => Math.pow( arg1, 1 / arg2 ),
	[ typeNumber, typeNumber ],
	typeNumber
);
export const funcSq = new ExpressionFunction(
	( arg: number ) => arg * arg,
	[ typeNumber ],
	typeNumber
);
export const funcSqrt = new ExpressionFunction(
	( arg: number ) => Math.sqrt( arg ),
	[ typeNumber ],
	typeNumber
);
export const funcAbs = new ExpressionFunction(
	( arg: number ) => Math.abs( arg ),
	[ typeNumber ],
	typeNumber
);
export const funcCeil = new ExpressionFunction(
	( arg: number ) => Math.ceil( arg ),
	[ typeNumber ],
	typeNumber
);
export const funcFloor = new ExpressionFunction(
	( arg: number ) => Math.floor( arg ),
	[ typeNumber ],
	typeNumber
);
export const funcRound = new ExpressionFunction(
	( arg: number ) => Math.round( arg ),
	[ typeNumber ],
	typeNumber
);
export const funcMax = new ExpressionFunction(
	( ...args: ( number | number[] )[] ) => Math.max( ...args.flat() ),
	[ new ExpressionType( [ 'number', 'number[]' ] ) ],
	typeNumber
);
export const funcMin = new ExpressionFunction(
	( ...args: ( number | number[] )[] ) => Math.min( ...args.flat() ),
	[ new ExpressionType( [ 'number', 'number[]' ] ) ],
	typeNumber
);
export const funcLen = new ExpressionFunction(
	( arg: string | boolean[] | number [] | string[] | ExpressionObjectType[] ) => arg.length,
	[ new ExpressionType( [ 'string', 'boolean[]', 'number[]', 'string[]', 'object[]' ] ) ],
	typeNumber
);
export const funcTrim = new ExpressionFunction(
	( arg: string ) => arg.trim(),
	[ typeString ],
	typeString
);
export const funcLowercase = new ExpressionFunction(
	( arg: string ) => arg.toLowerCase(),
	[ typeString ],
	typeString
);
export const funcUppercase = new ExpressionFunction(
	( arg: string ) => arg.toUpperCase(),
	[ typeString ],
	typeString
);
export const funcSubstr = new ExpressionFunction(
	( arg: string, ...args: number[] ) => arg.substring( args[ 0 ], args[ 1 ] ),
	[ typeString, typeNumber ],
	typeString
);
export const funcConcat = new ExpressionFunction(
	( ...args: ( boolean | boolean[] )[] | ( number | number[] )[] | ( string | string[] )[] | ( ExpressionObjectType | ExpressionObjectType[] )[] ) =>
		args.flat() as ExpressionValueType,
	[ typeAny ],
	typeAnyArray,
	inferenceByConstituency
);
export const funcAt = new ExpressionFunction(
	( arg1: string | ExpressionObjectType | boolean[] | number [] | string[] | ExpressionObjectType[], arg2: number | string ) =>
		typeof arg1 === 'string' ? arg1.charAt( arg2 as number ) : Array.isArray( arg1 ) ? arg1[ arg2 as number ] : arg1[ arg2 ],
	[ new ExpressionType( [ 'string', 'object', 'boolean[]', 'number[]', 'string[]', 'object[]' ] ), new ExpressionType( [ 'number', 'string' ] ) ],
	typeAny,
	( ix: number, type: ExpressionType, mask: ExpressionType ) =>
		ix > 0 ? type : type.filter( tn => tn === 'object' || mask.or( mtn => mtn.split( '[]' )[ 0 ] === tn.split( '[]' )[ 0 ] ) )
);
