import { Node } from '../Node.js';
import { ParserFrame } from '../ParserFrame.js';
import { ConstantNode } from './ConstantNode.js';
import { Value, Type, typeUnknown, typeFunction } from '../Type.js';

export class CallNode extends Node {

	protected _type: Type;

	constructor(
		frame: ParserFrame,
		protected _subnode: Node,
		protected _subnodes: Node[],
	) {
		super(frame);
		this._type = _subnode.signature?.type ?? typeUnknown;
	}

	override get type(): Type {
		return this._type;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} call node, subnodes:\n${this._subnodes.map((s)=> s.toString(ident + 1)).join('\n')}`;
	}

	override compile(type: Type): Node {
		this._subnode.compile(typeFunction);
		const reducedType = this._type = this.reduceType(type);
		const signature = this._subnode.signature;
		if (signature) {
			if (this._subnodes.length < signature.minArity) {
				this.throwError(`insufficient number of arguments ${this._subnodes.length} is less than ${signature.minArity} that function requires`);
			}
			if (this._subnodes.length > signature.maxArity) {
				this.throwError(`excessive number of arguments ${this._subnodes.length} is more than ${signature.maxArity} that function requires`);
			}
		}
		let constant = true;
		for (let i = 0; i < this._subnodes.length; ++i) {
			const reducedArgType = signature?.argTypeInference(reducedType, i) ?? typeUnknown;
			if (!reducedArgType) {
				this.throwTypeError(type);
			}
			const subnode = this._subnodes[ i ] = this._subnodes[ i ].compile(reducedArgType);
			constant &&= subnode instanceof ConstantNode;
		}
		if (constant) {
			return new ConstantNode(this, (this._subnode.evaluate() as (...values: Value[])=> Value)(...this._subnodes.map((node)=> node.evaluate())));
		}
		return this;
	}

	override evaluate(): Value {
		return (this._subnode.evaluate() as (...values: Value[])=> Value)(...this._subnodes.map((node)=> node.evaluate()));
	}

}
