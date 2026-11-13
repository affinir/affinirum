import { ParserSpan } from "../ParserSpan.js";
import { Type } from "../Type.js";
import { Value } from "../Value.js";
import { CallFrame } from "../CallFrame.js";

export abstract class Node extends ParserSpan {

	constructor(
		span: ParserSpan,
	) {
		super(span);
	}

	get type(): Type {
		return Type.Void;
	}

	abstract compile(hint: Type): Node;
	abstract evaluate(frame: CallFrame): Value;

	acceptType(type: Type): boolean {
		return type.accept(this.type);
	}

	validateType(type: Type): void {
		if (!type.isVoid && !this.acceptType(type)) {
			this._throwTypeError(type);
		}
	}

	get constant(): boolean {
		return false;
	}

	toString(ident: number = 0): string {
		return "  ".repeat(ident) + `[${this._start}:${this._end}] <${this.type}>`;
	}

	protected _throwTypeError(type: Type): never {
		return this.throwError(`type ${this.type} mismatch with expected type ${type}`);
	}

}
