import { ExpressionObjectType, ExpressionValueType, ExpressionType,
	typeBoolean, typeNumber, typeString,
	typeBooleanNumberStringObjectArray, typeAny, inferenceByConstituency } from './ExpressionType.js';

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

export const orFunc = new ExpressionFunction(
	( ...args: ( boolean | boolean[] )[] ) => args.flat().some( v => v ),
	[ new ExpressionType( [ 'boolean', 'boolean[]' ] ) ],
	typeBoolean
);
export const andFunc = new ExpressionFunction(
	( ...args: ( boolean | boolean[] )[] ) => args.flat().every( v => v ),
	[ new ExpressionType( [ 'boolean', 'boolean[]' ] ) ],
	typeBoolean
);
export const notFunc = new ExpressionFunction(
	( arg: boolean ) => !arg,
	[ typeBoolean ],
	typeBoolean
);
export const gtFunc = new ExpressionFunction(
	( arg1: number, arg2: number ) => arg1 > arg2,
	[ typeNumber, typeNumber ],
	typeBoolean
);
export const ltFunc = new ExpressionFunction(
	( arg1: number, arg2: number ) => arg1 < arg2,
	[ typeNumber, typeNumber ],
	typeBoolean
);
export const geFunc = new ExpressionFunction(
	( arg1: number, arg2: number ) => arg1 >= arg2,
	[ typeNumber, typeNumber ],
	typeBoolean
);
export const leFunc = new ExpressionFunction(
	( arg1: number, arg2: number ) => arg1 <= arg2,
	[ typeNumber, typeNumber ],
	typeBoolean
);
export const eqFunc = new ExpressionFunction(
	( arg1: boolean | number | string, arg2: boolean | number | string ) => ExpressionType.equate( arg1, arg2 ),
	[ typeAny, typeAny ],
	typeBoolean
);
export const neFunc = new ExpressionFunction(
	( arg1: boolean | number | string, arg2: boolean | number | string ) => !ExpressionType.equate( arg1, arg2 ),
	[ typeAny, typeAny ],
	typeBoolean
);
export const likeFunc = new ExpressionFunction(
	( arg1: string, arg2: string ) => arg1.toLowerCase() === arg2.toLowerCase(),
	[ typeString, typeString ],
	typeBoolean
);
export const unlikeFunc = new ExpressionFunction(
	( arg1: string, arg2: string ) => arg1.toLowerCase() !== arg2.toLowerCase(),
	[ typeString, typeString ],
	typeBoolean
);
export const beginofFunc = new ExpressionFunction(
	( arg1: string, arg2: string ) => arg2.startsWith( arg1 ),
	[ typeString, typeString ],
	typeBoolean
);
export const endofFunc = new ExpressionFunction(
	( arg1: string, arg2: string ) => arg2.endsWith( arg1 ),
	[ typeString, typeString ],
	typeBoolean
);
export const partofFunc = new ExpressionFunction(
	( arg1: string, arg2: string ) => arg2.includes( arg1 ),
	[ typeString, typeString ],
	typeBoolean
);
export const addFunc = new ExpressionFunction(
	( ...args: ( number | number[] )[] | ( string | string[] )[] ) => args.flat().reduce( ( acc: any, val: any ) => acc += val ),
	[ new ExpressionType( [ 'number', 'string', 'number[]', 'string[]' ] ) ],
	new ExpressionType( [ 'number', 'string' ] ),
	inferenceByConstituency
);
export const subFunc = new ExpressionFunction(
	( arg1: number, arg2: number ) => arg1 - arg2,
	[ typeNumber, typeNumber ],
	typeNumber
);
export const negFunc = new ExpressionFunction(
	( arg: number ) => -arg,
	[ typeNumber ],
	typeNumber
);
export const mulFunc = new ExpressionFunction(
	( ...args: ( number | number[] )[] ) => args.flat().reduce( ( acc, val ) => acc *= val ),
	[ new ExpressionType( [ 'number', 'number[]' ] ) ],
	typeNumber
);
export const divFunc = new ExpressionFunction(
	( arg1: number, arg2: number ) => arg1 / arg2,
	[ typeNumber, typeNumber ],
	typeNumber
);
export const remFunc = new ExpressionFunction(
	( arg1: number, arg2: number ) => arg1 % arg2,
	[ typeNumber, typeNumber ],
	typeNumber
);
export const modFunc = new ExpressionFunction(
	( arg1: number, arg2: number ) => ( ( arg1 % arg2 ) + arg2 ) % arg2,
	[ typeNumber, typeNumber ],
	typeNumber
);
export const pctFunc = new ExpressionFunction(
	( arg1: number, arg2: number ) => Math.round( arg1 * arg2 / 100 ),
	[ typeNumber, typeNumber ],
	typeNumber
);
export const expFunc = new ExpressionFunction(
	( arg: number ) => Math.exp( arg ),
	[ typeNumber ],
	typeNumber
);
export const logFunc = new ExpressionFunction(
	( arg: number ) => Math.log( arg ),
	[ typeNumber ],
	typeNumber
);
export const powFunc = new ExpressionFunction(
	( arg1: number, arg2: number ) => Math.pow( arg1, arg2 ),
	[ typeNumber, typeNumber ],
	typeNumber
);
export const rtFunc = new ExpressionFunction(
	( arg1: number, arg2: number ) => Math.pow( arg1, 1 / arg2 ),
	[ typeNumber, typeNumber ],
	typeNumber
);
export const sqFunc = new ExpressionFunction(
	( arg: number ) => arg * arg,
	[ typeNumber ],
	typeNumber
);
export const sqrtFunc = new ExpressionFunction(
	( arg: number ) => Math.sqrt( arg ),
	[ typeNumber ],
	typeNumber
);
export const absFunc = new ExpressionFunction(
	( arg: number ) => Math.abs( arg ),
	[ typeNumber ],
	typeNumber
);
export const ceilFunc = new ExpressionFunction(
	( arg: number ) => Math.ceil( arg ),
	[ typeNumber ],
	typeNumber
);
export const floorFunc = new ExpressionFunction(
	( arg: number ) => Math.floor( arg ),
	[ typeNumber ],
	typeNumber
);
export const roundFunc = new ExpressionFunction(
	( arg: number ) => Math.round( arg ),
	[ typeNumber ],
	typeNumber
);
export const maxFunc = new ExpressionFunction(
	( ...args: ( number | number[] )[] ) => Math.max( ...args.flat() ),
	[ new ExpressionType( [ 'number', 'number[]' ] ) ],
	typeNumber
);
export const minFunc = new ExpressionFunction(
	( ...args: ( number | number[] )[] ) => Math.min( ...args.flat() ),
	[ new ExpressionType( [ 'number', 'number[]' ] ) ],
	typeNumber
);
export const lenFunc = new ExpressionFunction(
	( arg: string | boolean[] | number [] | string[] ) => arg.length,
	[ new ExpressionType( [ 'string', 'boolean[]', 'number[]', 'string[]' ] ) ],
	typeNumber
);
export const trimFunc = new ExpressionFunction(
	( arg: string ) => arg.trim(),
	[ typeString ],
	typeString
);
export const lowercaseFunc = new ExpressionFunction(
	( arg: string ) => arg.toLowerCase(),
	[ typeString ],
	typeString
);
export const uppercaseFunc = new ExpressionFunction(
	( arg: string ) => arg.toUpperCase(),
	[ typeString ],
	typeString
);
export const substrFunc = new ExpressionFunction(
	( arg: string, ...args: number[] ) => arg.substring( args[ 0 ], args[ 1 ] ),
	[ typeString, typeNumber ],
	typeString
);
export const concatFunc = new ExpressionFunction(
	( ...args: ( boolean | boolean[] )[] | ( number | number[] )[] | ( string | string[] )[] | ( ExpressionObjectType | ExpressionObjectType[] )[] ) =>
		args.flat() as ExpressionValueType,
	[ typeAny ],
	typeBooleanNumberStringObjectArray,
	inferenceByConstituency
);
export const atFunc = new ExpressionFunction(
	( arg1: string | ExpressionObjectType | boolean[] | number [] | string[] | ExpressionObjectType[], arg2: number | string ) =>
		typeof arg1 === 'string' ? arg1.charAt( arg2 as number ) : Array.isArray( arg1 ) ? arg1[ arg2 as number ] : arg1[ arg2 ],
	[ new ExpressionType( [ 'string', 'object', 'boolean[]', 'number[]', 'string[]', 'object[]' ] ), new ExpressionType( [ 'number', 'string' ] ) ],
	typeAny,
	( ix: number, type: ExpressionType, mask: ExpressionType ) =>
		ix > 0 ? type : type.filter( tn => tn === 'object' || mask.anyone( mtn => mtn.split( '[]' )[ 0 ] === tn.split( '[]' )[ 0 ] ) )
);
