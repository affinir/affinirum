export class ParserSpan {

	protected readonly _script: string;
	protected _start = 0;
	protected _end = 0;

	protected constructor(span: ParserSpan | string) {
		if (typeof span === "string") {
			this._script = span;
		}
		else {
			this._script = span._script;
			this._start = span._start;
			this._end = span._end;
		}
	}

	start() {
		return new ParserSpan(this);
	}

	end(span: ParserSpan) {
		this._end = span._end;
		return this;
	}

	throwError(message: string): never {
		const offset = this._start < 32 ? 0 : this._start - 32;
		const length = this._end < this._start ? 0 : this._end - this._start - 1;
		let expr = "";
		for (let i = 0; i < this._script.length; ++i) {
			const c = this._script[i];
			expr += SPACE_SYMBOLS.includes(c) ? " " : c;
		}
		throw new Error(`error: ${message} at position ${this._start}:\n${expr.substring(offset, offset + 60)}\n` +
			`${" ".repeat(expr.substring(offset, this._start).length)}^${"'".repeat(length)}`);
	}

	toString() {
		return `[${this._start}:${this._end}]`;
	}

}

const SPACE_SYMBOLS = [
	// Whitespace and line-breaking characters
	"\t", // tab
	"\n", // newline
	"\r", // carriage return
	"\f", // form feed
	"\v", // vertical tab
	// Unicode spaces and separators
	"\u00A0", // no-break space
	"\u1680", // ogham space mark
	"\u180E", // mongolian vowel separator
	"\u2000", // en quad
	"\u2001", // em quad
	"\u2002", // en space
	"\u2003", // em space
	"\u2004", // three-per-em space
	"\u2005", // four-per-em space
	"\u2006", // six-per-em space
	"\u2007", // figure space
	"\u2008", // punctuation space
	"\u2009", // thin space
	"\u200A", // hair space
	"\u2028", // line separator
	"\u2029", // paragraph separator
	"\u205F", // medium mathematical space
	"\u3000", // ideographic space
	// Zero-width & directional formatting characters
	"\u200B", // zero-width space
	"\u200C", // zero-width non-joiner
	"\u200D", // zero-width joiner
	"\u2060", // word joiner
	"\uFEFF", // byte order mark
];
