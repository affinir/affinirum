import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class ArrayNode extends Node {

	protected _subnodes: Node[];
	protected _uniform: boolean;
	protected _type: Type;

	constructor(
		span: ParserSpan,
		subnodes: Node[],
		uniform: boolean = false,
	) {
		super(span);
		this._subnodes = subnodes;
		this._uniform = uniform;
		const types = subnodes.map((i) => i.type);
		this._type = Type.arrayType(uniform ? Type.union(...types) : types);
	}

	override get type(): Type {
		return this._type;
	}

	override satisfies(type: Type): boolean {
		return this.type.isNever || super.satisfies(type)
			&& this._subnodes.every((node, index) => node.satisfies(type.arrayAtomValType(index)));
	}

	override compile(type = Type.Unknown): Node {
		const valTypes: Type[] = [];
		let never = false;
		for (let i = 0; i < this._subnodes.length; ++i) {
			this._subnodes[i] = this._subnodes[i].compile(type.arrayAtomValType(i));
			never ||= this._subnodes[i].type.isNever;
			valTypes.push(this._subnodes[i].type);
		}
		this._type = never
			? Type.Never
			: Type.arrayType(this._uniform ? Type.union(...valTypes) : valTypes);
		return super.compile(type);
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
