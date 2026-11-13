import { Type } from "../../../src/index.js";

describe("Type equality test", () => {
	it("compares array atoms structurally and positionally", () => {
		const type = Type.arrayType([Type.Integer, Type.String]);
		expect(type.equate(Type.arrayType([Type.Integer, Type.String]))).toBe(true);
		expect(type.equate(Type.arrayType([Type.String, Type.Integer]))).toBe(false);
		expect(type.equate(Type.arrayType([Type.Integer]))).toBe(false);
	});

	it("compares object atoms independently of property order", () => {
		const type = Type.objectType([["a", Type.Integer], ["b", Type.String]]);
		expect(type.equate(Type.objectType([["b", Type.String], ["a", Type.Integer]]))).toBe(true);
		expect(type.equate(Type.objectType([["a", Type.Integer]]))).toBe(false);
		expect(type.equate(Type.objectType([["a", Type.String], ["b", Type.String]]))).toBe(false);
	});

	it("compares function atoms including return, arguments, and variadicity", () => {
		const strings = Type.arrayType([Type.String]);
		const booleans = Type.arrayType([Type.Boolean]);
		const type = Type.functionType([[Type.Float, [Type.Integer, strings], true]]);
		expect(type.equate(Type.functionType([[Type.Float, [Type.Integer, strings], true]]))).toBe(true);
		expect(type.equate(Type.functionType([[Type.Integer, [Type.Integer, strings], true]]))).toBe(false);
		expect(type.equate(Type.functionType([[Type.Float, [Type.Integer, booleans], true]]))).toBe(false);
		expect(type.equate(Type.functionType([[Type.Float, [Type.Integer, strings]]]))).toBe(false);
	});

	it("compares union members independently of order", () => {
		expect(Type.union(Type.Float, Type.Integer).equate(Type.union(Type.Integer, Type.Float))).toBe(true);
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
		]).accept(source)).toBe(true);
		expect(Type.objectType([
			["items", Type.arrayType([Type.Integer])],
			["label", Type.Unknown],
		]).accept(source)).toBe(true);
	});

	it("accepts omitted optional tuple items", () => {
		const source = Type.arrayType([Type.Integer, Type.String]);
		expect(Type.arrayType([
			Type.Integer,
			Type.String,
			Type.OptionalBoolean,
		]).accept(source)).toBe(true);
		expect(Type.arrayType([
			Type.Integer,
			Type.String,
			Type.Boolean,
		]).accept(source)).toBe(false);
	});

	it("rejects missing required object properties", () => {
		const source = Type.objectType([
			["items", Type.arrayType([Type.Integer])],
		]);
		expect(Type.objectType([
			["items", Type.arrayType([Type.Integer])],
			["label", Type.String],
		]).accept(source)).toBe(false);
	});
});

describe("Type intersect test", () => {
	it("treats Never as disjoint from Unknown in either order", () => {
		expect(Type.Never.intersect(Type.Unknown)).toBe(false);
		expect(Type.Unknown.intersect(Type.Never)).toBe(false);
	});

	it("recognizes overlapping primitive unions", () => {
		expect(Type.Number.intersect(Type.Integer)).toBe(true);
		expect(Type.Integer.intersect(Type.Void)).toBe(false);
		expect(
			Type.union(Type.Integer, Type.String).intersect(
				Type.union(Type.String, Type.Boolean),
			)
		).toBe(true);
	});

	it("recognizes overlapping structured types", () => {
		expect(
			Type.arrayType([Type.Number]).intersect(
				Type.arrayType([Type.Integer]),
			)
		).toBe(true);
	});

	it("checks overlap directly against an atom", () => {
		const [atom] = Type.objectType([["value", Type.Integer]]).objectAtoms();
		expect(Type.objectType([["value", Type.Number]]).intersect(atom)).toBe(true);
		expect(Type.objectType([["value", Type.String]]).intersect(atom)).toBe(false);
		expect(Type.Unknown.intersect(atom)).toBe(true);
		expect(Type.Never.intersect(atom)).toBe(false);
	});

	it("recognizes partially overlapping array element unions", () => {
		const left = Type.arrayType([Type.union(Type.Integer, Type.String)]);
		const right = Type.arrayType([Type.union(Type.String, Type.Boolean)]);
		expect(left.intersect(right)).toBe(true);
		expect(right.intersect(left)).toBe(true);
		expect(left.intersect(Type.arrayType([Type.Boolean]))).toBe(false);
	});

	it("recognizes overlapping tuple constraints", () => {
		const type = Type.arrayType([Type.Integer, Type.String]);
		expect(type.intersect(Type.arrayType([Type.Number, Type.String, Type.Boolean]))).toBe(true);
		expect(type.intersect(Type.arrayType([Type.Integer, Type.Boolean]))).toBe(false);
		expect(type.intersect(Type.arrayType([Type.Number]))).toBe(false);
	});

	it("permits an incompatible optional tuple tail to be omitted", () => {
		const homogeneous = Type.arrayType([Type.Integer]);
		const optionalTuple = Type.arrayType([Type.Integer, Type.OptionalString]);
		const requiredTuple = Type.arrayType([Type.Integer, Type.String]);
		expect(homogeneous.intersect(optionalTuple)).toBe(true);
		expect(optionalTuple.intersect(homogeneous)).toBe(true);
		expect(homogeneous.intersect(requiredTuple)).toBe(false);
		expect(requiredTuple.intersect(homogeneous)).toBe(false);
	});

	it("permits incompatible optional tails in overlapping tuples", () => {
		const strings = Type.arrayType([Type.Integer, Type.OptionalString]);
		const booleans = Type.arrayType([Type.Integer, Type.OptionalBoolean]);
		expect(strings.intersect(booleans)).toBe(true);
		expect(booleans.intersect(strings)).toBe(true);
	});

	it("recognizes compatible object constraints", () => {
		const left = Type.objectType([["a", Type.Integer]]);
		const right = Type.objectType([["b", Type.String]]);
		expect(left.intersect(right)).toBe(true);
		expect(right.intersect(left)).toBe(true);
		expect(left.intersect(Type.objectType([["a", Type.Number]]))).toBe(true);
		expect(left.intersect(Type.objectType([["a", Type.String]]))).toBe(false);
	});

	it("recognizes partially overlapping function types", () => {
		const left = Type.functionType([
			[Type.union(Type.Integer, Type.String), [Type.union(Type.Integer, Type.String)]],
		]);
		const right = Type.functionType([
			[Type.union(Type.String, Type.Boolean), [Type.union(Type.String, Type.Boolean)]],
		]);
		expect(left.intersect(right)).toBe(true);
		expect(right.intersect(left)).toBe(true);
	});

	it("ignores incompatible optional trailing function parameters", () => {
		const left = Type.functionType([[Type.Boolean, [Type.Integer, Type.OptionalString]]]);
		const right = Type.functionType([[Type.Boolean, [Type.Integer, Type.OptionalBoolean]]]);
		expect(left.intersect(right)).toBe(true);
		expect(right.intersect(left)).toBe(true);
	});

	it("rejects function types without a compatible call", () => {
		const acceptsInteger = Type.functionType([[Type.Boolean, [Type.Integer]]]);
		const acceptsString = Type.functionType([[Type.Boolean, [Type.String]]]);
		const requiresTwo = Type.functionType([[Type.Boolean, [Type.Integer, Type.String]]]);
		const variadic = Type.functionType([[Type.Boolean, [Type.arrayType([Type.Integer])], true]]);
		expect(acceptsInteger.intersect(acceptsString)).toBe(false);
		expect(acceptsInteger.intersect(requiresTwo)).toBe(false);
		expect(acceptsInteger.intersect(variadic)).toBe(false);
	});
});

describe("Type atom lookup test", () => {
	it("lists array and object alternatives in a mixed union", () => {
		const type = Type.union(
			Type.Boolean,
			Type.arrayType([Type.Integer]),
			Type.arrayType([Type.String]),
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
		const type = Type.arrayType([Type.Number]);
		expect(type.acceptValue([1, 2n])).toBe(true);
		expect(type.acceptValue([1, "2"])).toBe(false);
		expect(type.acceptValue([])).toBe(true);
	});

	it("checks tuple prefixes and permits additional values", () => {
		const type = Type.arrayType([Type.Integer, Type.String]);
		const optionalType = Type.arrayType([Type.Integer, Type.OptionalString]);
		const unknownType = Type.arrayType([Type.Integer, Type.Unknown]);
		expect(type.acceptValue([1n, "two", true])).toBe(true);
		expect(type.acceptValue([1n])).toBe(false);
		expect(type.acceptValue([1n, false])).toBe(false);
		expect(optionalType.acceptValue([1n])).toBe(true);
		expect(unknownType.acceptValue([1n])).toBe(true);
	});

	it("checks object properties recursively and permits additional properties", () => {
		const type = Type.objectType([
			["items", Type.arrayType([Type.Integer])],
			["label", Type.OptionalString],
		]);
		expect(type.acceptValue({ items: [1n, 2n], extra: true })).toBe(true);
		expect(type.acceptValue({ items: [1n], label: "one" })).toBe(true);
		expect(type.acceptValue({ items: [1n], label: false })).toBe(false);
		expect(type.acceptValue({ items: [1n, "two"] })).toBe(false);
		expect(type.acceptValue({ label: "missing items" })).toBe(false);
	});

	it("does not use inherited properties to satisfy object constraints", () => {
		const type = Type.objectType([["value", Type.Integer]]);
		const value = Object.create({ value: 1n }) as { value: bigint };
		expect(type.acceptValue(value)).toBe(false);
	});

	it("does not use inherited array slots to satisfy tuple constraints", () => {
		const type = Type.arrayType([Type.Integer, Type.String]);
		const value = Array<string>(2);
		value[1] = "two";
		Object.setPrototypeOf(value, { 0: 1n });
		expect(type.acceptValue(value)).toBe(false);
	});

	it("treats sparse homogeneous items as undefined", () => {
		const value = Array<bigint>(2);
		value[1] = 1n;
		expect(Type.arrayType([Type.OptionalInteger]).acceptValue(value)).toBe(true);
		expect(Type.arrayType([Type.Integer]).acceptValue(value)).toBe(false);
	});

	it("preserves unknown and broad structured types", () => {
		expect(Type.Unknown.acceptValue({ value: [1, "two"] })).toBe(true);
		expect(Type.Array.acceptValue([1, "two", true])).toBe(true);
		expect(Type.Object.acceptValue({ value: 1 })).toBe(true);
		expect(Type.Function.acceptValue(() => undefined)).toBe(true);
	});
});

describe("Uniform object type test", () => {
	it("checks every source value type during acceptance", () => {
		const type = Type.objectType([[undefined, Type.Integer]]);
		expect(type.accept(Type.objectType([["a", Type.Integer], ["b", Type.Integer]]))).toBe(true);
		expect(type.accept(Type.objectType([["a", Type.Integer], ["b", Type.String]]))).toBe(false);
		expect(type.accept(Type.objectType([[undefined, Type.Integer]]))).toBe(true);
		expect(type.accept(Type.objectType([[undefined, Type.String]]))).toBe(false);
		expect(Type.objectType([[undefined, Type.OptionalInteger]])
			.accept(Type.objectType([["a", Type.String]]))).toBe(false);
	});

	it("does not guarantee the existence of named properties", () => {
		const type = Type.objectType([[undefined, Type.Integer]]);
		expect(Type.objectType([["a", Type.Integer]]).accept(type)).toBe(false);
		expect(Type.objectType([["a", Type.OptionalInteger]]).accept(type)).toBe(true);
		expect(Type.objectType([["a", Type.OptionalString]]).accept(type)).toBe(false);
	});

	it("supplies uniform constraints for property inference without changing equality", () => {
		const type = Type.objectType([[undefined, Type.Integer]]);
		expect(type.objectAtomValType("a").equate(Type.Integer)).toBe(true);
		expect(type.objectAtomValType("").equate(Type.Integer)).toBe(true);
		expect(Type.union(type, Type.objectType([[undefined, Type.Float]]))
			.objectAtomValType("a").equate(Type.Number)).toBe(true);
		expect(type.equate(Type.objectType([["a", Type.Integer]]))).toBe(false);
		expect(Type.objectType([["a", Type.Integer]]).equate(type)).toBe(false);
	});

	it.each<[Type, boolean]>([
		[Type.objectType([["a", Type.Integer]]), true],
		[Type.objectType([["a", Type.String]]), false],
		[Type.objectType([["a", Type.OptionalString]]), true],
		[Type.objectType([["a", Type.Void]]), true],
		[Type.objectType([["a", Type.union(Type.Integer, Type.String)]]), true],
		[Type.objectType([[undefined, Type.String]]), true],
	])("compares intersections with %s symmetrically", (other, expected) => {
		const type = Type.objectType([[undefined, Type.Integer]]);
		expect(type.intersect(other)).toBe(expected);
		expect(other.intersect(type)).toBe(expected);
	});

	it("checks uniform values recursively and accepts empty objects", () => {
		const type = Type.objectType([[undefined, Type.objectType([[undefined, Type.Integer]])]]);
		expect(type.acceptValue({})).toBe(true);
		expect(type.acceptValue({ a: {}, b: { count: 1n } })).toBe(true);
		expect(type.acceptValue({ a: { count: 1n, other: "bad" } })).toBe(false);
	});
});

describe("Function argument test", () => {
	it("compares optional function argument types", () => {
		const expected = Type.functionType([
			[Type.Boolean, [Type.Integer, Type.OptionalString]],
		]);

		expect(expected.accept(Type.functionType([
			[Type.Boolean, [Type.Integer, Type.OptionalString]],
		]))).toBe(true);

		expect(expected.accept(Type.functionType([
			[Type.Boolean, [Type.Integer, Type.OptionalBoolean]],
		]))).toBe(false);
	});

	it("checks function arguments contravariantly", () => {
		const acceptsInteger = Type.functionType([[Type.Boolean, [Type.Integer]]]);
		const acceptsNumber = Type.functionType([[Type.Boolean, [Type.Number]]]);

		expect(acceptsInteger.accept(acceptsNumber)).toBe(true);
		expect(acceptsNumber.accept(acceptsInteger)).toBe(false);
	});

	it("checks optional function argument ranges", () => {
		const acceptsOne = Type.functionType([[Type.Boolean, [Type.Integer]]]);
		const acceptsOneOrTwo = Type.functionType([[Type.Boolean, [Type.Integer, Type.OptionalString]]]);
		const requiresTwo = Type.functionType([[Type.Boolean, [Type.Integer, Type.String]]]);

		expect(acceptsOne.accept(acceptsOneOrTwo)).toBe(true);
		expect(acceptsOneOrTwo.accept(acceptsOne)).toBe(true);
		expect(acceptsOne.accept(requiresTwo)).toBe(false);
	});

	it("distinguishes fixed and variadic function signatures", () => {
		const fixed = Type.functionType([[Type.Boolean, [Type.Integer]]]);
		const variadic = Type.functionType([[Type.Boolean, [Type.arrayType([Type.Integer])], true]]);

		expect(fixed.accept(variadic)).toBe(false);
		expect(variadic.accept(fixed)).toBe(false);
		expect(variadic.accept(Type.functionType([
			[Type.Boolean, [Type.arrayType([Type.Integer])], true],
		]))).toBe(true);
	});
});

describe("Variadic function argument test", () => {
	it.each([Type.String, Type.arrayType([Type.Integer, Type.Integer])])("rejects a host rest parameter of type %s", (type) => {
		expect(() => Type.functionType([[Type.Integer, [type], true]]))
			.toThrow(/variadic function argument must be of uniform array type/);
	});
});
