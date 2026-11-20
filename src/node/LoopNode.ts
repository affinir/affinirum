import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { JumpNode } from "./JumpNode.js";
import { CallFrame } from "../CallFrame.js";

export class LoopNode extends Node {

	protected _subnode: Node;
	protected _wnode: Node | undefined;
	protected _unode: Node | undefined;

	constructor(
		span: ParserSpan,
		subnode: Node,
		wnode: Node | undefined,
		unode: Node | undefined,
	) {
		super(span);
		this._subnode = subnode;
		this._wnode = wnode;
		this._unode = unode;
	}

	override get type(): Type {
		return this._wnode?.type.isNever ? Type.Never : this._subnode.type.toOptional();
	}

	override satisfies(type: Type): boolean {
		return this.type.isNever || super.satisfies(type) && this._subnode.satisfies(type);
	}

	override compile(type = Type.Any): Node {
		this._wnode = this._wnode?.compile(Type.Boolean);
		this._unode = this._unode?.compile(Type.Boolean);
		this._subnode = this._subnode.compile(this._wnode?.type.isNever ? Type.Any : type);
		return super.compile(type);
	}

	override evaluate(frame: CallFrame): Value {
		let result: Value = undefined;
		while (true) {
			frame.timer();
			if (this._wnode && !this._wnode.evaluate(frame)) {
				break;
			}
			try {
				result = this._subnode.evaluate(frame);
			}
			catch (e) {
				if (!(e instanceof JumpNode)) {
					throw e;
				}
				if (e.action === "exit") {
					break;
				}
			}
			if (this._unode && this._unode.evaluate(frame)) {
				break;
			}
		}
		return result;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} loop node subnode:\n${this._subnode.toString(ident + 1)}` +
			(this._wnode ? `\n${super.toString(ident)} loop node while node:\n${this._wnode.toString(ident + 1)}` : "") +
			(this._unode ? `\n${super.toString(ident)} loop node until node:\n${this._unode.toString(ident + 1)}` : "");
	}

}
