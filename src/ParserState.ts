import { ParserFrame } from './ParserFrame.js';
import { FunctionDefinition } from './FunctionDefinition.js';
import { toStringBuffer } from './MutationFunctions.js';
import { operOr, operAnd, operNot, operGt, operLt, operGe, operLe, operEqual, operNotEqual, operLike, operNotLike,
	operCoalesce, operAppend, operAt, operAdd, operSub, operMul, operDiv, operPct, operPow } from './Operators.js';
import { Type, Value, typeBoolean, typeNumber, typeBuffer, typeString, typeObject, typeFunction, typeVoid, typeUnknown, typeArray } from './Type.js';

class Literal {

	constructor(public value: Value) {}

}

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
				case '?':
					switch (this._expr.charAt(this._end)) {
						case '?': ++this._end; this._obj = typeUnknown; break;
						case ':': ++this._end; this._obj = operCoalesce; break;
						default: this._obj = symbolOption; break;
					}
					break;
				case '|': this._obj = operOr; break;
				case '&': this._obj = operAnd; break;
				case '>':
					switch (this._expr.charAt(this._end)) {
						case '=': ++this._end; this._obj = operGe; break;
						default: this._obj = operGt; break;
					}
					break;
				case '<':
					switch (this._expr.charAt(this._end)) {
						case '=': ++this._end; this._obj = operLe; break;
						default: this._obj = operLt; break;
					}
					break;
				case '!':
					switch (this._expr.charAt(this._end)) {
						case '=': ++this._end; this._obj = operNotEqual; break;
						case '~': ++this._end; this._obj = operNotLike; break;
						default: this._obj = operNot; break;
					}
					break;
				case '=':
					switch (this._expr.charAt(this._end)) {
						case '=': ++this._end; this._obj = operEqual; break;
						default: this._obj = symbolAssignment; break;
					}
					break;
				case '~': this._obj = operLike; break;
				case '+':
					switch (this._expr.charAt(this._end)) {
						case '>': ++this._end; this._obj = operAppend; break;
						default: this._obj = operAdd; break;
					}
					break;
				case '-':
					switch (this._expr.charAt(this._end)) {
						case '>': ++this._end; this._obj = symbolMethod; break;
						default: this._obj = operSub; break;
					}
					break;
				case '*': this._obj = operMul; break;
				case '/': this._obj = operDiv; break;
				case '%': this._obj = operPct; break;
				case '^': this._obj = operPow; break;
				case '.': this._obj = operAt; break;
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
							case 'boolean': case 'bool': this._obj = typeBoolean; break;
							case 'number': case 'num': this._obj = typeNumber; break;
							case 'buffer': case 'buf': this._obj = typeBuffer; break;
							case 'string': case 'str': this._obj = typeString; break;
							case 'array': case 'arr': this._obj = typeArray; break;
							case 'object': case 'obj': this._obj = typeObject; break;
							case 'function': case 'func': this._obj = typeFunction; break;
							case 'if': this._obj = symbolIf; break;
							case 'then': this._obj = symbolThen; break;
							case 'else': this._obj = symbolElse; break;
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
