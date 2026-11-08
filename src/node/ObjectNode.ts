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
		this._type = Type.objectType(_subnodes.filter(([i]) => i instanceof ConstantNode && i.constant).map(([k, v]) => [k.evaluate(new CallFrame()) as string, v.type]));
	}

	override get type(): Type {
		return this._type;
	}

	override compile(type: Type): Node {
		const keyOf = (node: Node): string | undefined =>
			node instanceof ConstantNode && node.constant && node.type.isString
				? node.value as string
				: undefined;
		const lastKeys = new Map<string, number>();
		const keys = this._subnodes.map(([node], index) => {
			const key = keyOf(node);
			if (key !== undefined) {
				lastKeys.set(key, index);
			}
			return key;
		});
		for (let i = 0; i < this._subnodes.length; ++i) {
			const enodes = this._subnodes[i];
			enodes[0] = enodes[0].compile(Type.String);
			const key = keys[i] ??= keyOf(enodes[0]);
			if (key !== undefined) {
				lastKeys.set(key, Math.max(i, lastKeys.get(key) ?? -1));
			}
			const lastDynamic = keys.lastIndexOf(undefined);
			const shape = Type.objectType([...lastKeys]
				.filter(([, index]) => index > lastDynamic)
				.map(([name, index]) => [name, this._subnodes[index][1].type]));
			const objectAtoms = type.objectAtoms(shape);
			const valTypes = key !== undefined && lastKeys.get(key) === i && i > lastDynamic
				? objectAtoms.map((atom) => atom.valType(key))
				: [];
			const first = valTypes[0];
			const valType = first && valTypes.every((candidate) => first.equate(candidate))
				? first
				: Type.Unknown;
			enodes[1] = enodes[1].compile(valType);
		}
		this._type = Type.objectType(keys.flatMap<[string, Type]>((key, index) =>
			key !== undefined ? [[key, this._subnodes[index][1].type]] : []
		));
		this._type = this.reduceType(type);
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
