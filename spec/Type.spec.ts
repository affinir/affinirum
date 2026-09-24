import { Affinirum, Type, Value } from "../src/index.js";

describe("Type equality test", () => {
	it("compares array atoms structurally and positionally", () => {
		const type = Type.arrayType([Type.Integer, Type.String]);
		expect(type.equate(Type.arrayType([Type.Integer, Type.String]))).toBeTrue();
		expect(type.equate(Type.arrayType([Type.String, Type.Integer]))).toBeFalse();
		expect(type.equate(Type.arrayType([Type.Integer]))).toBeFalse();
	});

	it("compares object atoms independently of property order", () => {
		const type = Type.objectType([["a", Type.Integer], ["b", Type.String]]);
		expect(type.equate(Type.objectType([["b", Type.String], ["a", Type.Integer]]))).toBeTrue();
		expect(type.equate(Type.objectType([["a", Type.Integer]]))).toBeFalse();
		expect(type.equate(Type.objectType([["a", Type.String], ["b", Type.String]]))).toBeFalse();
	});

	it("compares function atoms including return, arguments, and variadicity", () => {
		const type = Type.functionType(Type.Float, [Type.Integer, Type.OptionalString], true);
		expect(type.equate(Type.functionType(Type.Float, [Type.Integer, Type.OptionalString], true))).toBeTrue();
		expect(type.equate(Type.functionType(Type.Integer, [Type.Integer, Type.OptionalString], true))).toBeFalse();
		expect(type.equate(Type.functionType(Type.Float, [Type.Integer, Type.OptionalBoolean], true))).toBeFalse();
		expect(type.equate(Type.functionType(Type.Float, [Type.Integer, Type.OptionalString], false))).toBeFalse();
	});

	it("compares union members independently of order", () => {
		expect(Type.union(Type.Float, Type.Integer).equate(Type.union(Type.Integer, Type.Float))).toBeTrue();
	});
});

describe("Type acceptance test", () => {
	it("accepts missing optional and unknown object properties", () => {
		const source = Type.objectType([
			["items", Type.arrayType([Type.Integer])],
		]);
		expect(Type.objectType([
			["items", Type.arrayType([Type.Integer])],
			["label", Type.OptionalString],
		]).accept(source)).toBeTrue();
		expect(Type.objectType([
			["items", Type.arrayType([Type.Integer])],
			["label", Type.Unknown],
		]).accept(source)).toBeTrue();
	});

	it("rejects missing required object properties", () => {
		const source = Type.objectType([
			["items", Type.arrayType([Type.Integer])],
		]);
		expect(Type.objectType([
			["items", Type.arrayType([Type.Integer])],
			["label", Type.String],
		]).accept(source)).toBeFalse();
	});
});

describe("Type intersect test", () => {
	it("recognizes overlapping primitive unions", () => {
		expect(Type.Number.intersect(Type.Integer)).toBeTrue();
		expect(Type.Integer.intersect(Type.Void)).toBeFalse();
		expect(
			Type.union(Type.Integer, Type.String).intersect(
				Type.union(Type.String, Type.Boolean),
			)
		).toBeTrue();
	});

	it("recognizes overlapping structured types", () => {
		expect(
			Type.arrayType([Type.Number]).intersect(
				Type.arrayType([Type.Integer]),
			)
		).toBeTrue();
	});

	it("recognizes partially overlapping array element unions", () => {
		const left = Type.arrayType([Type.union(Type.Integer, Type.String)]);
		const right = Type.arrayType([Type.union(Type.String, Type.Boolean)]);
		expect(left.intersect(right)).toBeTrue();
		expect(right.intersect(left)).toBeTrue();
		expect(left.intersect(Type.arrayType([Type.Boolean]))).toBeFalse();
	});

	it("recognizes overlapping tuple constraints", () => {
		const type = Type.arrayType([Type.Integer, Type.String]);
		expect(type.intersect(Type.arrayType([Type.Number, Type.String, Type.Boolean]))).toBeTrue();
		expect(type.intersect(Type.arrayType([Type.Integer, Type.Boolean]))).toBeFalse();
		expect(type.intersect(Type.arrayType([Type.Number]))).toBeFalse();
	});

	it("permits an incompatible optional tuple tail to be omitted", () => {
		const homogeneous = Type.arrayType([Type.Integer]);
		const optionalTuple = Type.arrayType([Type.Integer, Type.OptionalString]);
		const requiredTuple = Type.arrayType([Type.Integer, Type.String]);
		expect(homogeneous.intersect(optionalTuple)).toBeTrue();
		expect(optionalTuple.intersect(homogeneous)).toBeTrue();
		expect(homogeneous.intersect(requiredTuple)).toBeFalse();
		expect(requiredTuple.intersect(homogeneous)).toBeFalse();
	});

	it("permits incompatible optional tails in overlapping tuples", () => {
		const strings = Type.arrayType([Type.Integer, Type.OptionalString]);
		const booleans = Type.arrayType([Type.Integer, Type.OptionalBoolean]);
		expect(strings.intersect(booleans)).toBeTrue();
		expect(booleans.intersect(strings)).toBeTrue();
	});

	it("recognizes compatible object constraints", () => {
		const left = Type.objectType([["a", Type.Integer]]);
		const right = Type.objectType([["b", Type.String]]);
		expect(left.intersect(right)).toBeTrue();
		expect(right.intersect(left)).toBeTrue();
		expect(left.intersect(Type.objectType([["a", Type.Number]]))).toBeTrue();
		expect(left.intersect(Type.objectType([["a", Type.String]]))).toBeFalse();
	});

	it("recognizes partially overlapping function types", () => {
		const left = Type.functionType(
			Type.union(Type.Integer, Type.String),
			[Type.union(Type.Integer, Type.String)],
		);
		const right = Type.functionType(
			Type.union(Type.String, Type.Boolean),
			[Type.union(Type.String, Type.Boolean)],
		);
		expect(left.intersect(right)).toBeTrue();
		expect(right.intersect(left)).toBeTrue();
	});

	it("ignores incompatible optional trailing function parameters", () => {
		const left = Type.functionType(Type.Boolean, [Type.Integer, Type.OptionalString]);
		const right = Type.functionType(Type.Boolean, [Type.Integer, Type.OptionalBoolean]);
		expect(left.intersect(right)).toBeTrue();
		expect(right.intersect(left)).toBeTrue();
	});

	it("rejects function types without a compatible call", () => {
		const acceptsInteger = Type.functionType(Type.Boolean, [Type.Integer]);
		const acceptsString = Type.functionType(Type.Boolean, [Type.String]);
		const requiresTwo = Type.functionType(Type.Boolean, [Type.Integer, Type.String]);
		const variadic = Type.functionType(Type.Boolean, [Type.arrayType([Type.Integer])], true);
		expect(acceptsInteger.intersect(acceptsString)).toBeFalse();
		expect(acceptsInteger.intersect(requiresTwo)).toBeFalse();
		expect(acceptsInteger.intersect(variadic)).toBeFalse();
	});
});

describe("Type value acceptance test", () => {
	it("checks every value in a homogeneous array", () => {
		const type = Type.arrayType([Type.Number]);
		expect(type.acceptValue([1, 2n])).toBeTrue();
		expect(type.acceptValue([1, "2"])).toBeFalse();
		expect(type.acceptValue([])).toBeTrue();
	});

	it("checks tuple prefixes and permits additional values", () => {
		const type = Type.arrayType([Type.Integer, Type.String]);
		const optionalType = Type.arrayType([Type.Integer, Type.OptionalString]);
		const unknownType = Type.arrayType([Type.Integer, Type.Unknown]);
		expect(type.acceptValue([1n, "two", true])).toBeTrue();
		expect(type.acceptValue([1n])).toBeFalse();
		expect(type.acceptValue([1n, false])).toBeFalse();
		expect(optionalType.acceptValue([1n])).toBeTrue();
		expect(unknownType.acceptValue([1n])).toBeTrue();
	});

	it("checks object properties recursively and permits additional properties", () => {
		const type = Type.objectType([
			["items", Type.arrayType([Type.Integer])],
			["label", Type.OptionalString],
		]);
		expect(type.acceptValue({ items: [1n, 2n], extra: true })).toBeTrue();
		expect(type.acceptValue({ items: [1n], label: "one" })).toBeTrue();
		expect(type.acceptValue({ items: [1n], label: false })).toBeFalse();
		expect(type.acceptValue({ items: [1n, "two"] })).toBeFalse();
		expect(type.acceptValue({ label: "missing items" })).toBeFalse();
	});

	it("does not use inherited properties to satisfy object constraints", () => {
		const type = Type.objectType([["value", Type.Integer]]);
		const value = Object.create({ value: 1n }) as { value: bigint };
		expect(type.acceptValue(value)).toBeFalse();
	});

	it("does not use inherited array slots to satisfy tuple constraints", () => {
		const type = Type.arrayType([Type.Integer, Type.String]);
		const value = Array<string>(2);
		value[1] = "two";
		Object.setPrototypeOf(value, { 0: 1n });
		expect(type.acceptValue(value)).toBeFalse();
	});

	it("treats sparse homogeneous items as undefined", () => {
		const value = Array<bigint>(2);
		value[1] = 1n;
		expect(Type.arrayType([Type.OptionalInteger]).acceptValue(value)).toBeTrue();
		expect(Type.arrayType([Type.Integer]).acceptValue(value)).toBeFalse();
	});

	it("preserves unknown and broad structured types", () => {
		expect(Type.Unknown.acceptValue({ value: [1, "two"] })).toBeTrue();
		expect(Type.Array.acceptValue([1, "two", true])).toBeTrue();
		expect(Type.Object.acceptValue({ value: 1 })).toBeTrue();
		expect(Type.Function.acceptValue(() => undefined)).toBeTrue();
	});
});

describe("Value normalization test", () => {
	it("normalizes integers recursively while preserving composite identity", () => {
		const integer = 1n << 100n;
		const value: Value[] = [integer];
		const object: Record<string, Value> = { integer, value };
		value.push(object);
		const result = new Affinirum("value").evaluate({ value }) as Value[];
		expect(result === value).toBeTrue();
		expect(result[0] as bigint).toBe(0n);
		expect((result[1] as Record<string, Value>).integer as bigint).toBe(0n);
		expect((result[1] as Record<string, Value>).value === result).toBeTrue();
	});

	it("normalizes integers recursively in function results", () => {
		const expression = new Affinirum("[f()]", {
			strict: true,
			variables: { f: Type.functionType(Type.Array, []) },
		});
		const result = expression.evaluate({ f: () => [1n << 100n] }) as Value[][];
		expect(result[0][0] as bigint).toBe(0n);
	});
});
