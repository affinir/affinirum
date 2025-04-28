import { IType, Primitive } from '../Type.js';

export class PrimitiveAtom implements IType {

	constructor(
		protected readonly _primitive: Primitive = 'void',
	) {}

	match(type: IType): boolean {
		if (type instanceof PrimitiveAtom) {
			return type._primitive === this._primitive;
		}
		return false;
	}

	weight(): number {
		switch (this._primitive) {
			case 'void': return 0x0;
			case 'boolean': return 0x2;
			case 'timestamp': return 0x3;
			case 'float': return 0x8;
			case 'integer': return 0x10;
			case 'buffer': return 0x20;
			case 'string': return 0x30;
		}
	}

	toString(): string {
		return this._primitive;
	}

}
