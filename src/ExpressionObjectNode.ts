import { Node } from './Node.js';
import { ParserFrame } from './ParserFrame.js';
import { ExpressionConstantNode } from './ExpressionConstantNode.js';
import { ExpressionConstant } from './ExpressionConstant.js';
import { Type, Value, typeString, typeObject, typeVariant } from './Type.js';

export class ExpressionObjectNode extends Node {

	constructor(
		frame: ParserFrame,
		protected _subnodes: [ Node, Node ][],
	) {
		super(frame);
	}

	override get type(): Type {
		return typeObject;
	}

	override toString(ident: number): string {
		return `${super.toString(ident)} object node, subnodes:\n${this._subnodes.map(([ k, v ])=> `key: ${k.toString(ident + 1)} value: ${v.toString(ident + 1)}`).join('\n')}`;
	}

	override compile(type: Type): Node {
		if (!typeObject.infer(type)) {
			this.throwTypeError(type);
		}
		let constant = true;
		for (const [ key, value ] of this._subnodes) {
			const knode = key.compile(typeString);
			const vnode = value.compile(typeVariant);
			constant &&= knode instanceof ExpressionConstantNode && !knode.type.isFunction
				&& vnode instanceof ExpressionConstantNode && !vnode.type.isFunction;
		}
		if (constant) {
			return new ExpressionConstantNode(this, new ExpressionConstant(this.evaluate()));
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
