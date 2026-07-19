import { runAffinirumTests } from "../helpers/AffinirumTest.js";

describe("Unknown function test", ()=> {
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
				{ values: { a: ()=> 0n }, result: "" },
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
				{ values: { a: ()=> 0n }, result: "" },
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
