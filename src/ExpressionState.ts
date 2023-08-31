import { ExpressionConstant } from './ExpressionConstant.js';
import { ExpressionFunction } from './ExpressionFunction.js';
import { ExpressionVariable } from './ExpressionVariable.js';
import { operOr, operAnd, operNot, operGt, operLt, operGe, operLe, operEq, operNe,
	operLike, operUnlike, operBeginof, operEndof, operPartof,
	operAdd, operSub, operNeg, operMul, operDiv, operPct, operPow, operConcat } from './ExpressionOperator.js';

const bracketsOpenSymbol = Symbol();
const bracketsCloseSymbol = Symbol();
const parenthesesOpenSymbol = Symbol();
const parenthesesCloseSymbol = Symbol();
const separatorSymbol = Symbol();
const indexerSymbol = Symbol();

export class ExpressionState {

	protected _obj: ExpressionConstant | ExpressionFunction | string | symbol | undefined;
	protected _pos = 0;
	protected _next = 0;

	constructor(
		protected _constants: Map<string, ExpressionConstant>,
		protected _functions: Map<string, ExpressionFunction>,
		protected readonly _expr: string
	) {}

	get pos(): number {
		return this._pos;
	}

	get constant(): ExpressionConstant {
		return this._obj as ExpressionConstant;
	}

	get func(): ExpressionFunction {
		return this._obj as ExpressionFunction;
	}

	get token(): string {
		return this._obj as string;
	}

	get isConstant(): boolean {
		return this._obj instanceof ExpressionConstant;
	}

	get isFunction(): boolean {
		return this._obj instanceof ExpressionFunction;
	}

	get isToken(): boolean {
		return typeof this._obj === 'string';
	}

	get isBracketsOpen(): boolean {
		return this._obj === bracketsOpenSymbol;
	}

	get isBracketsClose(): boolean {
		return this._obj === bracketsCloseSymbol;
	}

	get isParenthesesOpen(): boolean {
		return this._obj === parenthesesOpenSymbol;
	}

	get isParenthesesClose(): boolean {
		return this._obj === parenthesesCloseSymbol;
	}

	get isSeparator(): boolean {
		return this._obj === separatorSymbol;
	}

	get isIndexer(): boolean {
		return this._obj === indexerSymbol;
	}

	next(): ExpressionState {
		while ( this._next < this._expr.length ) {
			this._obj = undefined;
			this._pos = this._next;
			const c = this._expr.charAt(  this._pos );
			this._next++;
			switch ( c ) {
				case ' ': case '\t': case '\n': case '\r': break;
				case '[': this._obj = bracketsOpenSymbol; return this;
				case ']': this._obj = bracketsCloseSymbol; return this;
				case '(': this._obj = parenthesesOpenSymbol; return this;
				case ')': this._obj = parenthesesCloseSymbol; return this;
				case ',': this._obj = separatorSymbol; return this;
				case '.': this._obj = indexerSymbol; return this;
				case '|': this._obj = operOr; return this;
				case '&': this._obj = operAnd; return this;
				case '!': switch ( this._expr.charAt( this._next ) ) {
					case '=': this._next++; this._obj = operNe; return this;
					case '~': this._next++; this._obj = operUnlike; return this;
					default: this._obj = operNot; return this;
				}
				case '=': switch ( this._expr.charAt( this._next ) ) {
					case '*': this._next++; this._obj = operBeginof; return this;
					case '=': this._next++; this._obj = operEq; return this;
					default: this._obj = operEq; return this;
				}
				case '>': switch ( this._expr.charAt( this._next ) ) {
					case '=': this._next++; this._obj = operGe; return this;
					default: this._obj = operGt; return this;
				}
				case '<': switch ( this._expr.charAt( this._next ) ) {
					case '=': this._next++; this._obj = operLe; return this;
					default: this._obj = operLt; return this;
				}
				case '+': this._obj = operAdd; return this;
				case '-': this._obj = operSub; return this;
				case '*': switch ( this._expr.charAt( this._next ) ) {
					case '=': this._next++; this._obj = operEndof; return this;
					case '*': this._next++; this._obj = operPartof; return this;
					default: this._obj = operMul; return this;
				}
				case '~': this._obj = operLike; return this;
				case '/': this._obj = operDiv; return this;
				case '%': this._obj = operPct; return this;
				case '^': this._obj = operPow; return this;
				case '#': this._obj = operConcat; return this;
				default:
					if ( ExpressionState.alpha( c ) ) {
						while ( ExpressionState.alphanumeric( this._expr.charAt( this._next ) ) ) {
							this._next++;
						}
						const token = this._expr.substring(  this._pos, this._next );
						const constant = this._constants.get( token );
						if ( constant != null ) {
							this._obj = constant;
							return this;
						}
						const func = this._functions.get( token );
						if ( func != null ) {
							this._obj = func;
							return this;
						}
						this._obj = token;
						return this;
					}
					else if ( ExpressionState.numeric( c ) ) {
						while ( ExpressionState.decinumeric( this._expr.charAt( this._next ) ) ) {
							this._next++;
						}
						this._obj = new ExpressionConstant( parseFloat( this._expr.substring(  this._pos, this._next ) ) );
						return this;
					}
					else if ( ExpressionState.quotation( c ) ) {
						const pos = this._next;
						while ( this._expr.charAt( this._next ) !== '' && this._expr.charAt( this._next ) !== c ) {
							this._next++;
						}
						this._obj = new ExpressionConstant( this._expr.substring( pos, this._next++ ) );
						return this;
					}
					throw new Error( `unknown symbol ${ c }` );
			}
		}
		return this;
	}

	protected static alpha = ( c: string ) => ( c >= 'a' && c <= 'z' ) || ( c >= 'A' && c <= 'Z' ) || ( c === '_' );
	protected static numeric = ( c: string ) => ( c >= '0' && c <= '9' );
	protected static alphanumeric = ( c: string ) => ExpressionState.alpha( c ) || ExpressionState.numeric( c );
	protected static decinumeric = ( c: string ) => ( c === '.' ) || ExpressionState.numeric( c );
	protected static quotation = ( c: string ) => ( c === '\'' || c === '\"' || c === '\`' );

}
