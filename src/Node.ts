import { Type, Value, typeVariant } from './Type.js';

export abstract class Node {

	constructor(
		protected _pos: number,
	) {}

	get pos(): number {
		return this._pos;
	}

	throwTypeError(type: Type): never {
		throw new NodeTypeError(this._pos, this.type, type);
	}

	abstract type: Type;
	abstract compile(type: Type): Node;
	abstract evaluate(): Value;

	static compileList(nodes: Node[], type: Type): Node[] {
		return [ ...nodes.slice(0, -1).map((n)=> n.compile(typeVariant)), nodes[ nodes.length - 1 ].compile(type) ];
	}

}

export class NodeTypeError extends TypeError {

	constructor(
		protected _pos: number,
		protected _nodeType: Type,
		protected _mismatchType: Type,
	) {
		super(`type mismatch error`);
	}

	get pos(): number {
		return this._pos;
	}

	get nodeType(): Type {
		return this._nodeType;
	}

	get mismatchType(): Type {
		return this._mismatchType;
	}

}
