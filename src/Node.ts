import { ParserFrame } from './ParserFrame.js';
import { Value } from './Value.js';
import { IType } from './Type.js';

export abstract class Node extends ParserFrame {

	constructor(
		frame: ParserFrame,
	) {
		super(frame.expr, frame.start, frame.end);
	}

	abstract type: IType;
	abstract compile(type: IType): Node;
	abstract evaluate(): Value;

	get constant(): boolean {
		return false;
	}

	protected reduceType(type: IType) {
		const compiledType = this.type.reduce(type);
		if (compiledType) {
			return compiledType;
		}
		this.throwTypeError(type);
	}

	protected throwTypeError(type: IType): never {
		return this.throwError(`type ${this.type} mismatch with expected type ${type}`);
	}

	toString(ident: number = 0): string {
		return '  '.repeat(ident) + `[${this._start}:${this.end}] <${this.type}>`;
	}

}
