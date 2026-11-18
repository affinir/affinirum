import { AssignableNode, AssignmentResolver } from "./AssignableNode.js";
import { Node } from "./Node.js";
import { ConstantNode } from "./ConstantNode.js";
import { Constant } from "../Constant.js";
import { ParserSpan } from "../ParserSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";
import { funcOptionalAt } from "../native/Composite.js";

export class AccessNode extends AssignableNode {

	protected _subnode: Node;
	protected _inode: Node;
	protected readonly _operator: Constant;
	protected _type?: Type;

	constructor(
		span: ParserSpan,
		subnode: Node,
		inode: Node,
		operator: Constant,
	) {
		super(span);
		this._subnode = subnode;
		this._inode = inode;
		this._operator = operator;
	}

	override get type(): Type {
		return this._type ?? Type.Any;
	}

	override get assignable(): boolean {
		return this._subnode instanceof AssignableNode ? this._subnode.assignable : !this._subnode.constant;
	}

	override get constant(): boolean {
		return this._subnode.constant && this._inode.constant;
	}

	override compile(type = Type.Any): Node {
		this._compileAccess();
		if (!this._subnode.type.isNever) {
			this._type = this.type.toOptional();
		}
		super.compile(type);
		if (this.constant && !this.type.intersects(Type.Reference)) {
			return new ConstantNode(this, new Constant(this.evaluate(new CallFrame()), this.type));
		}
		return this;
	}

	override compileAssignment(type: Type): AssignableNode {
		this._compileAccess();
		const compiledType = this.reduceAssignmentType(type);
		if (!compiledType) {
			this._throwTypeError(type);
		}
		this._type = compiledType;
		return this;
	}

	override evaluate(frame: CallFrame): Value {
		const func = this._operator.value as (composite: Value, index: Value) => Value;
		const composite = this._subnode.evaluate(frame);
		if (func === funcOptionalAt.value && composite == null) {
			return undefined;
		}
		const compositeType = this._operator.type.functionAtomArgType(0) ?? Type.Any;
		if (!compositeType.acceptsValue(composite)) {
			this.throwError("indexed value must be an array or object");
		}
		const value = func(composite, this._inode.evaluate(frame));
		if (value != null && !this.type.acceptsValue(value)) {
			this.throwError(`indexed value mismatch with expected type ${this._type}`);
		}
		return value;
	}

	override resolver(frame: CallFrame): AssignmentResolver {
		const resolver = this._subnode instanceof AccessNode ? this._subnode.resolver(frame) : undefined;
		const composite = resolver ? resolver.get() : this._subnode.evaluate(frame);
		if (composite == null) {
			this.throwError("cannot assign through null");
		}
		const compositeType = resolver?.type ?? this._subnode.type;
		const key = this._inode.evaluate(frame);
		if (Array.isArray(composite)) {
			if (typeof key !== "bigint") {
				this.throwError("array index must be an integer");
			}
			const num = Number(key);
			const index = num < 0 ? composite.length + num : num;
			const type = compositeType.arrayAtomValType(index);
			return {
				type,
				get: () => index >= 0 && index < composite.length ? composite[index] : undefined,
				set: (value: Value) => {
					if (index < 0 || index >= composite.length) {
						this.throwError("array index is out of range");
					}
					if (!type.acceptsValue(value)) {
						this.throwError(`indexed value mismatch with expected type ${type}`);
					}
					let arr: Value[] | undefined;
					for (const constraint of new Set([compositeType, ...frame.definitions(composite)])) {
						if (constraint.isAny || constraint.equals(Type.Array)) {
							continue;
						}
						if (!arr) {
							arr = composite.slice();
							arr[index] = value;
						}
						if (!constraint.acceptsValue(arr)) {
							this.throwError(`indexed value mismatch with expected type ${constraint}`);
						}
					}
					composite[index] = value;
					return value;
				},
			};
		}
		if (!Type.Object.acceptsValue(composite)) {
			this.throwError("indexed value must be an array or object");
		}
		if (typeof key !== "string") {
			this.throwError("object key must be a string");
		}
		const object = composite as Record<string, Value>;
		const type = compositeType.objectAtomValType(key);
		return {
			type,
			get: () => Object.hasOwn(object, key) ? object[key] : undefined,
			set: (value: Value) => {
				if (!type.acceptsValue(value)) {
					this.throwError(`indexed value mismatch with expected type ${type}`);
				}
				let obj: Record<string, Value> | undefined;
				for (const constraint of new Set([compositeType, ...frame.definitions(object)])) {
					if (constraint.isAny || constraint.equals(Type.Object)) {
						continue;
					}
					if (!obj) {
						obj = Object.assign(Object.create(null) as Record<string, Value>, object);
						obj[key] = value;
					}
					if (!constraint.acceptsValue(obj)) {
						this.throwError(`indexed value mismatch with expected type ${constraint}`);
					}
				}
				object[key] = value;
				return value;
			},
		};
	}

	override toString(indent: number = 0): string {
		return `${super.toString(indent)} index node subnode:\n${this._subnode.toString(indent + 1)}\n`
			+ `${super.toString(indent)} index node inode:\n${this._inode.toString(indent + 1)}`;
	}

	private _compileAccess(): void {
		if (this._type) {
			return;
		}
		const receiverType = this._operator.type.functionAtomArgType(0) ?? Type.Any;
		this._subnode = this._subnode.compile(receiverType);
		const compositeType = this._subnode.type;
		const mandatoryType = compositeType.toMandatory();
		let indexType = this._operator.type.functionAtomArgType(1) ?? Type.Any;
		if (!mandatoryType.isAny) {
			if (mandatoryType.isArray) {
				indexType = Type.Integer;
			}
			else if (mandatoryType.isObject) {
				indexType = Type.String;
			}
		}
		this._inode = this._inode.compile(indexType);
		if (this._inode.type.isNever) {
			this._inode.throwError("index must produce a value");
		}
		const index = this._inode instanceof ConstantNode ? this._inode.value : undefined;
		if (compositeType.isNever) {
			this._type = Type.Never;
		}
		else if (this._inode.type.isInteger) {
			this._type = compositeType.arrayAtomValType(typeof index === "bigint" ? Number(index) : undefined);
		}
		else if (this._inode.type.isString) {
			this._type = compositeType.objectAtomValType(typeof index === "string" ? index : undefined);
		}
		else {
			this._type = Type.Any;
		}
	}

}
