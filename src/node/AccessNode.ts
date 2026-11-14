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

	protected _subnode: Node;
	protected _inode: Node;
	protected _type?: Type;

	constructor(
		span: ParserSpan,
		subnode: Node,
		inode: Node,
	) {
		super(span);
		this._subnode = subnode;
		this._inode = inode;
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

	override compile(type = Type.Unknown): Node {
		this._compileAccess();
		if (!this.type.isNever) {
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
		const func = funcAt.value as (indexer: Value, index: Value) => Value;
		const receiver = this._subnode.evaluate(frame);
		if (!Type.Composite.acceptsValue(receiver)) {
			this.throwError("indexed value must be an array or object");
		}
		const value = func(receiver, this._inode.evaluate(frame));
		if (value != null && !this.type.acceptsValue(value)) {
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
					if (!type.acceptsValue(value)) {
						this.throwError(`indexed value mismatch with expected type ${type}`);
					}
					let arr: Value[] | undefined;
					for (const constraint of new Set([compositeType, ...frame.definitions(composite)])) {
						if (constraint.isUnknown || constraint.equals(Type.Array)) {
							continue;
						}
						arr ??= Object.defineProperties([], {
							...Object.getOwnPropertyDescriptors<object>(composite),
							[index]: { value },
						});
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
				const current = Object.getOwnPropertyDescriptor(object, key);
				const descriptor = current && "value" in current
					? { ...current, value }
					: { value, writable: true, enumerable: true, configurable: true };
				let obj: Record<string, Value> | undefined;
				for (const constraint of new Set([compositeType, ...frame.definitions(object)])) {
					if (constraint.isUnknown || constraint.equals(Type.Object)) {
						continue;
					}
					obj ??= Object.create(Object.getPrototypeOf(object), {
						...Object.getOwnPropertyDescriptors(object),
						[key]: descriptor,
					}) as Record<string, Value>;
					if (!constraint.acceptsValue(obj)) {
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
		this._subnode = this._subnode.compile(Type.Composite);
		const receiverType = this._subnode.type;
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
