export class ParserFrame {

	constructor(
		protected readonly _expr: string,
		protected _start = 0,
		protected _end = 0,
	) {}

	get expr() {
		return this._expr;
	}

	get start() {
		return this._start;
	}

	get end() {
		return this._end;
	}

	starts(frame?: ParserFrame) {
		if (frame) {
			this._start = frame.start;
			return this;
		}
		return new ParserFrame(this._expr, this._start, this._end);
	}

	ends(frame?: ParserFrame) {
		if (frame) {
			this._end = frame.end;
			return this;
		}
		return new ParserFrame(this._expr, this._start, this._end);
	}

	throwError(message: string): never {
		const offset = this._start < 32 ? 0 : this._start - 32;
		const length = this._end < this._start ? 0 : this._end - this._start - 1;
		let expr = '';
		for (let i = 0; i < this._expr.length; ++i) {
			const c = this._expr[i];
			expr += SPACE_SYMBOLS.includes(c) ? ' ' : c;
		}
		throw new Error(`error: ${message} at position ${this._start}:\n${expr.substring(offset, offset + 60)}\n` +
			`${' '.repeat(expr.substring(offset, this._start).length)}^${'\''.repeat(length)}`);
	}

	toString() {
		return `[${this._start}:${this._end}]`;
	}

}

const SPACE_SYMBOLS = [
	// Whitespace and line-breaking characters
	'\t', // tab
	'\n', // newline
	'\r', // carriage return
	'\f', // form feed
	'\v', // vertical tab
	// Unicode spaces and separators
	'\u00A0', // no-break space
	'\u1680', // ogham space mark
	'\u180E', // mongolian vowel separator
	'\u2000', // en quad
	'\u2001', // em quad
	'\u2002', // en space
	'\u2003', // em space
	'\u2004', // three-per-em space
	'\u2005', // four-per-em space
	'\u2006', // six-per-em space
	'\u2007', // figure space
	'\u2008', // punctuation space
	'\u2009', // thin space
	'\u200A', // hair space
	'\u2028', // line separator
	'\u2029', // paragraph separator
	'\u205F', // medium mathematical space
	'\u3000', // ideographic space
	// Zero-width & directional formatting characters
	'\u200B', // zero-width space
	'\u200C', // zero-width non-joiner
	'\u200D', // zero-width joiner
	'\u2060', // word joiner
	'\uFEFF', // byte order mark
];