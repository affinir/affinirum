export type ExpressionObjectType = Record<string, boolean | number | string | boolean[] | number[] | string[]>;
export type ExpressionValueType = boolean | number | string | boolean[] | number[] | string[] | ExpressionObjectType | ExpressionObjectType[];
export type ExpressionValueTypename = 'boolean' | 'number' | 'string' | 'boolean[]' | 'number[]' | 'string[]' | 'object' | 'object[]';

export class ExpressionType {

	constructor(
		protected _typenames: ExpressionValueTypename[]
	) {}

	get exact(): boolean {
		return this._typenames.length === 1;
	}

	get invalid(): boolean {
		return this._typenames.length === 0;
	}

	infer( type: ExpressionType ): ExpressionType {
		return new ExpressionType( this._typenames.filter( tn => type._typenames.includes( tn ) ) );
	}

	filter( fn: ( tn: ExpressionValueTypename ) => boolean ): ExpressionType {
		return new ExpressionType( this._typenames.filter( fn ) );
	}

	anyone( fn: ( tn: ExpressionValueTypename ) => boolean ): boolean {
		return this._typenames.some( fn );
	}

	toString(): string {
		return this.invalid ? 'invalid' : this._typenames.join( '|' );
	}

	static of( value: ExpressionValueType ): ExpressionType {
		const vt = Array.isArray( value ) ? typeof value[ 0 ] + '[]' : typeof value;
		return new ExpressionType( [ vt as ExpressionValueTypename ] );
	}

	static equate( value1: ExpressionValueType, value2: ExpressionValueType ): boolean {
		return value1 === value2; // TODO
	}

}

export const typeBoolean = new ExpressionType( [ 'boolean' ] );
export const typeNumber = new ExpressionType( [ 'number' ] );
export const typeString = new ExpressionType( [ 'string' ] );
export const typeObject = new ExpressionType( [ 'object' ] );
export const typeBooleanNumberStringObject = new ExpressionType( [ 'boolean', 'number', 'string', 'object' ] );
export const typeBooleanArray = new ExpressionType( [ 'boolean[]' ] );
export const typeNumberArray = new ExpressionType( [ 'number[]' ] );
export const typeStringArray = new ExpressionType( [ 'string[]' ] );
export const typeObjectArray = new ExpressionType( [ 'object[]' ] );
export const typeBooleanNumberStringObjectArray = new ExpressionType( [ 'boolean[]', 'number[]', 'string[]', 'object[]' ] );
export const typeAny = new ExpressionType( [ 'boolean', 'number', 'string', 'object', 'boolean[]', 'number[]', 'string[]', 'object[]' ] );
export const inferenceByConstituency = ( ix: number, type: ExpressionType, mask: ExpressionType ) =>
	type.filter( tn => mask.anyone( mtn => mtn.split( '[]' )[ 0 ] === tn.split( '[]' )[ 0 ] ) );
