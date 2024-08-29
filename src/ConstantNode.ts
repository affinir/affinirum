import { Node } from './Node.js';
import { ParserFrame } from './ParserFrame.js';
import { Type, typeFunction, Value } from './Type.js';
import { FunctionDefinition } from './FunctionDefinition.js';

export class ConstantNode extends Node {

	constructor(
		frame: ParserFrame,
		protected _value: Value | FunctionDefinition,
	) {
		super(frame);
	}

	override get type(): Type {
		return this._value instanceof FunctionDefinition ? typeFunction : Type.of(this._value);
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} constant node`;
	}

	override compile(type: Type): Node {
		this.reduceType(type);
		return this;
	}

	override evaluate(): Value {
		return this._value instanceof FunctionDefinition ? this._value.evaluate : this._value;
	}

	functionDefinition(): FunctionDefinition | undefined {
		return this._value instanceof FunctionDefinition ? this._value : undefined;
	}

}
