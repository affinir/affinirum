import { Node } from './Node.js';
import { ExpressionVariable } from './ExpressionVariable.js';
import { Type, Value, typeFunction } from './Type.js';

export class ExpressionClosureNode extends Node {

	constructor(
		_startPos: number,
		_endPos: number,
		protected _type: Type,
		protected _variables: ExpressionVariable[],
		protected _subnode: Node,
	) {
		super(_startPos, _endPos);
	}

	override get type(): Type {
		return typeFunction;
	}

	override toString(ident: number): string {
		return `${super.toString(ident)} closure node, type: ${this._type.toString()}, subnode:\n${this._subnode.toString(ident + 1)}`;
	}

	override compile(type: Type): Node {
		if (!typeFunction.infer(type)) {
			this.throwTypeError(type);
		}
		this._subnode = this._subnode.compile(this._type);
		return this;
	}

	override evaluate(): Value {
		return (...values: Value[])=> {
			this._variables.forEach((arg, ix)=> arg.value = values[ ix ]);
			return this._subnode.evaluate();
		};
	}

}
