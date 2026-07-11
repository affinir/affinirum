import { runAffinirumTests } from "./helpers/AffinirumTest.js";

describe("Mixed function test", ()=> {
	runAffinirumTests([
		{
			script: "_var",
			cases: [
				{ values: { _var: undefined }, result: undefined },
				{ values: { _var: 0 }, result: 0 },
				{ values: { _var: "str0" }, result: "str0" },
				{ values: { _var: true }, result: true },
			],
		},
		{
			script: "if v {a}else{b}",
			cases: [
				{ values: { v: true, a: 1, b: 2 }, result: 1 },
				{ values: { v: false, a: "f", b: undefined }, result: undefined },
			],
		},
		{
			script: "a.Slice(3, 4).UpperCase()",
			cases: [
				{ values: { a: "abcdef" }, result: "D" },
				{ values: { a: "abcDef---" }, result: "D" },
			],
		},
		{
			script: "(a[n+1] + 2)^2",
			cases: [
				{ values: { a: [0, 1, 2], n: 1n }, result: 16 },
			],
		},
		{
			script: "Float.Sum(arr0.Derive( ~ array(a:array){ a.Derive(~float(b:float){b+12.0})} ).Flatten())",
			cases: [
				{ values: { arr0: [[1], [1, 2], [2, 3, 4]] }, result: 85 },
			],
		},
		{
			script: "val x=arr0.Any(~boolean(a:float){a<0});var b:boolean=c;x&b",
			cases: [
				{ values: { arr0: [0, -1], c: true }, result: true },
			],
		},
		{
			script: "[\"a\":a1+a2, \"b\": b1, \"c\": \"10\", \"d\": a1*a2, \"p\": 10][p]",
			cases: [
				{ values: { a1: 1, a2: 2, b1: "b", p: "d" }, result: 2 },
				{ values: { a1: -2, a2: 18, b1: "bb", p: "a" }, result: 16 },
			],
		},
		{
			script: "[\"n\":50,\"a\" : 10,\"b\":\"my string\",][p]",
			cases: [
				{ values: { p: "n" }, result: 50n },
				{ values: { p: "a" }, result: 10n },
				{ values: { p: "b" }, result: "my string" },
			],
		},
		{
			script: "a.Compose(~string (acc:object, key:string){key.Char(0)}).\"a\"",
			cases: [
				{ values: { a: ["a", "b", "c"] }, result: "a" },
				{ values: { a: ["b", "a"] }, result: "a" },
			],
		},
		{
			script: "Float.Sum(Array.Intersection(a, b))",
			cases: [
				{ values: { a: [-1, 2, 1, -2], b: [1, 2] }, result: 3 },
			],
		},
		{
			script: "Float.Sum(Array.Difference(a, b))",
			cases: [
				{ values: { a: [-1, -2, 1, 2], b: [1, 2] }, result: -3 },
			],
		},
		{
			script: "1000 + {while a < b { a = a + 1 }; {b; a+100}}",
			cases: [
				{ values: { a: 1, b: 10 }, result: 1110 },
				{ values: { a: -5, b: -1 }, result: 1099 },
			],
		},
		{
			script: "var f=~boolean(a:float){a=a*100; a>0};Float.Sum(a.Filter(f))",
			cases: [
				{ values: { a: [-10, -20, 1, 2] }, result: 3 },
			],
		},
		{
			script: "val f=~??(){b = b + 1000; true}; Float.Sum(a.Filter(f)) + b",
			cases: [
				{ values: { a: [10, 20, 1, 2], b: 0 }, result: 4033 },
			],
		},
		{
			script: "var a=~(){b = b + 10}; a(); b",
			cases: [
				{ values: { b: 0n }, result: 10n },
				{ values: { b: -10n }, result: 0n },
			],
		},
		{
			script: "(~(){~??(){b = b + 10}})()()",
			cases: [
				{ values: { b: 0n }, result: 10n },
			],
		},
		{
			script: "if a {b}else{if c{d}else{e}}",
			cases: [
				{ values: { a: true, b: false, c: false, d: 10, e: 20 }, result: false },
				{ values: { a: false, b: true, c: false, d: 10, e: 20 }, result: 20 },
			],
		},
		{
			script: "while a<10{a= while a+1<20{a=a+1}}",
			cases: [
				{ values: { a: 1n }, result: 19n },
			],
		},
		{
			script: "while while a<10{a=a+1}<20{a=a+1}",
			cases: [
				{ values: { a: 1n }, result: 11n },
			],
		},
		{
			script: "if x > 0 { x }",
			cases: [
				{ values: { x: 1 }, result: 1 },
				{ values: { x: -1 }, result: undefined },
			],
		},
		{
			script: "Buffer.Random(c).Length + String.Random(c).Length",
			cases: [
				{ values: { c: 0n }, result: 0n },
				{ values: { c: 64n }, result: 128n },
			],
		},
	]);
});
