import { IAtom } from "./Atom.js";
import { Type } from "../Type.js";

export class ObjectAtom implements IAtom {

	protected readonly _valTypes: [string | undefined, Type][];

	constructor(
		valTypes: [string | undefined, Type][] = [],
	) {
		this._valTypes = valTypes[0]?.[0] == null ? valTypes : [...new Map(valTypes)];
	}

	private get _generic(): boolean {
		return this._valTypes.length === 0;
	}

	get isUniform(): boolean {
		return this._valTypes.length === 1 && this._valTypes[0][0] === undefined;
	}

	valTypes(): [string | undefined, Type][] {
		return this._valTypes;
	}

	valType(key: string | undefined): Type | undefined {
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
			if (this._generic || atom._generic) {
				return true;
			}
			if (this.isUniform) {
				return atom._valTypes.every(([, type]) => this._valTypes[0][1].accept(type));
			}
			for (const [key, type] of this._valTypes) {
				const atype = atom.isUniform
					? atom._valTypes[0][1].toOptional()
					: atom.valType(key) ?? Type.Void;
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
		if (this._generic || atom._generic) {
			return true;
		}
		if (this.isUniform) {
			return atom.isUniform || atom.intersect(this);
		}
		for (const [key, type] of this._valTypes) {
			const atype = atom.isUniform ? atom._valTypes[0][1] : atom.valType(key);
			if (atype && !type.intersect(atype) && !(atom.isUniform && type.accept(Type.Void))) {
				return false;
			}
		}
		return true;
	}

	weight(): number {
		return 0x100000000 + this._valTypes.reduce((acc, i) => acc + i[1].weight(), 0);
	}

	toString(): string {
		if (this._generic) {
			return "object";
		}
		return `[${this._valTypes.map(([k, v]) => `${k == null ? "" : `"${k}"`}:${v}`).join(",")}]`;
	}

}
