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

	or( fn: ( tn: ExpressionValueTypename ) => boolean ): boolean {
		return this._typenames.some( fn );
	}

	and( fn: ( tn: ExpressionValueTypename ) => boolean ): boolean {
		return this._typenames.every( fn );
	}

	toElement(): ExpressionType {
		return new ExpressionType( this._typenames.map( tn => tn.slice( 0, -2 ) ) as ExpressionValueTypename[] );
	}

	toArray(): ExpressionType {
		return new ExpressionType( this._typenames.map( tn => tn + '[]' ) as ExpressionValueTypename[] );
	}

	toString(): string {
		return this.invalid ? 'invalid' : this._typenames.join( '|' );
	}

	static of( value: ExpressionValueType ): ExpressionType {
		const tn = Array.isArray( value ) ? ExpressionType.of( value[ 0 ] ) + '[]' : typeof value;
		return new ExpressionType( [ tn as ExpressionValueTypename ] );
	}

	static equate( value1: ExpressionValueType, value2: ExpressionValueType ): boolean {
		if ( typeof value1 === 'boolean' || typeof value1 === 'number' || typeof value1 === 'string' ) {
			return value1 === value2;
		}
		if ( Array.isArray( value1 ) && Array.isArray( value2 ) ) {
			if ( value1.length === value2.length ) {
				for ( let i = 0; i < value1.length; ++i ) {
					if ( ExpressionType.equate( value1[ i ], value2[ i ] ) ) {
						return false;
					}
				}
				return true;
			}
			return false;
		}
		const props = new Set( [ ...Object.getOwnPropertyNames( value1 ), ...Object.getOwnPropertyNames( value2 ) ] );
		for ( let p of props ) {
			if ( ( value1 as any )[ p ] !== ( value2 as any )[ p ] ) {
				return false;
			}
		}
		return true;
	}

}

export const typeBoolean = new ExpressionType( [ 'boolean' ] );
export const typeNumber = new ExpressionType( [ 'number' ] );
export const typeString = new ExpressionType( [ 'string' ] );
export const typeObject = new ExpressionType( [ 'object' ] );
export const typeAnyElement = new ExpressionType( [ 'boolean', 'number', 'string', 'object' ] );
export const typeBooleanArray = new ExpressionType( [ 'boolean[]' ] );
export const typeNumberArray = new ExpressionType( [ 'number[]' ] );
export const typeStringArray = new ExpressionType( [ 'string[]' ] );
export const typeObjectArray = new ExpressionType( [ 'object[]' ] );
export const typeAnyArray = new ExpressionType( [ 'boolean[]', 'number[]', 'string[]', 'object[]' ] );
export const typeAny = new ExpressionType( [ 'boolean', 'number', 'string', 'object', 'boolean[]', 'number[]', 'string[]', 'object[]' ] );
export const inferenceByConstituency = ( ix: number, type: ExpressionType, mask: ExpressionType ) =>
	type.filter( tn => mask.or( mtn => mtn.split( '[]' )[ 0 ] === tn.split( '[]' )[ 0 ] ) );
