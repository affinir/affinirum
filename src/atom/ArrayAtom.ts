import { IAtom } from "../Atom.js";
import { Type } from "../Type.js";

export class ArrayAtom implements IAtom {

	constructor(
		protected readonly _itemTypes: Type[] = [],
	) {}

	private get _undefined(): boolean {
		return this._itemTypes.length === 0;
	}

	subtypes(): Type[] {
		return this._itemTypes;
	}

	itemType(index: number): Type | undefined {
		return this._itemTypes[index];
	}

	match(atom: IAtom): boolean {
		if (atom instanceof ArrayAtom) {
			if (this._undefined || atom._undefined) {
				return true;
			}
			if (this.subtypes().length !== atom.subtypes().length) {
				return false;
			}
			for (let i = 0; i < this._itemTypes.length; ++i) {
				if (!this._itemTypes[i].match(atom._itemTypes[i])) {
					return false;
				}
			}
			return true;
		}
		return false;
	}

	weight(): number {
		return 0x10000 + this.subtypes().reduce((acc, i)=> acc + i.weight(), 0);
	}

	toString(): string {
		return this._undefined ? "array" : `[${this._itemTypes.join(",")}]`;
	}

}
