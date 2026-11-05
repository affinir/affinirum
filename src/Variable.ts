import { Type } from "./Type.js";

export class Variable {

	constructor(
		protected _type = Type.Unknown,
		protected readonly _assignable = true,
	) {}

	get type() {
		return this._type;
	}

	set type(type: Type) {
		this._type = type;
	}

	get assignable() {
		return this._assignable;
	}

}
