import { ISubtype } from '../Type.js';

export type Primitive = 'void' | 'number' | 'boolean' | 'timestamp' | 'buffer' | 'string' | 'array';

export class PrimitiveSubtype implements ISubtype {

	constructor(
		protected readonly _primitive: Primitive,
	) {}

	stable(): boolean {
		return true;
	}

	match(subtype: ISubtype): boolean {
		if (subtype instanceof PrimitiveSubtype) {
			return this._primitive === subtype._primitive;
		}
		return false;
	}

	order(): number {
		switch (this._primitive) {
			case 'void': return 0;
			case 'number': return 1;
			case 'boolean': return 2;
			case 'timestamp': return 3;
			//case 'integer': return 7;
			case 'buffer': return 8;
			case 'string': return 9;
			case 'array': return 0x100;
		}
	}

	toString(): string {
		return this._primitive;
	}

}
