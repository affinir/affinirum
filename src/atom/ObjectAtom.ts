import { IAtom } from "../Atom.js";
import { Type } from "../Type.js";

export class ObjectAtom implements IAtom {

	protected readonly _valTypes: [string, Type][];

	constructor(
		valTypes: [string, Type][] = [],
	) {
		this._valTypes = [...new Map(valTypes)];
	}

	private get _undefined(): boolean {
		return this._valTypes.length === 0;
	}

	valTypes(): [string, Type][] {
		return this._valTypes;
	}

	valType(key: string): Type | undefined {
		return this._valTypes.find((i) => i[0] === key)?.[1];
	}

	equate(atom: IAtom): boolean {
		if (!(atom instanceof ObjectAtom)) {
			return false;
		}
		return this._valTypes.length === atom._valTypes.length && this._valTypes.every(([key, type]) => type.equate(atom.valType(key)));
	}

	accept(atom: IAtom): boolean {
		if (atom instanceof ObjectAtom) {
			if (this._undefined || atom._undefined) {
				return true;
			}
			for (const [key, type] of this._valTypes) {
				const atype = atom.valType(key) ?? Type.Void;
				if (!type.accept(atype)) {
					return false;
				}
			}
			return true;
		}
		return false;
	}

	intersect(atom: IAtom): boolean {
		if (!(atom instanceof ObjectAtom)) {
			return false;
		}
		if (this._undefined || atom._undefined) {
			return true;
		}
		for (const [key, type] of this._valTypes) {
			const atype = atom.valType(key);
			if (atype && !type.intersect(atype)) {
				return false;
			}
		}
		return true;
	}

	weight(): number {
		return 0x100000000 + this._valTypes.reduce((acc, i) => acc + i[1].weight(), 0);
	}

	toString(): string {
		if (this._undefined) {
			return "object";
		}
		return `[${this._valTypes.map(([k, v]) => `"${k}":${v}`).join(",")}]`;
	}

}
