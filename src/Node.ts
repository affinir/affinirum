import { ParserFrame } from './ParserFrame.js';
import { Type, Value } from './Type.js';

export abstract class Node extends ParserFrame {

	constructor(
		frame: ParserFrame,
	) {
		super(frame.expr, frame.start, frame.end);
	}

	abstract type: Type;
	abstract compile(type: Type): Node;
	abstract evaluate(): Value;

	reduceType(type: Type) {
		const compiledType = this.type.reduce(type);
		if (compiledType) {
			return compiledType;
		}
		this.throwTypeError(type);
	}

	toString(ident: number = 0): string {
		return '  '.repeat(ident) + `[${this._start}:${this.end}] <${this.type}>`;
	}

	throwTypeError(type: Type): never {
		return this.throwError(`type ${this.type} mismatch with expected type ${type}`);
	}

}
