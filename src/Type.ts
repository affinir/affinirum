import { Value } from './Value.js';
import { Primitive, PrimitiveSubtype } from './subtype/PrimitiveSubtype.js';
import { ObjectSubtype } from './subtype/ObjectSubtype.js';
import { IFunctionSubtypeOptions, FunctionSubtype } from './subtype/FunctionSubype.js';

type Subtype = PrimitiveSubtype | ObjectSubtype | FunctionSubtype;

export interface ISubtype {
	stable(): boolean;
	match(subtype: ISubtype): boolean;
	order(): number;
	toString(): string;
}

export class Type {

	protected readonly _subtypes: Subtype[] = [];

	constructor(
		...subtypes: Subtype[]
	) {
		subtypes.forEach((i)=> {
			if (!this.match(i)) {
				this._subtypes.push(i);
			}
		});
	}

	get isUnknown() {
		return this._subtypes.length === 0;
	}

	get isSubtype() {
		return this._subtypes.length === 1;
	}

	get isOptional() {
		return this.isUnknown || this._subtypes.length > 1 && this._subtypes.some((i)=> i.match(Type.Void._subtypes[0]));
	}

	get isVoid() {
		return this.isSubtype && this._subtypes[0].match(Type.Void._subtypes[0]);
	}

	get isNumber() {
		return this.isSubtype && this._subtypes[0].match(Type.Number._subtypes[0]);
	}

	get isBoolean() {
		return this.isSubtype && this._subtypes[0].match(Type.Boolean._subtypes[0]);
	}

	get isTimestamp() {
		return this.isSubtype && this._subtypes[0].match(Type.Timestamp._subtypes[0]);
	}

	get isBuffer() {
		return this.isSubtype && this._subtypes[0].match(Type.Buffer._subtypes[0]);
	}

	get isString() {
		return this.isSubtype && this._subtypes[0].match(Type.String._subtypes[0]);
	}

	get isArray() {
		return this.isSubtype && this._subtypes[0].match(Type.Array._subtypes[0]);
	}

	get isObject() {
		return this._subtypes.every((i)=> i instanceof ObjectSubtype);
	}

	get isFunction() {
		return this._subtypes.every((i)=> i instanceof FunctionSubtype);
	}

	mergeFunctionRetType(type: Type) {
		const subtypes = this._subtypes.filter((i)=>
			i instanceof FunctionSubtype
			&& i.retType.reduce(type)
		) as FunctionSubtype[];
		return Type.union(...subtypes.map((i)=> i.retType));
	}

	mergeFunctionSubtype(type: Type, argc: number) {
		if (this.isUnknown || type.isVoid) {
			return new FunctionSubtype(type,
				Array.from({ length: argc }).map(()=> Type.Unknown),
				{ unstable: true, variadic: false });
		}
		const subtypes = this._subtypes.filter((i)=>
			i instanceof FunctionSubtype && i.minArity <= argc && i.maxArity >= argc && i.retType.reduce(type)
		) as FunctionSubtype[];
		if (!subtypes.length) {
			return undefined;
		}
		return new FunctionSubtype(Type.union(...subtypes.map((i)=> i.retType)),
			Array.from({ length: argc }).map((_, ix)=> Type.union(...subtypes.map((i)=> i.argType(ix)))),
			{ unstable: subtypes.some((i)=> i.unstable), variadic: subtypes.some((i)=> i.variadic) });
	}

	get stable(): boolean {
		return this._subtypes.every((i)=> i.stable());
	}

	match(mask: Subtype) {
		return this._subtypes.some((i)=> i.match(mask));
	}

	reduce(mask: Type) {
		if (mask.isUnknown || mask.isVoid) {
			return this;
		}
		if (this.isUnknown) {
			return mask;
		}
		const list = this._subtypes.filter((i)=> mask.match(i));
		return list.length === 0
			? undefined
			: list.length === this._subtypes.length
				? this
				: new Type(...list);
	}

	toOptional() {
		return this._subtypes.length ? new Type(PrimitiveSubtype.Void, ...this._subtypes) : this;
	}

	order() {
		return this._subtypes.reduce((acc, i)=> acc + i.order(), 0);
	}

	toString() {
		return this._subtypes.length
			? this._subtypes.sort((a, b)=> a.order() - b.order()).map((i)=> i.toString()).join('|')
			: '??';
	}

	static union(...types: Type[]) {
		return (types.some((i)=> i.isUnknown)) ? Type.Unknown : new Type(...types.map((i)=> i._subtypes).flat());
	}

	static of(value: Value) {
		return value == null
			? Type.Void
			: typeof value === 'number'
				? Type.Number
				: typeof value === 'boolean'
					? Type.Boolean
					: value instanceof Date
						? Type.Timestamp
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

	static primitiveType(primitive: Primitive) {
		return new Type(new PrimitiveSubtype(primitive));
	}

	static objectType(propTypes: Record<string, Type>) {
		return new Type(new ObjectSubtype(propTypes));
	}

	static functionType(retType: Type, argTypes: Type[], options?: IFunctionSubtypeOptions) {
		return new Type(new FunctionSubtype(retType, argTypes, options));
	}

	static functionTypeInference(argNum: number, retType: Type, argTypes: Type[], options?: IFunctionSubtypeOptions) {
		return new Type(...retType._subtypes.map((i)=> {
			const rtype = new Type(i);
			const atypes = argTypes.map((t, ix)=> ix < argNum ? rtype : t);
			return new FunctionSubtype(rtype, atypes, options);
		}));
	}

	static readonly Unknown = new Type();
	static readonly Void = new Type(PrimitiveSubtype.Void);
	static readonly Number = new Type(PrimitiveSubtype.Number);
	static readonly OptionalNumber = Type.union(Type.Void, Type.Number);
	static readonly Boolean = new Type(PrimitiveSubtype.Boolean);
	static readonly OptionalBoolean = Type.union(Type.Void, Type.Boolean);
	static readonly Timestamp = new Type(PrimitiveSubtype.Timestamp);
	static readonly OptionalTimestamp = Type.union(Type.Void, Type.Timestamp);
	static readonly Buffer = new Type(PrimitiveSubtype.Buffer);
	static readonly OptionalBuffer = Type.union(Type.Void, Type.Buffer);
	static readonly String = new Type(PrimitiveSubtype.String);
	static readonly OptionalString = Type.union(Type.Void, Type.String);
	static readonly Array = new Type(PrimitiveSubtype.Array);
	static readonly OptionalArray = Type.union(Type.Void, Type.Array);
	static readonly Object = new Type(new ObjectSubtype({}));
	static readonly OptionalObject = Type.union(Type.Void, Type.Object);
	static readonly Function = new Type(new FunctionSubtype(Type.Unknown, [Type.Unknown], { variadic: true }));
	static readonly OptionalFunction = Type.union(Type.Void, Type.Function);
	static readonly Enumerable = Type.union(Type.Buffer, Type.String, Type.Array);
	static readonly Iterable = Type.union(Type.Buffer, Type.String, Type.Array, Type.Object);

}
