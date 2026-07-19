import { runAffinirumTests } from "../helpers/AffinirumTest.js";

describe("Aggregable function test", ()=> {
	runAffinirumTests([
		{
			script: "a.Add(b)",
			cases: [
				{ values: { a: 1n, b: 2n }, result: 3n },
				{ values: { a: 1, b: 2n }, result: 3 },
				{ values: { a: 1.5, b: 2n }, result: 3.5 },
			],
		},
		{
			script: "a + b + (c + d)",
			cases: [
				{ values: { a: "1", b: "b", c: "c", d: "3" }, result: "1bc3" },
			],
		},
		{
			script: "a.Add(b).Format()",
			cases: [
				{ values: { a: new Uint8Array([0x10, 0x20]).buffer, b: new Uint8Array([0x30]).buffer }, result: "102030" },
			],
		},
		{
			script: "a.Add(b)[i]",
			cases: [
				{ values: { a: [1, 2], b: [3, 4], i: 2n }, result: 3 },
				{ values: { a: ["a"], b: ["b", "c"], i: 1n }, result: "b" },
			],
		},
	]);
});
