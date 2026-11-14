import { Affinirum, Value } from "../../../src/index.js";
import { runAffinirumTests } from "../../util/AffinirumTest.js";

describe("Array function test", () => {
	it("joins arrays in order while preserving nested arrays", () => {
		const expression = new Affinirum("Array.Join([1,[2,[3]]],[],[4,[5]])");
		expect(expression.evaluate()).toEqual([1n, [2n, [3n]], 4n, [5n]]);
	});

	it("preserves nested items when joining a single array", () => {
		const expression = new Affinirum("Array.Join([[1,2],[3,[4]]])");
		expect(expression.evaluate()).toEqual([[1n, 2n], [3n, [4n]]]);
	});

	it("joins into a fresh array while preserving inputs and nested references", () => {
		const nested = [1n, 2n];
		const first = [nested];
		const second = [3n];
		const expression = new Affinirum("Array.Join(first,second)");
		const result = expression.evaluate({ first, second }) as Value[];
		expect(result).toEqual([nested, 3n]);
		expect(result).not.toBe(first);
		expect(result).not.toBe(second);
		expect(result[0]).toBe(nested);
		result.push(4n);
		expect(first).toEqual([[1n, 2n]]);
		expect(second).toEqual([3n]);
		const repeated = expression.evaluate({ first, second });
		expect(repeated).toEqual([nested, 3n]);
		expect(repeated).not.toBe(result);
	});

	it("gives composition callbacks immutable snapshots of the accumulated properties", () => {
		const expression = new Affinirum("var first:object=[:];var second:object=[:];val built=['a','b'].Compose(~(acc:object,key:string):integer{if key=='a'{first=acc}else{second=acc};1});[first,second,built]");
		const result = expression.evaluate() as Value[];
		expect(result).toEqual([{}, { a: 1n }, { a: 1n, b: 1n }]);
		expect(result[0]).not.toBe(result[1]);
		expect(result[1]).not.toBe(result[2]);
	});

	runAffinirumTests([
		{
			script: "[a, b, c].Add([1, 2, 3, 4]).Reduce(~(acc:float, v:float|integer):float { acc + v })",
			cases: [
				{ values: { a: 1, b: 2, c: 3 }, result: 16 },
			],
		},
		{
			script: "Array.Unique(a).Reduce(~ (acc,v){acc+v})",
			cases: [
				{ values: { a: [1, 2, 3, 3, 2, 1] }, result: 6 },
				{ values: { a: ["a", "b", "c", "a", "b", "c"] }, result: "abc" },
			],
		},
		{
			script: "Array.Join(a, b, c)[i]",
			cases: [
				{ values: { a: [10], b: [4], c: [12], i: 0n }, result: 10 },
				{ values: { a: ["a"], b: ["b"], c: ["c"], i: 1n }, result: "b" },
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
			script: "var s:float=0.0;Array.Range(start, end).Derive(~(x:integer):void{s=s+x;null});s",
			cases: [
				{ values: { start: 1n, end: 11n }, result: 55 },
				{ values: { start: -1n, end: -11n }, result: -65 },
			],
		},
		{
			script: "[p,11].Derive(~ (a:integer):integer? {val t=10; if (a>10){t}else{null} } )[i]",
			cases: [
				{ values: { i: 1n, p: 10n }, result: 10n },
				{ values: { i: 0n, p: 1n }, result: undefined },
			],
		},
		{
			script: "[p,p,1, 2, 3].Derive(~(a:integer?):integer?{a?:10})[1]",
			cases: [
				{ values: { p: undefined }, result: 10n },
				{ values: { p: 0n }, result: 0n },
			],
		},
		{
			script: "arr1.Flatten(depth)[i]",
			cases: [
				{ values: { arr1: [[1], [2, [3]]], depth: 1n, i: 1n }, result: 2 },
				{ values: { arr1: [[1], [2, [3]]], depth: 2n, i: 2n }, result: 3 },
			],
		},
		{
			script: "arr1.Reverse()[i]",
			cases: [
				{ values: { arr1: [1, 2, 3], i: 0n }, result: 3 },
				{ values: { arr1: ["a", "b", "c"], i: 2n }, result: "a" },
			],
		},
		{
			script: "arr1.First(~(v:float, i:integer):boolean{v==2})",
			cases: [
				{ values: { arr1: [1, 2, 3] }, result: 2 },
				{ values: { arr1: [2, 2, 3] }, result: 2 },
				{ values: { arr1: [1, 3, 5] }, result: undefined },
			],
		},
		{
			script: "arr1.Last(~(v:float, i:integer):boolean{(i==1)})",
			cases: [
				{ values: { arr1: [1, 2, 3] }, result: 2 },
				{ values: { arr1: [10, 20, 30] }, result: 20 },
				{ values: { arr1: [1] }, result: undefined },
			],
		},
		{
			script: "arr1.FirstIndex(~(v:float, i:integer):boolean{(v==2)})",
			cases: [
				{ values: { arr1: [1, 2, 3] }, result: 1n },
				{ values: { arr1: [1, 3, 5] }, result: undefined },
			],
		},
		{
			script: "arr1.LastIndex(~(v:float, i:integer):boolean{i==1})",
			cases: [
				{ values: { arr1: [1, 2, 3] }, result: 1n },
				{ values: { arr1: [1] }, result: undefined },
			],
		},
		{
			script: "arr1.Filter(~(v:float, i:integer, a:array):boolean{(a[i]*i>2)})[1]",
			cases: [
				{ values: { arr1: [1, 1, 5, 4, 1] }, result: 4 },
			],
		},
		{
			script: "arr0.Derive(~(v:float):float{v*2*t}).Filter(~(v:float):boolean{v>5})[1]+[9].Length()",
			cases: [
				{ values: { arr0: [1, 2, 3], t: 2 }, result: 13 },
			],
		},
		{
			script: "keys.Compose(~(acc:object, key:string):string?{key.Char(0)}).\"a\"",
			cases: [
				{ values: { keys: ["a", "b", "c"] }, result: "a" },
				{ values: { keys: ["b", "a"] }, result: "a" },
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
			script: "arr0.Any(~(a:object):boolean{a.i>0 & a.d>0})",
			cases: [
				{ values: { arr0: [{ i: -1, d: -1 }, { i: -1, d: 5 }, { i: 1, d: 1 }] }, result: true }],
		},
		{
			script: "arr0.Any(~(a:float):boolean { a > 0 } )",
			cases: [
				{ values: { arr0: [1, -2, -3, -4] }, result: true },
				{ values: { arr0: [-1, -2, -3, -4] }, result: false },
			],
		},
		{
			script: "arr0.Every(~(a:float):boolean { a > 0 } )",
			cases: [
				{ values: { arr0: [1, 2, 3, 4] }, result: true },
				{ values: { arr0: [1, -2, 3, 4] }, result: false },
			],
		},
	]);
});
