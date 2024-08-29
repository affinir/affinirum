export class ParserFrame {

	constructor(
		protected readonly _expr: string,
		protected _start = 0,
		protected _end = 0,
	) {}

	get expr(): string {
		return this._expr;
	}

	get start(): number {
		return this._start;
	}

	get end(): number {
		return this._end;
	}

	starts(start: number): ParserFrame {
		this._start = start;
		return this;
	}

	ends(end: number): ParserFrame {
		this._end = end;
		return this;
	}

	frame(token?: string): ParserFrame {
		return token
			? new ParserFrame(this._expr, this._expr.indexOf(token), this._expr.indexOf(token) + token.length)
			: new ParserFrame(this._expr, this._start, this._end);
	}

	throwError(message: string): never {
		const offset = this._start < 32 ? 0 : this._start - 32;
		const length = this._end < this._start ? 0 : this._end - this._start - 1;
		throw new Error(`error: ${message} at position ${this._start}:\n${this._expr.substring(offset, offset + 60)}\n` +
			`${' '.repeat(this._expr.substring(offset, this._start).length)}^${'\''.repeat(length)}`);
	}

}
