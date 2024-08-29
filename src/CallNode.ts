import { Node } from './Node.js';
import { ParserFrame } from './ParserFrame.js';
import { ConstantNode } from './ConstantNode.js';
import { FunctionDefinition } from './FunctionDefinition.js';
import { Type, Value } from './Type.js';

export class CallNode extends Node {

	protected _type: Type;

	constructor(
		frame: ParserFrame,
		protected _function: FunctionDefinition,
		protected _subnodes: Node[],
	) {
		super(frame);
		this._type = _function.type;
	}

	override get type(): Type {
		return this._type;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} call node, subnodes:\n${this._subnodes.map((s)=> s.toString(ident + 1)).join('\n')}`;
	}

	override compile(type: Type): Node {
		const reducedType = this.reduceType(type);
		this._type = reducedType;
		if (this._subnodes.length < this._function.minArity) {
			this.throwError(`insufficient number of arguments ${this._subnodes.length} is less than ${this._function.minArity} that function requires`);
		}
		if (this._subnodes.length > this._function.maxArity) {
			this.throwError(`excessive number of arguments ${this._subnodes.length} is more than ${this._function.maxArity} that function requires`);
		}
		let constant = true;
		for (let i = 0; i < this._subnodes.length; ++i) {
			const reducedArgType = this._function.argTypeInference(reducedType, i);
			if (!reducedArgType) {
				this.throwTypeError(type);
			}
			const subnode = this._subnodes[ i ] = this._subnodes[ i ].compile(reducedArgType);
			constant &&= subnode instanceof ConstantNode;
		}
		if (constant) {
			return new ConstantNode(this, this._function.evaluate(...this._subnodes.map((node)=> node.evaluate())));
		}
		return this;
	}

	override evaluate(): Value {
		return this._function.evaluate(...this._subnodes.map((node)=> node.evaluate()));
	}

}
