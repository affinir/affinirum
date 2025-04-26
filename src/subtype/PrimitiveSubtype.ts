import { IType } from '../Type.js';

export type Primitive = 'void' | 'number' | 'boolean' | 'timestamp' | 'integer' | 'buffer' | 'string';

export class PrimitiveSubtype implements IType {

	constructor(
		protected readonly _primitive: Primitive,
	) {}

	void(): boolean {
		return false;//this._primitive === 'void';
	}

	stable(): boolean {
		return true;
	}

	match(type: IType): boolean {
		if (type instanceof PrimitiveSubtype) {
			return type._primitive === this._primitive;
		}
		return false;
	}

	weight(): number {
		switch (this._primitive) {
			case 'void': return 0;
			case 'number': return 1;
			case 'boolean': return 2;
			case 'timestamp': return 3;
			case 'integer': return 7;
			case 'buffer': return 8;
			case 'string': return 9;
		}
	}

	toString(): string {
		return this._primitive;
	}

	static readonly Void = new PrimitiveSubtype('void');
	static readonly Number = new PrimitiveSubtype('number');
	static readonly Boolean = new PrimitiveSubtype('boolean');
	static readonly Timestamp = new PrimitiveSubtype('timestamp');
	static readonly Integer = new PrimitiveSubtype('integer');
	static readonly Buffer = new PrimitiveSubtype('buffer');
	static readonly String = new PrimitiveSubtype('string');

}
