import { runAffinirumTests } from "./helpers/AffinirumTest.js";

describe("Boolean function test", ()=> {
	runAffinirumTests([
		{
			script: "!b",
			cases: [
				{ values: { b: true }, result: false },
				{ values: { b: false }, result: true },
			],
		},
		{
			script: "Boolean.Not(b)",
			cases: [
				{ values: { b: true }, result: false },
				{ values: { b: false }, result: true },
			],
		},
		{
			script: "Boolean.And(values)",
			cases: [
				{ values: { values: [true, true, true] }, result: true },
				{ values: { values: [true, false, true] }, result: false },
			],
		},
		{
			script: "i==0 & Boolean.And(b, c, true)",
			cases: [
				{ values: { i: 1, b: true, c: true }, result: false },
				{ values: { i: 0, b: true, c: false }, result: false },
				{ values: { i: 0, b: true, c: true }, result: true },
			],
		},
		{
			script: "Boolean.Or(values)",
			cases: [
				{ values: { values: [false, false, false] }, result: false },
				{ values: { values: [false, true, false] }, result: true },
			],
		},
		{
			script: "i==0 | Boolean.Or(b, c, false)",
			cases: [
				{ values: { i: 1, b: true, c: false }, result: true },
				{ values: { i: 0, b: false, c: false }, result: true },
				{ values: { i: 1, b: false, c: false }, result: false },
			],
		},
		{
			script: "Boolean.Decode(v.Encode())",
			cases: [
				{ values: { v: true }, result: true },
				{ values: { v: false }, result: false },
			],
		},
		{
			script: "Boolean.Decode(v, offset)",
			cases: [
				{ values: { v: new Uint8Array([0, 255]).buffer, offset: 0n }, result: false },
				{ values: { v: new Uint8Array([0, 255]).buffer, offset: 1n }, result: true },
			],
		},
		{
			script: "Boolean.Parse(v)",
			cases: [
				{ values: { v: "true" }, result: true },
				{ values: { v: "FALSE" }, result: false },
				{ values: { v: "yes" }, result: undefined },
			],
		},
		{
			script: "a|=b",
			cases: [
				{ values: { a: true, b: false }, result: true },
				{ values: { a: false, b: true }, result: true },
				{ values: { a: false, b: false }, result: false },
				{ values: { a: true, b: true }, result: true },
			],
		},
		{
			script: "a&=b",
			cases: [
				{ values: { a: true, b: false }, result: false },
				{ values: { a: false, b: true }, result: false },
				{ values: { a: false, b: false }, result: false },
				{ values: { a: true, b: true }, result: true },
			],
		},
	]);
});
