import { runAffinirumTests } from "./helpers/AffinirumTest.js";

describe("Enumerable function test", ()=> {
	runAffinirumTests([
		{
			script: "a.Slice(start, end)",
			cases: [
				{ values: { a: "abcdef", start: 1n, end: 4n }, result: "bcd" },
				{ values: { a: "abcdef", start: -3n, end: undefined }, result: "def" },
			],
		},
		{
			script: "a.Slice(start, end).Format()",
			cases: [
				{ values: { a: ["a", "b", "c", "d"], start: 1n, end: 3n }, result: "bc" },
				{ values: { a: new Uint8Array([0xff, 0x00, 0x01]).buffer, start: 1n, end: 3n }, result: "0001" },
			],
		},
		{
			script: "a.Splice(1, 1, b)",
			cases: [
				{ values: { a: "abcdef", b: "12" }, result: "a12cdef" },
			],
		},
		{
			script: "a.Splice(start, remove, b, c)",
			cases: [
				{ values: { a: "abcdef", start: 2n, remove: 2n, b: "12", c: "34" }, result: "ab1234ef" },
			],
		},
		{
			script: "a.Inject(1, b)",
			cases: [
				{ values: { a: "abcdef", b: "12" }, result: "a12bcdef" },
			],
		},
		{
			script: "a.Inject(start, b, c)",
			cases: [
				{ values: { a: "abcdef", start: 2n, b: "12", c: "34" }, result: "ab1234cdef" },
			],
		},
		{
			script: "v.Splice(1, 1, b).Format",
			cases: [
				{ values: { v: "abcdef".split(""), b: "12".split("") }, result: "a12cdef" },
			],
		},
		{
			script: "v.Inject(1, b).Format",
			cases: [
				{ values: { v: "abcdef".split(""), b: "12".split("") }, result: "a12bcdef" },
			],
		},
		{
			script: "v.Splice(1, 2, b).Format()",
			cases: [
				{ values: { v: new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd]).buffer, b: new Uint8Array([0x10, 0x20]).buffer }, result: "aa1020dd" },
			],
		},
		{
			script: "v.Inject(2, b).Format()",
			cases: [
				{ values: { v: new Uint8Array([0xaa, 0xbb, 0xcc]).buffer, b: new Uint8Array([0x10, 0x20]).buffer }, result: "aabb1020cc" },
			],
		},
	]);
});
