import { IType, Type } from '../Type.js';

export class FunctionAtom implements IType {

	constructor(
		protected readonly _retType?: IType,
		protected readonly _argTypes: IType[] = [],
		protected readonly _minArity: number = _argTypes.length,
		protected readonly _isVariadic: boolean = false,
	) {}

	get retType() {
		return this._retType as Type ?? Type.Unknown;
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

	subtypes(): IType[] {
		return this._retType ? [this._retType, ...this._argTypes] : [];
	}

	argType(index: number): Type {
		return (this._argTypes[index] ?? this._argTypes[this._argTypes.length - 1]) as Type;
	}

	match(type: IType): boolean {
		if (type instanceof FunctionAtom) {
			if (!this._retType || !type._retType) {
				return true;
			}
			if (!this._retType.match(type._retType) || this.minArity > type.maxArity || this.maxArity < type.minArity) {
				return false;
			}
			for (let i = 0, argc = Math.max(this.minArity, type.minArity); i < argc; ++i) {
				if (!this.argType(i).match(type.argType(i))) {
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
