import { runAffinirumTests } from "../../util/AffinirumTest.js";

describe("Composite function test", () => {
	runAffinirumTests([
		{
			script: "[0,1][i]==null",
			cases: [
				{ values: { i: 2n }, result: true },
				{ values: { i: 1n }, result: false },
			],
		},
		{
			script: "[0,1][2]?:n",
			cases: [
				{ values: { n: 5 }, result: 5 },
				{ values: { n: undefined }, result: undefined },
			],
		},
		{
			script: "arr0[3] == 50",
			cases: [
				{ values: { arr0: [10, 20, 30, 50] }, result: true },
				{ values: { arr0: [] }, result: false },
			],
		},
		{
			script: "arr0[i]",
			cases: [
				{ values: { arr0: [10, 20, 30, 50], i: 0n }, result: 10 },
				{ values: { arr0: [], i: 5n }, result: undefined },
			],
		},
		{
			script: "arr0[x] + obj0[y]",
			cases: [
				{ values: { arr0: [undefined, 10, 20], x: 1n, obj0: { a: undefined, "1": 100 }, y: "1" }, result: 110 },
				{ values: { arr0: [1, 2], x: 0n, obj0: { a: 1, "1": 1 }, y: "1" }, result: 2 },
			],
		},
		{
			script: "obj1.\"a0\"",
			cases: [
				{ values: { obj1: { a0: 10 } }, result: 10 },
				{ values: { obj1: { a0: "10" } }, result: "10" },
			],
		},
		{
			script: "obj2[\"prop\"].a",
			cases: [
				{ values: { obj2: { prop: { a: 10 } } }, result: 10 },
				{ values: { obj2: { prop: { a: "10" } } }, result: "10" },
			],
		},
		{
			script: "v*myobj[a[\"prop\"]]+1",
			cases: [
				{ values: { v: 1, myobj: { test: 10 }, a: { prop: "test" } }, result: 11 },
			],
		},
		{
			script: "obj3[prop1]+obj3[prop2]",
			cases: [
				{ values: { obj3: { prop1: 1, prop2: 2 }, prop1: "prop1", prop2: "prop2" }, result: 3 },
			],
		},
		{
			script: "test[0].prop1==test[1][\"prop2\"]",
			cases: [
				{ values: { test: [{ prop1: 1, prop2: 2 }, { prop1: 2, prop2: 1 }] }, result: true },
			],
		},
		{
			script: "a.b.c.d ?: 10",
			cases: [
				{ values: { a: { b: { c: { d: 50n } } } }, result: 50n },
				{ values: { a: { b: {} } }, result: 10n },
			],
		},
		{
			script: "a[4][0][0] ?: 10",
			cases: [
				{ values: { a: [0] }, result: 10n },
				{ values: { a: [[0]] }, result: 10n },
			],
		},
		{
			script: "a.1",
			cases: [
				{ values: { a: [0, 1] }, result: 1 },
				{ values: { a: ["-1", "-2"] }, result: "-2" },
			],
		},
		{
			script: "a[x]",
			cases: [
				{ values: { a: { b: 1 }, x: "a" }, result: undefined },
				{ values: { a: { b: 1 }, x: "1" }, result: undefined },
				{ values: { a: [0,  1], x: 5n }, result: undefined },
				{ values: { a: [0], x: -5n }, result: undefined },
			],
		},
		{
			script: "[a:1, b:2,][c]",
			cases: [
				{ values: { a: "abc", b: "def", c: "abc" }, result: 1n },
				{ values: { a: "abc", b: "def", c: "def" }, result: 2n },
			],
		},
		{
			script: "[if (x == `a`) { x } else { \"a\" } :1].a",
			cases: [
				{ values: { x: "a" }, result: 1n },
				{ values: { x: "b" }, result: 1n },
			],
		},
		{
			script: "[\"entity\":[d.id:[\"a1\", \"a2\"]]].entity.abc[0]",
			cases: [
				{ values: { d: { id: "abc" } }, result: "a1" },
				{ values: { d: { id: "a" } }, result: undefined },
			],
		},
		{
			script: "v.At(\"prop\") + v.z",
			cases: [
				{ values: { v: { prop: 10n, z: 10n } }, result: 20n },
				{ values: { v: { prop: 100n } }, result: undefined },
			],
		},
		{
			script: "v.At(i)",
			cases: [
				{ values: { v: [10, 20, 30], i: 1n }, result: 20 },
				{ values: { v: [10, 20, 30], i: -1n }, result: 30 },
				{ values: { v: [10], i: 5n }, result: undefined },
			],
		},
		{
			script: "v.Has(\"prop\") & v?z",
			cases: [
				{ values: { v: { prop: "abc", z: 10n } }, result: true },
				{ values: { v: { prop: "abc" } }, result: false },
			],
		},
		{
			script: "v.Has(i)",
			cases: [
				{ values: { v: [10, 20], i: 1n }, result: true },
				{ values: { v: [10, 20], i: 2n }, result: false },
			],
		},
	]);
});
