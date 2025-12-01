import { Jump } from "./Jump.js";
import { Value } from "./Value.js";

export class JumpException {

	constructor(
		private readonly _jump: Jump,
		private readonly _value?: Value,
	) {}

	get jump() {
		return this._jump;
	}

	get value() {
		return this._value;
	}

}
