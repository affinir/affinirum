export type Value = void | undefined | boolean | number | ArrayBuffer | string |
	Value[] | { [ key: string ]: Value } | ((...args: Value[])=> Value);
type ValueType = 'void' | 'boolean' | 'number' | 'buffer' | 'string' | 'array' | 'object' | 'function';
const VALUE_TYPE_NAMES: ValueType[] = [ 'void', 'boolean', 'number', 'buffer', 'string', 'array', 'object', 'function' ];
const VALUE_TYPE_COUNT = VALUE_TYPE_NAMES.length;

export class Type {

	protected _vtypes: Set<ValueType>;

	constructor(
		...args: ValueType[]
	) {
		this._vtypes = new Set(args.length ? args : VALUE_TYPE_NAMES);
	}

	get isSpecific(): boolean {
		return this._vtypes.size === 1;
	}

	get isBoolean(): boolean {
		return this.isSpecific && this._vtypes.has('boolean');
	}

	get isNumber(): boolean {
		return this.isSpecific && this._vtypes.has('number');
	}

	get isBuffer(): boolean {
		return this.isSpecific && this._vtypes.has('buffer');
	}

	get isString(): boolean {
		return this.isSpecific && this._vtypes.has('string');
	}

	get isArray(): boolean {
		return this.isSpecific && this._vtypes.has('array');
	}

	get isObject(): boolean {
		return this.isSpecific && this._vtypes.has('object');
	}

	get isFunction(): boolean {
		return this.isSpecific && this._vtypes.has('function');
	}

	get isVoid(): boolean {
		return this.isSpecific && this._vtypes.has('void');
	}

	reduce(mask: Type): Type | undefined {
		if (mask.isVoid) {
			return this;
		}
		const vtypes = Array.from(this._vtypes.values()).filter((t)=> mask._vtypes.has(t));
		return vtypes.length === 0
			? undefined
			: vtypes.length === this._vtypes.size
				? this
				: new Type(...vtypes);
	}

	toOptional(): Type {
		return new Type('void', ...this._vtypes);
	}

	toString(): string {
		return this._vtypes.size < VALUE_TYPE_COUNT ? Array.from(this._vtypes.values()).join('|') : '??';
	}

	static of(value: Value): Type {
		const vtype = value == null
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
									: 'function';
		return new Type(vtype as ValueType);
	}

}

export const typeUnknown = new Type();
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
export const typeNumberOrString = new Type('number', 'string');
export const typeArrayOrObject = new Type('array', 'object');
export const typeEnumerable = new Type('buffer', 'string', 'array');
export const typeIterable = new Type('buffer', 'string', 'array', 'object');
export const typeJson = new Type('void', 'boolean', 'number', 'string', 'array', 'object');
export const typeValid = new Type('boolean', 'number', 'buffer', 'string', 'array', 'object', 'function');
