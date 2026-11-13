import { Type } from "./Type.js";

export abstract class Variable {

	protected _type: Type | undefined;

	constructor(type?: Type) {
		this._type = type;
	}

	get type() {
		return this._type ?? Type.Unknown;
	}

	get declared() {
		return Boolean(this._type);
	}

	abstract declare(type: Type): void;

}

export class LocalVariable extends Variable {

	protected readonly _assignable: boolean;

	constructor(type?: Type, assignable?: boolean) {
		super(type);
		this._assignable = assignable ?? false;
	}

	override declare(type: Type) {
		if (!this._type) {
			this._type = type;
		}
	}

	get assignable() {
		return this._assignable;
	}

}

export class InputVariable extends Variable {

	protected readonly _declared: boolean;

	constructor(type?: Type) {
		super(type);
		this._declared = Boolean(type);
	}

	override declare(type: Type): void {
		if (!this._declared) {
			this._type = this._type ? Type.union(this._type, type) : type;
		}
	}

	override get declared() {
		return this._declared;
	}

}
