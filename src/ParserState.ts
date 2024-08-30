import { ParserFrame } from './ParserFrame.js';
import { FunctionDefinition } from './FunctionDefinition.js';
import { toStringBuffer } from './function/MutationFunctions.js';
import { funcOr, funcAnd, funcNot } from './function/GlobalFunctions.js';
import { funcGreaterThan, funcLessThan, funcGreaterOrEqual, funcLessOrEqual,
	funcEqual, funcNotEqual, funcLike, funcNotLike, funcSwitch, funcCoalesce } from './function/BaseFunctions.js';
import { funcAppend, funcAt } from './function/CompositeFunctions.js';
import { funcAdd, funcSubtract, funcMultiply, funcDivide, funcRemainder, funcPower } from './function/MathFunctions.js';
import { Type, Value, typeBoolean, typeNumber, typeBuffer, typeString, typeObject, typeFunction, typeVoid, typeUnknown, typeArray } from './Type.js';

class Literal { constructor(public readonly value: Value) {} }
const valueTrue = new Literal(true);
const valueFalse = new Literal(false);
const valueNull = new Literal(undefined);
const symbolParenthesesOpen = Symbol();
const symbolParenthesesClose = Symbol();
const symbolBracketsOpen = Symbol();
const symbolBracketsClose = Symbol();
const symbolBracesOpen = Symbol();
const symbolBracesClose = Symbol();
const symbolColon = Symbol();
const symbolSeparator = Symbol();
const symbolAssignment = Symbol();
const symbolOption = Symbol();
const symbolScope = Symbol();
const symbolCycle = Symbol();

const isSign = (c: string)=> c === '+' || c === '-';
const isAlpha = (c: string)=>  c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c === '_' ;
const isNumeric = (c: string)=>  c >= '0' && c <= '9' ;
const isAlphanumeric = (c: string)=> isAlpha(c) || isNumeric(c);
const isHexadecimal = (c: string)=> isNumeric(c) || c >= 'a' && c <= 'f' || c >= 'A' && c <= 'F';
const isQuotation = (c: string)=>  c === '\'' || c === '"' || c === '`' ;

export class ParserState extends ParserFrame {

	protected _obj: FunctionDefinition | Literal | Type | symbol | string | undefined;

	constructor(
		expr: string,
	) {
		super(expr);
	}

	get literal(): Value {
		return (this._obj as Literal).value;
	}

	get operator(): FunctionDefinition {
		return this._obj as FunctionDefinition;
	}

	get type(): Type {
		return this._obj as Type;
	}

	get token(): string {
		return this._obj as string;
	}

	get isOperator(): boolean {
		return this._obj instanceof FunctionDefinition;
	}

	get isLiteral(): boolean {
		return this._obj instanceof Literal;
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

	get isColon(): boolean {
		return this._obj === symbolColon;
	}

	get isSeparator(): boolean {
		return this._obj === symbolSeparator;
	}

	get isAssignment(): boolean {
		return this._obj === symbolAssignment;
	}

	get isOption(): boolean {
		return this._obj === symbolOption;
	}

	get isScope(): boolean {
		return this._obj === symbolScope;
	}

	get isCycle(): boolean {
		return this._obj === symbolCycle;
	}

	get isVoid(): boolean {
		return this._obj == null;
	}

	next(): ParserState {
		this._obj = undefined;
		while (this._end < this._expr.length && this._obj == null) {
			this._start = this._end;
			const c = this._expr.charAt(this._end);
			++this._end;
			switch (c) {
				case ' ': case '\t': case '\n': case '\r': break;
				case '(': this._obj = symbolParenthesesOpen; break;
				case ')': this._obj = symbolParenthesesClose; break;
				case '[': this._obj = symbolBracketsOpen; break;
				case ']': this._obj = symbolBracketsClose; break;
				case '{': this._obj = symbolBracesOpen; break;
				case '}': this._obj = symbolBracesClose; break;
				case ':': this._obj = symbolColon; break;
				case ',': this._obj = symbolSeparator; break;
				case '@': this._obj = symbolCycle; break;
				case '?':
					switch (this._expr.charAt(this._end)) {
						case '?': ++this._end; this._obj = typeUnknown; break;
						case ':': ++this._end; this._obj = funcCoalesce; break;
						default: this._obj = symbolOption; break;
					}
					break;
				case '$': this._obj = funcSwitch; break;
				case '|': this._obj = funcOr; break;
				case '&': this._obj = funcAnd; break;
				case '>':
					switch (this._expr.charAt(this._end)) {
						case '=': ++this._end; this._obj = funcGreaterOrEqual; break;
						default: this._obj = funcGreaterThan; break;
					}
					break;
				case '<':
					switch (this._expr.charAt(this._end)) {
						case '=': ++this._end; this._obj = funcLessOrEqual; break;
						default: this._obj = funcLessThan; break;
					}
					break;
				case '!':
					switch (this._expr.charAt(this._end)) {
						case '=': ++this._end; this._obj = funcNotEqual; break;
						case '~': ++this._end; this._obj = funcNotLike; break;
						default: this._obj = funcNot; break;
					}
					break;
				case '=':
					switch (this._expr.charAt(this._end)) {
						case '=': ++this._end; this._obj = funcEqual; break;
						default: this._obj = symbolAssignment; break;
					}
					break;
				case '~': this._obj = funcLike; break;
				case '+':
					switch (this._expr.charAt(this._end)) {
						case '>': ++this._end; this._obj = funcAppend; break;
						default: this._obj = funcAdd; break;
					}
					break;
				case '-':
					switch (this._expr.charAt(this._end)) {
						case '>': ++this._end; this._obj = symbolScope; break;
						default: this._obj = funcSubtract; break;
					}
					break;
				case '*': this._obj = funcMultiply; break;
				case '/': this._obj = funcDivide; break;
				case '%': this._obj = funcRemainder; break;
				case '^': this._obj = funcPower; break;
				case '.': this._obj = funcAt; break;
				case '#':
					if (this._expr.charAt(this._end) === '#') {
						++this._end;
						while (isHexadecimal(this._expr.charAt(this._end))) {
							++this._end;
						}
						this._obj = new Literal(toStringBuffer(this._expr.substring(this._start + 2, this._end)));
					}
					else {
						++this._end;
						while (isHexadecimal(this._expr.charAt(this._end))) {
							++this._end;
						}
						this._obj = new Literal(parseInt(this._expr.substring(this._start + 1, this._end), 16));
					}
					break;
				default:
					if (isAlpha(c)) {
						while (isAlphanumeric(this._expr.charAt(this._end))) {
							++this._end;
						}
						const token = this._expr.substring(this._start, this._end);
						switch (token) {
							case 'true': this._obj = valueTrue; break;
							case 'false': this._obj = valueFalse; break;
							case 'null': this._obj = valueNull; break;
							case 'void': this._obj = typeVoid; break;
							case 'boolean': this._obj = typeBoolean; break;
							case 'number': this._obj = typeNumber; break;
							case 'buffer': this._obj = typeBuffer; break;
							case 'string': this._obj = typeString; break;
							case 'array': this._obj = typeArray; break;
							case 'object': this._obj = typeObject; break;
							case 'function': this._obj = typeFunction; break;
							default: this._obj = token; break;
						}
					}
					else if (isNumeric(c)) {
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
						}
						this._obj = new Literal(parseFloat(this._expr.substring(this._start, this._end)));
					}
					else if (isQuotation(c)) {
						while (this._expr.charAt(this._end) !== '' && this._expr.charAt(this._end) !== c) {
							++this._end;
						}
						if (this._end >= this._expr.length) {
							this._start = this._expr.length;
							throw new Error(`missing closing quotation mark ${c}`);
						}
						this._obj = new Literal(this._expr.substring(this._start + 1, this._end++));
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
