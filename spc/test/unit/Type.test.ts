import { Type } from "../../../src/index.js";

describe("Type equality test", () => {
	it("compares array atoms structurally and positionally", () => {
		const type = Type.arrayType([Type.Integer, Type.String]);
		expect(type.equals(Type.arrayType([Type.Integer, Type.String]))).toBe(true);
		expect(type.equals(Type.arrayType([Type.String, Type.Integer]))).toBe(false);
		expect(type.equals(Type.arrayType([Type.Integer]))).toBe(false);
	});

	it("compares object atoms independently of property order", () => {
		const type = Type.objectType([["a", Type.Integer], ["b", Type.String]]);
		expect(type.equals(Type.objectType([["b", Type.String], ["a", Type.Integer]]))).toBe(true);
		expect(type.equals(Type.objectType([["a", Type.Integer]]))).toBe(false);
		expect(type.equals(Type.objectType([["a", Type.String], ["b", Type.String]]))).toBe(false);
	});

	it("compares function atoms including return, arguments, and variadicity", () => {
		const strings = Type.arrayType(Type.String);
		const booleans = Type.arrayType(Type.Boolean);
		const type = Type.functionType([[Type.Float, [Type.Integer, strings], true]]);
		expect(type.equals(Type.functionType([[Type.Float, [Type.Integer, strings], true]]))).toBe(true);
		expect(type.equals(Type.functionType([[Type.Integer, [Type.Integer, strings], true]]))).toBe(false);
		expect(type.equals(Type.functionType([[Type.Float, [Type.Integer, booleans], true]]))).toBe(false);
		expect(type.equals(Type.functionType([[Type.Float, [Type.Integer, strings]]]))).toBe(false);
	});

	it("compares union members independently of order", () => {
		expect(Type.union(Type.Float, Type.Integer).equals(Type.union(Type.Integer, Type.Float))).toBe(true);
	});
});

describe("Type acceptance test", () => {
	it("accepts missing optional and unknown object properties", () => {
		const source = Type.objectType([
			["items", Type.arrayType(Type.Integer)],
		]);
		expect(Type.objectType([
			["items", Type.arrayType(Type.Integer)],
			["label", Type.OptionalString],
		]).accepts(source)).toBe(true);
		expect(Type.objectType([
			["items", Type.arrayType(Type.Integer)],
			["label", Type.Unknown],
		]).accepts(source)).toBe(true);
	});

	it("accepts omitted optional tuple items", () => {
		const source = Type.arrayType([Type.Integer, Type.String]);
		expect(Type.arrayType([
			Type.Integer,
			Type.String,
			Type.OptionalBoolean,
		]).accepts(source)).toBe(true);
		expect(Type.arrayType([
			Type.Integer,
			Type.String,
			Type.Boolean,
		]).accepts(source)).toBe(false);
	});

	it("rejects missing required object properties", () => {
		const source = Type.objectType([
			["items", Type.arrayType(Type.Integer)],
		]);
		expect(Type.objectType([
			["items", Type.arrayType(Type.Integer)],
			["label", Type.String],
		]).accepts(source)).toBe(false);
	});
});

describe("Type intersect test", () => {
	it("treats Never as disjoint from Unknown in either order", () => {
		expect(Type.Never.intersects(Type.Unknown)).toBe(false);
		expect(Type.Unknown.intersects(Type.Never)).toBe(false);
	});

	it("recognizes overlapping primitive unions", () => {
		expect(Type.Number.intersects(Type.Integer)).toBe(true);
		expect(Type.Integer.intersects(Type.Void)).toBe(false);
		expect(
			Type.union(Type.Integer, Type.String).intersects(
				Type.union(Type.String, Type.Boolean),
			)
		).toBe(true);
	});

	it("recognizes overlapping structured types", () => {
		expect(
			Type.arrayType(Type.Number).intersects(
				Type.arrayType(Type.Integer),
			)
		).toBe(true);
	});

	it("checks overlap directly against an atom", () => {
		const [atom] = Type.objectType([["value", Type.Integer]]).objectAtoms();
		expect(Type.objectType([["value", Type.Number]]).intersects(atom)).toBe(true);
		expect(Type.objectType([["value", Type.String]]).intersects(atom)).toBe(false);
		expect(Type.Unknown.intersects(atom)).toBe(true);
		expect(Type.Never.intersects(atom)).toBe(false);
	});

	it("recognizes partially overlapping array element unions", () => {
		const left = Type.arrayType(Type.union(Type.Integer, Type.String));
		const right = Type.arrayType(Type.union(Type.String, Type.Boolean));
		expect(left.intersects(right)).toBe(true);
		expect(right.intersects(left)).toBe(true);
		expect(left.intersects(Type.arrayType(Type.Boolean))).toBe(true); // Both can be empty.
	});

	it("recognizes overlapping tuple constraints", () => {
		const type = Type.arrayType([Type.Integer, Type.String]);
		expect(type.intersects(Type.arrayType([Type.Number, Type.String, Type.Boolean]))).toBe(true);
		expect(type.intersects(Type.arrayType([Type.Integer, Type.Boolean]))).toBe(false);
		expect(type.intersects(Type.arrayType(Type.Number))).toBe(false);
	});

	it("permits an incompatible optional tuple tail to be omitted", () => {
		const homogeneous = Type.arrayType(Type.Integer);
		const optionalTuple = Type.arrayType([Type.Integer, Type.OptionalString]);
		const requiredTuple = Type.arrayType([Type.Integer, Type.String]);
		expect(homogeneous.intersects(optionalTuple)).toBe(true);
		expect(optionalTuple.intersects(homogeneous)).toBe(true);
		expect(homogeneous.intersects(requiredTuple)).toBe(false);
		expect(requiredTuple.intersects(homogeneous)).toBe(false);
	});

	it("permits incompatible optional tails in overlapping tuples", () => {
		const strings = Type.arrayType([Type.Integer, Type.OptionalString]);
		const booleans = Type.arrayType([Type.Integer, Type.OptionalBoolean]);
		expect(strings.intersects(booleans)).toBe(true);
		expect(booleans.intersects(strings)).toBe(true);
	});

	it("recognizes compatible object constraints", () => {
		const left = Type.objectType([["a", Type.Integer]]);
		const right = Type.objectType([["b", Type.String]]);
		expect(left.intersects(right)).toBe(true);
		expect(right.intersects(left)).toBe(true);
		expect(left.intersects(Type.objectType([["a", Type.Number]]))).toBe(true);
		expect(left.intersects(Type.objectType([["a", Type.String]]))).toBe(false);
	});

	it("recognizes partially overlapping function types", () => {
		const left = Type.functionType([
			[Type.union(Type.Integer, Type.String), [Type.union(Type.Integer, Type.String)]],
		]);
		const right = Type.functionType([
			[Type.union(Type.String, Type.Boolean), [Type.union(Type.String, Type.Boolean)]],
		]);
		expect(left.intersects(right)).toBe(true);
		expect(right.intersects(left)).toBe(true);
	});

	it("ignores incompatible optional trailing function parameters", () => {
		const left = Type.functionType([[Type.Boolean, [Type.Integer, Type.OptionalString]]]);
		const right = Type.functionType([[Type.Boolean, [Type.Integer, Type.OptionalBoolean]]]);
		expect(left.intersects(right)).toBe(true);
		expect(right.intersects(left)).toBe(true);
	});

	it("rejects function types without a compatible call", () => {
		const acceptsInteger = Type.functionType([[Type.Boolean, [Type.Integer]]]);
		const acceptsString = Type.functionType([[Type.Boolean, [Type.String]]]);
		const requiresTwo = Type.functionType([[Type.Boolean, [Type.Integer, Type.String]]]);
		const variadic = Type.functionType([[Type.Boolean, [Type.arrayType(Type.Integer)], true]]);
		expect(acceptsInteger.intersects(acceptsString)).toBe(false);
		expect(acceptsInteger.intersects(requiresTwo)).toBe(false);
		expect(acceptsInteger.intersects(variadic)).toBe(false);
	});
});

describe("Type atom lookup test", () => {
	it("lists array and object alternatives in a mixed union", () => {
		const type = Type.union(
			Type.Boolean,
			Type.arrayType(Type.Integer),
			Type.arrayType(Type.String),
			Type.objectType([["value", Type.Integer]]),
			Type.objectType([["value", Type.String]]),
		);
		expect(type.arrayAtoms().map((atom) => atom.valType(0))).toEqual([Type.Integer, Type.String]);
		expect(type.objectAtoms().map((atom) => atom.valType("value"))).toEqual([Type.Integer, Type.String]);
		expect(Type.Unknown.arrayAtoms()).toEqual(Type.Array.arrayAtoms());
		expect(Type.Unknown.objectAtoms()).toEqual(Type.Object.objectAtoms());
	});
});

describe("Type value acceptance test", () => {
	it("checks every value in a homogeneous array", () => {
		const type = Type.arrayType(Type.Number);
		expect(type.acceptsValue([1, 2n])).toBe(true);
		expect(type.acceptsValue([1, "2"])).toBe(false);
		expect(type.acceptsValue([])).toBe(true);
	});

	it("checks tuple prefixes and permits additional values", () => {
		const type = Type.arrayType([Type.Integer, Type.String]);
		const optionalType = Type.arrayType([Type.Integer, Type.OptionalString]);
		const unknownType = Type.arrayType([Type.Integer, Type.Unknown]);
		expect(type.acceptsValue([1n, "two", true])).toBe(true);
		expect(type.acceptsValue([1n])).toBe(false);
		expect(type.acceptsValue([1n, false])).toBe(false);
		expect(optionalType.acceptsValue([1n])).toBe(true);
		expect(unknownType.acceptsValue([1n])).toBe(true);
	});

	it("checks object properties recursively and permits additional properties", () => {
		const type = Type.objectType([
			["items", Type.arrayType(Type.Integer)],
			["label", Type.OptionalString],
		]);
		expect(type.acceptsValue({ items: [1n, 2n], extra: true })).toBe(true);
		expect(type.acceptsValue({ items: [1n], label: "one" })).toBe(true);
		expect(type.acceptsValue({ items: [1n], label: false })).toBe(false);
		expect(type.acceptsValue({ items: [1n, "two"] })).toBe(false);
		expect(type.acceptsValue({ label: "missing items" })).toBe(false);
	});

	it("does not use inherited properties to satisfy object constraints", () => {
		const type = Type.objectType([["value", Type.Integer]]);
		const value = Object.create({ value: 1n }) as { value: bigint };
		expect(type.acceptsValue(value)).toBe(false);
	});

	it("does not use inherited array slots to satisfy tuple constraints", () => {
		const type = Type.arrayType([Type.Integer, Type.String]);
		const value = Array<string>(2);
		value[1] = "two";
		Object.setPrototypeOf(value, { 0: 1n });
		expect(type.acceptsValue(value)).toBe(false);
	});

	it("treats sparse homogeneous items as undefined", () => {
		const value = Array<bigint>(2);
		value[1] = 1n;
		expect(Type.arrayType(Type.OptionalInteger).acceptsValue(value)).toBe(true);
		expect(Type.arrayType(Type.Integer).acceptsValue(value)).toBe(false);
	});

	it("preserves unknown and broad structured types", () => {
		expect(Type.Unknown.acceptsValue({ value: [1, "two"] })).toBe(true);
		expect(Type.Array.acceptsValue([1, "two", true])).toBe(true);
		expect(Type.Object.acceptsValue({ value: 1 })).toBe(true);
		expect(Type.Function.acceptsValue(() => undefined)).toBe(true);
	});
});

describe("Uniform object type test", () => {
	it("checks every source value type during acceptance", () => {
		const type = Type.objectType(Type.Integer);
		expect(type.accepts(Type.objectType([["a", Type.Integer], ["b", Type.Integer]]))).toBe(true);
		expect(type.accepts(Type.objectType([["a", Type.Integer], ["b", Type.String]]))).toBe(false);
		expect(type.accepts(Type.objectType(Type.Integer))).toBe(true);
		expect(type.accepts(Type.objectType(Type.String))).toBe(false);
		expect(Type.objectType(Type.OptionalInteger)
			.accepts(Type.objectType([["a", Type.String]]))).toBe(false);
	});

	it("does not guarantee the existence of named properties", () => {
		const type = Type.objectType(Type.Integer);
		expect(Type.objectType([["a", Type.Integer]]).accepts(type)).toBe(false);
		expect(Type.objectType([["a", Type.OptionalInteger]]).accepts(type)).toBe(true);
		expect(Type.objectType([["a", Type.OptionalString]]).accepts(type)).toBe(false);
	});

	it("supplies uniform constraints for property inference without changing equality", () => {
		const type = Type.objectType(Type.Integer);
		expect(type.objectAtomValType("a").equals(Type.Integer)).toBe(true);
		expect(type.objectAtomValType("").equals(Type.Integer)).toBe(true);
		expect(Type.union(type, Type.objectType(Type.Float))
			.objectAtomValType("a").equals(Type.Number)).toBe(true);
		expect(type.equals(Type.objectType([["a", Type.Integer]]))).toBe(false);
		expect(Type.objectType([["a", Type.Integer]]).equals(type)).toBe(false);
	});

	it.each<[Type, boolean]>([
		[Type.objectType([["a", Type.Integer]]), true],
		[Type.objectType([["a", Type.String]]), false],
		[Type.objectType([["a", Type.OptionalString]]), true],
		[Type.objectType([["a", Type.Void]]), true],
		[Type.objectType([["a", Type.union(Type.Integer, Type.String)]]), true],
		[Type.objectType(Type.String), true],
	])("compares intersections with %s symmetrically", (other, expected) => {
		const type = Type.objectType(Type.Integer);
		expect(type.intersects(other)).toBe(expected);
		expect(other.intersects(type)).toBe(expected);
	});

	it("checks uniform values recursively and accepts empty objects", () => {
		const type = Type.objectType(Type.objectType(Type.Integer));
		expect(type.acceptsValue({})).toBe(true);
		expect(type.acceptsValue({ a: {}, b: { count: 1n } })).toBe(true);
		expect(type.acceptsValue({ a: { count: 1n, other: "bad" } })).toBe(false);
	});
});

describe("Function argument test", () => {
	it("compares optional function argument types", () => {
		const expected = Type.functionType([
			[Type.Boolean, [Type.Integer, Type.OptionalString]],
		]);

		expect(expected.accepts(Type.functionType([
			[Type.Boolean, [Type.Integer, Type.OptionalString]],
		]))).toBe(true);

		expect(expected.accepts(Type.functionType([
			[Type.Boolean, [Type.Integer, Type.OptionalBoolean]],
		]))).toBe(false);
	});

	it("checks function arguments contravariantly", () => {
		const acceptsInteger = Type.functionType([[Type.Boolean, [Type.Integer]]]);
		const acceptsNumber = Type.functionType([[Type.Boolean, [Type.Number]]]);

		expect(acceptsInteger.accepts(acceptsNumber)).toBe(true);
		expect(acceptsNumber.accepts(acceptsInteger)).toBe(false);
	});

	it("checks optional function argument ranges", () => {
		const acceptsOne = Type.functionType([[Type.Boolean, [Type.Integer]]]);
		const acceptsOneOrTwo = Type.functionType([[Type.Boolean, [Type.Integer, Type.OptionalString]]]);
		const requiresTwo = Type.functionType([[Type.Boolean, [Type.Integer, Type.String]]]);

		expect(acceptsOne.accepts(acceptsOneOrTwo)).toBe(true);
		expect(acceptsOneOrTwo.accepts(acceptsOne)).toBe(true);
		expect(acceptsOne.accepts(requiresTwo)).toBe(false);
		expect(acceptsOneOrTwo.accepts(requiresTwo)).toBe(false);
	});

	it("preserves nullability when matching a parameter before a required one", () => {
		const nullableFirst = Type.functionType([[Type.Boolean, [Type.OptionalInteger, Type.Integer]]]);
		const requiredFirst = Type.functionType([[Type.Boolean, [Type.Integer, Type.Integer]]]);

		expect(nullableFirst.accepts(requiredFirst)).toBe(false);
		expect(requiredFirst.accepts(nullableFirst)).toBe(true);
	});

	it("distinguishes fixed and variadic function signatures", () => {
		const fixed = Type.functionType([[Type.Boolean, [Type.Integer]]]);
		const variadic = Type.functionType([[Type.Boolean, [Type.arrayType(Type.Integer)], true]]);

		expect(fixed.accepts(variadic)).toBe(false);
		expect(variadic.accepts(fixed)).toBe(false);
		expect(variadic.accepts(Type.functionType([
			[Type.Boolean, [Type.arrayType(Type.Integer)], true],
		]))).toBe(true);
	});
});

describe("Variadic function argument test", () => {
	it.each([Type.String, Type.arrayType([Type.Integer, Type.Integer])])("rejects a host rest parameter of type %s", (type) => {
		expect(() => Type.functionType([[Type.Integer, [type], true]]))
			.toThrow(/variadic function argument must be of uniform array type/);
	});
});
