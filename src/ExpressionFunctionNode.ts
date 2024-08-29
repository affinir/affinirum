import { Node } from './Node.js';
import { ParserFrame } from './ParserFrame.js';
import { ExpressionConstantNode } from './ExpressionConstantNode.js';
import { ExpressionConstant } from './ExpressionConstant.js';
import { ExpressionFunction } from './ExpressionFunction.js';
import { Type, Value } from './Type.js';

export class ExpressionFunctionNode extends Node {

	protected _type: Type;

	constructor(
		frame: ParserFrame,
		protected _function: ExpressionFunction,
		protected _subnodes: Node[],
	) {
		super(frame);
		this._type = _function.type;
	}

	override get type(): Type {
		return this._type;
	}

	override toString(ident: number): string {
		return `${super.toString(ident)} function node, type: ${this._function.type.toString()}, subnodes:\n${this._subnodes.map((s)=> s.toString(ident + 1)).join('\n')}`;
	}

	override compile(type: Type): Node {
		const inferredType = this._function.type.infer(type);
		if (!inferredType) {
			this.throwTypeError(type);
		}
		this._type = inferredType;
		let constant = true;
		for (let i = 0; i < this._subnodes.length; ++i) {
			const argType = this._function.argTypes[ i ] ?? this._function.argTypes[ this._function.argTypes.length - 1 ];
			const inferredArgType = argType.infer(inferredType, this._function.typeInference(i));
			if (!inferredArgType) {
				this.throwTypeError(type);
			}
			const subnode = this._subnodes[ i ] = this._subnodes[ i ].compile(inferredArgType);
			constant &&= subnode instanceof ExpressionConstantNode && !subnode.type.isFunction;
		}
		if (constant) {
			return new ExpressionConstantNode(this,
				new ExpressionConstant(this._function.evaluate(...this._subnodes.map((node)=> node.evaluate()))));
		}
		return this;
	}

	override evaluate(): Value {
		return this._function.evaluate(...this._subnodes.map((node)=> node.evaluate()));
	}

}
