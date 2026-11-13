import { IAtom } from "./Atom.js";
import { Type } from "../Type.js";

export class ArrayAtom implements IAtom {

	protected readonly _valTypes: Type[];

	constructor(
		valTypes: readonly Type[] = [],
	) {
		this._valTypes = [...valTypes];
	}

	private get _generic(): boolean {
		return this._valTypes.length === 0;
	}

	get isUniform(): boolean {
		return this._valTypes.length < 2;
	}

	valTypes(): Type[] {
		return this._valTypes;
	}

	valType(index: number | undefined): Type | undefined {
		return index == null ? undefined : this._valTypes[index];
	}

	equate(atom: IAtom): boolean {
		return atom instanceof ArrayAtom
			&& this._valTypes.length === atom._valTypes.length
			&& this._valTypes.every((type, index) => type.equate(atom._valTypes[index]));
	}

	accept(atom: IAtom): boolean {
		if (atom instanceof ArrayAtom) {
			if (this._generic || atom._generic) {
				return true;
			}
			if (this.isUniform) {
				for (let i = 0; i < atom.valTypes().length; ++i) {
					const vtype = atom.valType(i);
					if (!vtype || !this._valTypes[0].accept(vtype)) {
						return false;
					}
				}
			}
			else {
				for (let i = 0; i < this._valTypes.length; ++i) {
					const vtype = atom.isUniform
						? atom.valType(0)
						: atom.valType(i) ?? Type.Void;
					if (!vtype || !this._valTypes[i].accept(vtype)) {
						return false;
					}
				}
			}
			return true;
		}
		return false;
	}

	intersect(atom: IAtom): boolean {
		if (!(atom instanceof ArrayAtom)) {
			return false;
		}
		if (this._generic || atom._generic) {
			return true;
		}
		const length = this.isUniform
			? atom.isUniform ? 1 : atom._valTypes.length
			: atom.isUniform ? this._valTypes.length : Math.min(this._valTypes.length, atom._valTypes.length);
		for (let i = 0; i < length; ++i) {
			const type = this.isUniform ? this._valTypes[0] : this._valTypes[i];
			const atype = atom.isUniform ? atom._valTypes[0] : atom._valTypes[i];
			if (!type.intersect(atype)) {
				return !(this.isUniform && atom.isUniform)
					&& (this.isUniform || this._valTypes.slice(i).every((type) => type.isOptional))
					&& (atom.isUniform || atom._valTypes.slice(i).every((type) => type.isOptional));
			}
		}
		return true;
	}

	weight(): number {
		return 0x10000 + this.valTypes().reduce((acc, i) => acc + i.weight(), 0);
	}

	toString(): string {
		if (this._generic) {
			return "array";
		}
		return `[${this._valTypes.join(",")}]`;
	}

}
