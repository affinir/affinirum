import { Node } from './Node.js';
import { ExpressionVariable } from './ExpressionVariable.js';
import { Type, Value } from './Type.js';

export class ExpressionVariableNode extends Node {

	constructor(
		_startPos: number,
		_endPos: number,
		protected _variable: ExpressionVariable,
		protected _subnode?: Node,
	) {
		super(_startPos, _endPos);
	}

	override get type(): Type {
		return this._variable.type;
	}

	override toString(ident: number): string {
		return `${super.toString(ident)} variable node, type ${this._variable.type.toString()}, subnode:\n${this._subnode?.toString(ident + 1) ?? ''}`;
	}

	override compile(type: Type): Node {
		this._subnode = this._subnode?.compile(type);
		const inferredType = this._variable.type.infer(this._subnode?.type ?? type);
		if (!inferredType) {
			this.throwTypeError(type);
		}
		this._variable.type = inferredType;
		return this;
	}

	override evaluate(): Value {
		return this._subnode ? this._variable.value = this._subnode.evaluate() : this._variable.value!;
	}

}
