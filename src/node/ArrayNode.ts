import { Node } from "../Node.js";
import { ParserFrame } from "../ParserFrame.js";
import { Constant } from "../Constant.js";
import { ConstantNode } from "./ConstantNode.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";

export class ArrayNode extends Node {

	constructor(
		frame: ParserFrame,
		protected _subnodes: Node[],
	) {
		super(frame);
	}

	override get type(): Type {
		return Type.Array;
	}

	override compile(type: Type): Node {
		this.reduceType(type);
		let constant = true;
		for (let i = 0; i < this._subnodes.length; ++i) {
			this._subnodes[i] = this._subnodes[i].compile(Type.Unknown);
			constant &&= this._subnodes[i].constant;
		}
		if (constant) {
			return new ConstantNode(this, new Constant(this.evaluate(), this.type));
		}
		return this;
	}

	override evaluate(): Value {
		const result: Value[] = [];
		for (const subnode of this._subnodes) {
			result.push(subnode.evaluate());
		}
		return result;
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map((s)=> s.toString(ident + 1)).join("\n");
		return `${super.toString(ident)} array node subnodes:\n${subnodes}`;
	}

}
