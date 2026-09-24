import { IAtom } from "../Atom.js";
import { Type } from "../Type.js";

export class ArrayAtom implements IAtom {

	constructor(
		protected readonly _valTypes: Type[] = [],
	) {}

	private get _undefined(): boolean {
		return this._valTypes.length === 0;
	}

	private _intersectLength(length: number): boolean {
		return !this.isTuple || this._valTypes.slice(length).every((type) => type.isOptional);
	}

	get isTuple(): boolean {
		return this._valTypes.length > 1;
	}

	valTypes(): Type[] {
		return this._valTypes;
	}

	valType(index: number): Type | undefined {
		return this._valTypes[index];
	}

	equate(atom: IAtom): boolean {
		return atom instanceof ArrayAtom
			&& this._valTypes.length === atom._valTypes.length
			&& this._valTypes.every((type, index) => type.equate(atom._valTypes[index]));
	}

	accept(atom: IAtom): boolean {
		if (atom instanceof ArrayAtom) {
			if (this._undefined || atom._undefined) {
				return true;
			}
			if (this.isTuple) {
				for (let i = 0; i < this._valTypes.length; ++i) {
					const vtype = atom.isTuple ? atom.valType(i) : atom.valType(0);
					if (!vtype || !this._valTypes[i].accept(vtype)) {
						return false;
					}
				}
			}
			else {
				for (let i = 0; i < atom.valTypes().length; ++i) {
					const vtype = atom.valType(i);
					if (!vtype || !this._valTypes[0].accept(vtype)) {
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
		if (this._undefined || atom._undefined) {
			return true;
		}
		const length = this.isTuple
			? atom.isTuple ? Math.min(this._valTypes.length, atom._valTypes.length) : this._valTypes.length
			: atom.isTuple ? atom._valTypes.length : 1;
		for (let i = 0; i < length; ++i) {
			const type = this.isTuple ? this._valTypes[i] : this._valTypes[0];
			const atype = atom.isTuple ? atom._valTypes[i] : atom._valTypes[0];
			if (!type.intersect(atype)) {
				return (this.isTuple || atom.isTuple)
					&& this._intersectLength(i)
					&& atom._intersectLength(i);
			}
		}
		return true;
	}

	weight(): number {
		return 0x10000 + this.valTypes().reduce((acc, i) => acc + i.weight(), 0);
	}

	toString(): string {
		if (this._undefined) {
			return "array";
		}
		return `[${this._valTypes.join(",")}]`;
	}

}
