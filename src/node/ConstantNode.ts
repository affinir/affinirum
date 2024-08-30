import { Node } from '../Node.js';
import { ParserFrame } from '../ParserFrame.js';
import { Type, Value } from '../Type.js';
import { FunctionSignature } from '../FunctionSignature.js';

export class ConstantNode extends Node {

	constructor(
		frame: ParserFrame,
		protected readonly _value: Value,
		protected readonly _signature?: FunctionSignature,
		protected _subnode?: Node,
	) {
		super(frame);
	}

	override get type(): Type {
		return Type.of(this._value);
	}

	override compile(type: Type): Node {
		this.reduceType(type);
		if (this._signature && this._subnode) {
			this._subnode = this._subnode.compile(this._signature.type);
		}
		return this;
	}

	override evaluate(): Value {
		return this._value;
	}

	override get constant(): boolean {
		return !this._subnode;
	}

	override get signature(): FunctionSignature | undefined {
		return this._signature;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} constant node`
			+ (this._subnode ? `, subnode:\n${this._subnode.toString(ident + 1)}` : '');
	}

}
