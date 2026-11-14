import { Node } from "./Node.js";
import { ParserSpan } from "../ParserSpan.js";
import { Variable } from "../Variable.js";
import { Type } from "../Type.js";
import { Value } from "../Value.js";
import { CallFrame } from "../CallFrame.js";
import { FinalNode } from "./FinalNode.js";
import { JumpNode } from "./JumpNode.js";

export class FunctionNode extends Node {

	protected _subnode: Node;
	protected readonly _variables: readonly Variable[];
	protected readonly _arguments: readonly Variable[];
	protected _type: Type;

	constructor(
		span: ParserSpan,
		subnode: Node,
		variables: readonly Variable[],
		args: readonly Variable[],
		type: Type,
	) {
		super(span);
		this._subnode = subnode;
		this._arguments = args;
		this._variables = variables;
		this._type = type;
	}

	override get type(): Type {
		return this._type;
	}

	override compile(type = Type.Unknown): Node {
		const returnType = this._type.functionAtomRetType();
		this._subnode = this._subnode.compile(returnType);
		return super.compile(type);
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
