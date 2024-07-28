import { Node } from './Node.js';
import { ExpressionVariable } from './ExpressionVariable.js';
import { Type, Value } from './Type.js';

export class ExpressionVariableNode extends Node {

	constructor(
		_pos: number,
		protected _variable: ExpressionVariable,
		protected _subnode?: Node,
	) {
		super(_pos);
	}

	get type(): Type {
		return this._variable.type;
	}

	compile(type: Type): Node {
		this._subnode = this._subnode?.compile(type);
		const inferredType = this._variable.type.infer(this._subnode?.type ?? type);
		if (!inferredType) {
			this.throwTypeError(type);
		}
		this._variable.type = inferredType;
		return this;
	}

	evaluate(): Value {
		return this._subnode ? this._variable.value = this._subnode.evaluate() : this._variable.value!;
	}

}
