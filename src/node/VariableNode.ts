import { AssignableNode, AssignmentResolver } from "./AssignableNode.js";
import { ParserSpan } from "../ParserSpan.js";
import { InputVariable, LocalVariable, Variable } from "../Variable.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";

export class VariableNode extends AssignableNode {

	protected readonly _variable: Variable;
	protected readonly _initializer: boolean;
	protected _type?: Type;

	constructor(
		span: ParserSpan,
		variable: Variable,
		initializer: boolean = false,
	) {
		super(span);
		this._variable = variable;
		this._initializer = initializer;
	}

	override get assignable(): boolean {
		return this._variable instanceof LocalVariable && this._variable.assignable;
	}

	override get type(): Type {
		return this._type ?? (this._variable instanceof InputVariable && !this._variable.declared
			? Type.Unknown
			: this._variable.type);
	}

	override compile(type = Type.Unknown): AssignableNode {
		if (this._variable instanceof InputVariable && !this._variable.declared) {
			this._type = this._variable.type;
			if (!type.isUnknown && !type.isVoid && !type.isNever) {
				this._type = type === Type.Function ? this._type.reduce(type) ?? type : type;
				this._variable.declare(this._type);
			}
		}
		super.compile(type);
		return this;
	}

	override compileAssignment(type: Type): AssignableNode {
		if (!(this._variable instanceof LocalVariable)) {
			this.throwError("illegal re-assignment");
		}
		if (this._initializer) {
			this._variable.declare(type);
		}
		if (!this.reduceAssignmentType(type)) {
			this._throwTypeError(type);
		}
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		return frame.get(this._variable);
	}

	override resolver(frame: CallFrame): AssignmentResolver {
		return {
			set: (value: Value) => {
				const type = this._variable.type;
				if (!type.acceptsValue(value)) {
					this.throwError(`type ${Type.of(value)} mismatch with expected type ${type}`);
				}
				return frame.set(this._variable, value);
			},
			get: () => frame.get(this._variable),
		};
	}

	override toString(ident: number = 0): string {
		return `${super.toString(ident)} variable node`;
	}

}
