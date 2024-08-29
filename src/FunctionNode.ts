import { Node } from './Node.js';
import { ParserFrame } from './ParserFrame.js';
import { FunctionDefinition } from './FunctionDefinition.js';
import { Type, Value, typeFunction } from './Type.js';

export class FunctionNode extends Node {

	constructor(
		frame: ParserFrame,
		protected _function: FunctionDefinition,
		protected _subnode: Node,
	) {
		super(frame);
	}

	override get type(): Type {
		return typeFunction;
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} function node, subnode:\n${this._subnode.toString(ident + 1)}`;
	}

	override compile(type: Type): Node {
		this._subnode = this._subnode.compile(this._function.type);
		this.reduceType(type);
		return this;
	}

	override evaluate(): Value {
		return this._function.evaluate;
	}

}
