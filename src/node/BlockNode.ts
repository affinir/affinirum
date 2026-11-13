import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { Constant } from "../Constant.js";
import { ConstantNode } from "./ConstantNode.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";
import { Variable } from "../Variable.js";

export class BlockNode extends Node {

	constructor(
		span: ParserSpan,
		protected _subnodes: Node[],
		protected readonly _variables: Variable[] = [],
	) {
		super(span);
	}

	override get type(): Type {
		if (this._subnodes.some((node) => node.type.isNever)) {
			return Type.Never;
		}
		return this._subnodes.length ? this._subnodes[this._subnodes.length - 1].type : super.type;
	}

	override acceptType(type: Type): boolean {
		return this.type.isNever || (this._subnodes.at(-1)?.acceptType(type) ?? super.acceptType(type));
	}

	override validateType(type: Type): void {
		const last = this._subnodes.at(-1);
		if (last && !this.type.isNever) {
			last.validateType(type);
		}
		else {
			super.validateType(type);
		}
	}

	override compile(hint: Type): Node {
		if (this._subnodes.length === 0) {
			return new ConstantNode(this, Constant.Null);
		}
		let constant = true;
		for (let i = 0, last = this._subnodes.length - 1; i < this._subnodes.length; ++i) {
			this._subnodes[i] = this._subnodes[i].compile(i < last ? Type.Unknown : hint);
			constant &&= this._subnodes[i].constant;
		}
		if (constant && !this.type.intersect(Type.Reference)) {
			return new ConstantNode(this, new Constant(this.evaluate(new CallFrame()), this.type));
		}
		if (this._subnodes.length === 1 && this._variables.length === 0) {
			return this._subnodes[0];
		}
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		const subframe = this._variables.length ? frame.subframe(this._variables) : frame;
		let result: Value = undefined;
		for (const subnode of this._subnodes) {
			result = subnode.evaluate(subframe);
		}
		return result;
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map((s) => s.toString(ident + 1)).join("\n");
		return `${super.toString(ident)} block node subnodes:\n${subnodes}`;
	}

}
