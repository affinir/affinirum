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

	frame(): ParserFrame {
		return new ParserFrame(this._expr, this._start, this._end);
	}

}
