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

	protected _subtypes: Subtype[] = [];

	constructor(
		...types: (Subtype | Type)[]
	) {
		types.map((i)=> i instanceof Type ? i._subtypes : [i]).flat().forEach((i)=> {
			if (!this._subtypes.includes(i)) {
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

	functionSubtype(type: Type, argc: number) {
		const subtypes = this._subtypes.filter((i)=>
			i instanceof FunctionSubtype && i.minArity <= argc && i.maxArity >= argc && i.retType.reduce(type)
		) as FunctionSubtype[];
		if (!subtypes.length) {
			return undefined;
		}
		return new FunctionSubtype(
			new Type(...subtypes.map((i)=> i.retType)),
			Array.from({ length: argc }).map((_, ix)=> new Type(...subtypes.map((i)=> i.argType(ix)))),
			{
				unstable: subtypes.some((i)=> i.unstable),
				variadic: subtypes.some((i)=> i.variadic),
			},
		);
	}

	get stable(): boolean {
		return this._subtypes.every((i)=> !(i instanceof ObjectSubtype || i instanceof FunctionSubtype) || i.stable());
	}

	includes(mask: Subtype) {
		return this._subtypes.some((i)=>
			i === mask
				|| i instanceof ObjectSubtype && mask instanceof ObjectSubtype && i.match(mask)
				|| i instanceof FunctionSubtype && mask instanceof FunctionSubtype && i.match(mask)
		);
	}

	reduce(mask: Type) {
		if (mask.isUnknown || mask.isVoid) {
			return this;
		}
		if (this.isUnknown) {
			return mask;
		}
		const list = this._subtypes.filter((i)=> mask.includes(i));
		return list.length === 0
			? undefined
			: list.length === this._subtypes.length
				? this
				: new Type(...list);
	}

	toOptional() {
		return this._subtypes.length ? new Type(Type.Void, ...this._subtypes) : this;
	}

	order() {
		return this._subtypes.reduce((acc, i)=> acc + i.order(), 0);
	}

	toString() {
		return this._subtypes.length
			? this._subtypes.sort((a, b)=> a.order() - b.order()).map((i)=> i.toString()).join('|')
			: '??';
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

	static Unknown = new Type();
	static Void = Type.primitiveType('void');
	static Number = Type.primitiveType('number');
	static OptionalNumber = new Type(Type.Void, Type.Number);
	static Boolean = Type.primitiveType('boolean');
	static OptionalBoolean = new Type(Type.Void, Type.Boolean);
	static Timestamp = Type.primitiveType('timestamp');
	static OptionalTimestamp = new Type(Type.Void, Type.Timestamp);
	static Buffer = Type.primitiveType('buffer');
	static OptionalBuffer = new Type(Type.Void, Type.Buffer);
	static String = Type.primitiveType('string');
	static OptionalString = new Type(Type.Void, Type.String);
	static Array = Type.primitiveType('array');
	static OptionalArray = new Type(Type.Void, Type.Array);
	static Object = new Type(new ObjectSubtype({}));
	static OptionalObject = new Type(Type.Void, Type.Object);
	static Function = new Type(new FunctionSubtype(Type.Unknown, [Type.Unknown], { variadic: true }));
	static OptionalFunction = new Type(Type.Void, Type.Function);
	static Enumerable = new Type(Type.Buffer, Type.String, Type.Array);
	static Iterable = new Type(Type.Buffer, Type.String, Type.Array, Type.Object);

}
