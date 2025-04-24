import { Node } from '../Node.js';
import { ParserFrame } from '../ParserFrame.js';
import { Constant } from '../Constant.js';
import { ConstantNode } from './ConstantNode.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';

export class InvocationNode extends Node {

	protected _type: Type;

	constructor(
		frame: ParserFrame,
		protected _fnode: Node,
		protected _subnodes: Node[],
	) {
		super(frame);
		this._type = Type.Unknown;
	}

	override get type(): Type {
		return this._type;
	}

	override compile(type: Type): Node {
		this._fnode = this._fnode.compile(this._fnode.type);
		const subtype = this._fnode.type.functionSubtype(type, this._subnodes.length);
		if (subtype) {
			this._type = subtype.retType;
			if (this._subnodes.length < subtype.minArity) {
				this.throwError(`function requires ${subtype.minArity} arguments not ${this._subnodes.length}`);
			}
			if (this._subnodes.length > subtype.maxArity) {
				this.throwError(`function requires ${subtype.maxArity} arguments not ${this._subnodes.length}`);
			}
		}
		let constant = this._fnode.constant && (subtype?.stable() ?? true);
		for (let i = 0; i < this._subnodes.length; ++i) {
			const atype = subtype?.argType(i) ?? Type.Unknown;
			this._subnodes[i] = this._subnodes[i].compile(atype);
			constant &&= this._subnodes[i].constant;
		}
		return constant
			? new ConstantNode(this, new Constant(this.evaluate(), this.type))
			: this;
	}

	override evaluate(): Value {
		const func = (this._fnode.evaluate() as (...values: any[])=> Value);
		if (typeof func !== 'function') {
			this.throwError(`function expected not ${Type.of(func)}`);
		}
		return func(...this._subnodes.map((node)=> node.evaluate()));
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map((s)=> s.toString(ident + 1)).join('\n');
		return `${super.toString(ident)} invocation node fnode:\n${this._fnode.toString(ident + 1)}\n`
			+ `${super.toString(ident)} invocation node subnodes:\n${subnodes}`;
	}

}
