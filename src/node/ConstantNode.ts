import { Node } from '../Node.js';
import { ParserFrame } from '../ParserFrame.js';
import { ValueType, typeUnknown, Value } from '../ValueType.js';
import { FunctionType } from '../FunctionType.js';

export class ConstantNode extends Node {

	constructor(
		frame: ParserFrame,
		protected readonly _value: Value,
		protected readonly _signature?: FunctionType,
		protected _subnode?: Node,
	) {
		super(frame);
	}

	override get type(): ValueType {
		return ValueType.of(this._value);
	}

	override compile(type: ValueType): Node {
		this.reduceType(type);
		this._subnode = this._subnode?.compile(this._signature?.type ?? typeUnknown);
		return this;
	}

	override evaluate(): Value {
		return this._value;
	}

	override get constant(): boolean {
		return !this._subnode;
	}

	override get signature(): FunctionType | undefined {
		return this._signature;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} constant node`
			+ (this._subnode ? `, subnode:\n${this._subnode.toString(ident + 1)}` : '');
	}

}
