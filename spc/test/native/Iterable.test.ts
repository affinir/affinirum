import { runAffinirumTests } from "../../util/AffinirumTest.js";

describe("Iterable function test", () => {
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
				{ values: { v: new Uint8Array([1, 2]).buffer, s: new Uint8Array([1]).buffer, pos: -2n }, result: true },
				{ values: { v: new Uint8Array([1, 2]).buffer, s: new Uint8Array([1]).buffer, pos: -3n }, result: false },
				{ values: { v: new Uint8Array([1, 2, 3, 4]).buffer, s: new Uint8Array([1, 2, 3, 4]).buffer, pos: -9223372036854775808n }, result: false },
				{ values: { v: new Uint8Array([1, 2]).buffer, s: new ArrayBuffer(0), pos: -3n }, result: true },
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
				{ values: { v: "axb", s: "ab", pos: 0n }, result: false },
				{ values: { v: "acabc", s: "abc", pos: 0n }, result: true },
				{ values: { v: "a-aab", s: "aab", pos: 0n }, result: true },
				{ values: { v: "ababababac", s: "ab-abac", pos: 0n }, result: true },
				{ values: { v: "a".repeat(2048) + "b", s: "a".repeat(127) + "b", pos: 0n }, result: true },
				{ values: { v: "a".repeat(2048) + "c", s: "a".repeat(127) + "b", pos: 0n }, result: false },
				{ values: { v: "ab", s: "abc", pos: 0n }, result: false },
				{ values: { v: "", s: " - ", pos: 0n }, result: true },
				{ values: { v: "a", s: " a ", pos: 0n }, result: true },
				{ values: { v: "x a-b", s: "ab", pos: 2n }, result: true },
				{ values: { v: "x a-b", s: "ab", pos: -3n }, result: true },
				{ values: { v: "x İ-K", s: "IK", pos: 2n }, result: true },
				{ values: { v: "i k", s: "İK", pos: 0n }, result: true },
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
	]);
});
