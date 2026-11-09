import { Node } from "./Node.js";
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
		this._type = Type.objectType(_subnodes.flatMap<[string, Type]>(([key, value]) =>
			key instanceof ConstantNode && key.constant && key.type.isString ? [[key.value as string, value.type]] : []
		));
	}

	override get type(): Type {
		return this._type;
	}

	override compile(type: Type): Node {
		let objectAtoms = type.objectAtoms(this._type);
		if (!objectAtoms.length && !type.isVoid) {
			this.throwTypeError(type);
		}
		const valTypes: [string, Type][] = [];
		let generic = false;
		for (const kvnodes of this._subnodes) {
			kvnodes[0] = kvnodes[0].compile(Type.String);
			const key = kvnodes[0] instanceof ConstantNode && kvnodes[0].constant
				? kvnodes[0].value as string
				: undefined;
			const constraints = objectAtoms.map((atom) =>
				atom.isUniform || key !== undefined
					? [atom.valType(atom.isUniform ? undefined : key) ?? Type.Unknown]
					: atom.valTypes().map(([, type]) => type)
			);
			const types = constraints.map((types) => types.reduce((type, mask) => type.reduce(mask) ?? type, Type.Unknown));
			const first = types[0];
			const valType = first && types.every((candidate) => first.equate(candidate)) ? first : Type.Unknown;
			kvnodes[1] = kvnodes[1].compile(valType);
			objectAtoms = objectAtoms.filter((_, index) => constraints[index].every((type) => type.accept(kvnodes[1].type)));
			if (!objectAtoms.length && !type.isVoid) {
				kvnodes[1].throwError(`type ${kvnodes[1].type} mismatch with expected type ${type}`);
			}
			if (key === undefined) {
				generic = true;
			}
			else {
				valTypes.push([key, kvnodes[1].type]);
			}
		}
		this._type = objectAtoms.some((atom) => atom.valTypes().length)
			? Type.union(...objectAtoms.map((atom) => Type.objectType(atom.valTypes())))
			: generic ? Type.Object : Type.objectType(valTypes);
		this._type = this.reduceType(type);
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		const result: { [ key: string ]: Value } = Object.create(null);
		for (const [key, value] of this._subnodes) {
			result[key.evaluate(frame) as string] = value.evaluate(frame);
		}
		if (!this._type.acceptValue(result)) {
			this.throwError(`object value mismatch with expected type ${this._type}`);
		}
		return result;
	}

	override get constant(): boolean {
		return this._subnodes.every(([key, value]) => key.constant && value.constant);
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map(([k, v]) => `${k.toString(ident + 1)}:\n${v.toString(ident + 1)}`).join("\n");
		return `${super.toString(ident)} object node subnodes:\n${subnodes}`;
	}

}
