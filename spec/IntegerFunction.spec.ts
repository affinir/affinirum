import { runAffinirumTests } from "./helpers/AffinirumTest.js";

describe("Integer function test", ()=> {
	runAffinirumTests([
		{
			script: "Integer.Sum(values)",
			cases: [
				{ values: { values: [1n, 2n, 3n] }, result: 6n },
				{ values: { values: [-1n, 2n, 3n] }, result: 4n },
			],
		},
		{
			script: "Integer.Sum(a, b, values)",
			cases: [
				{ values: { a: 1n, b: 2n, values: [3n, 4n] }, result: 10n },
			],
		},
		{
			script: "Integer.Min([x, 2]) + Integer.Max([y, 3])",
			cases: [
				{ values: { x: 10n, y: 20n }, result: 22n }],
		},
		{
			script: "Integer.Min(a, b, values) + Integer.Max(a, b, values)",
			cases: [
				{ values: { a: 10n, b: -4n, values: [3n, 7n] }, result: 6n },
			],
		},
		{
			script: "Integer.Decode(v.Encode(enc), enc)",
			cases: [
				{ values: { v: -5n, enc: "i8" }, result: -5n },
				{ values: { v: 0n, enc: "i16" }, result: 0n },
				{ values: { v: 1200n, enc: "i16" }, result: 1200n },
				{ values: { v: -5n, enc: "i16le" }, result: -5n },
				{ values: { v: -155000n, enc: "i32" }, result: -155000n },
				{ values: { v: -1055n, enc: "i32le" }, result: -1055n },
				{ values: { v: -155000n, enc: "i64" }, result: -155000n },
				{ values: { v: -1055n, enc: "i64le" }, result: -1055n },
				{ values: { v: 255n, enc: "n8" }, result: 255n },
				{ values: { v: 0n, enc: "n16" }, result: 0n },
				{ values: { v: 1200n, enc: "n16" }, result: 1200n },
				{ values: { v: 15n, enc: "n16le" }, result: 15n },
				{ values: { v: 105500n, enc: "n32" }, result: 105500n },
				{ values: { v: 1055n, enc: "n32le" }, result: 1055n },
				{ values: { v: 1055000n, enc: "n64" }, result: 1055000n },
				{ values: { v: 11055n, enc: "n64le" }, result: 11055n },
			],
		},
		{
			script: "Integer.Decode(v, enc, offset)",
			cases: [
				{ values: { v: new Uint8Array([0x00, 0xff]).buffer, enc: "i8", offset: 1n }, result: -1n },
				{ values: { v: new Uint8Array([0x00, 0x01, 0x00]).buffer, enc: "i16", offset: 1n }, result: 256n },
				{ values: { v: new Uint8Array([0x00, 0xff]).buffer, enc: "n8", offset: 1n }, result: 255n },
			],
		},
		{
			script: "Integer.Parse(v)",
			cases: [
				{ values: { v: "123" }, result: 123n },
				{ values: { v: "-45" }, result: -45n },
				{ values: { v: "" }, result: undefined },
			],
		},
		{
			script: "Integer.Random(limit)",
			cases: [
				{ values: { limit: 0n }, result: 0n },
				{ values: { limit: 1n }, result: 0n },
			],
		},
	]);
});
