import { Node } from '../Node.js';
import { ParserFrame } from '../ParserFrame.js';
import { ValueType, Value, typeBoolean } from '../ValueType.js';

export class LoopNode extends Node {

	constructor(
		frame: ParserFrame,
		protected _cnode: Node,
		protected _subnode: Node,
	) {
		super(frame);
	}

	override get type(): ValueType {
		return this._subnode.type;
	}

	override compile(type: ValueType): Node {
		this._cnode = this._cnode.compile(typeBoolean);
		this._subnode = this._subnode.compile(type);
		return this;
	}

	override evaluate(): Value {
		let value: Value;
		while (this._cnode.evaluate()) {
			value = this._subnode.evaluate();
		}
		return value;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} loop node`
			+ `, cnode:\n${this._cnode.toString(ident + 1)}`
			+ `, subnode:\n${this._subnode.toString(ident + 1)}`;
	}

}
