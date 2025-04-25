import { ISubtype, Type } from '../Type.js';

export class ArraySubtype implements ISubtype {

	constructor(
		protected readonly _itemTypes: Type[],
	) {}

	types() {
		return this._itemTypes;
	}

	itemType(index: number): Type | undefined {
		return this._itemTypes[index];
	}

	stable(): boolean {
		return this.types().every((i)=> i.stable);
	}

	match(subtype: ISubtype): boolean {
		if (subtype instanceof ArraySubtype) {
			if (this.types().length === 0 || subtype.types().length === 0) {
				return true;
			}
			if (this.types().length !== subtype.types().length) {
				return false;
			}
			for (let i = 0; i < this._itemTypes.length; ++i) {
				if (!this._itemTypes[i].reduce(subtype._itemTypes[i])) {
					return false;
				}
			}
			return true;
		}
		return false
	}

	order(): number {
		return 0x100 + this.types().reduce((acc, i)=> acc + i.order(), 0);
	}

	toString(): string {
		return `[${this._itemTypes.join(', ')}]`;
	}

}
