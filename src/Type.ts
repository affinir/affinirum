export type Value = void | undefined | boolean | number | ArrayBufferLike | string |
	Value[] | { [ key: string ]: Value } | ((...args: Value[])=> Value);
type PrimitiveType = 'void' | 'boolean' | 'number' | 'buffer' | 'string' | 'array' | 'object' | 'function';
const PRIMITIVE_TYPES: PrimitiveType[] = [ 'void', 'boolean', 'number', 'buffer', 'string', 'array', 'object', 'function' ];

export class Type {

	protected _vtypes: PrimitiveType[];

	constructor(
		...args: PrimitiveType[]
	) {
		this._vtypes = args.length ? PRIMITIVE_TYPES.filter((n)=> args.includes(n)) : PRIMITIVE_TYPES;
	}

	get isPrimitive(): boolean {
		return this._vtypes.length === 1;
	}

	get isBoolean(): boolean {
		return this.isPrimitive && this._vtypes[ 0 ] === 'boolean';
	}

	get isNumber(): boolean {
		return this.isPrimitive && this._vtypes[ 0 ] === 'number';
	}

	get isBuffer(): boolean {
		return this.isPrimitive && this._vtypes[ 0 ] === 'buffer';
	}

	get isString(): boolean {
		return this.isPrimitive && this._vtypes[ 0 ] === 'string';
	}

	get isArray(): boolean {
		return this.isPrimitive && this._vtypes[ 0 ] === 'array';
	}

	get isObject(): boolean {
		return this.isPrimitive && this._vtypes[ 0 ] === 'object';
	}

	get isFunction(): boolean {
		return this.isPrimitive && this._vtypes[ 0 ] === 'function';
	}

	get isVoid(): boolean {
		return this.isPrimitive && this._vtypes[ 0 ] === 'void';
	}

	infer(mask: Type, func = (vtype: string, vmask: string)=> vtype === vmask): Type | undefined {
		if (mask.isVoid) {
			return this;
		}
		const vtypes = this._vtypes.filter((vtype)=> mask._vtypes.some((mvtype)=> func(vtype, mvtype)));
		return vtypes.length ? new Type(...vtypes) : undefined;
	}

	toOptional(): Type {
		return new Type('void', ...this._vtypes);
	}

	toString(): string {
		return this._vtypes.join('|');
	}

	static of(value: Value): Type {
		const vtype = value == null
			? 'void'
			: Array.isArray(value)
				? 'array'
				: value instanceof ArrayBuffer || value instanceof SharedArrayBuffer
					? 'buffer'
					: typeof value;
		return new Type(vtype as PrimitiveType);
	}

}

export const typeVariant = new Type();
export const typeVoid = new Type('void');
export const typeBoolean = new Type('boolean');
export const typeNumber = new Type('number');
export const typeBuffer = new Type('buffer');
export const typeString = new Type('string');
export const typeArray = new Type('array');
export const typeObject = new Type('object');
export const typeFunction = new Type('function');
export const typeOptionalBoolean = new Type('void', 'boolean');
export const typeOptionalNumber = new Type('void', 'number');
export const typeOptionalBuffer = new Type('void', 'buffer');
export const typeOptionalString = new Type('void', 'string');
export const typeOptionalArray = new Type('void', 'array');
export const typeOptionalObject = new Type('void', 'object');
export const typeOptionalFunction = new Type('void', 'function');
export const typeBooleanOrArray = new Type('boolean', 'array');
export const typeNumberOrArray = new Type('number', 'array');
export const typeBufferOrArray = new Type('buffer', 'array');
export const typeStringOrArray = new Type('string', 'array');
export const typeIterable = new Type('buffer', 'string', 'array', 'object');
export const typeAdditive = new Type('number', 'buffer', 'string', 'array', 'object');
export const typeJson = new Type('void', 'boolean', 'number', 'string', 'array', 'object');
export const typeValid = new Type('boolean', 'number', 'buffer', 'string', 'array', 'object', 'function');
