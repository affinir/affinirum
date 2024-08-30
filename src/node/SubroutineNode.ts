import { Node } from '../Node.js';
import { ParserFrame } from '../ParserFrame.js';
import { Type, Value, typeFunction } from '../Type.js';
import { FunctionSignature } from '../FunctionSignature.js';

export class SubroutineNode extends Node {

	constructor(
		frame: ParserFrame,
		protected readonly _value: Value,
		protected readonly _signature: FunctionSignature,
		protected _subnode: Node,
	) {
		super(frame);
	}

	override get type(): Type {
		return typeFunction;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} function node, subnode:\n${this._subnode.toString(ident + 1)}`;
	}

	override compile(type: Type): Node {
		this._subnode = this._subnode.compile(this._signature.type);
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
