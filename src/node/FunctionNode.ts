import { Node } from "./Node.js";
import { ScriptSpan } from "../ScriptSpan.js";
import { Variable } from "../Variable.js";
import { Type } from "../Type.js";
import { Value, normalize } from "../Value.js";
import { CallFrame } from "../CallFrame.js";
import { ReturnNode } from "./ReturnNode.js";
import { JumpNode } from "./JumpNode.js";

export class FunctionNode extends Node {

	constructor(
		span: ScriptSpan,
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

	override compile(type: Type): Node {
		this._type = this.reduceType(type);
		this._subnode = this._subnode.compile(this._type.functionAtomRetType());
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		return (...values: Value[]): Value => {
			const subframe = frame.subframe(this._variables);

			try {
				this._arguments.forEach((arg, index) => {
					subframe.set(arg, normalize(values[index]));
				});
				return normalize(this._subnode.evaluate(subframe));
			}
			catch (e) {
				if (e instanceof ReturnNode && e.scope === "function") {
					return normalize(e.value);
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