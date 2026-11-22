import { Type } from "./Type.js";
import { Value } from "./Value.js";
import { Constant } from "./Constant.js";
import { ParserSpan } from "./ParserSpan.js";
import { funcRange } from "./native/Array.js";
import { funcOr, funcAnd, funcNot } from "./native/Boolean.js";
import { parseLiteralBuffer } from "./native/Buffer.js";
import { funcAt, funcOptionalAt, funcHas, funcOptionalHas } from "./native/Composite.js";
import { funcAdd } from "./native/Aggregable.js";
import { funcGreaterThan, funcLessThan, funcGreaterOrEqual, funcLessOrEqual,
	funcSubtract, funcMultiply, funcDivide, funcRemainder, funcPower, isNumericSymbol, parseLiteralNumber } from "./native/Number.js";
import { funcCoalesce, funcEquals, funcNotEquals } from "./native/Unknown.js";
import { isIdentifierStartSymbol, isIdentifierSymbol, isWhiteSpaceSymbol, parseLiteralString } from "./native/String.js";
import { parseLiteralTimestamp } from "./native/Timestamp.js";

class Literal { constructor(public readonly value: Value) {} }

export class ParserState extends ParserSpan {

	protected readonly _tokens = new Map(tokens);
	protected readonly _assignments = new Set(assignments);
	protected readonly _punctuators = new Set(punctuators);
	protected readonly _operators = new Set(operators)

	protected _value: Type | Constant | Literal | string | false | undefined;

	constructor(script: string) {
		super(script);
	}

	equals(...tokens: string[]): boolean {
		return tokens.includes(this.text());
	}

	get isEnded(): boolean {
		return this._start === this._script.length;
	}

	get isType(): boolean {
		return this._value instanceof Type;
	}

	get isConstant(): boolean {
		return this._value instanceof Constant;
	}

	get isLiteral(): boolean {
		return this._value instanceof Literal;
	}

	get isIdentifier(): boolean {
		return typeof this._value === "string";
	}

	get isAssignment(): boolean {
		return this._assignments.has(this.text());
	}

	get isPunctuator(): boolean {
		return this._punctuators.has(this.text());
	}

	get isOperator(): boolean {
		return this._operators.has(this.text());
	}

	get type(): Type {
		return this._value as Type;
	}

	get constant(): Constant {
		return this._value as Constant;
	}

	get literal(): Literal {
		return this._value as Literal;
	}

	get identifier(): string {
		return this._value as string;
	}

	openParentheses() {
		if (!this.equals("(")) {
			this.throwError("missing opening parentheses");
		}
	}

	closeParentheses() {
		if (!this.equals(")")) {
			this.throwError("missing closing parentheses");
		}
	}

	openBrackets() {
		if (!this.equals("[")) {
			this.throwError("missing opening brackets");
		}
	}

	closeBrackets() {
		if (!this.equals("]")) {
			this.throwError("missing closing brackets");
		}
	}

	openBraces() {
		if (!this.equals("{")) {
			this.throwError("missing opening braces");
		}
	}

	closeBraces() {
		if (!this.equals("}")) {
			this.throwError("missing closing braces");
		}
	}

	assertColon() {
		if (!this.equals(":")) {
			this.throwError("missing colon separator")
		}
	}

	next(): ParserState {
		this._value = undefined;
		while (this._end < this._script.length && this._value == null) {
			this._start = this._end;
			const c = this._script.charAt(this._end);
			++this._end;
			if (isIdentifierStartSymbol(c)) {
				while (isIdentifierSymbol(this._script.charAt(this._end))) {
					++this._end;
				}
				this._value = this._tokens.get(this.text()) ?? this.text();
			}
			else if (isNumericSymbol(c)) {
				const [num, numEnd] = parseLiteralNumber(this._script, this._start);
				this._end = numEnd;
				this._value = new Literal(num);
			}
			else {
				const token = symbolics.get(c)?.find((i) => this._script.startsWith(i, this._start));
				if (token) {
					this._end = this._start + token.length;
					if (token === "//") {
						while (this._script.charAt(this._end) !== "" &&
							this._script.charAt(this._end) !== "\n") {
							++this._end;
						}
					}
					else if (token === "///") {
						this._end = this._script.indexOf("///", this._end);
						if (this._end < 0) {
							this._start = this._end = this._script.length;
							throw new Error("missing closing comment mark");
						}
						this._end += 3;
					}
					else if (token === "@") {
						const [ts, tsEnd] = parseLiteralTimestamp(this._script, this._start);
						this._end = tsEnd;
						if (Number.isNaN(ts.getTime())) {
							this.throwError("invalid timestamp");
						}
						this._value = new Literal(ts);
					}
					else if (token === "`") {
						const [buf, bufEnd] = parseLiteralBuffer(this._script, this._start);
						this._end = bufEnd;
						this._value = new Literal(buf);
					}
					else if (token === "'" || token === "\"") {
						const [str, strEnd] = parseLiteralString(this._script, this._start);
						this._end = strEnd;
						this._value = new Literal(str);
					}
					else {
						this._value = this._tokens.get(token);
					}
				}
				else if (!isWhiteSpaceSymbol(c)) {
					throw new Error(`unexpected symbol ${c}`);
				}
			}
		}
		if (this._end > this._script.length || this._value == null) {
			this._start = this._end = this._script.length;
		}
		return this;
	}

}

const tokens: [string, Type | Constant | Literal | false][] = [
	["var", false],
	["val", false],
	["func", false],
	["function", false],
	["if", false],
	["then", false],
	["else", false],
	["match", false],
	["when", false],
	["while", false],
	["loop", false],
	["until", false],
	["next", false],
	["exit", false],
	["true", new Literal(true)],
	["false", new Literal(false)],
	["null", new Literal(undefined)],
	["never", false],
	["any", Type.Any],
	["bool", Type.Boolean],
	["boolean", Type.Boolean],
	["time", Type.Timestamp],
	["timestamp", Type.Timestamp],
	["f64", Type.Float],
	["float", Type.Float],
	["i64", Type.Integer],
	["integer", Type.Integer],
	["buffer", Type.Buffer],
	["string", Type.String],
	["?:", funcCoalesce],
	["|", funcOr],
	["or", funcOr],
	["&", funcAnd],
	["and", funcAnd],
	["!", funcNot],
	["not", funcNot],
	["!=", funcNotEquals],
	["==", funcEquals],
	[">", funcGreaterThan],
	[">=", funcGreaterOrEqual],
	["<", funcLessThan],
	["<=", funcLessOrEqual],
	["+", funcAdd],
	["-", funcSubtract],
	["*", funcMultiply],
	["**", funcPower],
	["/", funcDivide],
	["%", funcRemainder],
	[".", funcAt],
	[".?", funcHas],
	["?.", funcOptionalAt],
	["?.?", funcOptionalHas],
	["?[", funcOptionalAt],
	["=", false],
	["|=", funcOr],
	["&=", funcAnd],
	["+=", funcAdd],
	["-=", funcSubtract],
	["*=", funcMultiply],
	["/=", funcDivide],
	["%=", funcRemainder],
	["(", false],
	[")", false],
	["[", funcAt],
	["]", false],
	["{", false],
	["}", false],
	[";", false],
	[":", false],
	[",", false],
	["?", false],
	["->", false],
	["=>", false],
	["..", funcRange],
	["...", false],
	["//", false],
	["///", false],
	["@", false],
	["`", false],
	["'", false],
	["\"", false],
];

const assignments = [
	"=",
	"|=",
	"&=",
	"+=",
	"-=",
	"*=",
	"/=",
	"%=",
];

const punctuators: string[] = [
	"(",
	")",
	"[",
	"]",
	"{",
	"}",
	";",
	":",
	",",
	"->",
	"?",
	"=>",
	".",
	".?",
	"...",
	"//",
	"///",
	"@",
	"`",
	"'",
	"\"",
];

const operators: string[] = [
	"..",
	"?:",
	"|",
	"or",
	"&",
	"and",
	"!",
	"not",
	"!=",
	"==",
	">",
	">=",
	"<",
	"<=",
	"+",
	"-",
	"*",
	"**",
	"/",
	"%",
	"=",
	"|=",
	"&=",
	"+=",
	"-=",
	"*=",
	"/=",
	"%=",
];

export const keywords = new Set<string>();
const symbolics = new Map<string, string[]>();

for (const [lexeme] of tokens) {
	const first = lexeme.charAt(0);
	if (isIdentifierStartSymbol(first)) {
		keywords.add(lexeme);
	}
	else {
		const bucket = symbolics.get(first);
		if (bucket) {
			bucket.push(lexeme);
		}
		else {
			symbolics.set(first, [lexeme]);
		}
	}
}
for (const bucket of symbolics.values()) {
	bucket.sort((a, b) => b.length - a.length);
}
