import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class TernaryNode extends Node {

	constructor(
		span: ParserSpan,
		protected _cnode: Node,
		protected _subnodes: Node[],
	) {
		super(span);
		if (_subnodes.length !== 2) {
			this.throwError(`switch requires 2 subnodes not ${_subnodes.length}`);
		}
	}

	override get type(): Type {
		return this._cnode.type.isNever ? Type.Never : Type.union(...this._subnodes.map((i) => i.type));
	}

	override acceptType(type: Type): boolean {
		return this._cnode.type.isNever || this._subnodes.every((node) => node.acceptType(type));
	}

	override validateType(type: Type): void {
		if (!this._cnode.type.isNever) {
			for (const node of this._subnodes) {
				node.validateType(type);
			}
		}
	}

	override compile(hint: Type): Node {
		this._cnode = this._cnode.compile(Type.Boolean);
		this._cnode.validateType(this._cnode.type.isOptional ? Type.OptionalBoolean : Type.Boolean);
		if (this._cnode.constant) {
			const index = this._cnode.evaluate(new CallFrame()) ? 0 : 1;
			this._subnodes[1 - index] = this._subnodes[1 - index].compile(hint);
			return this._subnodes[index].compile(hint);
		}
		for (let i = 0; i < this._subnodes.length; ++i) {
			this._subnodes[i] = this._subnodes[i].compile(hint);
		}
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		return this._cnode.evaluate(frame)
			? this._subnodes[0].evaluate(frame)
			: this._subnodes[1].evaluate(frame);
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map((s) => s.toString(ident + 1)).join("\n");
		return `${super.toString(ident)} switch node cnode:\n${this._cnode.toString(ident + 1)}\n`
			+ `${super.toString(ident)} switch node subnodes:\n${subnodes}`;
	}

}
