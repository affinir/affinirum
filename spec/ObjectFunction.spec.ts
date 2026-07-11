import { runAffinirumTests } from "./helpers/AffinirumTest.js";

describe("Object function test", ()=> {
	runAffinirumTests([
		{
			script: "Object.Merge([:], [:], [\"a\":x], [\"b\":x]).Length",
			cases: [
				{ values: { x: 1n }, result: 2n },
				{ values: { x: undefined }, result: 2n },
			],
		},
		{
			script: "(Object.Merge(a,b)).i == 0",
			cases: [
				{ values: { a: { f: 0, d: 0 }, b: { i: 0 } }, result: true },
				{ values: { a: { i: 50, d: 0 }, b: { i: 0 } }, result: true },
			],
		},
		{
			script: "Object.Merge(a, b,c).i == 0",
			cases: [
				{ values: { a: { f: 0, d: 0 }, b: { i: 0 }, c: {} }, result: true },
				{ values: { a: { i: 50, d: 0 }, b: { i: 0 }, c: { prop: 1 } }, result: true },
			],
		},
		{
			script: "Object.Merge(items).prop",
			cases: [
				{ values: { items: [{ a: 1 }, { prop: "merged" }] }, result: "merged" },
				{ values: { items: [{ prop: 1 }, { prop: 2 }] }, result: 2 },
			],
		},
		{
			script: "Object.Merge(a, items).prop + Object.Merge(a, items).extra",
			cases: [
				{ values: { a: { prop: 1 }, items: [{ prop: 2 }, { extra: 3 }] }, result: 5 },
			],
		},
		{
			script: "ooo.Entries()[i][j]",
			cases: [
				{ values: { ooo: { a: 0, b: 1 }, i: 0n, j: 0n }, result: "a" },
				{ values: { ooo: { a: 0, b: 1 }, i: 1n, j: 1n }, result: 1 },
			],
		},
		{
			script: "ooo.Entries()[0].\"1\"",
			cases: [
				{ values: { ooo: { a: 0, b: 1 } }, result: 0 },
				{ values: { ooo: { b: "b", a: "a" } }, result: "b" },
			],
		},
		{
			script: "o1.Keys()[i]",
			cases: [
				{ values: { o1: { a: 0, b: 1 }, i: 0n }, result: "a" },
				{ values: { o1: { b: "baa", c: "caa" }, i: 1n }, result: "c" },
			],
		},
		{
			script: "o1.Values()[i]",
			cases: [
				{ values: { o1: { a: 0, b: 1 }, i: 0n }, result: 0 },
				{ values: { o1: { b: "baa", c: "caa" }, i: 1n }, result: "caa" },
			],
		},
	]);
});
