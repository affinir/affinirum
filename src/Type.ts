import { Value } from "./Value.js";
import { PrimitiveAtom, Primitive } from "./atom/PrimitiveAtom.js";
import { ArrayAtom } from "./atom/ArrayAtom.js";
import { ObjectAtom } from "./atom/ObjectAtom.js";
import { FunctionAtom } from "./atom/FunctionAtom.js";

type Atom = PrimitiveAtom | ArrayAtom | ObjectAtom | FunctionAtom;

export class Type {

	private constructor(
		protected readonly _atoms: Atom[] = [],
	) {}

	get isUnknown() {
		return this._atoms.length === 0;
	}

	get isAtom() {
		return this._atoms.length === 1;
	}

	get isOptional() {
		return this.isUnknown || this._atoms.length > 1 && this._atoms.some((a) => a.equate(Type.Void._atoms[0]));
	}

	get isVoid() {
		return this.isAtom && this._atoms[0].equate(Type.Void._atoms[0]);
	}

	get isBoolean() {
		return this.isAtom && this._atoms[0].equate(Type.Boolean._atoms[0]);
	}

	get isTimestamp() {
		return this.isAtom && this._atoms[0].equate(Type.Timestamp._atoms[0]);
	}

	get isFloat() {
		return this.isAtom && this._atoms[0].equate(Type.Float._atoms[0]);
	}

	get isInteger() {
		return this.isAtom && this._atoms[0].equate(Type.Integer._atoms[0]);
	}

	get isBuffer() {
		return this.isAtom && this._atoms[0].equate(Type.Buffer._atoms[0]);
	}

	get isString() {
		return this.isAtom && this._atoms[0].equate(Type.String._atoms[0]);
	}

	get isArray() {
		return this._atoms.every((a) => a instanceof ArrayAtom);
	}

	get isObject() {
		return this._atoms.every((a) => a instanceof ObjectAtom);
	}

	get isFunction() {
		return this._atoms.every((a) => a instanceof FunctionAtom);
	}

	equate(type: Type | undefined): boolean {
		if (this._atoms.length !== type?._atoms.length) {
			return false;
		}
		const unmatched = [...type._atoms];
		for (const atom of this._atoms) {
			const index = unmatched.findIndex((a) => atom.equate(a));
			if (index < 0) {
				return false;
			}
			unmatched.splice(index, 1);
		}
		return true;
	}

	accept(type: Type | Atom): boolean {
		if (type instanceof Type) {
			if (this.isUnknown || type.isUnknown) {
				return true;
			}
			return type._atoms.every((a) => this._atoms.some((atom) => atom.accept(a)));
		}
		return this._atoms.some((a) => a.accept(type));
	}

	acceptValue(value: Value): boolean {
		if (this.isUnknown) {
			return true;
		}
		const valueAtom = Type.of(value)._atoms[0];
		return this._atoms.some((atom) => {
			if (!atom.accept(valueAtom)) {
				return false;
			}
			if (atom instanceof ArrayAtom) {
				const values = value as Value[];
				const types = atom.valTypes();
				if (!types.length) {
					return true;
				}
				if (atom.isTuple) {
					return types.every((type, ix) => type.acceptValue(Object.hasOwn(values, ix) ? values[ix] : undefined));
				}
				for (let i = 0; i < values.length; ++i) {
					if (!types[0].acceptValue(Object.hasOwn(values, i) ? values[i] : undefined)) {
						return false;
					}
				}
				return true;
			}
			if (atom instanceof ObjectAtom) {
				const values = value as Record<string, Value>;
				return atom.valTypes().every(([key, type]) =>
					type.acceptValue(Object.hasOwn(values, key) ? values[key] : undefined)
				);
			}
			return true;
		});
	}

	reduce(mask: Type) {
		if (mask.isUnknown || mask.isVoid) {
			return this;
		}
		if (this.isUnknown) {
			return mask;
		}
		const list = this._atoms.filter((a) => mask.accept(a));
		return list.length === 0
			? undefined
			: list.length === this._atoms.length
				? this
				: new Type(list);
	}

	intersect(type: Type): boolean {
		if (this.isUnknown || type.isUnknown) {
			return true;
		}
		return this._atoms.some((a) => type._atoms.some((atom) => a.intersect(atom)));
	}

	weight(): number {
		return this._atoms.reduce((acc, a) => acc + a.weight(), 0);
	}

	arrayAtomValType(index: number): Type {
		const atoms = this._atoms.filter((a): a is ArrayAtom => a instanceof ArrayAtom);
		if (!atoms.length) {
			return Type.Unknown;
		}
		const valTypes: Type[] = [];
		for (const atom of atoms) {
			const valType = atom.isTuple
				? atom.valType(index)
				: atom.valType(0);
			if (!valType) {
				return Type.Unknown;
			}
			valTypes.push(valType);
		}
		return Type.union(...valTypes);
	}

	functionAtomRetType(type: Type) {
		const atoms = this._atoms.filter((a): a is FunctionAtom => a instanceof FunctionAtom && type.accept(a.retType));
		return Type.union(...atoms.map((a) => a.retType));
	}

	functionAtoms(type: Type, argc: number) {
		if (this.isUnknown) {
			return Type.Function._atoms as FunctionAtom[];
		}
		return this._atoms.filter((a) =>
			a instanceof FunctionAtom && a.minArity <= argc && a.maxArity >= argc && (type.isVoid || type.accept(a.retType))
		) as FunctionAtom[];
	}

	toOptional() {
		return this._atoms.length ? Type.union(Type.Void, this) : this;
	}

	toMandatory() {
		if (!this.isOptional || this.isUnknown) {
			return this;
		}
		return new Type(this._atoms.filter((a) => !a.equate(Type.Void._atoms[0])));
	}

	toString(): string {
		return this._atoms.length
			? [...this._atoms]
				.sort((a, b) => a.weight() - b.weight())
				.map((a) => a.toString())
				.join("|")
			: "??";
	}

	static union(...types: Type[]) {
		if (types.some((t) => t.isUnknown)) {
			return Type.Unknown;
		}
		const type = new Type([]);
		types.flatMap((t) => t._atoms).forEach((a) => {
			if (!type._atoms.some((atom) => atom.equate(a))) {
				type._atoms.push(a);
			}
		});
		return type;
	}

	static of(value: Value) {
		return value == null
			? Type.Void
			: typeof value === "boolean"
				? Type.Boolean
				: value instanceof Date
					? Type.Timestamp
					: typeof value === "number"
						? Type.Float
						: typeof value === "bigint"
							? Type.Integer
							: value instanceof ArrayBuffer
								? Type.Buffer
								: typeof value === "string"
									? Type.String
									: Array.isArray(value)
										? Type.Array
										: typeof value === "object"
											? Type.Object
											: Type.Function;
	}

	static isPrimitive(value: Value) {
		return value == null
			|| typeof value === "boolean"
			|| value instanceof Date
			|| typeof value === "number"
			|| typeof value === "bigint"
			|| value instanceof ArrayBuffer
			|| typeof value === "string";
	}

	static primitiveType(primitive: Primitive) {
		return new Type([new PrimitiveAtom(primitive)]);
	}

	static arrayType(itemTypes: Type[] = []) {
		return new Type([new ArrayAtom(itemTypes)]);
	}

	static objectType(propTypes: [string, Type][] = []) {
		return new Type([new ObjectAtom(propTypes)]);
	}

	static functionType(retType: Type = Type.Unknown, argTypes: Type[] = [], isVariadic: boolean = false) {
		return new Type([new FunctionAtom(retType, argTypes, isVariadic)]);
	}

	static readonly Unknown = new Type();
	static readonly Void = Type.primitiveType("void");
	static readonly Boolean = Type.primitiveType("boolean");
	static readonly OptionalBoolean = Type.union(Type.Void, Type.Boolean);
	static readonly Timestamp = Type.primitiveType("timestamp");
	static readonly OptionalTimestamp = Type.union(Type.Void, Type.Timestamp);
	static readonly Float = Type.primitiveType("float");
	static readonly OptionalFloat = Type.union(Type.Void, Type.Float);
	static readonly Integer = Type.primitiveType("integer");
	static readonly OptionalInteger = Type.union(Type.Void, Type.Integer);
	static readonly Buffer = Type.primitiveType("buffer");
	static readonly OptionalBuffer = Type.union(Type.Void, Type.Buffer);
	static readonly String = Type.primitiveType("string");
	static readonly OptionalString = Type.union(Type.Void, Type.String);
	static readonly Array = Type.arrayType();
	static readonly OptionalArray = Type.union(Type.Void, Type.Array);
	static readonly Object = Type.objectType();
	static readonly OptionalObject = Type.union(Type.Void, Type.Object);
	static readonly Function = Type.functionType(undefined, undefined, true);
	static readonly OptionalFunction = Type.union(Type.Void, Type.Function);
	static readonly Number = Type.union(Type.Float, Type.Integer);
	static readonly OptionalNumber = Type.union(Type.Void, Type.Float, Type.Integer);
	static readonly Enumerable = Type.union(Type.Buffer, Type.String, Type.Array);
	static readonly OptionalEnumerable = Type.union(Type.Void, Type.Buffer, Type.String, Type.Array);
	static readonly Iterable = Type.union(Type.Buffer, Type.String, Type.Array, Type.Object);
	static readonly OptionalIterable = Type.union(Type.Void, Type.Buffer, Type.String, Type.Array, Type.Object);

}
