import { IAtom } from "../Atom.js";

export type Primitive = "void" | "boolean" | "timestamp" | "float" | "integer" | "buffer" | "string";

export class PrimitiveAtom implements IAtom {

	constructor(
		protected readonly _primitive: Primitive = "void",
	) {}

	get undef(): boolean {
		return this._primitive === "void";
	}

	match(atom: IAtom): boolean {
		if (atom instanceof PrimitiveAtom) {
			return atom._primitive === this._primitive;
		}
		return false;
	}

	weight(): number {
		switch (this._primitive) {
			case "void": return 0x1;
			case "boolean": return 0x2;
			case "timestamp": return 0x4;
			case "float": return 0x8;
			case "integer": return 0x10;
			case "buffer": return 0x20;
			case "string": return 0x40;
		}
	}

	toString(): string {
		return this._primitive;
	}

}
