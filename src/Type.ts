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
			if (!this._concreteTypes.includes(i)) {
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
		return this._concreteTypes.some((i)=>
			i === mask
				|| i instanceof FunctionType && mask instanceof FunctionType && i.isCompatible(mask)
		);
	}

	reduce(mask: Type) {
		if (mask.isUnknown || mask.isVoid) {
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
		return this._concreteTypes.length
			? this._concreteTypes.sort((a, b)=> Type._order(a) - Type._order(b)).map((i)=> i.toString()).join('|')
			: '??';
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
									: Type.DefaultFunctionType
		);
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
	static OptionalBoolean = new Type('void', 'boolean');
	static Number = new Type('number');
	static OptionalNumber = new Type('void', 'number');
	static Buffer = new Type('buffer');
	static OptionalBuffer = new Type('void', 'buffer');
	static String = new Type('string');
	static OptionalString = new Type('void', 'string');
	static Array = new Type('array');
	static OptionalArray = new Type('void', 'array');
	static Object = new Type('object');
	static OptionalObject = new Type('void', 'object');
	static DefaultFunctionType = new FunctionType(Type.Unknown, [Type.Unknown], { variadic: true });
	static Function = new Type(Type.DefaultFunctionType);
	static OptionalFunction = new Type('void', Type.DefaultFunctionType);
	static Enumerable = new Type('buffer', 'string', 'array');
	static Iterable = new Type('buffer', 'string', 'array', 'object');

	private static _order(mask: ConcreteType): number {
		switch (mask) {
			case 'void': return 0;
			case 'boolean': return 1;
			case 'number': return 2;
			//case 'integer': return 4;
			case 'buffer': return 8;
			case 'string': return 9;
			case 'array': return 0x100;
			case 'object': return 0x10000;
			default: return 0x100000000 + mask.retType._concreteTypes.reduce((acc, i)=> acc + Type._order(i), 0);
		}
	}

}
