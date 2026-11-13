import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { ConstantNode } from "./ConstantNode.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";
import { ObjectAtom } from "../atom/ObjectAtom.js";

export class ObjectNode extends Node {

	protected _type: Type;
	protected _constraint?: Type;

	constructor(
		span: ParserSpan,
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

	override acceptType(type: Type): boolean {
		return type.isUnknown || this.type.isNever || this._matchingAtoms(type).length > 0;
	}

	override validateType(type: Type): void {
		if (!type.isVoid && !type.isUnknown && !this.type.isNever) {
			const atoms = this._matchingAtoms(type);
			if (!atoms.length) {
				this._throwTypeError(type);
			}
			this._constraint = Type.union(...atoms.map((atom) => Type.objectType(atom.valTypes())));
			for (const [key, value] of this._subnodes) {
				const constraints = atoms.map((atom) => this._propertyTypes(atom, this._key(key)));
				value.validateType(this._commonType(constraints));
			}
		}
	}

	override compile(hint: Type): Node {
		let objectAtoms = hint.objectAtoms().filter((atom) => this._type.intersect(atom));
		const valTypes: [string, Type][] = [];
		let generic = false;
		let never = false;
		for (const enodes of this._subnodes) {
			enodes[0] = enodes[0].compile(Type.String);
			enodes[0].validateType(Type.String);
			const key = this._key(enodes[0]);
			const constraints = objectAtoms.map((atom) => this._propertyTypes(atom, key));
			enodes[1] = enodes[1].compile(this._commonType(constraints));
			objectAtoms = objectAtoms.filter((_, index) => constraints[index].every((type) => enodes[1].acceptType(type)));
			never ||= enodes[0].type.isNever || enodes[1].type.isNever;
			if (key === undefined) {
				generic = true;
			}
			else {
				valTypes.push([key, enodes[1].type]);
			}
		}
		this._type = never ? Type.Never : generic ? Type.Object : Type.objectType(valTypes);
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
		if (this._constraint && !this._constraint.acceptValue(result)) {
			this.throwError(`object value mismatch with expected type ${this._constraint}`);
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

	protected _key(node: Node): string | undefined {
		return node instanceof ConstantNode && node.constant ? node.value as string : undefined;
	}

	protected _propertyTypes(atom: ObjectAtom, key: string | undefined): Type[] {
		return atom.isUniform || key !== undefined
			? [atom.valType(atom.isUniform ? undefined : key) ?? Type.Unknown]
			: atom.valTypes().map(([, type]) => type);
	}

	protected _commonType(constraints: Type[][]): Type {
		const types = constraints.map((types) => types.reduce((type, mask) => type.reduce(mask) ?? type, Type.Unknown));
		const first = types[0];
		return first && types.every((candidate) => first.equate(candidate)) ? first : Type.Unknown;
	}

	protected _matchingAtoms(expected: Type): ObjectAtom[] {
		return expected.objectAtoms().filter((atom) =>
			this.type.intersect(atom) && Type.objectType(atom.valTypes()).accept(this.type) && this._subnodes.every(([key, value]) =>
				this._propertyTypes(atom, this._key(key)).every((propertyType) => value.acceptType(propertyType))
			)
		);
	}

}
