import { IType } from '../Type.js';

export class ArrayAtom implements IType {

	constructor(
		protected readonly _itemTypes: IType[],
	) {}

	subtypes(): IType[] {
		return this._itemTypes;
	}

	itemType(index: number): IType | undefined {
		return this._itemTypes[index];
	}

	match(type: IType): boolean {
		if (type instanceof ArrayAtom) {
			if (this.subtypes().length === 0 || type.subtypes().length === 0) {
				return true;
			}
			if (this.subtypes().length !== type.subtypes().length) {
				return false;
			}
			for (let i = 0; i < this._itemTypes.length; ++i) {
				if (!this._itemTypes[i].match(type._itemTypes[i])) {
					return false;
				}
			}
			return true;
		}
		return false
	}

	weight(): number {
		return 0x10000 + this.subtypes().reduce((acc, i)=> acc + i.weight(), 0);
	}

	toString(): string {
		return `[${this._itemTypes.join(',')}]`;
	}

}
