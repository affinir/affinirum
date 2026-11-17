import { Node } from "./Node.js";
import { InvocationNode } from "./InvocationNode.js";
import { ParserSpan } from "../ParserSpan.js";
import { Constant } from "../Constant.js";
import { ConstantNode } from "./ConstantNode.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";
import { funcCoalesce } from "../native/Unknown.js";

export class CallNode extends InvocationNode {

	protected _fnode: Node;
	protected _subnodes: Node[];
	protected readonly _optional: boolean;
	protected _type: Type;

	constructor(
		span: ParserSpan,
		fnode: Node,
		subnodes: Node[],
		optional: boolean = false,
	) {
		super(span);
		this._fnode = fnode;
		this._subnodes = subnodes;
		this._optional = optional;
		const argc = subnodes.length;
		const signatures = fnode.type.functionAtoms().flatMap((atom) => atom.signatures(argc));
		if (!signatures.length) {
			this.throwError(`value of type ${fnode.type} cannot be called with ${argc} argument(s)`);
		}
		const retType = Type.union(...signatures.map((signature) => signature.retType));
		this._type = optional ? retType.toOptional() : retType;
	}

	override get type(): Type {
		return this._type;
	}

	override compile(type = Type.Any): Node {
		this._fnode = this._fnode.compile(Type.Function);
		const functionType = this._fnode.type;
		this._type = this.compileArguments(this._optional ? functionType.optionalFirstParameter() : functionType, this._subnodes);
		this._subnodes.find((arg) => arg.type.isNever)?.throwError("call argument must be a value");
		super.compile(type);
		if (this._fnode.constant && !this._fnode.type.isVolatileFunction
			&& this._subnodes.every((node) => node.constant) && !this.type.intersects(Type.Reference)) {
			return new ConstantNode(this, new Constant(this.evaluate(new CallFrame()), this.type));
		}
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		const func = this._fnode.evaluate(frame);
		if (typeof func !== "function") {
			this.throwError(`function expected not ${Type.of(func)}`);
		}
		const args: Value[] = [];
		for (let i = 0; i < this._subnodes.length; ++i) {
			const arg = this._subnodes[i].evaluate(frame);
			if (i === 0) {
				if (this._optional && arg == null) {
					return undefined;
				}
				if (func === funcCoalesce.value && arg != null) {
					return arg;
				}
			}
			args.push(arg);
		}
		return frame.define(func(...args), this.type);
	}

	override toString(ident: number = 0): string {
		const subnodes = this._subnodes.map((s) => s.toString(ident + 1)).join("\n");
		return `${super.toString(ident)} call node fnode:\n${this._fnode.toString(ident + 1)}\n`
			+ `${super.toString(ident)} call node subnodes:\n${subnodes}`;
	}

}
