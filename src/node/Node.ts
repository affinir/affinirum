import { ScriptSpan } from "../ScriptSpan.js";
import { Type } from "../Type.js";
import { Value } from "../Value.js";
import { CallFrame } from "../CallFrame.js";

export abstract class Node extends ScriptSpan {

	constructor(
		span: ScriptSpan,
	) {
		super(span);
	}

	get type(): Type {
		return Type.Void;
	}

	abstract compile(type: Type): Node;
	abstract evaluate(frame: CallFrame): Value;

	get constant(): boolean {
		return false;
	}

	protected reduceType(type: Type) {
		const compiledType = this.type.reduce(type);
		if (compiledType) {
			return compiledType;
		}
		this.throwTypeError(type);
	}

	protected throwTypeError(type: Type): never {
		return this.throwError(`type ${this.type} mismatch with expected type ${type}`);
	}

	toString(ident: number = 0): string {
		return "  ".repeat(ident) + `[${this._start}:${this._end}] <${this.type}>`;
	}

}
