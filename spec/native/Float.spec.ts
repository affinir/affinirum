import { runAffinirumTests } from "../helpers/AffinirumTest.js";

describe("Float function test", ()=> {
	runAffinirumTests([
		{
			script: "Float.NAN == Float.NAN",
			cases: [
				{ values: {}, result: true },
			],
		},
		{
			script: "Float.PositiveInfinity > x & Float.NegativeInfinity < x & Float.Epsilon > 0",
			cases: [
				{ values: { x: 0 }, result: true },
			],
		},
		{
			script: "Float.Sum(values)",
			cases: [
				{ values: { values: [1, 2, 3] }, result: 6 },
				{ values: { values: [-1, 2.5, 3] }, result: 4.5 },
			],
		},
		{
			script: "Float.Sum(a, b, values)",
			cases: [
				{ values: { a: 1, b: 2, values: [3, 4] }, result: 10 },
			],
		},
		{
			script: "Float.Min(values) + Float.Max(values)",
			cases: [
				{ values: { values: [1, -2, 3.5] }, result: 1.5 },
			],
		},
		{
			script: "Float.Min(a, b, values) + Float.Max(a, b, values)",
			cases: [
				{ values: { a: 10, b: -4, values: [3, 7] }, result: 6 },
			],
		},
		{
			script: "Float.Exponent(x)",
			cases: [
				{ values: { x: 0 }, result: 1 },
			],
		},
		{
			script: "Float.Logarithm(x)",
			cases: [
				{ values: { x: 1 }, result: 0 },
			],
		},
		{
			script: "Float.Abs(x)",
			cases: [
				{ values: { x: -10.5 }, result: 10.5 },
				{ values: { x: 10.5 }, result: 10.5 },
			],
		},
		{
			script: "Float.Ceil(x)",
			cases: [
				{ values: { x: 10.1 }, result: 11 },
				{ values: { x: -10.9 }, result: -10 },
			],
		},
		{
			script: "Float.Floor(x)",
			cases: [
				{ values: { x: 10.9 }, result: 10 },
				{ values: { x: -10.1 }, result: -11 },
			],
		},
		{
			script: "Float.Round(x)",
			cases: [
				{ values: { x: 10.1 }, result: 10 },
				{ values: { x: 10.9 }, result: 11 },
				{ values: { x: -10.5 }, result: -10 },
			],
		},
		{
			script: "Float.Truncate(x)",
			cases: [
				{ values: { x: 10.9 }, result: 10 },
				{ values: { x: -10.9 }, result: -10 },
			],
		},
		{
			script: "Float.Decode(v.Encode(enc), enc)",
			cases: [
				{ values: { v: 50505, enc: "f32" }, result: 50505 },
				{ values: { v: 500, enc: "f32le" }, result: 500 },
				{ values: { v: 10101, enc: "f64" }, result: 10101 },
				{ values: { v: 100, enc: "f64le" }, result: 100 },
			],
		},
		{
			script: "Float.Decode(v, enc, offset)",
			cases: [
				{ values: { v: new Uint8Array([0xff, 0x40, 0x20, 0x00, 0x00]).buffer, enc: "f32", offset: 1n }, result: 2.5 },
				{ values: { v: undefined, enc: undefined, offset: undefined }, result: undefined },
				{ values: { v: null, enc: undefined, offset: undefined }, result: undefined },
			],
		},
		{
			script: "Float.Parse(v)",
			cases: [
				{ values: { v: "10.5" }, result: 10.5 },
				{ values: { v: "-2.25x" }, result: -2.25 },
				{ values: { v: "" }, result: undefined },
				{ values: { v: undefined }, result: undefined },
				{ values: { v: null }, result: undefined },
			],
		},
		{
			script: "v.Format()",
			cases: [
				{ values: { v: undefined }, result: "" },
				{ values: { v: null }, result: "" },
			],
		},
		{
			script: "v.Encode().Length",
			cases: [
				{ values: { v: undefined }, result: 0n },
				{ values: { v: null }, result: 0n },
			],
		},
		{
			script: "Float.Parse(v) == Float.NAN",
			cases: [
				{ values: { v: "abc" }, result: true },
			],
		},
		{
			script: "Float.Random(limit)",
			cases: [
				{ values: { limit: 0 }, result: 0 },
			],
		},
		{
			script: "val v=Float.Random(limit); v >= 0 & v < limit",
			cases: [
				{ values: { limit: 1 }, result: true },
			],
		},
	]);
});
