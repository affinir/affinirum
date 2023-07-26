export class ExpressionFunction {

	constructor(
		protected _func: ( ...values: any[] ) => boolean | number | string,
		protected _argTypes: ( 'boolean' | 'number' | 'string' | undefined )[],
		protected _type: 'boolean' | 'number' | 'string',
	) {}

	clone(): ExpressionFunction {
		return new ExpressionFunction( this._func, this._argTypes, this._type );
	}

	func( ...values: any[] ): boolean | number | string {
		return this._func( ...values );
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

export const orFunc = new ExpressionFunction(
	( value1: boolean, value2: boolean ) => value1 || value2,
	[ 'boolean', 'boolean' ], 'boolean'
);
export const andFunc = new ExpressionFunction(
	( value1: boolean, value2: boolean ) => value1 && value2,
	[ 'boolean', 'boolean' ], 'boolean'
);
export const notFunc = new ExpressionFunction(
	( value: boolean ) => !value,
	[ 'boolean' ], 'boolean'
);
export const gtFunc = new ExpressionFunction(
	( value1: number, value2: number ) => value1 > value2,
	[ 'number', 'number' ], 'boolean'
);
export const ltFunc = new ExpressionFunction(
	( value1: number, value2: number ) => value1 < value2,
	[ 'number', 'number' ], 'boolean'
);
export const geFunc = new ExpressionFunction(
	( value1: number, value2: number ) => value1 >= value2,
	[ 'number', 'number' ], 'boolean'
);
export const leFunc = new ExpressionFunction(
	( value1: number, value2: number ) => value1 <= value2,
	[ 'number', 'number' ], 'boolean'
);
export const eqFunc = new ExpressionFunction(
	( value1: boolean | number | string, value2: boolean | number | string ) => value1 === value2,
	[ undefined, undefined ], 'boolean'
);
export const neFunc = new ExpressionFunction(
	( value1: boolean | number | string, value2: boolean | number | string ) => value1 !== value2,
	[ undefined, undefined ], 'boolean'
);
export const likeFunc = new ExpressionFunction(
	( value1: string, value2: string ) => value1.toLowerCase() === value2.toLowerCase(),
	[ 'string', 'string' ], 'boolean'
);
export const unlikeFunc = new ExpressionFunction(
	( value1: string, value2: string ) => value1.toLowerCase() !== value2.toLowerCase(),
	[ 'string', 'string' ], 'boolean'
);
export const beginofFunc = new ExpressionFunction(
	( value1: string, value2: string ) => value2.startsWith( value1 ),
	[ 'string', 'string' ], 'boolean'
);
export const endofFunc = new ExpressionFunction(
	( value1: string, value2: string ) => value2.endsWith( value1 ),
	[ 'string', 'string' ], 'boolean'
);
export const partofFunc = new ExpressionFunction(
	( value1: string, value2: string ) => value2.includes( value1 ),
	[ 'string', 'string' ], 'boolean'
);
export const addFunc = new ExpressionFunction(
	( value1: number, value2: number ) => value1 + value2,
	[ 'number', 'number' ], 'number'
);
export const subFunc = new ExpressionFunction(
	( value1: number, value2: number ) => value1 - value2,
	[ 'number', 'number' ], 'number'
);
export const negFunc = new ExpressionFunction(
	( value: number ) => -value,
	[ 'number' ], 'number'
);
export const mulFunc = new ExpressionFunction(
	( value1: number, value2: number ) => value1 * value2,
	[ 'number', 'number' ], 'number'
);
export const divFunc = new ExpressionFunction(
	( value: number, div: number ) => value / div,
	[ 'number', 'number' ], 'number'
);
export const remFunc = new ExpressionFunction(
	( value: number, div: number ) => value % div,
	[ 'number', 'number' ], 'number'
);
export const modFunc = new ExpressionFunction(
	( value: number, div: number ) => ( ( value % div ) + div ) % div,
	[ 'number', 'number' ], 'number'
);
export const pctFunc = new ExpressionFunction(
	( value: number, div: number ) => Math.round( 100 * value / div ),
	[ 'number', 'number' ], 'number'
);
export const expFunc = new ExpressionFunction(
	( value: number ) => Math.exp( value ),
	[ 'number' ], 'number'
);
export const logFunc = new ExpressionFunction(
	( value: number ) => Math.log( value ),
	[ 'number' ], 'number'
);
export const powFunc = new ExpressionFunction(
	( value: number, exp: number ) => Math.pow( value, exp ),
	[ 'number', 'number' ], 'number'
);
export const rtFunc = new ExpressionFunction(
	( value: number, exp: number ) => Math.pow( value, 1 / exp ),
	[ 'number', 'number' ], 'number'
);
export const sqFunc = new ExpressionFunction(
	( value: number ) => value * value,
	[ 'number' ], 'number'
);
export const sqrtFunc = new ExpressionFunction(
	( value: number ) => Math.sqrt( value ),
	[ 'number' ], 'number'
);
export const absFunc = new ExpressionFunction(
	( value: number ) => Math.abs( value ),
	[ 'number' ], 'number'
);
export const ceilFunc = new ExpressionFunction(
	( value: number ) => Math.ceil( value ),
	[ 'number' ], 'number'
);
export const floorFunc = new ExpressionFunction(
	( value: number ) => Math.floor( value ),
	[ 'number' ], 'number'
);
export const roundFunc = new ExpressionFunction(
	( value: number ) => Math.round( value ),
	[ 'number' ], 'number'
);
export const maxFunc = new ExpressionFunction(
	( ...values: number[] ) => Math.max( ...values ),
	[ 'number', 'number' ], 'number'
);
export const minFunc = new ExpressionFunction(
	( ...values: number[] ) => Math.min( ...values ),
	[ 'number', 'number' ], 'number'
);
export const lenFunc = new ExpressionFunction(
	( value: string ) => value.length,
	[ 'string' ], 'number'
);
export const substrFunc = new ExpressionFunction(
	( value: string, ...args: number[] ) => value.substring( args[ 0 ], args[ 1 ] ),
	[ 'string', 'number' ], 'string'
);
