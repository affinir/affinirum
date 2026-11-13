import { Node } from "./Node.js";
import { InvocationNode } from "./InvocationNode.js";
import { ParserSpan } from "../ParserSpan.js";
import { Constant } from "../Constant.js";
import { ConstantNode } from "./ConstantNode.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class CallNode extends InvocationNode {

	protected _type: Type;

	constructor(
		span: ParserSpan,
		protected _fnode: Node,
		protected _subnodes: Node[],
	) {
		super(span);
		const argc = this._subnodes.length;
		const signatures = this._fnode.type.functionAtoms().flatMap((atom) =>
			atom.signatures
		).filter((signature) =>
			signature.minArity <= argc && argc <= signature.maxArity
		);
		if (!signatures.length) {
			this.throwError(`value of type ${this._fnode.type} cannot be called with ${argc} argument(s)`);
		}
		this._type = Type.union(...signatures.map((signature) => signature.retType));
	}

	override get type(): Type {
		return this._type;
	}

	override compile(): Node {
		this._fnode = this._fnode.compile(Type.Function);
		this._type = this.compileArguments(this._fnode.type, this._subnodes);
		if (this._fnode.constant && !this._fnode.type.isVolatileFunction
			&& this._subnodes.every((node) => node.constant) && !this.type.intersect(Type.Reference)) {
			return new ConstantNode(this, new Constant(this.evaluate(new CallFrame()), this.type));
		}
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		const func = this._fnode.evaluate(frame);
		if (typeof func !== "function") {
			this.throwError(`function expected not ${Type.of(func)}`);
		}
		return frame.define(func(...this._subnodes.map((node) => node.evaluate(frame))), this.type);
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map((s) => s.toString(ident + 1)).join("\n");
		return `${super.toString(ident)} call node fnode:\n${this._fnode.toString(ident + 1)}\n`
			+ `${super.toString(ident)} call node subnodes:\n${subnodes}`;
	}

}
