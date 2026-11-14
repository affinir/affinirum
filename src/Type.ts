import { Value } from "./Value.js";
import { PrimitiveAtom, Primitive } from "./atom/PrimitiveAtom.js";
import { ArrayAtom } from "./atom/ArrayAtom.js";
import { ObjectAtom } from "./atom/ObjectAtom.js";
import { FunctionAtom } from "./atom/FunctionAtom.js";

type Atom = PrimitiveAtom | ArrayAtom | ObjectAtom | FunctionAtom;

export class Type {

	protected readonly _atoms: Atom[] | undefined;

	private constructor(atoms?: Atom[]) {
		this._atoms = atoms;
	}

	private atom(ix: number) {
		return (this._atoms ?? [])[ix];
	}

	get isNever() {
		return !this._atoms;
	}

	get isUnknown() {
		return this._atoms?.length === 0;
	}

	get isAtom() {
		return this._atoms?.length === 1;
	}

	get isVoid() {
		return this._atoms?.length === 1 && this._atoms[0].equals(Type.Void.atom(0));
	}

	get isBoolean() {
		return this._atoms?.length === 1 && this._atoms[0].equals(Type.Boolean.atom(0));
	}

	get isTimestamp() {
		return this._atoms?.length === 1 && this._atoms[0].equals(Type.Timestamp.atom(0));
	}

	get isFloat() {
		return this._atoms?.length === 1 && this._atoms[0].equals(Type.Float.atom(0));
	}

	get isInteger() {
		return this._atoms?.length === 1 && this._atoms[0].equals(Type.Integer.atom(0));
	}

	get isBuffer() {
		return this._atoms?.length === 1 && this._atoms[0].equals(Type.Buffer.atom(0));
	}

	get isString() {
		return this._atoms?.length === 1 && this._atoms[0].equals(Type.String.atom(0));
	}

	get isArray() {
		return Boolean(this._atoms?.every((a) => a instanceof ArrayAtom));
	}

	get isObject() {
		return Boolean(this._atoms?.every((a) => a instanceof ObjectAtom));
	}

	get isFunction() {
		return Boolean(this._atoms?.every((a) => a instanceof FunctionAtom));
	}

	get isOptional() {
		return Boolean(this._atoms?.length === 0 || this._atoms?.some((a) => a.equals(Type.Void.atom(0))));
	}

	get isUniformArray() {
		return Boolean(this._atoms?.every((a) => a instanceof ArrayAtom && a.isUniform));
	}

	get isUniformObject() {
		return Boolean(this._atoms?.every((a) => a instanceof ObjectAtom && a.isUniform));
	}

	get isVariadicFunction() {
		return Boolean(this._atoms?.every((a) => a instanceof FunctionAtom && a.isVariadic));
	}

	get isVolatileFunction() {
		return Boolean(this._atoms?.some((a) => a instanceof FunctionAtom && a.isVolatile));
	}

	equals(type: Type | undefined): boolean {
		if (this !== type) {
			if (!type || this.isNever !== type.isNever || this._atoms?.length !== type._atoms?.length) {
				return false;
			}
			const unmatched = [...type._atoms ?? []];
			for (const atom of this._atoms ?? []) {
				const index = unmatched.findIndex((a) => atom.equals(a));
				if (index < 0) {
					return false;
				}
				unmatched.splice(index, 1);
			}
		}
		return true;
	}

	intersects(type: Type | Atom): boolean {
		if (type instanceof Type) {
			if (this.isNever || type.isNever) {
				return false;
			}
			return Boolean(this.isUnknown || type.isUnknown || this._atoms?.some((a) => type._atoms?.some((atom) => a.intersects(atom))));
		}
		return Boolean(this.isUnknown || this._atoms?.some((atom) => atom.intersects(type)));
	}

	accepts(type: Type | Atom): boolean {
		if (type instanceof Type) {
			if (this.isUnknown || type.isUnknown || type.isNever) {
				return true;
			}
			return Boolean(type._atoms?.every((a) => this._atoms?.some((atom) => atom.accepts(a))));
		}
		return Boolean(this._atoms?.some((a) => a.accepts(type)));
	}

	acceptsValue(value: Value): boolean {
		if (this.isUnknown) {
			return true;
		}
		const valueAtom = Type.of(value)._atoms?.[0];
		return Boolean(valueAtom && this._atoms?.some((atom) => {
			if (atom instanceof ObjectAtom ? !(valueAtom instanceof ObjectAtom) : !atom.accepts(valueAtom)) {
				return false;
			}
			if ((atom instanceof ArrayAtom || atom instanceof ObjectAtom) && atom.valType(undefined)?.isUnknown) {
				return true;
			}
			if (atom instanceof ArrayAtom) {
				const values = value as Value[];
				const types = atom.valTypes();
				if (!types.length) {
					return true;
				}
				if (!atom.isUniform) {
					return types.every((type, ix) => type.acceptsValue(Object.hasOwn(values, ix) ? values[ix] : undefined));
				}
				for (let i = 0; i < values.length; ++i) {
					if (!types[0].acceptsValue(Object.hasOwn(values, i) ? values[i] : undefined)) {
						return false;
					}
				}
				return true;
			}
			if (atom instanceof ObjectAtom) {
				const values = value as Record<string, Value>;
				return atom.valTypes().every(([key, type]) =>
					key != null
						? type.acceptsValue(Object.hasOwn(values, key) ? values[key] : undefined)
						: Object.values(values).every((v) => type.acceptsValue(v))
				);
			}
			return true;
		}));
	}

	hasFunction(): boolean {
		return Boolean(this._atoms?.some((atom) => atom instanceof FunctionAtom
			|| atom instanceof ArrayAtom && atom.valTypes().some((type) => type.hasFunction())
			|| atom instanceof ObjectAtom && atom.valTypes().some(([, type]) => type.hasFunction())));
	}

	reduce(type: Type): Type | undefined {
		if (this.isNever || type.isNever) {
			return Type.Never;
		}
		if (type.isUnknown || type.isVoid) {
			return this;
		}
		if (this.isUnknown) {
			return type;
		}
		const list = this._atoms?.filter((a) => type.accepts(a));
		return list?.length === 0
			? undefined
			: list?.length === this._atoms?.length
				? this
				: new Type(list);
	}

	weight(): number {
		return this._atoms?.reduce((acc, a) => acc + a.weight(), 0) ?? 0;
	}

	arrayAtomValType(index?: number): Type {
		const atoms = this.arrayAtoms();
		if (!atoms.length) {
			return Type.Unknown;
		}
		const valTypes: Type[] = [];
		for (const atom of atoms) {
			const valType = atom.valType(index);
			if (!valType) {
				return Type.Unknown;
			}
			valTypes.push(valType);
		}
		return Type.union(...valTypes);
	}

	objectAtomValType(key?: string): Type {
		const atoms = this.objectAtoms();
		if (!atoms.length) {
			return Type.Unknown;
		}
		const valTypes: Type[] = [];
		for (const atom of atoms) {
			const valType = atom.valType(key);
			if (!valType) {
				return Type.Unknown;
			}
			valTypes.push(valType);
		}
		return Type.union(...valTypes);
	}

	functionAtomRetType() {
		return Type.union(...this.functionAtoms().flatMap((atom) => atom.signatures.map((signature) => signature.retType)));
	}

	arrayAtoms(): ArrayAtom[] {
		if (this.isUnknown) {
			return Type.Array._atoms as ArrayAtom[];
		}
		return this._atoms?.filter((a): a is ArrayAtom => a instanceof ArrayAtom) ?? [];
	}

	objectAtoms(): ObjectAtom[] {
		if (this.isUnknown) {
			return Type.Object._atoms as ObjectAtom[];
		}
		return this._atoms?.filter((a): a is ObjectAtom => a instanceof ObjectAtom) ?? [];
	}

	functionAtoms(): FunctionAtom[] {
		if (this.isUnknown || this.isNever) {
			return Type.Function._atoms as FunctionAtom[];
		}
		return this._atoms?.filter((a): a is FunctionAtom => a instanceof FunctionAtom) ?? [];
	}

	toOptional() {
		return Type.union(Type.Void, this);
	}

	toMandatory() {
		if (!this._atoms?.length || !this.isOptional || this.isVoid) {
			return this;
		}
		return new Type(this._atoms.filter((a) => !a.equals(Type.Void.atom(0))));
	}

	toString(): string {
		if (this.isNever) {
			return "--";
		}
		return this._atoms?.length
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
		if (types.length && types.every((t) => t.isNever)) {
			return Type.Never;
		}
		const atoms: Atom[] = [];
		for (const type of types) {
			for (const atom of type._atoms ?? []) {
				if (!atoms.some((a) => a.equals(atom))) {
					atoms.push(atom);
				}
			}
		}
		return new Type(atoms);
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

	static isFunction(value: Value) {
		return typeof value === "function";
	}

	static primitiveType(primitive: Primitive) {
		return new Type([new PrimitiveAtom(primitive)]);
	}

	static arrayType(types: Type | readonly Type[] = Type.Unknown) {
		return new Type([new ArrayAtom(types)]);
	}

	static objectType(types: Type | readonly (readonly [key: string, valType: Type])[] = Type.Unknown) {
		return new Type([new ObjectAtom(types)]);
	}

	static functionType(signatures: [retType: Type, argTypes: Type[], variadic?: boolean][], volatile?: boolean) {
		return new Type([new FunctionAtom(signatures, volatile)]);
	}

	static readonly Never = new Type();
	static readonly Unknown = new Type([]);
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
	static readonly Function = Type.functionType([[Type.Unknown, [], true]]);
	static readonly OptionalFunction = Type.union(Type.Void, Type.Function);
	static readonly Reference = Type.union(Type.Array, Type.Object, Type.Function);
	static readonly OptionalReference = Type.union(Type.Void, Type.Array, Type.Object, Type.Function);
	static readonly Number = Type.union(Type.Float, Type.Integer);
	static readonly OptionalNumber = Type.union(Type.Void, Type.Float, Type.Integer);
	static readonly Composite = Type.union(Type.Array, Type.Object);
	static readonly OptionalComposite = Type.union(Type.Void, Type.Array, Type.Object);
	static readonly Enumerable = Type.union(Type.Buffer, Type.String, Type.Array);
	static readonly OptionalEnumerable = Type.union(Type.Void, Type.Buffer, Type.String, Type.Array);
	static readonly Iterable = Type.union(Type.Buffer, Type.String, Type.Array, Type.Object);
	static readonly OptionalIterable = Type.union(Type.Void, Type.Buffer, Type.String, Type.Array, Type.Object);

}
