import { IType } from '../Type.js';

export class ObjectAtom implements IType {

	constructor(
		protected readonly _propTypes: Record<string, IType> = {},
	) {}

	get empty(): boolean {
		return Object.keys(this._propTypes).length === 0;
	}

	subtypes(): IType[] {
		return Object.values(this._propTypes);
	}

	propType(property: string) {
		return this._propTypes[property];
	}

	match(type: IType): boolean {
		if (type instanceof ObjectAtom) {
			if (this.empty || type.empty) {
				return true;
			}
			for (const prop in this._propTypes) {
				if (!type.propType(prop)) {
					return false;
				}
				if (!this._propTypes[prop].match(type._propTypes[prop])) {
					return false;
				}
			}
			for (const prop in type._propTypes) {
				if (!this.propType(prop)) {
					return false;
				}
			}
			return true;
		}
		return false
	}

	weight(): number {
		return 0x100000000 + this.subtypes().reduce((acc, i)=> acc + i.weight(), 0);
	}

	toString(): string {
		const entries = Object.entries(this._propTypes);
		return entries.length ? `[${entries.map((i)=> i[0] + ':' + i[1].toString()).join(',')}]` : '[:]';
	}

}
