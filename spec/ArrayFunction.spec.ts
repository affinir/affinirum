import { runAffinirumTests } from "./helpers/AffinirumTest.js";

describe("Array function test", ()=> {
	runAffinirumTests([
		{
			script: "[a, b, c].Add([1, 2, 3, 4]).Reduce(~float(acc:float, v) { acc + v })",
			cases: [
				{ values: { a: 1, b: 2, c: 3 }, result: 16 },
			],
		},
		{
			script: "Array.Unique(a).Reduce(~?? (acc,v){acc+v})",
			cases: [
				{ values: { a: [1, 2, 3, 3, 2, 1] }, result: 6 },
				{ values: { a: ["a", "b", "c", "a", "b", "c"] }, result: "abc" },
			],
		},
		{
			script: "Array.Join(a, b, c)[i]",
			cases: [
				{ values: { a: [[10]], b: [4], c: [12], i: 0n }, result: 10 },
				{ values: { a: ["a"], b: [["b"]], c: ["c"], i: 1n }, result: "b" },
			],
		},
		{
			script: "Array.Range(start, end)[0] + Array.Range(start, end)[1]",
			cases: [
				{ values: { start: 5n, end: 10n }, result: 11n },
				{ values: { start: -5n, end: -10n }, result: -19n },
			],
		},
		{
			script: "var s:integer=0;Array.Range(start, end).Derive(~void(x:float){s=s+x});s",
			cases: [
				{ values: { start: 1n, end: 11n }, result: 55n },
				{ values: { start: -1n, end: -11n }, result: -65n },
			],
		},
		{
			script: "[p,11].Derive(~ integer?(a:integer) {val t=10; if (a>10){t}else{null} } )[i]",
			cases: [
				{ values: { i: 1n, p: 10n }, result: 10n },
				{ values: { i: 0n, p: 1n }, result: undefined },
			],
		},
		{
			script: "[p,p,1, 2, 3].Derive(~integer?(a:integer?){a?:10})[1]",
			cases: [
				{ values: { p: undefined }, result: 10n },
				{ values: { p: 0n }, result: 0n },
			],
		},
		{
			script: "arr.Flatten(depth)[i]",
			cases: [
				{ values: { arr: [[1], [2, [3]]], depth: 1n, i: 1n }, result: 2 },
				{ values: { arr: [[1], [2, [3]]], depth: 2n, i: 2n }, result: 3 },
			],
		},
		{
			script: "arr.Reverse()[i]",
			cases: [
				{ values: { arr: [1, 2, 3], i: 0n }, result: 3 },
				{ values: { arr: ["a", "b", "c"], i: 2n }, result: "a" },
			],
		},
		{
			script: "arr1.First(~boolean(v:float, i:integer){v==2})",
			cases: [
				{ values: { arr1: [1, 2, 3] }, result: 2 },
				{ values: { arr1: [2, 2, 3] }, result: 2 },
				{ values: { arr1: [1, 3, 5] }, result: undefined },
			],
		},
		{
			script: "arr1.Last(~boolean(v:float, i:integer){(i==1)})",
			cases: [
				{ values: { arr1: [1, 2, 3] }, result: 2 },
				{ values: { arr1: [10, 20, 30] }, result: 20 },
				{ values: { arr1: [1] }, result: undefined },
			],
		},
		{
			script: "arr1.FirstIndex(~boolean(v:float, i:integer){(v==2)})",
			cases: [
				{ values: { arr1: [1, 2, 3] }, result: 1n },
				{ values: { arr1: [1, 3, 5] }, result: undefined },
			],
		},
		{
			script: "arr1.LastIndex(~boolean(v:float, i:integer){i==1})",
			cases: [
				{ values: { arr1: [1, 2, 3] }, result: 1n },
				{ values: { arr1: [1] }, result: undefined },
			],
		},
		{
			script: "arr1.Filter(~boolean(v:float, i:integer, a:array){(a[i]*i>2)})[1]",
			cases: [
				{ values: { arr1: [1, 1, 5, 4, 1] }, result: 4 },
			],
		},
		{
			script: "arr0.Derive(~float(v:float){v*2*t}).Filter(~boolean(v:float){v>5})[1]+[9].Length()",
			cases: [
				{ values: { arr0: [1, 2, 3], t: 2 }, result: 13 },
			],
		},
		{
			script: "keys.Compose(~string(acc:object, key:string){key.Char(0)}).\"a\"",
			cases: [
				{ values: { keys: ["a", "b", "c"] }, result: "a" },
				{ values: { keys: ["b", "a"] }, result: "a" },
			],
		},
		{
			script: "arr.Prepend(a, b)[i][j]",
			cases: [
				{ values: { arr: [3, 4], a: 1, b: 2, i: 0n, j: 1n }, result: 2 },
				{ values: { arr: ["c"], a: "a", b: "b", i: 0n, j: 0n }, result: "a" },
			],
		},
		{
			script: "arr.Append(a, b)[i][j]",
			cases: [
				{ values: { arr: [1, 2], a: 3, b: 4, i: 2n, j: 1n }, result: 4 },
				{ values: { arr: ["a"], a: "b", b: "c", i: 1n, j: 0n }, result: "b" },
			],
		},
		{
			script: "Array.Intersection(a, b)[i]",
			cases: [
				{ values: { a: [-1, 2, 1, -2], b: [1, 2], i: 0n }, result: 2 },
				{ values: { a: ["a", "b", "c"], b: ["c", "a"], i: 1n }, result: "c" },
			],
		},
		{
			script: "Array.Difference(a, b)[i]",
			cases: [
				{ values: { a: [-1, -2, 1, 2], b: [1, 2], i: 1n }, result: -2 },
				{ values: { a: ["a", "b"], b: ["b", "c"], i: 1n }, result: "c" },
			],
		},
		{
			script: "arr0.Any(~boolean(a:object){a.i>0 & a.d>0})",
			cases: [
				{ values: { arr0: [{ i: -1, d: -1 }, { i: -1, d: 5 }, { i: 1, d: 1 }] }, result: true }],
		},
		{
			script: "arr0.Any(~boolean(a:float) { a > 0 } )",
			cases: [
				{ values: { arr0: [1, -2, -3, -4] }, result: true },
				{ values: { arr0: [-1, -2, -3, -4] }, result: false },
			],
		},
		{
			script: "arr0.Every(~boolean(a:float) { a > 0 } )",
			cases: [
				{ values: { arr0: [1, 2, 3, 4] }, result: true },
				{ values: { arr0: [1, -2, 3, 4] }, result: false },
			],
		},
	]);
});
