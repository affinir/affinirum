import { IAtom } from "../Atom.js";
import { Type } from "../Type.js";

export class FunctionAtom implements IAtom {

	protected readonly _minArity: number;

	constructor(
		protected readonly _retType: Type = Type.Unknown,
		protected readonly _argTypes: Type[] = [],
		protected readonly _isVariadic: boolean = false,
	) {
		let ix = 0;
		while (ix < _argTypes.length && !_argTypes[ix].isOptional) {
			++ix;
		}
		this._minArity = ix;
		if (ix < _argTypes.length) {
			while (ix < _argTypes.length && _argTypes[ix].isOptional) {
				++ix;
			}
			if (ix < _argTypes.length) {
				throw new Error("a required parameter illegally follows an optional one");
			}
		}
	}

	private get _undefined(): boolean {
		return this._retType.isUnknown && this._argTypes.length === 0 && this._isVariadic;
	}

	get retType() {
		return this._retType;
	}

	get minArity() {
		return this._minArity;
	}

	get maxArity() {
		return this._isVariadic ? Number.POSITIVE_INFINITY : this._argTypes.length;
	}

	get isVariadic() {
		return this._isVariadic;
	}

	get arity() {
		return this._argTypes.length;
	}

	argType(index: number): Type | undefined {
		return this._argTypes[index] ?? (this._isVariadic ? this._argTypes[this._argTypes.length - 1] : undefined);
	}

	paramType(index: number): Type | undefined {
		if (!this._isVariadic) {
			return this.argType(index);
		}
		if (!this._argTypes.length) {
			return Type.Unknown;
		}
		const variadicIndex = this._argTypes.length - 1;
		if (index < variadicIndex) {
			return this.argType(index);
		}
		return this.argType(variadicIndex)
			?.arrayAtomValType(index - variadicIndex);
	}

	equate(atom: IAtom): boolean {
		return atom instanceof FunctionAtom
			&& this._isVariadic === atom._isVariadic
			&& this._argTypes.length === atom._argTypes.length
			&& this._retType.equate(atom._retType)
			&& this._argTypes.every((type, index) => type.equate(atom._argTypes[index]));
	}

	accept(atom: IAtom): boolean {
		if (!(atom instanceof FunctionAtom)) {
			return false;
		}
		if (this._undefined || atom._undefined) {
			return true;
		}
		if (this._isVariadic !== atom._isVariadic
			|| this._isVariadic && this.arity !== atom.arity
			|| !this._retType.accept(atom._retType)
			|| this.minArity > atom.maxArity
			|| this.maxArity < atom.minArity) {
			return false;
		}
		const argc = Math.min(this.arity, atom.arity);
		for (let i = 0; i < argc; ++i) {
			const type = this.argType(i)?.toMandatory();
			const atype = atom.argType(i);
			if (type && (!atype || !atype.accept(type))) {
				return false;
			}
		}
		return true;
	}

	intersect(atom: IAtom): boolean {
		if (!(atom instanceof FunctionAtom)) {
			return false;
		}
		if (this._undefined || atom._undefined) {
			return true;
		}
		if (this._isVariadic !== atom._isVariadic
			|| this._isVariadic && this.arity !== atom.arity
			|| !this._retType.intersect(atom._retType)
			|| this.minArity > atom.maxArity
			|| this.maxArity < atom.minArity) {
			return false;
		}
		const argc = Math.max(this.minArity, atom.minArity);
		for (let i = 0; i < argc; ++i) {
			const type = this.argType(i);
			const atype = atom.argType(i);
			if (!type || !atype || !type.intersect(atype)) {
				return false;
			}
		}
		return true;
	}

	weight(): number {
		return 0x1000000000000 + this._argTypes.reduce((acc, i) => acc + i.weight(), this._retType.weight());
	}

	toString(): string {
		if (this._undefined) {
			return "function";
		}
		const argTypes = this._argTypes.map((i, ix) => ix === this._argTypes.length - 1 && this.isVariadic ? `...${i.toString()}` : i.toString()).join(",");
		return `~(${argTypes}):${this._retType.toString()}`;
	}

}
