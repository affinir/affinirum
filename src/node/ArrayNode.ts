import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class ArrayNode extends Node {

	protected _type: Type;

	constructor(
		span: ParserSpan,
		protected _subnodes: Node[],
	) {
		super(span);
		this._type = Type.arrayType(_subnodes.map((i) => i.type));
	}

	override get type(): Type {
		return this._type;
	}

	override acceptType(type: Type): boolean {
		return this.type.isNever || super.acceptType(type)
			&& this._subnodes.every((node, index) => node.acceptType(type.arrayAtomValType(index)));
	}

	override validateType(type: Type): void {
		super.validateType(type);
		if (!type.isVoid && !this.type.isNever) {
			for (let i = 0; i < this._subnodes.length; ++i) {
				this._subnodes[i].validateType(type.arrayAtomValType(i));
			}
		}
	}

	override compile(hint: Type): Node {
		const valTypes: Type[] = [];
		for (let i = 0; i < this._subnodes.length; ++i) {
			this._subnodes[i] = this._subnodes[i].compile(hint.arrayAtomValType(i));
			valTypes.push(this._subnodes[i].type);
		}
		this._type = valTypes.some((type) => type.isNever) ? Type.Never : Type.arrayType(valTypes);
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		const result = this._subnodes.map((node) => node.evaluate(frame));
		return frame.define(result, this.type);
	}

	override get constant(): boolean {
		return this._subnodes.every((node) => node.constant);
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map((s) => s.toString(ident + 1)).join("\n");
		return `${super.toString(ident)} array node subnodes:\n${subnodes}`;
	}

}
