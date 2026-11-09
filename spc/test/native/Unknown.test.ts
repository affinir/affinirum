import { Affinirum, Value } from "../../../src/index.js";
import { runAffinirumTests } from "../../util/AffinirumTest.js";

describe("Unknown function test", () => {
	runAffinirumTests([
		{
			script: "a.Format()",
			cases: [
				{ values: { a: undefined }, result: "" },
				{ values: { a: null }, result: "" },
				{ values: { a: true }, result: "true" },
				{ values: { a: new Date("2020-01-02T03:04:05.006Z") }, result: "2020-01-02T03:04:05.006Z" },
				{ values: { a: 5 }, result: "5.0" },
				{ values: { a: 1.5 }, result: "1.5" },
				{ values: { a: 5n }, result: "5" },
				{ values: { a: new Uint8Array().buffer }, result: "" },
				{ values: { a: "abc" }, result: "abc" },
				{ values: { a: [1n, "a", false] }, result: "1afalse" },
				{ values: { a: { a: 1n, b: "x" } }, result: "a1bx" },
				{ values: { a: () => 0n }, result: "" },
			],
		},
		{
			script: "a.Format(f)",
			cases: [
				{ values: { a: new Uint8Array([0xff, 0x00]).buffer, f: "base64" }, result: "/wA=" },
				{ values: { a: new Date("2020-01-02T03:04:05.006Z"), f: "ZYYYY/MM/DD hh:mm:ss.fffZ" }, result: "2020/01/02 03:04:05.006" },
			],
		},
		{
			script: "a == b",
			cases: [
				{ values: { a: 1, b: "1" }, result: false },
				{ values: { a: 1, b: 1.0001 }, result: false },
				{ values: { a: 1, b: 1 }, result: true },
			],
		},
		{
			script: "a.Equal(b)",
			cases: [
				{ values: { a: undefined, b: undefined }, result: true },
				{ values: { a: 1, b: 1n }, result: true },
				{ values: { a: 1n, b: 1.1 }, result: false },
				{ values: { a: Number.NaN, b: Number.NaN }, result: true },
				{ values: { a: new Date("2020-01-01T00:00:00.000Z"), b: new Date("2020-01-01T00:00:00.000Z") }, result: true },
				{ values: { a: new Uint8Array([1, 2]).buffer, b: new Uint8Array([1, 2]).buffer }, result: true },
				{ values: { a: [1n, ["a"]], b: [1, ["a"]] }, result: true },
				{ values: { a: { x: 1n, y: ["a"] }, b: { x: 1, y: ["a"] } }, result: true },
				{ values: { a: { x: 1 }, b: { x: 1, y: 2 } }, result: false },
			],
		},
		{
			script: "a != b",
			cases: [
				{ values: { a: 1, b: "1" }, result: true },
				{ values: { a: 1, b: 1.0001 }, result: true },
				{ values: { a: 1, b: 1 }, result: false },
			],
		},
		{
			script: "a.Unequal(b)",
			cases: [
				{ values: { a: new Date("2020-01-01T00:00:00.000Z"), b: new Date("2020-01-01T00:00:00.001Z") }, result: true },
				{ values: { a: new Uint8Array([1, 2]).buffer, b: new Uint8Array([1, 3]).buffer }, result: true },
				{ values: { a: [1, 2], b: [1, 2, 3] }, result: true },
				{ values: { a: { x: [1] }, b: { x: [2] } }, result: true },
				{ values: { a: "a", b: "a" }, result: false },
			],
		},
		{
			script: "a.Coalesce(b)",
			cases: [
				{ values: { a: false, b: true }, result: false },
				{ values: { a: 0n, b: 5n }, result: 0n },
				{ values: { a: "", b: "fallback" }, result: "" },
				{ values: { a: undefined, b: "fallback" }, result: "fallback" },
			],
		},
		{
			script: "a?:0.0",
			cases: [
				{ values: { a: 1 }, result: 1 },
				{ values: { a: undefined }, result: 0 },
			],
		},
		{
			script: "a?:-0.1",
			cases: [
				{ values: { a: 1 }, result: 1 },
				{ values: { a: undefined }, result: -0.1 },
			],
		},
		{
			script: "a?:b",
			cases: [
				{ values: { a: 1, b: 2 }, result: 1 },
				{ values: { a: undefined, b: 0 }, result: 0 },
				{ values: { a: undefined, b: undefined }, result: undefined },
			],
		},
		{
			script: "a.Encode().Format()",
			cases: [
				{ values: { a: true }, result: "ff" },
				{ values: { a: false }, result: "00" },
				{ values: { a: new Uint8Array([0xaa, 0xbb]).buffer }, result: "aabb" },
				{ values: { a: [true, "A"] }, result: "ff41" },
				{ values: { a: { a: 1n } }, result: "610000000000000001" },
				{ values: { a: () => 0n }, result: "" },
			],
		},
		{
			script: "a.Encode().Length",
			cases: [
				{ values: { a: undefined }, result: 0n },
				{ values: { a: null }, result: 0n },
			],
		},
		{
			script: "a.Encode(enc).Format()",
			cases: [
				{ values: { a: "A", enc: "utf8" }, result: "41" },
				{ values: { a: 10n, enc: "i16" }, result: "000a" },
				{ values: { a: 1.5, enc: "f32" }, result: "3fc00000" },
				{ values: { a: new Date("1970-01-01T00:00:01.000Z"), enc: "i64le" }, result: "e803000000000000" },
			],
		},
	]);
});

describe("Mixed numeric equality", () => {
	it.each<[number, bigint, boolean]>([
		[0, 0n, true],
		[-0, 0n, true],
		[42, 42n, true],
		[-42, -42n, true],
		[1.5, 1n, false],
		[-1.5, -1n, false],
		[Number.MIN_VALUE, 0n, false],
		[Number.MAX_SAFE_INTEGER, 9007199254740991n, true],
		[9007199254740992, 9007199254740992n, true],
		[9007199254740992, 9007199254740993n, false],
		[-9007199254740992, -9007199254740992n, true],
		[-9007199254740992, -9007199254740993n, false],
		[-(2 ** 63), -9223372036854775808n, true],
		[2 ** 63, 9223372036854775807n, false],
		[2 ** 63, -9223372036854775808n, false],
		[2 ** 64, 0n, false],
		[-(2 ** 64), 0n, false],
		[NaN, 0n, false],
		[Infinity, 0n, false],
		[-Infinity, 0n, false],
	])("compares float %s and integer %s in both operand orders", (float, integer, equal) => {
		const expression = new Affinirum("[a==b,b==a,a!=b,b!=a,a.Equal(b),b.Equal(a),a.Unequal(b),b.Unequal(a)]");
		expect(expression.evaluate({ a: float, b: integer }))
			.toEqual([equal, equal, !equal, !equal, equal, equal, !equal, !equal]);
	});

	it.each([
		"9007199254740992.0 == 9007199254740993",
		"9007199254740993 == 9007199254740992.0",
	])("folds %s without losing integer precision", (script) => {
		expect(new Affinirum(script).evaluate()).toBe(false);
	});

	it("preserves distinct large values in Array.Unique regardless of their order", () => {
		const expression = new Affinirum("Array.Unique(values)");
		for (const values of [[9007199254740992, 9007199254740993n], [9007199254740993n, 9007199254740992]]) {
			expect(expression.evaluate({ values })).toEqual(values);
		}
	});
});

describe("Object category equality", () => {
	const pairs: { categories: string, a: Value, b: Value }[] = [
		{ categories: "timestamp and buffer", a: new Date(0), b: new ArrayBuffer(0) },
		{ categories: "timestamp and array", a: new Date(0), b: [] },
		{ categories: "timestamp and object", a: new Date(0), b: {} },
		{ categories: "buffer and array", a: new Uint8Array([1]).buffer, b: [] },
		{ categories: "buffer and object", a: new Uint8Array([1]).buffer, b: Object.create(null) as Record<string, Value> },
		{ categories: "empty buffer and object", a: new ArrayBuffer(0), b: {} },
		{ categories: "empty array and object with matching properties", a: [], b: { length: 0n } },
		{ categories: "array and object with matching properties", a: [1n], b: { "0": 1n, length: 1n } },
	];
	const comparisonScript = "[a==b,b==a,a.Equal(b),b.Equal(a),a!=b,b!=a,a.Unequal(b),b.Unequal(a)]";

	it.each(pairs)("distinguishes $categories in both operand orders", ({ a, b }) => {
		const expression = new Affinirum(comparisonScript);
		expect(expression.evaluate({ a, b }))
			.toEqual([false, false, false, false, true, true, true, true]);
	});

	it.each(pairs)("distinguishes nested $categories in both operand orders", ({ a, b }) => {
		const expression = new Affinirum(comparisonScript);
		for (const values of [
			{ a: [a], b: [b] },
			{ a: { item: [a] }, b: { item: [b] } },
		]) {
			expect(expression.evaluate(values))
				.toEqual([false, false, false, false, true, true, true, true]);
		}
	});

	it.each(pairs)("keeps $categories distinct in Array.Unique", ({ a, b }) => {
		const expression = new Affinirum("Array.Unique(values)");
		for (const values of [
			[a, b], [b, a],
			[[a], [b]], [[b], [a]],
			[{ item: a }, { item: b }], [{ item: b }, { item: a }],
		]) {
			expect(expression.evaluate({ values })).toEqual(values);
		}
	});

	it("still removes equal values within each category in Array.Unique", () => {
		const values = [
			new Date(0), new Date(0),
			new Uint8Array([1]).buffer, new Uint8Array([1]).buffer,
			[], [],
			{}, {},
		];
		expect(new Affinirum("Array.Unique(values)").evaluate({ values }))
			.toEqual([new Date(0), new Uint8Array([1]).buffer, [], {}]);
	});
});

describe("Cyclic structural equality", () => {
	const comparisonScript = "[a==b,b==a,a.Equal(b),b.Equal(a),a!=b,b!=a,a.Unequal(b),b.Unequal(a)]";
	const createObject = (value: bigint): Record<string, Value> => {
		const object: Record<string, Value> = {};
		object.self = object;
		object.value = value;
		return object;
	};
	const factories: [string, (value: bigint) => Value][] = [
		["array", (value) => {
			const array: Value[] = [];
			array.push(array, value);
			return array;
		}],
		["object", createObject],
		["mixed object and array", (value) => {
			const object: Record<string, Value> = {};
			object.items = [object, value];
			return object;
		}],
	];

	it.each(factories)("compares cyclic %s values with themselves and matching copies", (_category, create) => {
		const expression = new Affinirum(comparisonScript);
		const a = create(1n);
		for (const b of [a, create(1n)]) {
			expect(expression.evaluate({ a, b }))
				.toEqual([true, true, true, true, false, false, false, false]);
		}
	});

	it.each(factories)("detects differences after a back-reference in cyclic %s values", (_category, create) => {
		const expression = new Affinirum(comparisonScript);
		expect(expression.evaluate({ a: create(1n), b: create(2n) }))
			.toEqual([false, false, false, false, true, true, true, true]);
	});

	it.each<[bigint, boolean]>([
		[1n, true],
		[2n, false],
	])("compares a shared child against distinct children with value %s", (value, equal) => {
		const shared = { value: 1n };
		const a = { first: shared, second: shared };
		const b = { first: { value: 1n }, second: { value } };
		const expression = new Affinirum(comparisonScript);
		expect(expression.evaluate({ a, b }))
			.toEqual([equal, equal, equal, equal, !equal, !equal, !equal, !equal]);
	});

	it("does not reuse compared pairs across evaluations", () => {
		const expression = new Affinirum("a==b");
		const a = createObject(1n);
		const b = createObject(1n);
		expect(expression.evaluate({ a, b })).toBe(true);
		b.value = 2n;
		expect(expression.evaluate({ a, b })).toBe(false);
	});

	it.each(factories)("removes matching cyclic %s values in Array.Unique", (_category, create) => {
		const a = create(1n);
		const b = create(1n);
		const c = create(2n);
		const expression = new Affinirum("Array.Unique(values)");
		const result = expression.evaluate({ values: [a, b, c] }) as Value[];
		expect(result).toHaveLength(2);
		expect(result[0]).toBe(a);
		expect(result[1]).toBe(c);
	});
});
