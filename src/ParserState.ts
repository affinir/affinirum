import { ExpressionConstant } from './ExpressionConstant.js';
import { ExpressionFunction } from './ExpressionFunction.js';
import { toStringBuffer } from './ExpressionFunctionMutation.js';
import { operAt, operOr, operAnd, operNot, operGt, operLt, operGe, operLe, operEqual, operNotEqual, operLike, operNotLike,
	operCoalesce, operAdd, operSub, operMul, operDiv, operPct, operPow } from './ExpressionOperator.js';
import { Type, typeBoolean, typeNumber, typeBuffer, typeString, typeObject, typeFunction, typeVoid, typeVariant, typeArray } from './Type.js';

const symbolParenthesesOpen = Symbol();
const symbolParenthesesClose = Symbol();
const symbolBracketsOpen = Symbol();
const symbolBracketsClose = Symbol();
const symbolBracesOpen = Symbol();
const symbolBracesClose = Symbol();
const symbolAssignment = Symbol();
const symbolSeparator = Symbol();
const symbolOption = Symbol();
const symbolMethod = Symbol();
const symbolIf = Symbol();
const symbolThen = Symbol();
const symbolElse = Symbol();

const isSign = (c: string)=> c === '+' || c === '-';
const isAlpha = (c: string)=>  c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c === '_' ;
const isNumeric = (c: string)=>  c >= '0' && c <= '9' ;
const isAlphanumeric = (c: string)=> isAlpha(c) || isNumeric(c);
const isHexadecimal = (c: string)=> isNumeric(c) || c >= 'a' && c <= 'f' || c >= 'A' && c <= 'F';
const isQuotation = (c: string)=>  c === '\'' || c === '"' || c === '`' ;

export class ParserState {

	protected _obj: ExpressionConstant | ExpressionFunction | Type | string | symbol | undefined;
	protected _startPos = 0;
	protected _endPos = 0;

	constructor(
		protected readonly _expr: string,
	) {}

	get literal(): ExpressionConstant {
		return this._obj as ExpressionConstant;
	}

	get operator(): ExpressionFunction {
		return this._obj as ExpressionFunction;
	}

	get type(): Type {
		return this._obj as Type;
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
		return this._obj instanceof Type;
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

	get isOption(): boolean {
		return this._obj === symbolOption;
	}

	get isMethod(): boolean {
		return this._obj === symbolMethod;
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

	get isVoid(): boolean {
		return this._obj == null;
	}

	get pos(): number {
		return this._startPos;
	}

	get length(): number {
		return this._endPos - this._startPos;
	}

	next(): ParserState {
		this._obj = undefined;
		while (this._endPos < this._expr.length && this._obj == null) {
			this._startPos = this._endPos;
			const c = this._expr.charAt(this._endPos);
			++this._endPos;
			switch (c) {
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
					switch (this._expr.charAt(this._endPos)) {
						case ':': ++this._endPos; this._obj = operCoalesce; break;
						default: this._obj = symbolOption; break;
					}
					break;
				case '|': this._obj = operOr; break;
				case '&': this._obj = operAnd; break;
				case '>':
					switch (this._expr.charAt(this._endPos)) {
						case '=': ++this._endPos; this._obj = operGe; break;
						default: this._obj = operGt; break;
					}
					break;
				case '<':
					switch (this._expr.charAt(this._endPos)) {
						case '=': ++this._endPos; this._obj = operLe; break;
						default: this._obj = operLt; break;
					}
					break;
				case '!':
					switch (this._expr.charAt(this._endPos)) {
						case '=': ++this._endPos; this._obj = operNotEqual; break;
						case '~': ++this._endPos; this._obj = operNotLike; break;
						default: this._obj = operNot; break;
					}
					break;
				case '=': this._obj = operEqual; break;
				case '~': this._obj = operLike; break;
				case '+': this._obj = operAdd; break;
				case '-':
					switch (this._expr.charAt(this._endPos)) {
						case '>': ++this._endPos; this._obj = symbolMethod; break;
						default: this._obj = operSub; break;
					}
					break;
				case '*': this._obj = operMul; break;
				case '/': this._obj = operDiv; break;
				case '%': this._obj = operPct; break;
				case '^': this._obj = operPow; break;
				case '.': this._obj = operAt; break;
				case '#':
					if (this._expr.charAt(this._endPos) === '#') {
						++this._endPos;
						while (isHexadecimal(this._expr.charAt(this._endPos))) {
							++this._endPos;
						}
						this._obj = new ExpressionConstant(toStringBuffer(this._expr.substring(this._startPos + 2, this._endPos)));
					}
					else {
						++this._endPos;
						while (isHexadecimal(this._expr.charAt(this._endPos))) {
							++this._endPos;
						}
						this._obj = new ExpressionConstant(parseInt(this._expr.substring(this._startPos + 1, this._endPos), 16));
					}
					break;
				default:
					if (isAlpha(c)) {
						while (isAlphanumeric(this._expr.charAt(this._endPos))) {
							++this._endPos;
						}
						const token = this._expr.substring(this._startPos, this._endPos);
						switch (token) {
							case 'void': this._obj = typeVoid; break;
							case 'boolean': case 'bool': this._obj = typeBoolean; break;
							case 'number': case 'num': this._obj = typeNumber; break;
							case 'buffer': case 'buf': this._obj = typeBuffer; break;
							case 'string': case 'str': this._obj = typeString; break;
							case 'array': case 'arr': this._obj = typeArray; break;
							case 'object': case 'obj': this._obj = typeObject; break;
							case 'function': case 'func': this._obj = typeFunction; break;
							case 'variant': case 'var': this._obj = typeVariant; break;
							case 'if': this._obj = symbolIf; break;
							case 'then': this._obj = symbolThen; break;
							case 'else': this._obj = symbolElse; break;
							default: this._obj = token; break;
						}
					}
					else if (isNumeric(c)) {
						while (isNumeric(this._expr.charAt(this._endPos))) {
							++this._endPos;
						}
						if (this._expr.charAt(this._endPos) === '.') {
							++this._endPos;
							if (isNumeric(this._expr.charAt(this._endPos))) {
								++this._endPos;
								while (isNumeric(this._expr.charAt(this._endPos))) {
									++this._endPos;
								}
							}
							else {
								--this._endPos;
							}
						}
						if (this._expr.charAt(this._endPos) === 'e') {
							++this._endPos;
							if (isNumeric(this._expr.charAt(this._endPos)) || isSign(this._expr.charAt(this._endPos))) {
								++this._endPos;
								while (isNumeric(this._expr.charAt(this._endPos))) {
									++this._endPos;
								}
							}
						}
						this._obj = new ExpressionConstant(parseFloat(this._expr.substring(this._startPos, this._endPos)));
					}
					else if (isQuotation(c)) {
						while (this._expr.charAt(this._endPos) !== '' && this._expr.charAt(this._endPos) !== c) {
							++this._endPos;
						}
						if (this._endPos >= this._expr.length) {
							this._startPos = this._expr.length;
							throw new Error(`missing closing quotation mark ${c}`);
						}
						this._obj = new ExpressionConstant(this._expr.substring(this._startPos + 1, this._endPos++));
					}
					else {
						throw new Error(`unknown symbol ${c}`);
					}
					break;
			}
		}
		if (this._endPos >= this._expr.length) {
			this._startPos = this._expr.length;
		}
		return this;
	}

}
