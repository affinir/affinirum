import { AssignableNode, AssignmentResolver } from "./AssignableNode.js";
import { Node } from "./Node.js";
import { ConstantNode } from "./ConstantNode.js";
import { Constant } from "../Constant.js";
import { ParserSpan } from "../ParserSpan.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { CallFrame } from "../CallFrame.js";
import { funcAt } from "../native/Composite.js";

export class AccessNode extends AssignableNode {

	protected _type?: Type;

	constructor(
		span: ParserSpan,
		protected _subnode: Node,
		protected _inode: Node,
	) {
		super(span);
	}

	override get type(): Type {
		return this._type ?? Type.Unknown;
	}

	override get assignable(): boolean {
		return this._subnode instanceof AssignableNode ? this._subnode.assignable : !this._subnode.constant;
	}

	override get constant(): boolean {
		return this._subnode.constant && this._inode.constant;
	}

	override compile(): Node {
		this._compileAccess();
		if (!this.type.isNever) {
			this._type = this.type.toOptional();
		}
		if (this.constant && !this.type.intersect(Type.Reference)) {
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
		const func = funcAt.value as (indexer: Value, index: Value) => Value;
		const value = func(this._subnode.evaluate(frame), this._inode.evaluate(frame));
		if (value != null && !this.type.acceptValue(value)) {
			this.throwError(`indexed value mismatch with expected type ${this._type}`);
		}
		return value;
	}

	override resolver(frame: CallFrame): AssignmentResolver {
		const resolver = this._subnode instanceof AccessNode ? this._subnode.resolver(frame) : undefined;
		const composite = resolver ? resolver.get() : this._subnode.evaluate(frame);
		if (composite == null) {
			return {
				get: () => undefined,
				set: () => this.throwError("indexed value must be an array or object"),
			};
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
					if (!type.acceptValue(value)) {
						this.throwError(`indexed value mismatch with expected type ${type}`);
					}
					let arr: Value[] | undefined;
					for (const constraint of new Set([compositeType, ...frame.definitions(composite)])) {
						if (constraint.isUnknown || constraint.equate(Type.Array)) {
							continue;
						}
						arr ??= Object.defineProperties([], {
							...Object.getOwnPropertyDescriptors<object>(composite),
							[index]: { value },
						});
						if (!constraint.acceptValue(arr)) {
							this.throwError(`indexed value mismatch with expected type ${constraint}`);
						}
					}
					composite[index] = value;
					return value;
				},
			};
		}
		if (!Type.Object.acceptValue(composite)) {
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
				if (!type.acceptValue(value)) {
					this.throwError(`indexed value mismatch with expected type ${type}`);
				}
				const current = Object.getOwnPropertyDescriptor(object, key);
				const descriptor = current && "value" in current
					? { ...current, value }
					: { value, writable: true, enumerable: true, configurable: true };
				let obj: Record<string, Value> | undefined;
				for (const constraint of new Set([compositeType, ...frame.definitions(object)])) {
					if (constraint.isUnknown || constraint.equate(Type.Object)) {
						continue;
					}
					obj ??= Object.create(Object.getPrototypeOf(object), {
						...Object.getOwnPropertyDescriptors(object),
						[key]: descriptor,
					}) as Record<string, Value>;
					if (!constraint.acceptValue(obj)) {
						this.throwError(`indexed value mismatch with expected type ${constraint}`);
					}
				}
				Object.defineProperty(object, key, descriptor);
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
		const compositeType = Type.union(Type.Array, Type.Object);
		this._subnode = this._subnode.compile(compositeType);
		const receiverType = this._subnode.type.toMandatory();
		if (!receiverType.isNever && !receiverType.intersect(compositeType)) {
			this._subnode.throwError(`type ${this._subnode.type} mismatch with expected type ${compositeType}`);
		}
		let indexType = Type.union(Type.Integer, Type.String);
		if (!receiverType.isUnknown && !receiverType.isNever) {
			if (receiverType.isArray) {
				indexType = Type.Integer;
			}
			else if (receiverType.isObject) {
				indexType = Type.String;
			}
		}
		this._inode = this._inode.compile(indexType);
		if (!this._inode.type.isNever && !this._inode.type.intersect(indexType)) {
			this._inode.throwError(`type ${this._inode.type} mismatch with expected type ${indexType}`);
		}
		const index = this._inode instanceof ConstantNode ? this._inode.value : undefined;
		if (receiverType.isNever || this._inode.type.isNever) {
			this._type = Type.Never;
		}
		else if (this._inode.type.isInteger) {
			this._type = receiverType.arrayAtomValType(typeof index === "bigint" ? Number(index) : undefined);
		}
		else if (this._inode.type.isString) {
			this._type = receiverType.objectAtomValType(typeof index === "string" ? index : undefined);
		}
		else {
			this._type = Type.Unknown;
		}
	}

}
