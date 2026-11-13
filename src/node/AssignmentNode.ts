import { Node } from "./Node.js";
import { CallNode } from "./CallNode.js";
import { AssignableNode } from "./AssignableNode.js";
import { ParserSpan } from "../ParserSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class AssignmentNode extends Node {

	constructor(
		span: ParserSpan,
		protected _anode: AssignableNode,
		protected _subnode: Node,
		protected readonly _compound = false,
	) {
		super(span);
	}

	override get type(): Type {
		return this._anode.reduceAssignmentType(this._subnode.type) ?? this._anode.type;
	}

	override acceptType(type: Type): boolean {
		return super.acceptType(type)
			&& (!type.accept(this._subnode.type) || this._subnode.acceptType(type));
	}

	override validateType(type: Type): void {
		super.validateType(type);
		if (type.accept(this._subnode.type)) {
			this._subnode.validateType(type);
		}
	}

	override compile(hint: Type): Node {
		this._subnode = this._subnode.compile(hint);
		this._anode = this._anode.compileAssignment(this._subnode.type);
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		const resolver = this._anode.resolver(frame);
		return resolver.set(this._compound
			? (this._subnode as CallNode).evaluate(frame, [resolver.get()])
			: this._subnode.evaluate(frame));
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} assignment node anode:\n${this._anode.toString(ident + 1)}\n`
			+ `${super.toString(ident)} assignment node subnode:\n${this._subnode.toString(ident + 1)}`;
	}

}
