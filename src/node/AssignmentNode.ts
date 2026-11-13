import { Node } from "./Node.js";
import { InvocationNode } from "./InvocationNode.js";
import { AccessNode } from "./AccessNode.js";
import { AssignableNode } from "./AssignableNode.js";
import { Constant } from "../Constant.js";
import { ParserSpan } from "../ParserSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class AssignmentNode extends InvocationNode {

	private _operationType?: Type;

	constructor(
		span: ParserSpan,
		protected _anode: AssignableNode,
		protected _subnode: Node,
		protected readonly _operator?: Constant,
	) {
		super(span);
	}

	override get type(): Type {
		const valueType = this._operationType ?? this._operator?.type.functionAtomRetType() ?? this._subnode.type;
		return this._anode.reduceAssignmentType(valueType) ?? this._anode.type;
	}

	override acceptType(type: Type): boolean {
		return super.acceptType(type)
			&& (this._operator !== undefined || !type.accept(this._subnode.type) || this._subnode.acceptType(type));
	}

	override validateType(type: Type): void {
		super.validateType(type);
		if (!this._operator && type.accept(this._subnode.type)) {
			this._subnode.validateType(type);
		}
	}

	override compile(hint: Type): Node {
		if (this._operator) {
			// Resolve the target type before checking it as the operator's first operand.
			this._anode = this._anode.compileAssignment(Type.Unknown);
			const args = [this._anode, this._subnode];
			this._operationType = this.compileArguments(this._operator.type, args, 1);
			this._subnode = args[1];
		}
		else {
			this._subnode = this._subnode.compile(hint);
		}
		this._anode = this._anode.compileAssignment(this._operationType ?? this._subnode.type);
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		const resolver = this._anode.resolver(frame);
		if (!this._operator) {
			return resolver.set(this._subnode.evaluate(frame));
		}
		const value = resolver.get();
		if (this._anode instanceof AccessNode) {
			if (!resolver.type) {
				this._anode.throwError("indexed value must be an array or object");
			}
			if (!resolver.type.acceptValue(value)) {
				this._anode.throwError(`indexed value mismatch with expected type ${resolver.type}`);
			}
		}
		const operation = this._operator.value as (left: Value, right: Value) => Value;
		const result = operation(value, this._subnode.evaluate(frame));
		return resolver.set(frame.define(result, this._operationType ?? Type.Unknown));
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} assignment node anode:\n${this._anode.toString(ident + 1)}\n`
			+ `${super.toString(ident)} assignment node subnode:\n${this._subnode.toString(ident + 1)}`;
	}

}
