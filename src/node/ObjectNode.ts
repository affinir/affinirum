import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { ConstantNode } from "./ConstantNode.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class ObjectNode extends Node {

	protected _subnodes: [Node, Node][];
	protected _uniform: boolean;
	protected _type: Type;

	constructor(
		span: ParserSpan,
		subnodes: [Node, Node][],
		uniform: boolean = false,
	) {
		super(span);
		this._subnodes = subnodes;
		this._uniform = uniform;
		const types = subnodes.flatMap<[string, Type]>(([key, value]) =>
			key instanceof ConstantNode && key.constant && key.type.isString ? [[key.value as string, value.type]] : []
		);
		this._type = Type.objectType(uniform ? Type.union(...types.map((i) => i[1])) : types);
	}

	override get type(): Type {
		return this._type;
	}

	override satisfies(type: Type): boolean {
		return type.isUnknown || this.type.isNever || type.objectAtoms().some((atom) =>
			this.type.intersects(atom) && Type.objectType(atom.types).accepts(this.type) && this._subnodes.every(([keyNode, value]) => {
				const key = keyNode instanceof ConstantNode && keyNode.constant ? keyNode.value as string : undefined;
				return value.satisfies(atom.valType(key) ?? Type.Unknown);
			})
		);
	}

	override compile(type = Type.Unknown): Node {
		let objectAtoms = type.objectAtoms().filter((atom) => this._type.intersects(atom));
		const valTypes = new Map<string, Type>();
		let never = false;
		for (let i = 0; i < this._subnodes.length; ++i) {
			const keyNode = this._subnodes[i][0] = this._subnodes[i][0].compile(Type.String);
			const key = keyNode instanceof ConstantNode && keyNode.constant ? keyNode.value as string : undefined;
			if (key !== undefined && valTypes.has(key)) {
				keyNode.throwError(`duplicate object key ${JSON.stringify(key)}`);
			}
			const constraints = objectAtoms.map((atom) => atom.valType(key) ?? Type.Unknown);
			const firstType = constraints[0];
			const valueType = firstType && constraints.every((candidate) => firstType.equals(candidate)) ? firstType : Type.Unknown;
			this._subnodes[i][1] = this._subnodes[i][1].compile(valueType);
			objectAtoms = objectAtoms.filter((_, index) => this._subnodes[i][1].satisfies(constraints[index]));
			never ||= this._subnodes[i][0].type.isNever || this._subnodes[i][1].type.isNever;
			if (key !== undefined) {
				valTypes.set(key, this._subnodes[i][1].type);
			}
		}
		this._type = never
			? Type.Never
			: Type.objectType(this._uniform ? Type.union(...valTypes.values()) : [...valTypes]);
		return super.compile(type);
	}

	override evaluate(frame: CallFrame): Value {
		const result: { [ key: string ]: Value } = Object.create(null);
		for (const [key, value] of this._subnodes) {
			result[key.evaluate(frame) as string] = value.evaluate(frame);
		}
		if (!this._type.acceptsValue(result)) {
			this.throwError(`object value mismatch with expected type ${this._type}`);
		}
		return frame.define(result, this.type);
	}

	override get constant(): boolean {
		return this._subnodes.every(([key, value]) => key.constant && value.constant);
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map(([k, v]) => `${k.toString(ident + 1)}:\n${v.toString(ident + 1)}`).join("\n");
		return `${super.toString(ident)} object node subnodes:\n${subnodes}`;
	}

}
