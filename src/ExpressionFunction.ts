export class ExprFunction {

	constructor(
		protected _exec: ( ...values: any[] ) => boolean | number | string,
		protected _argTypes: ( 'boolean' | 'number' | 'string' | undefined )[],
		protected _type: 'boolean' | 'number' | 'string',
	) {}

	oper(): ExprFunction {
		return new ExprFunction( this._exec, this._argTypes, this._type );
	}

	exec( ...values: any[] ): boolean | number | string {
		return this._exec( ...values );
	}

	getArgType( ix: number ): 'boolean' | 'number' | 'string' | undefined {
		return this._argTypes[ ix ] ?? this._argTypes.slice( -1 )[ 0 ];
	}

	get arity(): number {
		return this._argTypes.length;
	}

	get type(): 'boolean' | 'number' | 'string' {
		return this._type;
	}

}

export const orFunc = new ExprFunction( ( value1: boolean, value2: boolean ) => value1 || value2, [ 'boolean', 'boolean' ], 'boolean' );
export const andFunc = new ExprFunction( ( value1: boolean, value2: boolean ) => value1 && value2, [ 'boolean', 'boolean' ], 'boolean' );
export const notFunc = new ExprFunction( ( value: boolean ) => !value, [ 'boolean' ], 'boolean' );
export const gtFunc = new ExprFunction( ( value1: number, value2: number ) => value1 > value2, [ 'number', 'number' ], 'boolean' );
export const ltFunc = new ExprFunction( ( value1: number, value2: number ) => value1 < value2, [ 'number', 'number' ], 'boolean' );
export const geFunc = new ExprFunction( ( value1: number, value2: number ) => value1 >= value2, [ 'number', 'number' ], 'boolean' );
export const leFunc = new ExprFunction( ( value1: number, value2: number ) => value1 <= value2, [ 'number', 'number' ], 'boolean' );
export const eqFunc = new ExprFunction( ( value1: boolean | number | string, value2: boolean | number | string ) => value1 === value2,
	[ undefined, undefined ], 'boolean' );
export const neFunc = new ExprFunction( ( value1: boolean | number | string, value2: boolean | number | string ) => value1 !== value2,
	[ undefined, undefined ], 'boolean' );
export const likeFunc = new ExprFunction( ( value1: string, value2: string ) => value1.toLowerCase() === value2.toLowerCase(),
	[ 'string', 'string' ], 'boolean' );
export const unlikeFunc = new ExprFunction( ( value1: string, value2: string ) => value1.toLowerCase() !== value2.toLowerCase(),
	[ 'string', 'string' ], 'boolean' );
export const beginofFunc = new ExprFunction( ( value1: string, value2: string ) => value2.startsWith( value1 ), [ 'string', 'string' ], 'boolean' );
export const endofFunc = new ExprFunction( ( value1: string, value2: string ) => value2.endsWith( value1 ), [ 'string', 'string' ], 'boolean' );
export const partofFunc = new ExprFunction( ( value1: string, value2: string ) => value2.includes( value1 ), [ 'string', 'string' ], 'boolean' );
export const addFunc = new ExprFunction( ( value1: number, value2: number ) => value1 + value2, [ 'number', 'number' ], 'number' );
export const subFunc = new ExprFunction( ( value1: number, value2: number ) => value1 - value2, [ 'number', 'number' ], 'number' );
export const negFunc = new ExprFunction( ( value: number ) => -value, [ 'number' ], 'number' );
export const mulFunc = new ExprFunction( ( value1: number, value2: number ) => value1 * value2, [ 'number', 'number' ], 'number' );
export const divFunc = new ExprFunction( ( value: number, div: number ) => value / div, [ 'number', 'number' ], 'number' );
export const remFunc = new ExprFunction( ( value: number, div: number ) => value % div, [ 'number', 'number' ], 'number' );
export const modFunc = new ExprFunction( ( value: number, div: number ) => ( ( value % div ) + div ) % div, [ 'number', 'number' ], 'number' );
export const pctFunc = new ExprFunction( ( value: number, div: number ) => Math.round( 100 * value / div ), [ 'number', 'number' ], 'number' );
export const expFunc = new ExprFunction( ( value: number ) => Math.exp( value ), [ 'number' ], 'number' );
export const logFunc = new ExprFunction( ( value: number ) => Math.log( value ), [ 'number' ], 'number' );
export const powFunc = new ExprFunction( ( value: number, exp: number ) => Math.pow( value, exp ), [ 'number', 'number' ], 'number' );
export const rtFunc = new ExprFunction( ( value: number, exp: number ) => Math.pow( value, 1 / exp ), [ 'number', 'number' ], 'number' );
export const sqFunc = new ExprFunction( ( value: number ) => value * value, [ 'number' ], 'number' );
export const sqrtFunc = new ExprFunction( ( value: number ) => Math.sqrt( value ), [ 'number' ], 'number' );
export const absFunc = new ExprFunction( ( value: number ) => Math.abs( value ), [ 'number' ], 'number' );
export const ceilFunc = new ExprFunction( ( value: number ) => Math.ceil( value ), [ 'number' ], 'number' );
export const floorFunc = new ExprFunction( ( value: number ) => Math.floor( value ), [ 'number' ], 'number' );
export const roundFunc = new ExprFunction( ( value: number ) => Math.round( value ), [ 'number' ], 'number' );
export const maxFunc = new ExprFunction( ( ...values: number[] ) => Math.max( ...values ), [ 'number', 'number' ], 'number' );
export const minFunc = new ExprFunction( ( ...values: number[] ) => Math.min( ...values ), [ 'number', 'number' ], 'number' );
export const lenFunc = new ExprFunction( ( value: string ) => value.length, [ 'string' ], 'number' );
export const substrFunc = new ExprFunction( ( value: string, ...args: number[] ) => value.substring( args[ 0 ], args[ 1 ] ), [ 'string', 'number' ], 'string' );
