import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { Variable } from "../Variable.js";
import { Type } from "../Type.js";
import { Value } from "../Value.js";
import { CallFrame } from "../CallFrame.js";
import { FinalNode } from "./FinalNode.js";
import { JumpNode } from "./JumpNode.js";

export class FunctionNode extends Node {

	constructor(
		span: ParserSpan,
		protected _subnode: Node,
		protected readonly _arguments: readonly Variable[],
		protected readonly _variables: readonly Variable[],
		protected _type: Type,
	) {
		super(span);
	}

	override get type(): Type {
		return this._type;
	}

	override compile(): Node {
		const returnType = this._type.functionAtomRetType();
		this._subnode = this._subnode.compile(returnType);
		this._subnode.validateType(returnType);
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		const index = this._type.isVariadicFunction ? this._arguments.length - 1 : -1;
		return (...values: Value[]): Value => {
			const subframe = frame.subframe(this._variables);
			try {
				this._arguments.forEach((arg, ix) => {
					subframe.set(arg, ix === index ? values.slice(ix) : values[ix]);
				});
				return this._subnode.evaluate(subframe);
			}
			catch (e) {
				if (e instanceof FinalNode && e.level === "return") {
					return e.value;
				}
				if (e instanceof JumpNode) {
					this._subnode.throwError(`unexpected ${e.action} jump`);
				}
				throw e;
			}
		};
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} function node subnode:\n`
			+ this._subnode.toString(ident + 1);
	}

}
