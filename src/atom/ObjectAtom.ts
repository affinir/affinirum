import { IAtom } from "../Atom.js";
import { Type } from "../Type.js";

export class ObjectAtom implements IAtom {

	constructor(
		protected readonly _valTypes: Record<string, Type> = {},
	) {}

	private get _undefined(): boolean {
		return Object.keys(this._valTypes).length === 0;
	}

	subtypes(): Type[] {
		return Object.values(this._valTypes);
	}

	valueType(key: string): Type | undefined {
		return this._valTypes[key];
	}

	match(atom: IAtom): boolean {
		if (atom instanceof ObjectAtom) {
			if (this._undefined || atom._undefined) {
				return true;
			}
			for (const key in this._valTypes) {
				const vtype = atom.valueType(key);
				if (!vtype || !this._valTypes[key].match(vtype)) {
					return false;
				}
			}
			return true;
		}
		return false;
	}

	weight(): number {
		return 0x100000000 + this.subtypes().reduce((acc, i)=> acc + i.weight(), 0);
	}

	toString(): string {
		if (this._undefined) {
			return "object";
		}
		return `[${Object.entries(this._valTypes).map(([k, v])=> `"${k}":${v}`).join(",")}]`;
	}

}
