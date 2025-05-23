import { Value } from './Value.js';
import { PrimitiveAtom, Primitive } from './atom/PrimitiveAtom.js';
import { ArrayAtom } from './atom/ArrayAtom.js';
import { ObjectAtom } from './atom/ObjectAtom.js';
import { FunctionAtom } from './atom/FunctionAtom.js';

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
		return this.isUnknown || this._atoms.length > 1 && this._atoms.some((i)=> i.match(Type.Void._atoms[0]));
	}

	get isVoid() {
		return this.isAtom && this._atoms[0].match(Type.Void._atoms[0]);
	}

	get isBoolean() {
		return this.isAtom && this._atoms[0].match(Type.Boolean._atoms[0]);
	}

	get isTimestamp() {
		return this.isAtom && this._atoms[0].match(Type.Timestamp._atoms[0]);
	}

	get isFloat() {
		return this.isAtom && this._atoms[0].match(Type.Float._atoms[0]);
	}

	get isInteger() {
		return this.isAtom && this._atoms[0].match(Type.Integer._atoms[0]);
	}

	get isBuffer() {
		return this.isAtom && this._atoms[0].match(Type.Buffer._atoms[0]);
	}

	get isString() {
		return this.isAtom && this._atoms[0].match(Type.String._atoms[0]);
	}

	get isArray() {
		return this._atoms.every((i)=> i instanceof ArrayAtom);
	}

	get isObject() {
		return this._atoms.every((i)=> i instanceof ObjectAtom);
	}

	get isFunction() {
		return this._atoms.every((i)=> i instanceof FunctionAtom);
	}

	get isNumeric() {
		return this._atoms.length === 2
			&& (this._atoms[0].match(Type.Float._atoms[0]) || this._atoms[0].match(Type.Integer._atoms[0]));
	}

	toOptional() {
		return this._atoms.length ? Type.union(Type.Void, this) : this;
	}

	functionAtomRetType(type: Type) {
		const atoms = this._atoms.filter((i)=> i instanceof FunctionAtom && i.retType.match(type)) as FunctionAtom[];
		return Type.union(...atoms.map((i)=> i.retType));
	}

	functionAtoms(type: Type, argc: number) {
		if (this.isUnknown) {
			return Type.Function._atoms as FunctionAtom[];
		}
		return this._atoms.filter((i)=>
			i instanceof FunctionAtom && i.minArity <= argc && i.maxArity >= argc && (type.isVoid || i.retType.match(type))
		) as FunctionAtom[];
	}

	reduce(mask: Type) {
		if (mask.isUnknown || mask.isVoid) {
			return this;
		}
		if (this.isUnknown) {
			return mask;
		}
		const list = this._atoms.filter((i)=> mask.match(i));
		return list.length === 0
			? undefined
			: list.length === this._atoms.length
				? this
				: new Type(list);
	}

	match(type: Type | Atom): boolean {
		if (type instanceof Type) {
			return this.isUnknown || type.isUnknown || type.isVoid || this._atoms.some((i)=> type._atoms.some((j)=> i.match(j)));
		}
		else {
			return this._atoms.some((i)=> i.match(type));
		}
	}

	weight(): number {
		return this._atoms.reduce((acc, i)=> acc + i.weight(), 0);
	}

	toString(): string {
		return this._atoms.length
			? this._atoms.sort((a, b)=> a.weight() - b.weight()).map((i)=> i.toString()).join('|')
			: '??';
	}

	static union(...types: Type[]) {
		if (types.some((i)=> i.isUnknown)) {
			return Type.Unknown;
		}
		const type = new Type([]);
		types.map((i)=> i._atoms).flat().forEach((i)=> {
			if (!type.match(i)) {
				type._atoms.push(i);
			}
		});
		return type;
	}

	static of(value: Value) {
		return value == null
			? Type.Void
			: typeof value === 'boolean'
				? Type.Boolean
				: value instanceof Date
					? Type.Timestamp
					: typeof value === 'number'
						? Type.Float
						: typeof value === 'bigint'
							? Type.Integer
							: value instanceof ArrayBuffer
								? Type.Buffer
								: typeof value === 'string'
									? Type.String
									: Array.isArray(value)
										? Type.Array
										: typeof value === 'object'
											? Type.Object
											: Type.Function;
	}

	static isPrimitiveType(value: Value) {
		return value == null
			|| typeof value === 'boolean'
			|| value instanceof Date
			|| typeof value === 'number'
			|| typeof value === 'bigint'
			|| value instanceof ArrayBuffer
			|| typeof value === 'string';
	}

	static arrayType(itemTypes: Type[] = []) {
		return new Type([new ArrayAtom(itemTypes)]);
	}

	static objectType(propTypes: Record<string, Type> = {}) {
		return new Type([new ObjectAtom(propTypes)]);
	}

	static functionType(retType?: Type, argTypes: Type[] = [], isVariadic: boolean = false) {
		return new Type([Type._functionAtom(retType, argTypes, isVariadic)]);
	}

	static readonly Unknown = new Type();
	static readonly Void = Type._primitiveType('void');
	static readonly Boolean = Type._primitiveType('boolean');
	static readonly OptionalBoolean = Type.union(Type.Void, Type.Boolean);
	static readonly Timestamp = Type._primitiveType('timestamp');
	static readonly OptionalTimestamp = Type.union(Type.Void, Type.Timestamp);
	static readonly Float = Type._primitiveType('float');
	static readonly OptionalFloat = Type.union(Type.Void, Type.Float);
	static readonly Integer = Type._primitiveType('integer');
	static readonly OptionalInteger = Type.union(Type.Void, Type.Integer);
	static readonly Buffer = Type._primitiveType('buffer');
	static readonly OptionalBuffer = Type.union(Type.Void, Type.Buffer);
	static readonly String = Type._primitiveType('string');
	static readonly OptionalString = Type.union(Type.Void, Type.String);
	static readonly Array = Type.arrayType();
	static readonly OptionalArray = Type.union(Type.Void, Type.Array);
	static readonly Object = Type.objectType();
	static readonly OptionalObject = Type.union(Type.Void, Type.Object);
	static readonly Function = Type.functionType();
	static readonly OptionalFunction = Type.union(Type.Void, Type.Function);
	static readonly Number = Type.union(Type.Float, Type.Integer);
	static readonly OptionalNumber = Type.union(Type.Void, Type.Float, Type.Integer);
	static readonly Enumerable = Type.union(Type.Buffer, Type.String, Type.Array);
	static readonly OptionalEnumerable = Type.union(Type.Void, Type.Buffer, Type.String, Type.Array);
	static readonly Iterable = Type.union(Type.Buffer, Type.String, Type.Array, Type.Object);
	static readonly OptionalIterable = Type.union(Type.Void, Type.Buffer, Type.String, Type.Array, Type.Object);

	private static _primitiveType(primitive: Primitive) {
		return new Type([new PrimitiveAtom(primitive)]);
	}

	private static _functionAtom(retType?: Type, argTypes: Type[] = [], isVariadic: boolean = false) {
		let ix = 0;
		while (ix < argTypes.length && !argTypes[ix].isOptional) {
			++ix;
		}
		const minArity = ix;
		if (ix < argTypes.length) {
			while (ix < argTypes.length && argTypes[ix].isOptional) {
				++ix;
			}
			if (ix < argTypes.length) {
				throw new Error('a required parameter illegally follows an optional one');
			}
		}
		return new FunctionAtom(retType, argTypes, minArity, isVariadic);
	}

}
