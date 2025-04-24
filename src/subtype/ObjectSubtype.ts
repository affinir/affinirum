import { ISubtype, Type } from '../Type.js';

export class ObjectSubtype implements ISubtype {

	constructor(
		protected readonly _propTypes: Record<string, Type>,
	) {}

	types() {
		return Object.values(this._propTypes);
	}

	propType(property: string) {
		return this._propTypes[property];
	}

	stable(): boolean {
		return this.types().every((i)=> i.stable);
	}

	match(subtype: ISubtype): boolean {
		if (subtype instanceof ObjectSubtype) {
			if (this.types().length === 0 || subtype.types().length === 0) {
				return true;
			}
			for (const prop in this._propTypes) {
				if (!subtype.propType(prop)) {
					return false;
				}
				if (!this._propTypes[prop].reduce(subtype._propTypes[prop])) {
					return false;
				}
			}
			for(const prop in subtype._propTypes) {
				if (!this.propType(prop)) {
					return false;
				}
			}
			return true;
		}
		return false
	}

	order(): number {
		return 0x10000 + this.types().reduce((acc, i)=> acc + i.order(), 0);
	}

	toString(): string {
		const entries = Object.entries(this._propTypes);
		return entries.length ? `[${entries.map((i)=> i[0] + ': ' + i[1]).join(', ')}]` : '[:]';
	}

}
