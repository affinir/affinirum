export type PrimitiveValue = undefined | null | number | boolean | Date | bigint | ArrayBuffer | string;
export type Value = PrimitiveValue | Value[] | { [ key: string ]: Value } | ((...args: any[]) => Value);

const normalizeRecursively = (value: Value, objects: WeakSet<object>): Value => {
	if (typeof value === "bigint") {
		return BigInt.asIntN(64, value);
	}
	if (value == null || typeof value !== "object" || value instanceof Date || value instanceof ArrayBuffer || objects.has(value)) {
		return value;
	}
	objects.add(value);
	if (Array.isArray(value)) {
		value.forEach((i, ix) => value[ix] = normalizeRecursively(i, objects));
	}
	else {
		for (const key of Object.keys(value)) {
			value[key] = normalizeRecursively(value[key], objects);
		}
	}
	return value;
};

export const normalize = (value: Value): Value => {
	if (typeof value === "bigint") {
		return BigInt.asIntN(64, value);
	}
	if (value == null || typeof value !== "object" || value instanceof Date || value instanceof ArrayBuffer) {
		return value;
	}
	return normalizeRecursively(value, new WeakSet<object>());
};
