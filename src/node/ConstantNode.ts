import { Node } from '../Node.js';
import { ParserFrame } from '../ParserFrame.js';
import { Type, Value } from '../Type.js';
import { FunctionSignature } from '../FunctionSignature.js';

export class ConstantNode extends Node {

	constructor(
		frame: ParserFrame,
		protected readonly _value: Value,
		protected readonly _signature?: FunctionSignature,
	) {
		super(frame);
	}

	override get type(): Type {
		return Type.of(this._value);
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} constant node`;
	}

	override compile(type: Type): Node {
		this.reduceType(type);
		return this;
	}

	override evaluate(): Value {
		return this._value;
	}

	override get signature(): FunctionSignature | undefined {
		return this._signature;
	}

}
