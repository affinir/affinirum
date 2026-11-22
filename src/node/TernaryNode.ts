import { Node } from "./Node.js";
import { ConstantNode } from "./ConstantNode.js";
import { Constant } from "../Constant.js";
import { ParserSpan } from "../ParserSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class TernaryNode extends Node {

	protected _cnode: Node;
	protected _tnode: Node;
	protected _enode: Node;

	constructor(
		span: ParserSpan,
		cnode: Node,
		tnode: Node,
		enode: Node = new ConstantNode(span, Constant.Null),
	) {
		super(span);
		this._cnode = cnode;
		this._tnode = tnode;
		this._enode = enode;
	}

	override get type(): Type {
		return this._cnode.type.isNever ? Type.Never : Type.union(this._tnode.type, this._enode.type);
	}

	override satisfies(type: Type): boolean {
		return this._cnode.type.isNever || this._tnode.satisfies(type) && this._enode.satisfies(type);
	}

	override compile(type = Type.Any): Node {
		this._cnode = this._cnode.compile(Type.Boolean);
		if (this._cnode.constant) {
			if (this._cnode.evaluate(new CallFrame())) {
				this._enode = this._enode.compile();
				return this._tnode.compile(type);
			}
			this._tnode = this._tnode.compile();
			return this._enode.compile(type);
		}
		const branchType = this._cnode.type.isNever ? Type.Any : type;
		this._tnode = this._tnode.compile(branchType);
		this._enode = this._enode.compile(branchType);
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		return this._cnode.evaluate(frame)
			? this._tnode.evaluate(frame)
			: this._enode.evaluate(frame);
	}

	override toString(ident: number = 0): string {
		const subnodes = `${this._tnode.toString(ident + 1)}\n${this._enode.toString(ident + 1)}`;
		return `${super.toString(ident)} ternary node condition node:\n${this._cnode.toString(ident + 1)}\n`
			+ `${super.toString(ident)} ternary node subnodes:\n${subnodes}`;
	}

}
