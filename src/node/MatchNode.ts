import { Node } from "./Node.js";
import { ConstantNode } from "./ConstantNode.js";
import { Constant } from "../Constant.js";
import { ParserSpan } from "../ParserSpan.js";
import { Type } from "../Type.js";
import { Value } from "../Value.js";
import { CallFrame } from "../CallFrame.js";
import { equals } from "../native/Unknown.js";

export class MatchNode extends Node {

	protected _vnode: Node;
	protected _subnodes: [Node, Node][];
	protected _enode: Node;

	constructor(
		span: ParserSpan,
		vnode: Node,
		subnodes: [Node, Node][],
		enode: Node = new ConstantNode(span, Constant.Null),
	) {
		super(span);
		this._vnode = vnode;
		this._subnodes = subnodes;
		this._enode = enode;
	}

	override get type(): Type {
		const results = this._results();
		return results.length ? Type.union(...results.map((node) => node.type)) : Type.Never;
	}

	override satisfies(type: Type): boolean {
		return this._results().every((node) => node.satisfies(type));
	}

	override compile(type = Type.Any): Node {
		this._vnode = this._vnode.compile();
		let reachable = !this._vnode.type.isNever;
		this._subnodes = this._subnodes.map(([key, result]) => {
			const compiledKey = key.compile();
			reachable &&= !compiledKey.type.isNever;
			return [compiledKey, result.compile(reachable ? type : Type.Any)];
		});
		this._enode = this._enode.compile(reachable ? type : Type.Any);
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		const subject = this._vnode.evaluate(frame);
		for (const [key, result] of this._subnodes) {
			if (equals(subject, key.evaluate(frame))) {
				return result.evaluate(frame);
			}
		}
		return this._enode.evaluate(frame);
	}

	override toString(ident = 0): string {
		const children = [this._vnode, ...this._subnodes.flat(), this._enode];
		return `${super.toString(ident)} match node:\n` + children.map((node) => node.toString(ident + 1)).join("\n");
	}

	private _results(): Node[] {
		const results: Node[] = [];
		if (this._vnode.type.isNever) {
			return results;
		}
		for (const [key, value] of this._subnodes) {
			if (key.type.isNever) {
				return results;
			}
			results.push(value);
		}
		results.push(this._enode);
		return results;
	}

}
