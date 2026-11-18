export type PrimitiveValue = undefined | null | number | boolean | Date | bigint | ArrayBuffer | string;
export type Value = PrimitiveValue | Value[] | { [ key: string ]: Value } | ((...args: any[]) => Value);

export const normalize = (value: Value, composites?: WeakMap<object, Value>): Value => {
	if (typeof value === "bigint") {
		return BigInt.asIntN(64, value);
	}
	if (value == null || typeof value !== "object" || value instanceof Date || value instanceof ArrayBuffer) {
		return value;
	}
	composites ??= new WeakMap();
	const existing = composites.get(value);
	if (existing !== undefined) {
		return existing;
	}
	if (Array.isArray(value)) {
		const copy = new Array<Value>(value.length);
		composites.set(value, copy);
		for (const key of Object.getOwnPropertyNames(value)) {
			const index = Number(key);
			if (Number.isInteger(index) && index >= 0 && index < copy.length && String(index) === key) {
				copy[index] = normalize(value[index], composites);
			}
		}
		return copy;
	}
	const copy = Object.create(null) as Record<string, Value>;
	composites.set(value, copy);
	for (const key of Object.keys(value)) {
		copy[key] = normalize(value[key], composites);
	}
	return copy;
};
