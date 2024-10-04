import { Node } from '../Node.js';
import { ParserFrame } from '../ParserFrame.js';
import { ConstantNode } from './ConstantNode.js';
import { Value, Type, typeUnknown, typeFunction } from '../Type.js';

export class CallNode extends Node {

	protected _type: Type;

	constructor(
		frame: ParserFrame,
		protected _fnode: Node,
		protected _subnodes: Node[],
	) {
		super(frame);
		this._type = _fnode.signature?.type ?? typeUnknown;
	}

	override get type(): Type {
		return this._type;
	}

	override compile(type: Type): Node {
		this._fnode = this._fnode.compile(typeFunction);
		this._type = this._fnode.signature?.type ?? typeUnknown;
		this._type = this.reduceType(type);
		const signature = this._fnode.signature;
		if (signature) {
			if (this._subnodes.length < signature.minArity) {
				this.throwError(`insufficient number of arguments ${this._subnodes.length} is less than ${signature.minArity} that function requires`);
			}
			if (this._subnodes.length > signature.maxArity) {
				this.throwError(`excessive number of arguments ${this._subnodes.length} is more than ${signature.maxArity} that function requires`);
			}
		}
		let constant = this._fnode.constant;
		for (let i = 0; i < this._subnodes.length; ++i) {
			const argTypeInference = signature?.argTypeInference(this.type, i) ?? typeUnknown;
			if (!argTypeInference) {
				this.throwTypeError(type);
			}
			const subnode = this._subnodes[i] = this._subnodes[i].compile(argTypeInference);
			constant &&= subnode.constant;
		}
		if (constant) {
			return new ConstantNode(this, (this._fnode.evaluate() as (...values: Value[])=> Value)(...this._subnodes.map((node)=> node.evaluate())));
		}
		return this;
	}

	override evaluate(): Value {
		return (this._fnode.evaluate() as (...values: Value[])=> Value)(...this._subnodes.map((node)=> node.evaluate()));
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} call node`
			+ `, fnode:${this._fnode.toString(ident + 1)}`
			+ `, subnodes:\n${this._subnodes.map((s)=> s.toString(ident + 1)).join('\n')}`;
	}

}
