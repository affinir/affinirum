import { Node } from "../Node.js";
import { ScriptSpan } from "../ScriptSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class ArrayNode extends Node {

	protected _type: Type;

	constructor(
		span: ScriptSpan,
		protected _subnodes: Node[],
	) {
		super(span);
		this._type = Type.arrayType(_subnodes.map((i) => i.type));
	}

	override get type(): Type {
		return this._type;
	}

	override compile(type: Type): Node {
		for (let i = 0; i < this._subnodes.length; ++i) {
			const valType = type.arrayAtomValType(i);
			this._subnodes[i] = this._subnodes[i].compile(valType);
		}
		this._type = Type.arrayType(
			this._subnodes.map((node) => node.type)
		);
		this._type = this.reduceType(type);
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		const result: Value[] = [];
		for (const subnode of this._subnodes) {
			result.push(subnode.evaluate(frame));
		}
		return result;
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map((s) => s.toString(ident + 1)).join("\n");
		return `${super.toString(ident)} array node subnodes:\n${subnodes}`;
	}

}
