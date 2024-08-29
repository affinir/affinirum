import { Node } from './Node.js';
import { ParserFrame } from './ParserFrame.js';
import { ConstantNode } from './ConstantNode.js';
import { Type, Value, typeString, typeObject, typeUnknown } from './Type.js';

export class ObjectNode extends Node {

	constructor(
		frame: ParserFrame,
		protected _subnodes: [ Node, Node ][],
	) {
		super(frame);
	}

	override get type(): Type {
		return typeObject;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} object node, subnodes:\n${this._subnodes.map(([ k, v ])=> `key: ${k.toString(ident + 1)} value: ${v.toString(ident + 1)}`).join('\n')}`;
	}

	override compile(type: Type): Node {
		this.reduceType(type);
		let constant = true;
		for (const [ key, value ] of this._subnodes) {
			const knode = key.compile(typeString);
			const vnode = value.compile(typeUnknown);
			constant &&= knode instanceof ConstantNode// && !knode.type.isFunction
				&& vnode instanceof ConstantNode;// && !vnode.retType.isFunction;
		}
		if (constant) {
			return new ConstantNode(this, this.evaluate());
		}
		return this;
	}

	override evaluate(): Value {
		const obj: { [ key: string ]: Value } = {};
		for (const [ key, value ] of this._subnodes) {
			obj[ String(key.evaluate()) ] = value.evaluate();
		}
		return obj;
	}

}
