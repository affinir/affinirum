import { ExpressionConstant } from './ExpressionConstant.js';
import { ExpressionFunction } from './ExpressionFunction.js';
import { operOr, operAnd, operNot, operGt, operLt, operGe, operLe, operEqual, operNotEqual, operLike, operNotLike,
	operNullco, operAdd, operSub, operMul, operDiv, operPct, operPow, operConcat, operAt, operBy, operJoin } from './ExpressionOperator.js';
import { ExpressionType, typeBoolean, typeNumber, typeString, typeObject, typeFunction, typeVar, typeArray } from './ExpressionType.js';

const symbolParenthesesOpen = Symbol();
const symbolParenthesesClose = Symbol();
const symbolBracketsOpen = Symbol();
const symbolBracketsClose = Symbol();
const symbolBracesOpen = Symbol();
const symbolBracesClose = Symbol();
const symbolAssignment = Symbol();
const symbolSeparator = Symbol();
const symbolScope = Symbol();
const symbolNullable = Symbol();

export class ExpressionState {

	protected _obj: ExpressionConstant | ExpressionFunction | ExpressionType | string | symbol | undefined;
	protected _pos = 0;
	protected _next = 0;

	constructor(
		protected readonly _expr: string,
	) {}

	get pos(): number {
		return this._pos;
	}

	get constant(): ExpressionConstant {
		return this._obj as ExpressionConstant;
	}

	get operator(): ExpressionFunction {
		return this._obj as ExpressionFunction;
	}

	get type(): ExpressionType {
		return this._obj as ExpressionType;
	}

	get token(): string {
		return this._obj as string;
	}

	get isConstant(): boolean {
		return this._obj instanceof ExpressionConstant;
	}

	get isOperator(): boolean {
		return this._obj instanceof ExpressionFunction;
	}

	get isType(): boolean {
		return this._obj instanceof ExpressionType;
	}

	get isToken(): boolean {
		return typeof this._obj === 'string';
	}

	get isParenthesesOpen(): boolean {
		return this._obj === symbolParenthesesOpen;
	}

	get isParenthesesClose(): boolean {
		return this._obj === symbolParenthesesClose;
	}

	get isBracketsOpen(): boolean {
		return this._obj === symbolBracketsOpen;
	}

	get isBracketsClose(): boolean {
		return this._obj === symbolBracketsClose;
	}

	get isBracesOpen(): boolean {
		return this._obj === symbolBracesOpen;
	}

	get isBracesClose(): boolean {
		return this._obj === symbolBracesClose;
	}

	get isAssignment(): boolean {
		return this._obj === symbolAssignment;
	}

	get isSeparator(): boolean {
		return this._obj === symbolSeparator;
	}

	get isScope(): boolean {
		return this._obj === symbolScope;
	}

	get isNullable(): boolean {
		return this._obj === symbolNullable;
	}

	next(): ExpressionState {
		while ( this._next < this._expr.length ) {
			this._obj = undefined;
			this._pos = this._next;
			const c = this._expr.charAt( this._pos );
			++this._next;
			switch ( c ) {
				case ' ': case '\t': case '\n': case '\r': break;
				case '(': this._obj = symbolParenthesesOpen; return this;
				case ')': this._obj = symbolParenthesesClose; return this;
				case '[': this._obj = symbolBracketsOpen; return this;
				case ']': this._obj = symbolBracketsClose; return this;
				case '{': this._obj = symbolBracesOpen; return this;
				case '}': this._obj = symbolBracesClose; return this;
				case ':': this._obj = symbolAssignment; return this;
				case ',': this._obj = symbolSeparator; return this;
				case '?': switch ( this._expr.charAt( this._next ) ) {
					case '=': ++this._next; this._obj = operNullco; return this;
					default: this._obj = symbolNullable; return this;
				}
				case '|': this._obj = operOr; return this;
				case '&': this._obj = operAnd; return this;
				case '>': switch ( this._expr.charAt( this._next ) ) {
					case '=': ++this._next; this._obj = operGe; return this;
					default: this._obj = operGt; return this;
				}
				case '<': switch ( this._expr.charAt( this._next ) ) {
					case '=': ++this._next; this._obj = operLe; return this;
					default: this._obj = operLt; return this;
				}
				case '!': switch ( this._expr.charAt( this._next ) ) {
					case '=': ++this._next; this._obj = operNotEqual; return this;
					case '~': ++this._next; this._obj = operNotLike; return this;
					default: this._obj = operNot; return this;
				}
				case '=': switch ( this._expr.charAt( this._next ) ) {
					case '>': ++this._next; this._obj = symbolScope; return this;
					default: this._obj = operEqual; return this;
				}
				case '~': this._obj = operLike; return this;
				case '+': this._obj = operAdd; return this;
				case '-': this._obj = operSub; return this;
				case '*': this._obj = operMul; return this;
				case '/': this._obj = operDiv; return this;
				case '%': this._obj = operPct; return this;
				case '^': this._obj = operPow; return this;
				case '#': this._obj = operConcat; return this;
				case '@': this._obj = operAt; return this;
				case '$': this._obj = operJoin; return this;
				case '.': this._obj = operBy; return this;
				default:
					if ( ExpressionState.isAlpha( c ) ) {
						while ( ExpressionState.isAlphanumeric( this._expr.charAt( this._next ) ) ) {
							++this._next;
						}
						const token = this._expr.substring( this._pos, this._next );
						switch ( token ) {
							case 'boolean': this._obj = typeBoolean; break;
							case 'number': this._obj = typeNumber; break;
							case 'string': this._obj = typeString; break;
							case 'array': this._obj = typeArray; break;
							case 'object': this._obj = typeObject; break;
							case 'function': this._obj = typeFunction; break;
							case 'var': this._obj = typeVar; break;
							default: this._obj = token; break;
						}
						return this;
					}
					else if ( ExpressionState.isNumeric( c ) ) {
						while ( ExpressionState.isDecinumeric( this._expr.charAt( this._next ) ) ) {
							++this._next;
						}
						this._obj = new ExpressionConstant( parseFloat( this._expr.substring( this._pos, this._next ) ) );
						return this;
					}
					else if ( ExpressionState.isQuotation( c ) ) {
						const pos = this._next;
						while ( this._expr.charAt( this._next ) !== '' && this._expr.charAt( this._next ) !== c ) {
							++this._next;
						}
						this._obj = new ExpressionConstant( this._expr.substring( pos, this._next++ ) );
						return this;
					}
					throw new Error( `unknown symbol ${ c }` );
			}
		}
		if ( this._next++ > this._expr.length ) {
			throw new Error( `unexpected end of expression` );
		}
		return this;
	}

	static isAlpha = ( c: string ) => ( c >= 'a' && c <= 'z' ) || ( c >= 'A' && c <= 'Z' ) || ( c === '_' );
	static isNumeric = ( c: string ) => ( c >= '0' && c <= '9' );
	static isAlphanumeric = ( c: string ) => ExpressionState.isAlpha( c ) || ExpressionState.isNumeric( c );
	static isDecinumeric = ( c: string ) => ( c === '.' ) || ExpressionState.isNumeric( c );
	static isQuotation = ( c: string ) => ( c === '\'' || c === '\"' || c === '\`' );

}
