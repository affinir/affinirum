export type ExpressionValue = undefined | boolean | number | string |
	ExpressionValue[] | { [ key: string ]: ExpressionValue } | ( ( ...args: ExpressionValue[] ) => ExpressionValue );
type ExpressionValueType = 'null' | 'boolean' | 'number' | 'string' | 'array' | 'object' | 'function';

export class ExpressionType {

	protected _vtypes: ExpressionValueType[];

	constructor(
		...args: ExpressionValueType[]
	) {
		this._vtypes = args.length ? Array.from( new Set( args ) ) : [ 'null', 'boolean', 'number', 'string', 'array', 'object', 'function' ];
	}

	get exact(): boolean {
		return this._vtypes.length === 1;
	}

	get isBoolean(): boolean {
		return this.exact && this._vtypes[ 0 ] === 'boolean';
	}

	get isNumber(): boolean {
		return this.exact && this._vtypes[ 0 ] === 'number';
	}

	get isString(): boolean {
		return this.exact && this._vtypes[ 0 ] === 'string';
	}

	get isArray(): boolean {
		return this.exact && this._vtypes[ 0 ] === 'array';
	}

	get isObject(): boolean {
		return this.exact && this._vtypes[ 0 ] === 'object';
	}

	get isFunction(): boolean {
		return this.exact && this._vtypes[ 0 ] === 'function';
	}

	infer( mask: ExpressionType, func = ( vtype: string, vmask: string ) => vtype === vmask ): ExpressionType | undefined {
		const vtypes = this._vtypes.filter( vtype => mask._vtypes.some( mvtype => func( vtype, mvtype ) ) ) as ExpressionValueType[];
		return vtypes.length ? new ExpressionType( ...vtypes ) : undefined;
	}

	toNullable(): ExpressionType {
		return new ExpressionType( 'null', ...this._vtypes as ExpressionValueType[] );
	}

	toString(): string {
		return this._vtypes.join( '|' );
	}

	static of( value: ExpressionValue ): ExpressionType {
		const vtype = value == null ? 'null' : Array.isArray( value ) ? 'array' : typeof value;
		return new ExpressionType( vtype as ExpressionValueType );
	}

	static equal( value1: ExpressionValue, value2: ExpressionValue ): boolean {
		if ( value1 == null || value2 == null ) {
			return value1 == value2;
		}
		if ( typeof value1 === 'boolean' || typeof value1 === 'number' || typeof value1 === 'string' || typeof value1 === 'function' ) {
			return value1 === value2;
		}
		if ( Array.isArray( value1 ) && Array.isArray( value2 ) ) {
			if ( value1.length === value2.length ) {
				for ( let i = 0; i < value1.length; ++i ) {
					if ( !ExpressionType.equal( value1[ i ], value2[ i ] ) ) {
						return false;
					}
				}
				return true;
			}
			return false;
		}
		const props = new Set( [ ...Object.getOwnPropertyNames( value1 ), ...Object.getOwnPropertyNames( value2 ) ] );
		for ( const prop of props ) {
			if ( !ExpressionType.equal( ( value1 as any )[ prop ], ( value2 as any )[ prop ] ) ) {
				return false;
			}
		}
		return true;
	}

	static equalStrings( value1: string, value2: string, ignoreCaseSpaceEtc?: boolean ): boolean {
		if ( !ignoreCaseSpaceEtc ) {
			return value1 === value2;
		}
		const str1 = value1.toLowerCase();
		const str2 = value2.toLowerCase();
		for ( let i1 = 0, i2 = 0; i1 < str1.length && i2 < str2.length; ++i1, ++i2 ) {
			while ( ExpressionType.isCaseSpaceEtc( str1[ i1 ] ) && i1 < str1.length ) {
				++i1;
			}
			while ( ExpressionType.isCaseSpaceEtc( str2[ i2 ] ) && i2 < str2.length ) {
				++i2;
			}
			if ( str1[ i1 ] != str2[ i2 ] ) {
				return false;
			}
		}
		return true;
	}

	static containsString( value: string, search: string, startPos?: number, ignoreCaseSpaceEtc?: boolean ): boolean {
		if ( !ignoreCaseSpaceEtc ) {
			return value.includes( search, startPos );
		}
		const valueStr = value.toLowerCase();
		const searchStr = search.toLowerCase();
		if ( valueStr.length < searchStr.length ) {
			return false;
		}
		const pos = startPos == null ? 0 : startPos < 0 ? value.length + startPos : startPos;
		for ( let i1 = pos, i2 = 0; i1 < valueStr.length && i2 < searchStr.length; ++i1, ++i2 ) {
			while ( ExpressionType.isCaseSpaceEtc( valueStr[ i1 ] ) && i1 < valueStr.length ) {
				++i1;
			}
			while ( ExpressionType.isCaseSpaceEtc( searchStr[ i2 ] ) && i2 < searchStr.length ) {
				++i2;
			}
			while ( valueStr[ i1 ] != searchStr[ i2 ] && i1 < valueStr.length ) {
				++i1;
			}
			if ( valueStr[ i1 ] != searchStr[ i2 ] && i2 < searchStr.length ) {
				return false;
			}
		}
		return true;
	}

	static startsWithString( value: string, search: string, startPos?: number, ignoreCaseSpaceEtc?: boolean ): boolean {
		if ( !ignoreCaseSpaceEtc ) {
			return value.startsWith( search, startPos );
		}
		const valueStr = value.toLowerCase();
		const searchStr = search.toLowerCase();
		if ( valueStr.length < searchStr.length ) {
			return false;
		}
		const pos = startPos == null ? 0 : startPos < 0 ? value.length + startPos : startPos;
		for ( let i1 = pos, i2 = 0; i1 < valueStr.length && i2 < searchStr.length; ++i1, ++i2 ) {
			while ( ExpressionType.isCaseSpaceEtc( valueStr[ i1 ] ) && i1 < valueStr.length ) {
				++i1;
			}
			while ( ExpressionType.isCaseSpaceEtc( searchStr[ i2 ] ) && i2 < searchStr.length ) {
				++i2;
			}
			if ( valueStr[ i1 ] != searchStr[ i2 ] && i2 < searchStr.length ) {
				return false;
			}
		}
		return true;
	}

	static endsWithString( value: string, search: string, endPos?: number, ignoreCaseSpaceEtc?: boolean ): boolean {
		if ( !ignoreCaseSpaceEtc ) {
			return value.endsWith( search, endPos );
		}
		const valueStr = value.toLowerCase();
		const searchStr = search.toLowerCase();
		if ( valueStr.length < searchStr.length ) {
			return false;
		}
		const pos = endPos == null ? valueStr.length : endPos < 0 ? value.length + endPos : endPos;
		for ( let i1 = pos - 1, i2 = searchStr.length - 1; i1 > -1 && i2 > -1; --i1, --i2 ) {
			while ( ExpressionType.isCaseSpaceEtc( valueStr[ i1 ] ) && i1 > -1 ) {
				--i1;
			}
			while ( ExpressionType.isCaseSpaceEtc( searchStr[ i2 ] ) && i2 > -1 ) {
				--i2;
			}
			if ( valueStr[ i1 ] != searchStr[ i2 ] && i2 > -1 ) {
				return false;
			}
		}
		return true;
	}

	static isCaseSpaceEtc = ( c: string ) => ( c < 'a' || c > 'z' ) && ( c < '0' || c > '9' );

}

export const typeBoolean = new ExpressionType( 'boolean' );
export const typeNumber = new ExpressionType( 'number' );
export const typeString = new ExpressionType( 'string' );
export const typeArray = new ExpressionType( 'array' );
export const typeObject = new ExpressionType( 'object' );
export const typeFunction = new ExpressionType( 'function' );
export const typeOptionalBoolean = new ExpressionType( 'null', 'boolean' );
export const typeOptionalNumber = new ExpressionType( 'null', 'number' );
export const typeOptionalString = new ExpressionType( 'null', 'string' );
export const typeOptionalArray = new ExpressionType( 'null', 'array' );
export const typeOptionalObject = new ExpressionType( 'null', 'object' );
export const typeOptionalFunction = new ExpressionType( 'null', 'function' );
export const typeVar = new ExpressionType();
