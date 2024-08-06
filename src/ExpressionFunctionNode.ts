import { Node } from './Node.js';
import { ExpressionConstantNode } from './ExpressionConstantNode.js';
import { ExpressionConstant } from './ExpressionConstant.js';
import { ExpressionFunction } from './ExpressionFunction.js';
import { Type, Value } from './Type.js';

export class ExpressionFunctionNode extends Node {

	protected _type: Type;

	constructor(
		_pos: number,
		protected _function: ExpressionFunction,
		protected _subnodes: Node[],
	) {
		super(_pos);
		this._type = _function.type;
	}

	get type(): Type {
		return this._type;
	}

	compile(type: Type): Node {
		const inferredType = this._function.type.infer(type);
		if (!inferredType) {
			this.throwTypeError(type);
		}
		this._type = inferredType;
		let constant = true;
		for (let i = 0; i < this._subnodes.length; ++i) {
			const argType = this._function.argTypes[ i ] ?? this._function.argTypes.slice(-1)[ 0 ];
			const inferredArgType = argType.infer(inferredType, this._function.typeInference(i));
			if (!inferredArgType) {
				this.throwTypeError(type);
			}
			const subnode = this._subnodes[ i ] = this._subnodes[ i ].compile(inferredArgType);
			constant &&= subnode instanceof ExpressionConstantNode && !subnode.type.isFunction;
		}
		if (constant) {
			return new ExpressionConstantNode(this._pos,
				new ExpressionConstant(this._function.evaluate(...this._subnodes.map((node)=> node.evaluate()))));
		}
		return this;
	}

	evaluate(): Value {
		return this._function.evaluate(...this._subnodes.map((node)=> node.evaluate()));
	}

}
