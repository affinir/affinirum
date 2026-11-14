import { Affinirum } from "../../src/index.js";

describe("Block scope test", () => {
	it("captures a separate local binding for each loop iteration", () => {
		const expression = new Affinirum("var first:~():integer=~():integer{-1};var second:~():integer=first;var i=0;while i<2{val n=i;if i==0{first=~():integer{n}}else{second=~():integer{n}};i+=1};[first(),second()]");
		expect<unknown>(expression.evaluate()).toEqual([0n, 1n]);
	});

	it("keeps mutable captures from separate loop iterations independent", () => {
		const expression = new Affinirum("var first:~():integer=~():integer{-1};var second:~():integer=first;var i=0;while i<2{var n=i;if i==0{first=~():integer{n+=1}}else{second=~():integer{n+=1}};i+=1};[first(),second(),first(),second()]");
		expect<unknown>(expression.evaluate()).toEqual([1n, 2n, 2n, 3n]);
	});

	it("continues sharing captured variables declared outside the loop body", () => {
		const expression = new Affinirum("var first:~():integer=~():integer{-1};var second:~():integer=first;var i=0;while i<2{if i==0{first=~():integer{i}}else{second=~():integer{i}};i+=1};[first(),second()]");
		expect<unknown>(expression.evaluate()).toEqual([2n, 2n]);
	});

	it("evaluates a block containing only a local declaration", () => {
		const expression = new Affinirum("{val n=7}");
		expect(expression.evaluate() as bigint).toBe(7n);
	});

	it("initializes unassigned block locals again on each iteration", () => {
		const expression = new Affinirum("var i=0;var sum=0;while i<2{var n:integer?;if i==0{n=7};sum+=(n?:0)::integer;i+=1};sum");
		expect(expression.evaluate() as bigint).toBe(7n);
	});
});
