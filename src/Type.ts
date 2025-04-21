import { Value } from './Value.js';
import { IFunctionTypeOptions, FunctionType } from './FunctionType.js';

export type PrimitiveType = 'void' | 'boolean' | 'number' | 'buffer' | 'string' | 'array' | 'object';
export type ConcreteType = PrimitiveType | FunctionType;

export class Type {

	protected _concreteTypes: ConcreteType[] = [];

	constructor(
		...types: ConcreteType[] | Type[]
	) {
		types.map((i)=> i instanceof Type ? i._concreteTypes : [i]).flat().forEach((i)=> {
			if (this._concreteTypes.every((c)=> !Type.equate(c, i))) {
				this._concreteTypes.push(i);
			}
		});
	}

	get isUnknown() {
		return this._concreteTypes.length === 0;
	}

	get isConcrete() {
		return this._concreteTypes.length === 1;
	}

	get isOptional() {
		return this.isUnknown || this._concreteTypes.length > 1 && this._concreteTypes.some((i)=> i === 'void');
	}

	get isVoid() {
		return this.isConcrete && this._concreteTypes[0] === 'void';
	}

	get isBoolean() {
		return this.isConcrete && this._concreteTypes[0] === 'boolean';
	}

	get isNumber() {
		return this.isConcrete && this._concreteTypes[0] === 'number';
	}

	get isBuffer() {
		return this.isConcrete && this._concreteTypes[0] === 'buffer';
	}

	get isString() {
		return this.isConcrete && this._concreteTypes[0] === 'string';
	}

	get isArray() {
		return this.isConcrete && this._concreteTypes[0] === 'array';
	}

	get isObject() {
		return this.isConcrete && this._concreteTypes[0] === 'object';
	}

	get isFunction() {
		return this.isConcrete && this._concreteTypes[0] instanceof FunctionType;
	}

	get functionType() {
		return this.isFunction ? this._concreteTypes[0] as FunctionType : undefined;
	}

	includes(mask: ConcreteType) {
		return this._concreteTypes.some((i)=> Type.equate(i, mask));
	}

	equals(type: Type) {
		return type._concreteTypes.length === this._concreteTypes.length && type._concreteTypes.every((i)=> this.includes(i));
	}

	reduce(mask: Type) {
		if (mask.isUnknown) {
			return this;
		}
		if (this.isUnknown) {
			return mask;
		}
		const list = this._concreteTypes.filter((i)=> mask.includes(i));
		return list.length === 0
			? undefined
			: list.length === this._concreteTypes.length
				? this
				: new Type(...list);
	}

	toOptional() {
		return this._concreteTypes.length ? new Type('void', ...this._concreteTypes) : this;
	}

	toString() {
		return this._concreteTypes.length ? this._concreteTypes.map((p)=> p.toString()).sort().join('|') : '??';
	}

	static of(value: Value) {
		return new Type(value == null
			? 'void'
			: typeof value === 'boolean'
				? 'boolean'
				: typeof value === 'number'
					? 'number'
					: value instanceof ArrayBuffer
						? 'buffer'
						: typeof value === 'string'
							? 'string'
							: Array.isArray(value)
								? 'array'
								: typeof value === 'object'
									? 'object'
									: new FunctionType(Type.Unknown, [Type.Unknown], { variadic: true })
		);
	}

	static equate(a: ConcreteType, b: ConcreteType) {
		return a === b
			|| a instanceof FunctionType && b instanceof FunctionType && a.equals(b);
	}

	static functionType(
		type: Type,
		argTypes: Type[],
		options?: IFunctionTypeOptions,
	) {
		return new Type(new FunctionType(type, argTypes, options));
	}

	static Unknown = new Type();
	static Void = new Type('void');
	static Boolean = new Type('boolean');
	static Number = new Type('number');
	static Buffer = new Type('buffer');
	static String = new Type('string');
	static Array = new Type('array');
	static Object = new Type('object');
	static OptionalBoolean = new Type('void', 'boolean');
	static OptionalNumber = new Type('void', 'number');
	static OptionalBuffer = new Type('void', 'buffer');
	static OptionalString = new Type('void', 'string');
	static OptionalArray = new Type('void', 'array');
	static OptionalObject = new Type('void', 'object');
	static Enumerable = new Type('buffer', 'string', 'array');
	static Iterable = new Type('buffer', 'string', 'array', 'object');

}
