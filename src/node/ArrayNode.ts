import { Node } from "../Node.js";
import { ParserFrame } from "../ParserFrame.js";
import { Constant } from "../Constant.js";
import { ConstantNode } from "./ConstantNode.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";

export class ArrayNode extends Node {

	protected _type: Type;

	constructor(
		frame: ParserFrame,
		protected _subnodes: Node[],
	) {
		super(frame);
		this._type = Type.arrayType(_subnodes.map((i) => i.type));
	}

	override get type(): Type {
		return this._type;
	}

	override compile(type: Type): Node {
		let constant = true;
		for (let i = 0; i < this._subnodes.length; ++i) {
			const valType = type.arrayAtomValType(i);
			this._subnodes[i] = this._subnodes[i].compile(valType);
			constant &&= this._subnodes[i].constant;
		}
		this._type = Type.arrayType(
			this._subnodes.map((node) => node.type)
		);
		this._type = this.reduceType(type);
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
		const subnodes = this._subnodes.map((s) => s.toString(ident + 1)).join("\n");
		return `${super.toString(ident)} array node subnodes:\n${subnodes}`;
	}

}
