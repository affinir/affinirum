import { IAtom } from "./Atom.js";
import { Type } from "../Type.js";

export class ArrayAtom implements IAtom {

	protected readonly _valTypes: Type | readonly Type[];

	constructor(
		valTypes: Type | readonly Type[] = [],
	) {
		this._valTypes = Array.isArray(valTypes) ? [...valTypes] : valTypes;
	}

	get isUniform(): boolean {
		return !Array.isArray(this._valTypes);
	}

	get isTuple(): boolean {
		return Array.isArray(this._valTypes);
	}

	get types(): Type | readonly Type[] {
		return this._valTypes;
	}

	valTypes(): readonly Type[] {
		const types = this._valTypes;
		return types instanceof Type ? [types] : types;
	}

	valType(index: number | undefined): Type | undefined {
		const types = this._valTypes;
		if (types instanceof Type) {
			return types;
		}
		return index == null ? undefined : types[index];
	}

	equals(atom: IAtom): boolean {
		if (!(atom instanceof ArrayAtom)) {
			return false;
		}
		const types = this._valTypes;
		const other = atom._valTypes;
		if (types instanceof Type) {
			return other instanceof Type && types.equals(other);
		}
		return !(other instanceof Type)
			&& types.length === other.length
			&& types.every((type, index) => type.equals(other[index]));
	}

	accepts(atom: IAtom): boolean {
		if (!(atom instanceof ArrayAtom)) {
			return false;
		}
		const types = this._valTypes;
		const other = atom._valTypes;
		if (other instanceof Type && other.isUnknown) {
			return true;
		}
		if (types instanceof Type) {
			return atom.valTypes().every((type) => types.accepts(type));
		}
		if (other instanceof Type) {
			return types.every((type) => type.isOptional && type.accepts(other));
		}
		return types.every((type, index) => type.accepts(other[index] ?? Type.Void));
	}

	intersects(atom: IAtom): boolean {
		if (!(atom instanceof ArrayAtom)) {
			return false;
		}
		const types = this._valTypes;
		const other = atom._valTypes;
		if (types instanceof Type) {
			// Any two uniform arrays can both be empty.
			return other instanceof Type || atom.intersects(this);
		}
		for (let index = 0; index < types.length; ++index) {
			const otherType = other instanceof Type ? other : other[index];
			if (!otherType) {
				break;
			}
			if (!types[index].intersects(otherType)) {
				return types.slice(index).every((type) => type.isOptional)
					&& (other instanceof Type || other.slice(index).every((type) => type.isOptional));
			}
		}
		return true;
	}

	weight(): number {
		return 0x10000 + this.valTypes().reduce((acc, i) => acc + i.weight(), 0);
	}

	toString(): string {
		const types = this._valTypes;
		if (types instanceof Type) {
			return types.isUnknown ? "array" : `[...${types}]`;
		}
		return types.length ? `[${types.join(",")}]` : "[]";
	}

}
