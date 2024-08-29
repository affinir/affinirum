import { Node } from './Node.js';
import { ParserFrame } from './ParserFrame.js';
import { Variable } from './Variable.js';
import { Type, Value } from './Type.js';

export class VariableNode extends Node {

	constructor(
		frame: ParserFrame,
		protected _variable: Variable,
		protected _subnode?: Node,
	) {
		super(frame);
	}

	override get type(): Type {
		return this._variable.type;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} variable node` + (this._subnode ? `, subnode:\n${this._subnode?.toString(ident + 1) ?? ''}` : '');
	}

	override compile(type: Type): Node {
		this._subnode = this._subnode?.compile(type);
		this._variable.type = this.reduceType(this._subnode?.type ?? type);
		return this;
	}

	override evaluate(): Value {
		return this._subnode ? this._variable.value = this._subnode.evaluate() : this._variable.value!;
	}

}
