import { funcOr, funcAnd, funcNot } from "./constant/Boolean.js";
import { parseBuffer } from "./constant/Buffer.js";
import { funcAdd } from "./constant/Enumerable.js";
import { isSignSymbol, isTokenStartSymbol, isNumericSymbol, isTokenSymbol, isDateSymbol, isTimeSymbol, isDateTimeSeparatorSymbol,
	replaceWith } from "./constant/String.js";
import { Constant } from "./Constant.js";
import { funcGreaterThan, funcLessThan, funcGreaterOrEqual, funcLessOrEqual,
	funcSubtract, funcMultiply, funcDivide, funcRemainder, funcPower } from "./constant/Number.js";
import { funcCoalesce, funcEqual, funcNotEqual } from "./constant/Unknown.js";
import { Value } from "./Value.js";
import { Type } from "./Type.js";
import { ParserFrame } from "./ParserFrame.js";

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
const idParenthesesOpen = Symbol();
const idParenthesesClose = Symbol();
const idBracketsOpen = Symbol();
const idBracketsClose = Symbol();
const idBracesOpen = Symbol();
const idBracesClose = Symbol();
const idSemicolon = Symbol();
const idColon = Symbol();
const idComma = Symbol();
const idDot = Symbol();
const idQuestion = Symbol();
const idTilda = Symbol();
const idEllipsis = Symbol();
const idVar = Symbol();
const idVal = Symbol();
const idWhile = Symbol();
const idIf = Symbol();
const idElse = Symbol();

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
		return typeof this._fragment === "string";
	}

	get isParenthesesOpen(): boolean {
		return this._fragment === idParenthesesOpen;
	}

	get isParenthesesClose(): boolean {
		return this._fragment === idParenthesesClose;
	}

	get isBracketsOpen(): boolean {
		return this._fragment === idBracketsOpen;
	}

	get isBracketsClose(): boolean {
		return this._fragment === idBracketsClose;
	}

	get isBracesOpen(): boolean {
		return this._fragment === idBracesOpen;
	}

	get isBracesClose(): boolean {
		return this._fragment === idBracesClose;
	}

	get isSemicolon(): boolean {
		return this._fragment === idSemicolon;
	}

	get isColon(): boolean {
		return this._fragment === idColon;
	}

	get isComma(): boolean {
		return this._fragment === idComma;
	}

	get isDot(): boolean {
		return this._fragment === idDot;
	}

	get isQuestion(): boolean {
		return this._fragment === idQuestion;
	}

	get isTilda(): boolean {
		return this._fragment === idTilda;
	}

	get isEllipsis(): boolean {
		return this._fragment === idEllipsis;
	}

	get isVariable(): boolean {
		return this._fragment === idVar;
	}

	get isValue(): boolean {
		return this._fragment === idVal;
	}

	get isWhile(): boolean {
		return this._fragment === idWhile;
	}

	get isIf(): boolean {
		return this._fragment === idIf;
	}

	get isElse(): boolean {
		return this._fragment === idElse;
	}

	get isVoid(): boolean {
		return this._fragment == null;
	}

	openParentheses() {
		if (!this.isParenthesesOpen) {
			this.throwError("missing opening parentheses");
		}
		return this;
	}

	closeParentheses() {
		if (!this.isParenthesesClose) {
			this.throwError("missing closing parentheses");
		}
		return this;
	}

	openBrackets() {
		if (!this.isBracketsOpen) {
			this.throwError("missing opening brackets");
		}
		return this;
	}

	closeBrackets() {
		if (!this.isBracketsClose) {
			this.throwError("missing closing brackets");
		}
		return this;
	}

	openBraces() {
		if (!this.isBracesOpen) {
			this.throwError("missing opening braces");
		}
		return this;
	}

	closeBraces() {
		if (!this.isBracesClose) {
			this.throwError("missing closing braces");
		}
		return this;
	}

	separateByColon() {
		if (!this.isColon) {
			this.throwError("missing colon separator")
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
				case " ": case "\t": case "\n": case "\r": case "\v": case "\f": break;
				case "(": this._fragment = idParenthesesOpen; break;
				case ")": this._fragment = idParenthesesClose; break;
				case "[": this._fragment = idBracketsOpen; break;
				case "]": this._fragment = idBracketsClose; break;
				case "{": this._fragment = idBracesOpen; break;
				case "}": this._fragment = idBracesClose; break;
				case ";": this._fragment = idSemicolon; break;
				case ":": this._fragment = idColon; break;
				case ",": this._fragment = idComma; break;
				case "~": this._fragment = idTilda; break;
				case "?":
					switch (this._expr.charAt(this._end)) {
						case "?": ++this._end; this._fragment = Type.Unknown; break;
						case ":": ++this._end; this._fragment = funcCoalesce; break;
						default: this._fragment = idQuestion; break;
					}
					break;
				case "|":
					switch (this._expr.charAt(this._end)) {
						case "=": ++this._end; this._fragment = funcOrAssignment; break;
						default: this._fragment = funcOr; break;
					}
					break;
				case "&":
					switch (this._expr.charAt(this._end)) {
						case "=": ++this._end; this._fragment = funcAndAssignment; break;
						default: this._fragment = funcAnd; break;
					}
					break;
				case ">":
					switch (this._expr.charAt(this._end)) {
						case "=": ++this._end; this._fragment = funcGreaterOrEqual; break;
						default: this._fragment = funcGreaterThan; break;
					}
					break;
				case "<":
					switch (this._expr.charAt(this._end)) {
						case "=": ++this._end; this._fragment = funcLessOrEqual; break;
						default: this._fragment = funcLessThan; break;
					}
					break;
				case "!":
					switch (this._expr.charAt(this._end)) {
						case "=": ++this._end; this._fragment = funcNotEqual; break;
						default: this._fragment = funcNot; break;
					}
					break;
				case "=":
					switch (this._expr.charAt(this._end)) {
						case "=": ++this._end; this._fragment = funcEqual; break;
						default: this._fragment = funcAssignment; break;
					}
					break;
				case "+":
					switch (this._expr.charAt(this._end)) {
						case "=": ++this._end; this._fragment = funcAddAssignment; break;
						default: this._fragment = funcAdd; break;
					}
					break;
				case "-":
					switch (this._expr.charAt(this._end)) {
						case "=": ++this._end; this._fragment = funcSubtractAssignment; break;
						default: this._fragment = funcSubtract; break;
					}
					break;
				case "*":
					switch (this._expr.charAt(this._end)) {
						case "=": ++this._end; this._fragment = funcMultiplyAssignment; break;
						default: this._fragment = funcMultiply; break;
					}
					break;
				case "/":
					switch (this._expr.charAt(this._end)) {
						case "=": ++this._end; this._fragment = funcDivideAssignment; break;
						default: this._fragment = funcDivide; break;
					}
					break;
				case "%":
					switch (this._expr.charAt(this._end)) {
						case "=": ++this._end; this._fragment = funcRemainderAssignment; break;
						default: this._fragment = funcRemainder; break;
					}
					break;
				case "$":
					switch (this._expr.charAt(this._end)) {
						case "$":
							while (this._expr.charAt(this._end) !== "" && this._expr.charAt(this._end) !== "\n") {
								++this._end;
							}
							break;
						default:
							while (this._expr.charAt(this._end) !== "" && this._expr.charAt(this._end) !== c) {
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
				case "^": this._fragment = funcPower; break;
				case ".":
					switch (this._expr.charAt(this._end)) {
						case ".":
							if (this._expr.charAt(++this._end) === ".") {
								++this._end;
								this._fragment = idEllipsis;
							}
							else {
								throw new Error("incomplete ellipsis ...");
							}
							break;
						default:
							this._fragment = idDot;
							break;
					}
					break;
				case "@":
					while (isDateSymbol(this._expr.charAt(this._end))) {
						++this._end;
					}
					if (isDateTimeSeparatorSymbol(this._expr.charAt(this._end))) {
						++this._end;
						while (isTimeSymbol(this._expr.charAt(this._end))) {
							++this._end;
						}
						if (this._expr.charAt(this._end) === "." && isNumericSymbol(this._expr.charAt(this._end + 1))) {
							++this._end;
							while (isNumericSymbol(this._expr.charAt(this._end))) {
								++this._end;
							}
							if (this._expr.charAt(this._end) === "Z") {
								++this._end;
							}
						}
					}
					this._fragment = new Literal(new Date(this._expr.substring(this._start + 1, this._end)));
					break;
				case "`":
					while (this._expr.charAt(this._end) !== "" && this._expr.charAt(this._end) !== c) {
						++this._end;
					}
					if (this._end >= this._expr.length) {
						this._start = this._expr.length;
						throw new Error(`missing closing buffer quotation mark ${c}`);
					}
					this._fragment = new Literal(parseBuffer(replaceWith(this._expr.substring(this._start + 1, this._end), "", " ", "\t", "\n")));
					++this._end;
					break;
				case "\"": case "'":
					while (this._expr.charAt(this._end) !== "" && this._expr.charAt(this._end) !== c) {
						++this._end;
					}
					if (this._end >= this._expr.length) {
						this._start = this._expr.length;
						throw new Error(`missing closing string quotation mark ${c}`);
					}
					this._fragment = new Literal(replaceWith(this._expr.substring(this._start + 1, this._end), "", "\\\n"));
					++this._end;
					break;
				default:
					if (isTokenStartSymbol(c)) {
						while (isTokenSymbol(this._expr.charAt(this._end))) {
							++this._end;
						}
						const token = this._expr.substring(this._start, this._end);
						switch (token) {
							case "true": this._fragment = valueTrue; break;
							case "false": this._fragment = valueFalse; break;
							case "null": this._fragment = valueNull; break;
							case "void": this._fragment = Type.Void; break;
							case "boolean": this._fragment = Type.Boolean; break;
							case "timestamp": this._fragment = Type.Timestamp; break;
							case "float": this._fragment = Type.Float; break;
							case "integer": this._fragment = Type.Integer; break;
							case "buffer": this._fragment = Type.Buffer; break;
							case "string": this._fragment = Type.String; break;
							case "array": this._fragment = Type.Array; break;
							case "object": this._fragment = Type.Object; break;
							case "function": this._fragment = Type.Function; break;
							case "var": this._fragment = idVar; break;
							case "val": this._fragment = idVal; break;
							case "while": this._fragment = idWhile; break;
							case "if": this._fragment = idIf; break;
							case "else": this._fragment = idElse; break;
							default: this._fragment = token; break;
						}
					}
					else if (isNumericSymbol(c)) {
						let integer = true;
						while (isNumericSymbol(this._expr.charAt(this._end))) {
							++this._end;
						}
						if (this._expr.charAt(this._end) === ".") {
							++this._end;
							if (isNumericSymbol(this._expr.charAt(this._end))) {
								++this._end;
								while (isNumericSymbol(this._expr.charAt(this._end))) {
									++this._end;
								}
								integer = false;
							}
							else {
								--this._end;
							}
						}
						if (this._expr.charAt(this._end) === "e") {
							++this._end;
							if (isNumericSymbol(this._expr.charAt(this._end)) || isSignSymbol(this._expr.charAt(this._end))) {
								++this._end;
								while (isNumericSymbol(this._expr.charAt(this._end))) {
									++this._end;
								}
							}
							integer = false;
						}
						this._fragment = integer
							? new Literal(BigInt(this._expr.substring(this._start, this._end)))
							: new Literal(parseFloat(this._expr.substring(this._start, this._end)));
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
