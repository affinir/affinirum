import { IAtom } from '../Atom.js';
import { Type } from '../Type.js';

export class FunctionAtom implements IAtom {

	constructor(
		protected readonly _retType?: Type,
		protected readonly _argTypes: Type[] = [],
		protected readonly _minArity: number = _argTypes.length,
		protected readonly _isVariadic: boolean = false,
	) {}

	get retType() {
		return this._retType ?? Type.Unknown;
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

	subtypes(): Type[] {
		return this._retType ? [this._retType, ...this._argTypes] : [];
	}

	argType(index: number): Type {
		return (this._argTypes[index] ?? this._argTypes[this._argTypes.length - 1]);
	}

	match(atom: IAtom): boolean {
		if (atom instanceof FunctionAtom) {
			if (!this._retType || !atom._retType) {
				return true;
			}
			if (!this._retType.match(atom._retType) || this.minArity > atom.maxArity || this.maxArity < atom.minArity) {
				return false;
			}
			for (let i = 0, argc = Math.max(this.minArity, atom.minArity); i < argc; ++i) {
				if (!this.argType(i).match(atom.argType(i))) {
					return false;
				}
			}
			return true;
		}
		return false;
	}

	weight(): number {
		return 0x1000000000000 + this.subtypes().reduce((acc, i)=> acc + i.weight(), 0);
	}

	toString(): string {
		const argTypes = this._argTypes.map((i)=> i.toString()).join(',');
		return this._retType ? `~${this._retType.toString()}(${argTypes}${this.isVariadic ? '...' : ''})` : '~()';
	}

}
