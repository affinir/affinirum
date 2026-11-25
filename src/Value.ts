export type PrimitiveValue = undefined | null | number | boolean | Date | bigint | ArrayBuffer | string;
export type Value = PrimitiveValue | Value[] | { [ key: string ]: Value } | ((...args: any[]) => Value);

export const normalize = (value: Value, normalized?: WeakMap<object, Value>): Value => {
	if (typeof value === "bigint") {
		return BigInt.asIntN(64, value);
	}
	if (value == null ||
		typeof value !== "object" && typeof value !== "function" ||
		value instanceof Date ||
		value instanceof ArrayBuffer) {
		return value;
	}
	normalized ??= new WeakMap();
	const existing = normalized.get(value);
	if (existing !== undefined) {
		return existing;
	}
	if (typeof value === "function") {
		const copy = (...args: Value[]) => {
			const result = value(...args);
			return typeof result === "bigint" ? BigInt.asIntN(64, result) : result;
		};
		normalized.set(value, copy);
		return copy;
	}
	if (Array.isArray(value)) {
		const copy = new Array<Value>(value.length);
		normalized.set(value, copy);
		for (const key of Object.getOwnPropertyNames(value)) {
			const index = Number(key);
			if (Number.isInteger(index) && index >= 0 && index < copy.length && String(index) === key) {
				copy[index] = normalize(value[index], normalized);
			}
		}
		return copy;
	}
	const copy = Object.create(null) as Record<string, Value>;
	normalized.set(value, copy);
	for (const key of Object.keys(value)) {
		copy[key] = normalize(value[key], normalized);
	}
	return copy;
};
