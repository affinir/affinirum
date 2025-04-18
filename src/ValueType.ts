
export type Value = void | undefined | null | boolean | number | ArrayBuffer | string |
	Value[] | { [ key: string ]: Value } | ((...args: any[])=> Value);

export type Type = 'void' | 'boolean' | 'number' | 'buffer' | 'string' | 'array' | 'object' | 'function';

export class ValueType {

	protected _types: Set<Type>;

	constructor(
		...types: Type[]
	) {
		this._types = new Set(types);
	}

	get isSpecific() {
		return this._types.size === 1;
	}

	get isBoolean() {
		return this.isSpecific && this._types.has('boolean');
	}

	get isNumber() {
		return this.isSpecific && this._types.has('number');
	}

	get isBuffer() {
		return this.isSpecific && this._types.has('buffer');
	}

	get isString() {
		return this.isSpecific && this._types.has('string');
	}

	get isArray() {
		return this.isSpecific && this._types.has('array');
	}

	get isObject() {
		return this.isSpecific && this._types.has('object');
	}

	get isFunction() {
		return this.isSpecific && this._types.has('function');
	}

	get isVoid() {
		return this.isSpecific && this._types.has('void');
	}

	has(type: Type) {
		return this._types.size === 0 || this._types.has(type);
	}

	reduce(mask: ValueType) {
		if (mask.isVoid) {
			return this;
		}
		if (this._types.size === 0) {
			return mask;
		}
		const vtypes = Array.from(this._types.values()).filter((t)=> mask.has(t));
		return vtypes.length === 0
			? undefined
			: vtypes.length === this._types.size
				? this
				: new ValueType(...vtypes);
	}

	toOptional() {
		return this._types.size ? new ValueType('void', ...this._types) : this;
	}

	toString() {
		return this._types.size ? Array.from(this._types.values()).join('|') : '??';
	}

	static of(value: Value) {
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
		return new ValueType(vtype as Type);
	}

}

export const typeUnknown = new ValueType();
export const typeVoid = new ValueType('void');
export const typeBoolean = new ValueType('boolean');
export const typeNumber = new ValueType('number');
export const typeBuffer = new ValueType('buffer');
export const typeString = new ValueType('string');
export const typeArray = new ValueType('array');
export const typeObject = new ValueType('object');
export const typeFunction = new ValueType('function');
export const typeOptionalBoolean = new ValueType('void', 'boolean');
export const typeOptionalNumber = new ValueType('void', 'number');
export const typeOptionalBuffer = new ValueType('void', 'buffer');
export const typeOptionalString = new ValueType('void', 'string');
export const typeOptionalArray = new ValueType('void', 'array');
export const typeOptionalObject = new ValueType('void', 'object');
export const typeOptionalFunction = new ValueType('void', 'function');
export const typeBooleanOrArray = new ValueType('boolean', 'array');
export const typeNumberOrArray = new ValueType('number', 'array');
export const typeBufferOrArray = new ValueType('buffer', 'array');
export const typeStringOrArray = new ValueType('string', 'array');
export const typeNumberOrString = new ValueType('number', 'string');
export const typeArrayOrObject = new ValueType('array', 'object');
export const typeOptionalArrayOrObject = new ValueType('void', 'array', 'object');
export const typeEnumerable = new ValueType('buffer', 'string', 'array');
export const typeIterable = new ValueType('buffer', 'string', 'array', 'object');
export const typeJson = new ValueType('void', 'boolean', 'number', 'string', 'array', 'object');
export const typeValid = new ValueType('boolean', 'number', 'buffer', 'string', 'array', 'object', 'function');
