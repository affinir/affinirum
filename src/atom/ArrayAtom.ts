import { IAtom } from "../Atom.js";
import { Type } from "../Type.js";

export class ArrayAtom implements IAtom {

	constructor(
		protected readonly _valTypes: Type[] = [],
	) {}

	private get _undefined(): boolean {
		return this._valTypes.length === 0;
	}

	subtypes(): Type[] {
		return this._valTypes;
	}

	valueType(index: number): Type | undefined {
		return this._valTypes[index];
	}

	match(atom: IAtom): boolean {
		if (atom instanceof ArrayAtom) {
			if (this._undefined || atom._undefined) {
				return true;
			}
			for (let i = 0; i < this._valTypes.length; ++i) {
				const vtype = atom.valueType(i);
				if (!vtype || !this._valTypes[i].match(vtype)) {
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
		if (this._undefined) {
			return "array";
		}
		return `[${this._valTypes.join(",")}]`;
	}

}
