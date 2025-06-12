import { IAtom } from "../Atom.js";
import { Type } from "../Type.js";

export class ObjectAtom implements IAtom {

	constructor(
		protected readonly _propTypes: Record<string, Type> = {},
	) {}

	get empty(): boolean {
		return Object.keys(this._propTypes).length === 0;
	}

	subtypes(): Type[] {
		return Object.values(this._propTypes);
	}

	propType(property: string) {
		return this._propTypes[property];
	}

	match(atom: IAtom): boolean {
		if (atom instanceof ObjectAtom) {
			if (this.empty || atom.empty) {
				return true;
			}
			for (const prop in this._propTypes) {
				if (!atom.propType(prop)) {
					return false;
				}
				if (!this._propTypes[prop].match(atom._propTypes[prop])) {
					return false;
				}
			}
			for (const prop in atom._propTypes) {
				if (!this.propType(prop)) {
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
		const entries = Object.entries(this._propTypes);
		return entries.length ? `[${entries.map((i)=> i[0] + ":" + i[1].toString()).join(",")}]` : "[:]";
	}

}
