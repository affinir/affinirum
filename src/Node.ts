import { ParserFrame } from './ParserFrame.js';
import { ValueType, Value } from './ValueType.js';
import { FunctionType } from './FunctionType.js';

export abstract class Node extends ParserFrame {

	constructor(
		frame: ParserFrame,
	) {
		super(frame.expr, frame.start, frame.end);
	}

	abstract type: ValueType;
	abstract compile(type: ValueType): Node;
	abstract evaluate(): Value;

	get constant(): boolean {
		return false;
	}

	get signature(): FunctionType | undefined {
		return;
	}

	protected reduceType(type: ValueType) {
		const compiledType = this.type.reduce(type);
		if (compiledType) {
			return compiledType;
		}
		this.throwTypeError(type);
	}

	protected throwTypeError(type: ValueType): never {
		return this.throwError(`type ${this.type} mismatch with expected type ${type}`);
	}

	toString(ident: number = 0): string {
		return '  '.repeat(ident) + `[${this._start}:${this.end}] <${this.type}>`;
	}

}
