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

	match(atom: IAtom): boolean {
		if (atom instanceof FunctionAtom) {
			if (this._undefined || atom._undefined) {
				return true;
			}
			if (!this._retType.match(atom._retType) || this.minArity > atom.maxArity || this.maxArity < atom.minArity) {
				return false;
			}
			const argc = Math.max(this.minArity, atom.minArity);
			for (let i = 0; i < argc; ++i) {
				const atype = atom.argType(i);
				if (!atype || !this.argType(i)?.match(atype)) {
					return false;
				}
			}
			return true;
		}
		return false;
	}

	weight(): number {
		return 0x1000000000000 + (this._retType ? [this._retType, ...this._argTypes] : []).reduce((acc, i)=> acc + i.weight(), 0);
	}

	toString(): string {
		if (this._undefined) {
			return "function";
		}
		const argTypes = this._argTypes.map((i, ix)=> ix === this._argTypes.length - 1 && this.isVariadic ? `...${i.toString()}` : i.toString()).join(",");
		return `~(${argTypes}):${this._retType.toString()}`;
	}

}
