import { Node } from "../Node.js";
import { ScriptSpan } from "../ScriptSpan.js";
import { ConstantNode } from "./ConstantNode.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class ObjectNode extends Node {

	protected _type: Type;

	constructor(
		span: ScriptSpan,
		protected _subnodes: [Node, Node][],
	) {
		super(span);
		this._type = Type.objectType(_subnodes.filter(([i]) => i instanceof ConstantNode && i.constant).map(([k, v]) => [k.evaluate(new CallFrame()) as string, v.type]));
	}

	override get type(): Type {
		return this._type;
	}

	override compile(type: Type): Node {
		this._type = this.reduceType(type);
		for (let i = 0; i < this._subnodes.length; ++i) {
			this._subnodes[i][0] = this._subnodes[i][0].compile(Type.String);
			this._subnodes[i][1] = this._subnodes[i][1].compile(Type.Unknown);
		}
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		const result: { [ key: string ]: Value } = Object.create(null);
		for (const [key, value] of this._subnodes) {
			result[key.evaluate(frame) as string] = value.evaluate(frame);
		}
		return result;
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map(([k, v]) => `${k.toString(ident + 1)}:\n${v.toString(ident + 1)}`).join("\n");
		return `${super.toString(ident)} object node subnodes:\n${subnodes}`;
	}

}
