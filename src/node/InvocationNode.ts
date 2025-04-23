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
		this._type = this._fnode.type.functionType?.retType ?? Type.Unknown;
	}

	override get type(): Type {
		return this._type;
	}

	override compile(type: Type): Node {
		this._fnode = this._fnode.compile(this._fnode.type);
		this._type = this._fnode.type.functionType?.retType ?? Type.Unknown;
		this._type = this.reduceType(type);
		const ftype = this._fnode.type.functionType;
		if (ftype) {
			if (this._subnodes.length < ftype.minArity) {
				this.throwError(`function requires ${ftype.minArity} arguments not ${this._subnodes.length}`);
			}
			if (this._subnodes.length > ftype.maxArity) {
				this.throwError(`function requires ${ftype.maxArity} arguments not ${this._subnodes.length}`);
			}
		}
		let constant = this._fnode.constant && (ftype?.isPure ?? true);
		for (let i = 0; i < this._subnodes.length; ++i) {
			const atype = ftype?.argType(i, this.type) ?? Type.Unknown;
			if (!atype) {
				this.throwTypeError(type);
			}
			this._subnodes[i] = this._subnodes[i].compile(atype);
			constant &&= this._subnodes[i].constant;
		}
		return constant
			? new ConstantNode(this, new Constant(this.evaluate(), this.type))
			: this;
	}

	override evaluate(): Value {
		return (this._fnode.evaluate() as (...values: any[])=> Value)(...this._subnodes.map((node)=> node.evaluate()));
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map((s)=> s.toString(ident + 1)).join('\n');
		return `${super.toString(ident)} invocation node fnode:\n${this._fnode.toString(ident + 1)}\n`
			+ `${super.toString(ident)} invocation node subnodes:\n${subnodes}`;
	}

}
