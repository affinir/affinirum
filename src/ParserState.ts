import { funcOr, funcAnd, funcNot } from './constant/Boolean.js';
import { parseBuffer } from './constant/Buffer.js';
import { funcAdd } from './constant/Enumerable.js';
import { isSign, isAlpha, isNumeric, isAlphanumeric, isHexadecimal, isQuotation,
	isDateSymbol, isTimeSymbol, isDateTimeSeparator } from './constant/String.js';
import { Constant } from './Constant.js';
import { funcGreaterThan, funcLessThan, funcGreaterOrEqual, funcLessOrEqual,
	funcSubtract, funcMultiply, funcDivide, funcRemainder, funcPower } from './constant/Number.js';
import { funcCoalesce, funcEqual, funcNotEqual } from './constant/Unknown.js';
import { Value } from './Value.js';
import { Type } from './Type.js';
import { ParserFrame } from './ParserFrame.js';

class Literal { constructor(public readonly value: Value) {} }
const valueTrue = new Literal(true);
const valueFalse = new Literal(false);
const valueNull = new Literal(undefined);
class Assignment { constructor(public readonly operator?: Constant) {} }
const funcAssignment = new Assignment();
const funcOrAssignment = new Assignment(funcOr);
const funcAndAssignment = new Assignment(funcAnd);
const funcAddAssignment = new Assignment(funcAdd);
const funcSubtractAssignment = new Assignment(funcSubtract);
const funcMultiplyAssignment = new Assignment(funcMultiply);
const funcDivideAssignment = new Assignment(funcDivide);
const funcRemainderAssignment = new Assignment(funcRemainder);
const symbolParenthesesOpen = Symbol();
const symbolParenthesesClose = Symbol();
const symbolBracketsOpen = Symbol();
const symbolBracketsClose = Symbol();
const symbolBracesOpen = Symbol();
const symbolBracesClose = Symbol();
const symbolSemicolonSeparator = Symbol();
const symbolColonSeparator = Symbol();
const symbolCommaSeparator = Symbol();
const symbolDotMark = Symbol();
const symbolQuestionMark = Symbol();
const symbolTildaMark = Symbol();
const symbolVariadicFunction = Symbol();
const symbolVariableDefinition = Symbol();
const symbolConstantDefinition = Symbol();
const symbolWhile = Symbol();
const symbolIf = Symbol();
const symbolElse = Symbol();

export class ParserState extends ParserFrame {

	protected _fragment: Literal | Assignment | Constant | Type | symbol | string | undefined;

	constructor(
		expr: string,
	) {
		super(expr);
	}

	get literal(): Literal {
		return this._fragment as Literal;
	}

	get assignment(): Assignment {
		return this._fragment as Assignment;
	}

	get operator(): Constant {
		return this._fragment as Constant;
	}

	get type(): Type {
		return this._fragment as Type;
	}

	get token(): string {
		return this._fragment as string;
	}

	get isOperator(): boolean {
		return this._fragment instanceof Constant;
	}

	get isLiteral(): boolean {
		return this._fragment instanceof Literal;
	}

	get isAssignment(): boolean {
		return this._fragment instanceof Assignment;
	}

	get isType(): boolean {
		return this._fragment instanceof Type;
	}

	get isToken(): boolean {
		return typeof this._fragment === 'string';
	}

	get isParenthesesOpen(): boolean {
		return this._fragment === symbolParenthesesOpen;
	}

	get isParenthesesClose(): boolean {
		return this._fragment === symbolParenthesesClose;
	}

	get isBracketsOpen(): boolean {
		return this._fragment === symbolBracketsOpen;
	}

	get isBracketsClose(): boolean {
		return this._fragment === symbolBracketsClose;
	}

	get isBracesOpen(): boolean {
		return this._fragment === symbolBracesOpen;
	}

	get isBracesClose(): boolean {
		return this._fragment === symbolBracesClose;
	}

	get isSemicolonSeparator(): boolean {
		return this._fragment === symbolSemicolonSeparator;
	}

	get isColonSeparator(): boolean {
		return this._fragment === symbolColonSeparator;
	}

	get isCommaSeparator(): boolean {
		return this._fragment === symbolCommaSeparator;
	}

	get isDotMark(): boolean {
		return this._fragment === symbolDotMark;
	}

	get isQuestionMark(): boolean {
		return this._fragment === symbolQuestionMark;
	}

	get isTildaMark(): boolean {
		return this._fragment === symbolTildaMark;
	}

	get isVariadicFunction(): boolean {
		return this._fragment === symbolVariadicFunction;
	}

	get isVariableDefinition(): boolean {
		return this._fragment === symbolVariableDefinition;
	}

	get isConstantDefinition(): boolean {
		return this._fragment === symbolConstantDefinition;
	}

	get isWhile(): boolean {
		return this._fragment === symbolWhile;
	}

	get isIf(): boolean {
		return this._fragment === symbolIf;
	}

	get isElse(): boolean {
		return this._fragment === symbolElse;
	}

	get isVoid(): boolean {
		return this._fragment == null;
	}

	openParentheses() {
		if (!this.isParenthesesOpen) {
			this.throwError('missing opening parentheses');
		}
		return this;
	}

	closeParentheses() {
		if (!this.isParenthesesClose) {
			this.throwError('missing closing parentheses');
		}
		return this;
	}

	openBrackets() {
		if (!this.isBracketsOpen) {
			this.throwError('missing opening brackets');
		}
		return this;
	}

	closeBrackets() {
		if (!this.isBracketsClose) {
			this.throwError('missing closing brackets');
		}
		return this;
	}

	openBraces() {
		if (!this.isBracesOpen) {
			this.throwError('missing opening braces');
		}
		return this;
	}

	closeBraces() {
		if (!this.isBracesClose) {
			this.throwError('missing closing braces');
		}
		return this;
	}

	separateByColon() {
		if (!this.isColonSeparator) {
			this.throwError('missing colon separator')
		}
		return this;
	}

	clone() {
		const state = new ParserState(this._expr);
		state._start = this._start;
		state._end = this._end;
		state._fragment = this._fragment;
		return state;
	}

	next(): ParserState {
		this._fragment = undefined;
		while (this._end < this._expr.length && this._fragment == null) {
			this._start = this._end;
			const c = this._expr.charAt(this._end);
			++this._end;
			switch (c) {
				case ' ': case '\t': case '\n': case '\r': break;
				case '(': this._fragment = symbolParenthesesOpen; break;
				case ')': this._fragment = symbolParenthesesClose; break;
				case '[': this._fragment = symbolBracketsOpen; break;
				case ']': this._fragment = symbolBracketsClose; break;
				case '{': this._fragment = symbolBracesOpen; break;
				case '}': this._fragment = symbolBracesClose; break;
				case ';': this._fragment = symbolSemicolonSeparator; break;
				case ':': this._fragment = symbolColonSeparator; break;
				case ',': this._fragment = symbolCommaSeparator; break;
				case '~': this._fragment = symbolTildaMark; break;
				case '?':
					switch (this._expr.charAt(this._end)) {
						case '?': ++this._end; this._fragment = Type.Unknown; break;
						case ':': ++this._end; this._fragment = funcCoalesce; break;
						default: this._fragment = symbolQuestionMark; break;
					}
					break;
				case '|':
					switch (this._expr.charAt(this._end)) {
						case '=': ++this._end; this._fragment = funcOrAssignment; break;
						default: this._fragment = funcOr; break;
					}
					break;
				case '&':
					switch (this._expr.charAt(this._end)) {
						case '=': ++this._end; this._fragment = funcAndAssignment; break;
						default: this._fragment = funcAnd; break;
					}
					break;
				case '>':
					switch (this._expr.charAt(this._end)) {
						case '=': ++this._end; this._fragment = funcGreaterOrEqual; break;
						default: this._fragment = funcGreaterThan; break;
					}
					break;
				case '<':
					switch (this._expr.charAt(this._end)) {
						case '=': ++this._end; this._fragment = funcLessOrEqual; break;
						default: this._fragment = funcLessThan; break;
					}
					break;
				case '!':
					switch (this._expr.charAt(this._end)) {
						case '=': ++this._end; this._fragment = funcNotEqual; break;
						default: this._fragment = funcNot; break;
					}
					break;
				case '=':
					switch (this._expr.charAt(this._end)) {
						case '=': ++this._end; this._fragment = funcEqual; break;
						default: this._fragment = funcAssignment; break;
					}
					break;
				case '+':
					switch (this._expr.charAt(this._end)) {
						case '=': ++this._end; this._fragment = funcAddAssignment; break;
						default: this._fragment = funcAdd; break;
					}
					break;
				case '-':
					switch (this._expr.charAt(this._end)) {
						case '=': ++this._end; this._fragment = funcSubtractAssignment; break;
						default: this._fragment = funcSubtract; break;
					}
					break;
				case '*':
					switch (this._expr.charAt(this._end)) {
						case '=': ++this._end; this._fragment = funcMultiplyAssignment; break;
						default: this._fragment = funcMultiply; break;
					}
					break;
				case '/':
					switch (this._expr.charAt(this._end)) {
						case '=': ++this._end; this._fragment = funcDivideAssignment; break;
						default: this._fragment = funcDivide; break;
					}
					break;
				case '%':
					switch (this._expr.charAt(this._end)) {
						case '=': ++this._end; this._fragment = funcRemainderAssignment; break;
						default: this._fragment = funcRemainder; break;
					}
					break;
				case '$':
					switch (this._expr.charAt(this._end)) {
						case '$':
							while (this._expr.charAt(this._end) !== '' && this._expr.charAt(this._end) !== '\n') {
								++this._end;
							}
							break;
						default:
							while (this._expr.charAt(this._end) !== '' && this._expr.charAt(this._end) !== c) {
								++this._end;
							}
							if (this._end >= this._expr.length) {
								this._start = this._expr.length;
								throw new Error(`missing closing comment mark ${c}`);
							}
							++this._end;
							break;
					}
					break;
				case '^': this._fragment = funcPower; break;
				case '.':
					switch (this._expr.charAt(this._end)) {
						case '.':
							if (this._expr.charAt(++this._end) === '.') {
								++this._end;
								this._fragment = symbolVariadicFunction;
							}
							else {
								throw new Error('incomplete ellipsis ...');
							}
							break;
						default:
							this._fragment = symbolDotMark;
							break;
					}
					break;
				case '@':
					while (isDateSymbol(this._expr.charAt(this._end))) {
						++this._end;
					}
					if (isDateTimeSeparator(this._expr.charAt(this._end))) {
						++this._end;
						while (isTimeSymbol(this._expr.charAt(this._end))) {
							++this._end;
						}
						if (this._expr.charAt(this._end) === '.') {
							++this._end;
							while (isNumeric(this._expr.charAt(this._end))) {
								++this._end;
							}
							if (this._expr.charAt(this._end) === 'Z') {
								++this._end;
							}
						}
					}
					this._fragment = new Literal(new Date(this._expr.substring(this._start + 1, this._end)));
					break;
				case '#':
					while (isHexadecimal(this._expr.charAt(this._end))) {
						++this._end;
					}
					this._fragment = new Literal(parseBuffer(this._expr.substring(this._start + 1, this._end)));
					break;
				default:
					if (isAlpha(c)) {
						while (isAlphanumeric(this._expr.charAt(this._end))) {
							++this._end;
						}
						const token = this._expr.substring(this._start, this._end);
						switch (token) {
							case 'true': this._fragment = valueTrue; break;
							case 'false': this._fragment = valueFalse; break;
							case 'null': this._fragment = valueNull; break;
							case 'void': this._fragment = Type.Void; break;
							case 'bool': case 'boolean': this._fragment = Type.Boolean; break;
							case 'time': case 'timestamp': this._fragment = Type.Timestamp; break;
							case 'flo': case 'float': this._fragment = Type.Float; break;
							case 'int': case 'integer': this._fragment = Type.Integer; break;
							case 'buf': case 'buffer': this._fragment = Type.Buffer; break;
							case 'str': case 'string': this._fragment = Type.String; break;
							case 'arr': case 'array': this._fragment = Type.Array; break;
							case 'obj': case 'object': this._fragment = Type.Object; break;
							case 'func': case 'function': this._fragment = Type.Function; break;
							case 'var': case 'variable': this._fragment = symbolVariableDefinition; break;
							case 'const': case 'constant': this._fragment = symbolConstantDefinition; break;
							case 'while': this._fragment = symbolWhile; break;
							case 'if': this._fragment = symbolIf; break;
							case 'else': this._fragment = symbolElse; break;
							default: this._fragment = token; break;
						}
					}
					else if (isNumeric(c)) {
						let integer = true;
						while (isNumeric(this._expr.charAt(this._end))) {
							++this._end;
						}
						if (this._expr.charAt(this._end) === '.') {
							++this._end;
							if (isNumeric(this._expr.charAt(this._end))) {
								++this._end;
								while (isNumeric(this._expr.charAt(this._end))) {
									++this._end;
								}
								integer = false;
							}
							else {
								--this._end;
							}
						}
						if (this._expr.charAt(this._end) === 'e') {
							++this._end;
							if (isNumeric(this._expr.charAt(this._end)) || isSign(this._expr.charAt(this._end))) {
								++this._end;
								while (isNumeric(this._expr.charAt(this._end))) {
									++this._end;
								}
							}
							integer = false;
						}
						this._fragment = integer
							? new Literal(BigInt(this._expr.substring(this._start, this._end)))
							: new Literal(parseFloat(this._expr.substring(this._start, this._end)));
					}
					else if (isQuotation(c)) {
						while (this._expr.charAt(this._end) !== '' && this._expr.charAt(this._end) !== c) {
							++this._end;
						}
						if (this._end >= this._expr.length) {
							this._start = this._expr.length;
							throw new Error(`missing closing quotation mark ${c}`);
						}
						this._fragment = new Literal(this._expr.substring(this._start + 1, this._end));
						++this._end;
					}
					else {
						throw new Error(`unknown symbol ${c}`);
					}
					break;
			}
		}
		if (this._end > this._expr.length) {
			this._start = this._end = this._expr.length;
		}
		return this;
	}

}
