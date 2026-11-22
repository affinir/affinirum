import { Affinirum } from "../../../src/index.js";
import { runAffinirumTests } from "../../util/AffinirumTest.js";

describe("Mixed function test", () => {
	it.each<[string, bigint | number]>([
		["Integer.Min", 2n],
		["Integer.Max", 2n],
		["Float.Min", 2],
		["Float.Max", 2],
	])("requires at least one argument for %s", (name, expected) => {
		const error = /^function requires at least one argument$/;
		expect(() => new Affinirum(`${name}()`)).toThrow(error);
		const expression = new Affinirum(`val f=${name};f()`);
		expect(() => expression.evaluate()).toThrow(error);
		expect(new Affinirum(`${name}(2)`).evaluate()).toBe(expected);
	});

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
			script: "if v then {a}else{b}",
			cases: [
				{ values: { v: true, a: 1, b: 2 }, result: 1 },
				{ values: { v: false, a: "f", b: undefined }, result: undefined },
			],
		},
		{
			script: "(a:string).Slice(3, 4).UpperCase()",
			cases: [
				{ values: { a: "abcdef" }, result: "D" },
				{ values: { a: "abcDef---" }, result: "D" },
			],
		},
		{
			script: "(a[(n+1:integer)] + 2)**2",
			cases: [
				{ values: { a: [0, 1, 2], n: 1n }, result: 16 },
			],
		},
		{
			script: "arr0.Derive( func (a:[]):[] {  a.Derive(func(b:float):float { b+12.0})} ).Flatten().Reduce(func(total:float,item:float):float { total+item},0.0)",
			cases: [
				{ values: { arr0: [[1], [1, 2], [2, 3, 4]] }, result: 85 },
			],
		},
		{
			script: "val x=arr0.Any(func(a:float):boolean { a<0});var b:boolean=c;x&b",
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
			script: "Array.Intersection(a, b).Reduce(func(total:float,item:float):float { total+item},0.0)",
			cases: [
				{ values: { a: [-1, 2, 1, -2], b: [1, 2] }, result: 3 },
			],
		},
		{
			script: "Array.Difference(a, b).Reduce(func(total:float,item:float):float { total+item},0.0)",
			cases: [
				{ values: { a: [-1, -2, 1, 2], b: [1, 2] }, result: -3 },
			],
		},
		{
			script: "var x=a;1000 + {while x < b loop { x = x + 1 }; {b; x+100}}",
			cases: [
				{ values: { a: 1, b: 10 }, result: 1110 },
				{ values: { a: -5, b: -1 }, result: 1099 },
			],
		},
		{
			script: "var f=func(a:float):boolean { a=a*100; a>0};a.Filter(f).Reduce(func(total:float,item:float):float { total+item},0.0)",
			cases: [
				{ values: { a: [-10, -20, 1, 2] }, result: 3 },
			],
		},
		{
			script: "var x=b;val f=func():any { x = x + 1000; true}; a.Filter(f).Reduce(func(total:float,item:float):float { total+item},0.0) + x",
			cases: [
				{ values: { a: [10, 20, 1, 2], b: 0 }, result: 4033 },
			],
		},
		{
			script: "var x=b;var a=func() { x = x + 10}; a(); x",
			cases: [
				{ values: { b: 0n }, result: 10n },
				{ values: { b: -10n }, result: 0n },
			],
		},
		{
			script: "var x=b;(func() { func():any { x = x + 10}})()()",
			cases: [
				{ values: { b: 0n }, result: 10n },
			],
		},
		{
			script: "if a then {b}else{if c then {d}else{e}}",
			cases: [
				{ values: { a: true, b: false, c: false, d: 10, e: 20 }, result: false },
				{ values: { a: false, b: true, c: false, d: 10, e: 20 }, result: 20 },
			],
		},
		{
			script: "var x=a;while x<10 loop {x= while x+1<20 loop {x=x+1}}",
			cases: [
				{ values: { a: 1n }, result: 19n },
			],
		},
		{
			script: "var x=a;while (while x<10 loop {x=x+1;x<20})==true loop {x=x+1}",
			cases: [
				{ values: { a: 1n }, result: 11n },
				{ values: { a: 10n }, result: undefined },
			],
		},
		{
			script: "if x > 0 then { x }",
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
