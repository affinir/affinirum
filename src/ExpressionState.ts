import { ExpressionConstant } from './ExpressionConstant.js';
import { ExpressionFunction } from './ExpressionFunction.js';
import { operOr, operAnd, operNot, operGt, operLt, operGe, operLe, operEqual, operNotEqual, operLike, operNotLike,
	operNullco, operAdd, operSub, operMul, operDiv, operPct, operPow, operConcat, operAt, operBy, operJoin } from './ExpressionOperator.js';
import { ExpressionType, typeBoolean, typeNumber, typeString, typeObject, typeFunction, typeVoid, typeVar, typeArray } from './ExpressionType.js';

const symbolParenthesesOpen = Symbol();
const symbolParenthesesClose = Symbol();
const symbolBracketsOpen = Symbol();
const symbolBracketsClose = Symbol();
const symbolBracesOpen = Symbol();
const symbolBracesClose = Symbol();
const symbolAssignment = Symbol();
const symbolSeparator = Symbol();
const symbolScope = Symbol();
const symbolOption = Symbol();
const symbolIf = Symbol();
const symbolThen = Symbol();
const symbolElse = Symbol();

export class ExpressionState {

	protected _obj: ExpressionConstant | ExpressionFunction | ExpressionType | string | symbol | undefined;
	protected _startPos = 0;
	protected _endPos = 0;

	constructor(
		protected readonly _expr: string,
	) {}

	get pos(): number {
		return this._startPos;
	}

	get literal(): ExpressionConstant {
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

	get isLiteral(): boolean {
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

	get isOption(): boolean {
		return this._obj === symbolOption;
	}

	get isIf(): boolean {
		return this._obj === symbolIf;
	}

	get isThen(): boolean {
		return this._obj === symbolThen;
	}

	get isElse(): boolean {
		return this._obj === symbolElse;
	}

	get isFinal(): boolean {
		return this._endPos >= this._expr.length;
	}

	next(): ExpressionState {
		this._obj = undefined;
		while ( this._endPos < this._expr.length && this._obj == null ) {
			this._startPos = this._endPos;
			const c = this._expr.charAt( this._endPos );
			++this._endPos;
			switch ( c ) {
				case ' ': case '\t': case '\n': case '\r': break;
				case '(': this._obj = symbolParenthesesOpen; break;
				case ')': this._obj = symbolParenthesesClose; break;
				case '[': this._obj = symbolBracketsOpen; break;
				case ']': this._obj = symbolBracketsClose; break;
				case '{': this._obj = symbolBracesOpen; break;
				case '}': this._obj = symbolBracesClose; break;
				case ':': this._obj = symbolAssignment; break;
				case ',': this._obj = symbolSeparator; break;
				case '?':
					switch ( this._expr.charAt( this._endPos ) ) {
						case '=': ++this._endPos; this._obj = operNullco; break;
						default: this._obj = symbolOption; break;
					}
					break;
				case '|': this._obj = operOr; break;
				case '&': this._obj = operAnd; break;
				case '>':
					switch ( this._expr.charAt( this._endPos ) ) {
						case '=': ++this._endPos; this._obj = operGe; break;
						default: this._obj = operGt; break;
					}
					break;
				case '<':
					switch ( this._expr.charAt( this._endPos ) ) {
						case '=': ++this._endPos; this._obj = operLe; break;
						default: this._obj = operLt; break;
					}
					break;
				case '!':
					switch ( this._expr.charAt( this._endPos ) ) {
						case '=': ++this._endPos; this._obj = operNotEqual; break;
						case '~': ++this._endPos; this._obj = operNotLike; break;
						default: this._obj = operNot; break;
					}
					break;
				case '=':
					switch ( this._expr.charAt( this._endPos ) ) {
						case '>': ++this._endPos; this._obj = symbolScope; break;
						default: this._obj = operEqual; break;
					}
					break;
				case '~': this._obj = operLike; break;
				case '+': this._obj = operAdd; break;
				case '-': this._obj = operSub; break;
				case '*': this._obj = operMul; break;
				case '/': this._obj = operDiv; break;
				case '%': this._obj = operPct; break;
				case '^': this._obj = operPow; break;
				case '#': this._obj = operConcat; break;
				case '@': this._obj = operAt; break;
				case '$': this._obj = operJoin; break;
				case '.': this._obj = operBy; break;
				default:
					if ( ExpressionState.isAlpha( c ) ) {
						while ( ExpressionState.isAlphanumeric( this._expr.charAt( this._endPos ) ) ) {
							++this._endPos;
						}
						const token = this._expr.substring( this._startPos, this._endPos );
						switch ( token ) {
							case 'boolean': this._obj = typeBoolean; break;
							case 'number': this._obj = typeNumber; break;
							case 'string': this._obj = typeString; break;
							case 'array': this._obj = typeArray; break;
							case 'object': this._obj = typeObject; break;
							case 'function': this._obj = typeFunction; break;
							case 'void': this._obj = typeVoid; break;
							case 'var': this._obj = typeVar; break;
							case 'if': this._obj = symbolIf; break;
							case 'then': this._obj = symbolThen; break;
							case 'else': this._obj = symbolElse; break;
							default: this._obj = token; break;
						}
					}
					else if ( ExpressionState.isNumeric( c ) ) {
						while ( ExpressionState.isDecinumeric( this._expr.charAt( this._endPos ) ) ) {
							++this._endPos;
						}
						this._obj = new ExpressionConstant( parseFloat( this._expr.substring( this._startPos, this._endPos ) ) );
					}
					else if ( ExpressionState.isQuotation( c ) ) {
						while ( this._expr.charAt( this._endPos ) !== '' && this._expr.charAt( this._endPos ) !== c ) {
							++this._endPos;
						}
						this._obj = new ExpressionConstant( this._expr.substring( this._startPos + 1, this._endPos++ ) );
					}
					else {
						throw new Error( `unknown symbol ${ c }` );
					}
					break;
			}
		}
		if ( this._endPos > this._expr.length ) {
			throw new Error( `unexpected end of expression while parsing value` );
		}
		return this;
	}

	static isAlpha = ( c: string ) => ( c >= 'a' && c <= 'z' ) || ( c >= 'A' && c <= 'Z' ) || ( c === '_' );
	static isNumeric = ( c: string ) => ( c >= '0' && c <= '9' );
	static isAlphanumeric = ( c: string ) => ExpressionState.isAlpha( c ) || ExpressionState.isNumeric( c );
	static isDecinumeric = ( c: string ) => ( c === '.' ) || ExpressionState.isNumeric( c );
	static isQuotation = ( c: string ) => ( c === '\'' || c === '\"' || c === '\`' );

}
