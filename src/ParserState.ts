import { ParserFrame } from './ParserFrame.js';
import { FunctionDefinition } from './FunctionDefinition.js';
import { funcOr, funcAnd, funcNot } from './function/GlobalFunctions.js';
import { funcGreaterThan, funcLessThan, funcGreaterOrEqual, funcLessOrEqual,
	funcEqual, funcNotEqual, funcSwitch, funcCoalesce } from './function/BaseFunctions.js';
import { funcAppend, funcAt } from './function/CompositeFunctions.js';
import { funcAdd, funcSubtract, funcMultiply, funcDivide, funcRemainder, funcPower } from './function/MathFunctions.js';
import { parseBuffer } from './function/MutationFunctions.js';
import { Type, Value, typeBoolean, typeNumber, typeBuffer, typeString, typeObject, typeFunction, typeVoid, typeUnknown, typeArray } from './Type.js';

class Literal { constructor(public readonly value: Value) {} }
const valueTrue = new Literal(true);
const valueFalse = new Literal(false);
const valueNull = new Literal(undefined);
class Assignment { constructor(public readonly operator?: FunctionDefinition) {} }
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
const symbolColonSeparator = Symbol();
const symbolCommaSeparator = Symbol();
const symbolOptionalType = Symbol();
const symbolScope = Symbol();
const symbolCycle = Symbol();

const isSign = (c: string)=> c === '+' || c === '-';
const isAlpha = (c: string)=>  c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c === '_' ;
const isNumeric = (c: string)=>  c >= '0' && c <= '9' ;
const isAlphanumeric = (c: string)=> isAlpha(c) || isNumeric(c);
const isHexadecimal = (c: string)=> isNumeric(c) || c >= 'a' && c <= 'f' || c >= 'A' && c <= 'F';
const isQuotation = (c: string)=>  c === '\'' || c === '"' || c === '`' ;

export class ParserState extends ParserFrame {

	protected _fragment: Literal | Assignment | FunctionDefinition | Type | symbol | string | undefined;

	constructor(
		expr: string,
	) {
		super(expr);
	}

	get literalValue(): Value {
		return (this._fragment as Literal).value;
	}

	get assignmentOperator(): FunctionDefinition | undefined {
		return (this._fragment as Assignment).operator;
	}

	get operator(): FunctionDefinition {
		return this._fragment as FunctionDefinition;
	}

	get type(): Type {
		return this._fragment as Type;
	}

	get token(): string {
		return this._fragment as string;
	}

	get isOperator(): boolean {
		return this._fragment instanceof FunctionDefinition;
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

	get isColonSeparator(): boolean {
		return this._fragment === symbolColonSeparator;
	}

	get isCommaSeparator(): boolean {
		return this._fragment === symbolCommaSeparator;
	}

	get isOptionalType(): boolean {
		return this._fragment === symbolOptionalType;
	}

	get isScope(): boolean {
		return this._fragment === symbolScope;
	}

	get isCycle(): boolean {
		return this._fragment === symbolCycle;
	}

	get isVoid(): boolean {
		return this._fragment == null;
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
				case ':': this._fragment = symbolColonSeparator; break;
				case ',': this._fragment = symbolCommaSeparator; break;
				case '@': this._fragment = symbolCycle; break;
				case '?':
					switch (this._expr.charAt(this._end)) {
						case '?': ++this._end; this._fragment = typeUnknown; break;
						case ':': ++this._end; this._fragment = funcCoalesce; break;
						default: this._fragment = symbolOptionalType; break;
					}
					break;
				case '$': this._fragment = funcSwitch; break;
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
						case '>': ++this._end; this._fragment = funcAppend; break;
						case '=': ++this._end; this._fragment = funcAddAssignment; break;
						default: this._fragment = funcAdd; break;
					}
					break;
				case '-':
					switch (this._expr.charAt(this._end)) {
						case '>': ++this._end; this._fragment = symbolScope; break;
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
				case '^': this._fragment = funcPower; break;
				case '.': this._fragment = funcAt; break;
				case '#':
					if (this._expr.charAt(this._end) === '#') {
						++this._end;
						while (isHexadecimal(this._expr.charAt(this._end))) {
							++this._end;
						}
						this._fragment = new Literal(parseBuffer(this._expr.substring(this._start + 2, this._end)));
					}
					else {
						++this._end;
						while (isHexadecimal(this._expr.charAt(this._end))) {
							++this._end;
						}
						this._fragment = new Literal(parseInt(this._expr.substring(this._start + 1, this._end), 16));
					}
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
							case 'void': this._fragment = typeVoid; break;
							case 'boolean': this._fragment = typeBoolean; break;
							case 'number': this._fragment = typeNumber; break;
							case 'buffer': this._fragment = typeBuffer; break;
							case 'string': this._fragment = typeString; break;
							case 'array': this._fragment = typeArray; break;
							case 'object': this._fragment = typeObject; break;
							case 'function': this._fragment = typeFunction; break;
							default: this._fragment = token; break;
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
						this._fragment = new Literal(parseFloat(this._expr.substring(this._start, this._end)));
					}
					else if (isQuotation(c)) {
						while (this._expr.charAt(this._end) !== '' && this._expr.charAt(this._end) !== c) {
							++this._end;
						}
						if (this._end >= this._expr.length) {
							this._start = this._expr.length;
							throw new Error(`missing closing quotation mark ${c}`);
						}
						this._fragment = new Literal(this._expr.substring(this._start + 1, this._end++));
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
