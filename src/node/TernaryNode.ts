import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class TernaryNode extends Node {

	protected _cnode: Node;
	protected _subnodes: Node[];

	constructor(
		span: ParserSpan,
		cnode: Node,
		subnodes: Node[],
	) {
		super(span);
		this._cnode = cnode;
		this._subnodes = subnodes.slice(0, 2);
	}

	override get type(): Type {
		return this._cnode.type.isNever ? Type.Never : Type.union(...this._subnodes.map((i) => i.type));
	}

	override satisfies(type: Type): boolean {
		return this._cnode.type.isNever || this._subnodes.every((node) => node.satisfies(type));
	}

	override compile(type = Type.Unknown): Node {
		this._cnode = this._cnode.compile(Type.Boolean);
		if (this._cnode.constant) {
			const index = this._cnode.evaluate(new CallFrame()) ? 0 : 1;
			this._subnodes[1 - index] = this._subnodes[1 - index].compile();
			return this._subnodes[index].compile(type);
		}
		const branchType = this._cnode.type.isNever ? Type.Unknown : type;
		for (let i = 0; i < this._subnodes.length; ++i) {
			this._subnodes[i] = this._subnodes[i].compile(branchType);
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
