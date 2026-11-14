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

	protected _anode: AssignableNode;
	protected _subnode: Node;
	protected readonly _operator?: Constant;
	private _type?: Type;

	constructor(
		span: ParserSpan,
		anode: AssignableNode,
		subnode: Node,
		operator?: Constant,
	) {
		super(span);
		this._anode = anode;
		this._subnode = subnode;
		this._operator = operator;
	}

	override get type(): Type {
		const valueType = this._type ?? this._operator?.type.functionAtomRetType() ?? this._subnode.type;
		return this._anode.reduceAssignmentType(valueType) ?? this._anode.type;
	}

	override satisfies(type: Type): boolean {
		return super.satisfies(type)
			&& (this._operator !== undefined || !type.accepts(this._subnode.type) || this._subnode.satisfies(type));
	}

	override compile(type = Type.Unknown): Node {
		if (this._operator) {
			// Resolve the target type before checking it as the operator's first operand.
			this._anode = this._anode.compileAssignment(Type.Unknown);
			const args = [this._anode, this._subnode];
			this._type = this.compileArguments(this._operator.type, args, 1);
			this._subnode = args[1];
		}
		else {
			this._subnode = this._subnode.compile(type);
		}
		this._anode = this._anode.compileAssignment(this._type ?? this._subnode.type);
		return super.compile(type);
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
			if (!resolver.type.acceptsValue(value)) {
				this._anode.throwError(`indexed value mismatch with expected type ${resolver.type}`);
			}
		}
		const operation = this._operator.value as (left: Value, right: Value) => Value;
		const result = operation(value, this._subnode.evaluate(frame));
		return resolver.set(frame.define(result, this._type ?? Type.Unknown));
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} assignment node anode:\n${this._anode.toString(ident + 1)}\n`
			+ `${super.toString(ident)} assignment node subnode:\n${this._subnode.toString(ident + 1)}`;
	}

}
