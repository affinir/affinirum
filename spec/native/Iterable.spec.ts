import { runAffinirumTests } from "../helpers/AffinirumTest.js";

describe("Iterable function test", ()=> {
	runAffinirumTests([
		{
			script: "v.Contains(s)",
			cases: [
				{ values: { v: { a: "abc", b: 4 }, s: 4 }, result: true },
				{ values: { v: { a: "abc", b: 4 }, s: 6 }, result: false },
			],
		},
		{
			script: "v.Contains(s, pos)",
			cases: [
				{ values: { v: " abc def abc", s: "def", pos: 2n }, result: true },
				{ values: { v: " abc ", s: "aba", pos: 1n }, result: false },
				{ values: { v: new Uint32Array([100, 200, 300, 400]).buffer, s: new Uint32Array([200, 300]).buffer, pos: 2n }, result: true },
				{ values: { v: new Uint8Array([0xaa, 0xbb, 0xcc]).buffer, s: new Uint8Array([0xbb, 0xcc]).buffer, pos: -2n }, result: true },
				{ values: { v: new Uint32Array([100, 202, 303, 400]).buffer, s: new Uint32Array([200, 300]).buffer, pos: 0n }, result: false },
				{ values: { v: [0, 1, 2, 3, 4, 5], s: 4, pos: undefined }, result: true },
				{ values: { v: [0, 1, 2, 3, 4, 5], s: 6, pos: 0n }, result: false },
				{ values: { v: [0, 1, 2, 3, 4, 5], s: 1, pos: 2n }, result: false },
			],
		},
		{
			script: "v.Contains(s, pos, true)",
			cases: [
				{ values: { v: "", s: "", pos: null }, result: true },
				{ values: { v: "", s: "123", pos: 0n }, result: false },
				{ values: { v: "  ab CD  0123   ", s: " A Bcd ", pos: null }, result: true },
				{ values: { v: "  ab C-D  0123   ", s: " A+Bcd ", pos: null }, result: true },
			],
		},
		{
			script: "s.Length()",
			cases: [
				{ values: { s: "my long string" }, result: 14n },
				{ values: { s: "my" }, result: 2n },
				{ values: { s: "" }, result: 0n },
				{ values: { s: new Uint8Array([1, 2, 3]).buffer }, result: 3n },
				{ values: { s: { a: 1, b: 2 } }, result: 2n },
			],
		},
		{
			script: "abc.Length * 10 - 5",
			cases: [
				{ values: { abc: "abc" }, result: 25n },
			],
		},
		{
			script: "a.Trim().Length() == 6",
			cases: [
				{ values: { a: "  abcdef  " }, result: true },
			],
		},
		{
			script: "[a, b, c].Length() + [1, 2, 3, 4].Length()",
			cases: [
				{ values: { a: 1n, b: 2n, c: 3n }, result: 7n },
			],
		},
		{
			script: "a.Length() % 3",
			cases: [
				{ values: { a: "abcd" }, result: 1n },
				{ values: { a: "abcdef" }, result: 0n },
			],
		},
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
			script: "arr0[1] + obj0[1]",
			cases: [
				{ values: { arr0: [undefined, 10, 20], obj0: { a: undefined, "1": 100 } }, result: 110 },
				{ values: { arr0: [1, 2], obj0: { a: 1, "1": 1 } }, result: 3 },
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
