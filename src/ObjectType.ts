import { Type } from './Type.js';

export interface IObjectTypeOptions {
	inference?: number,
	impure?: boolean,
	variadic?: boolean,
}

export class ObjectType {

	constructor(
		protected readonly _propTypes: Record<string, Type>,
	) {}

	get types() {
		return Object.values(this._propTypes);
	}

	get isPure() {
		return this.types.every((i)=> i.isPure);
	}

	isCompatible(ftype: ObjectType) {
		for (const prop in this._propTypes) {
			if (!this._propTypes[prop].reduce(ftype._propTypes[prop])) {
				return false;
			}
		}
		return true;
	}

	propType(property: string) {
		return this._propTypes[property] ?? Type.Unknown;
	}

	toString(): string {
		const entries = Object.entries(this._propTypes);
		return entries.length ? `[${entries.map((i)=> i[0] + ': ' + i[1]).join(', ')}]` : '[:]';
	}

}
