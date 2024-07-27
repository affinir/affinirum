import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionConstantNode } from './ExpressionConstantNode.js';
import { ExpressionConstant } from './ExpressionConstant.js';
import { ExpressionFunction } from './ExpressionFunction.js';
import { ExpressionType, ExpressionValue } from './ExpressionType.js';

export class ExpressionFunctionNode extends ExpressionNode {

	protected _type: ExpressionType;

	constructor(
		_pos: number,
		protected _function: ExpressionFunction,
		protected _subnodes: ExpressionNode[],
	) {
		super(_pos);
		this._type = _function.type;
	}

	get type(): ExpressionType {
		return this._type;
	}

	compile(type: ExpressionType): ExpressionNode {
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
			constant &&=  subnode instanceof ExpressionConstantNode && !subnode.type.isFunction ;
		}
		if (constant) {
			return new ExpressionConstantNode(this._pos,
				new ExpressionConstant(this._function.evaluate(...this._subnodes.map((node)=> node.evaluate()))));
		}
		return this;
	}

	evaluate(): ExpressionValue {
		return this._function.evaluate(...this._subnodes.map((node)=> node.evaluate()));
	}

}
