import { Node } from '../Node.js';
import { ParserFrame } from '../ParserFrame.js';
import { ConstantNode } from './ConstantNode.js';
import { Type, Value, typeObject, typeUnknown } from '../Type.js';

export class ObjectNode extends Node {

	constructor(
		frame: ParserFrame,
		protected _subnode: { [ key: string ]: Node },
	) {
		super(frame);
	}

	override get type(): Type {
		return typeObject;
	}

	override compile(type: Type): Node {
		this.reduceType(type);
		let constant = true;
		for (const [key, node] of Object.entries(this._subnode)) {
			this._subnode[ key ] = node.compile(typeUnknown);
			constant &&= node instanceof ConstantNode;
		}
		if (constant) {
			return new ConstantNode(this, this.evaluate());
		}
		return this;
	}

	override evaluate(): Value {
		const obj: { [ key: string ]: Value } = {};
		for (const [key, value] of Object.entries(this._subnode)) {
			obj[ key ] = value.evaluate();
		}
		return obj;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} object node`
			+ `, subnode:\n${Object.entries(this._subnode).map(([k, v])=> `${v.toString(ident + 1)} [${k}]`).join('\n')}`;
	}

}
