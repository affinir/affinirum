import { IAtom } from "./Atom.js";
import { Type } from "../Type.js";

export class ObjectAtom implements IAtom {

	protected readonly _valTypes: Type | readonly (readonly [string, Type])[];

	constructor(
		valTypes: Type | readonly (readonly [key: string, valType: Type])[] = [],
	) {
		if (Array.isArray(valTypes)) {
			if (valTypes.length === 0) {
				this._valTypes = Type.Any;
			}
			else {
				const keys: string[] = [];
				const types: [key: string, valType: Type][] = [];
				for (const [key, type] of valTypes) {
					if (keys.includes(key)) {
						throw Error(`duplicate object key ${key}`);
					}
					keys.push(key);
					types.push([key, type]);
				}
				this._valTypes = types;
			}
		}
		else {
			this._valTypes = valTypes;
		}
	}

	get isUniform(): boolean {
		return !Array.isArray(this._valTypes);
	}

	get isRecord(): boolean {
		return Array.isArray(this._valTypes);
	}

	get types(): Type | readonly (readonly [string, Type])[] {
		return this._valTypes;
	}

	valTypes(): readonly (readonly [string | undefined, Type])[] {
		const types = this._valTypes;
		return types instanceof Type ? [[undefined, types]] : types;
	}

	valType(key: string | undefined): Type | undefined {
		const types = this._valTypes;
		return types instanceof Type ? types : types.find(([name]) => name === key)?.[1];
	}

	equals(atom: IAtom): boolean {
		if (!(atom instanceof ObjectAtom)) {
			return false;
		}
		const types = this._valTypes;
		const other = atom._valTypes;
		if (types instanceof Type) {
			return other instanceof Type && types.equals(other);
		}
		return !(other instanceof Type)
			&& types.length === other.length
			&& types.every(([key, type]) => type.equals(atom.valType(key)));
	}

	accepts(atom: IAtom): boolean {
		if (!(atom instanceof ObjectAtom)) {
			return false;
		}
		const types = this._valTypes;
		const other = atom._valTypes;
		if (types instanceof Type) {
			return atom.valTypes().every(([, type]) => types.accepts(type));
		}
		if (other instanceof Type) {
			return types.every(([, type]) => type.isOptional && type.accepts(other));
		}
		return types.every(([key, type]) => type.accepts(atom.valType(key) ?? Type.Null));
	}

	intersects(atom: IAtom): boolean {
		if (!(atom instanceof ObjectAtom)) {
			return false;
		}
		const types = this._valTypes;
		const other = atom._valTypes;
		if (types instanceof Type) {
			// Any two uniform objects can both be empty.
			return other instanceof Type || atom.intersects(this);
		}
		if (other instanceof Type) {
			return types.every(([, type]) => type.isOptional || type.intersects(other));
		}
		return types.every(([key, type]) => {
			const otherType = atom.valType(key);
			return !otherType || type.intersects(otherType) || type.isOptional && otherType.isOptional;
		});
	}

	weight(): number {
		return 0x100000000 + this.valTypes().reduce((acc, [, type]) => acc + type.weight(), 0);
	}

	toString(): string {
		const types = this._valTypes;
		if (types instanceof Type) {
			return types.isAny ? "[:]" : `[:${types}]`;
		}
		return `[${types.map(([key, type]) => {
			const normalized = key.replace(/[\\"]/g, "\\$&");
			return `"${normalized}":${type}`;
		}).join(",")}]`;
	}

}
