import { Affinirum, Type } from "../../src/index.js";

describe("Closure test", () => {
	it("retains a captured parameter after the enclosing function returns", () => {
		const expression = new Affinirum("val make=~(n:integer):~():integer{~():integer{n}};val f=make(7);f()");
		expect(expression.evaluate() as bigint).toBe(7n);
	});

	it("keeps captures from separate factory calls independent", () => {
		const expression = new Affinirum("val make=~(n:integer):~():integer{~():integer{n}};val f=make(7);val g=make(9);[f(),g(),f()]");
		expect<unknown>(expression.evaluate()).toEqual([7n, 9n, 7n]);
	});

	it("shares mutable captured variables between sibling closures", () => {
		const expression = new Affinirum("val make=~():object{var n=0;[\"increment\":~():integer{n+=1},\"read\":~():integer{n}]};val counter=make();[counter.read(),counter.increment(),counter.read(),counter.increment(),counter.read()]");
		expect<unknown>(expression.evaluate()).toEqual([0n, 1n, 1n, 2n, 2n]);
	});

	it("exposes captured updates during nested closure calls", () => {
		const expression = new Affinirum("val make=~():object{var n=0;val read=~():integer{n};[\"increment\":~():integer{n+=1;read()},\"read\":read]};val counter=make();[counter.increment(),counter.increment(),counter.read()]");
		expect<unknown>(expression.evaluate()).toEqual([1n, 2n, 2n]);
	});

	it("keeps closures from separate evaluations independent", () => {
		const expression = new Affinirum("var n=7;~():integer{n+=1}");
		const first = expression.evaluate() as () => bigint;
		expect(first()).toBe(8n);
		const second = expression.evaluate() as () => bigint;
		expect(second()).toBe(8n);
		expect(first()).toBe(9n);
		expect(second()).toBe(9n);
	});

	it("keeps assignments in an uncalled function out of enclosing type inference", () => {
		const expression = new Affinirum("var x:integer|string=1;val f=~():string{x='two'};x-1");
		expect(expression.type.equate(Type.Integer)).toBe(true);
		expect(expression.evaluate()).toBe(0n);
	});

	it.each([
		"val read=~():integer{x.Length};x='two';read()",
		"val change=~():string{x='two'};change();x.Length",
	])("checks captured reads against the fixed declaration in %s", (script) => {
		const expression = new Affinirum("var x:integer|string=1;" + script);
		expect(expression.evaluate()).toBe(3n);
	});

	it("includes input uses from an uncalled function", () => {
		const expression = new Affinirum("val f=~():float|integer{value-1};value.Length");
		expect(expression.variables().value.equate(Type.union(Type.Number, Type.Iterable))).toBe(true);
		expect(expression.type.equate(Type.Integer)).toBe(true);
		expect(expression.evaluate({ value: "kept" })).toBe(4n);
	});

	it("keeps a captured parameter's declared type across nested functions", () => {
		const expression = new Affinirum("~(value:integer|string):integer|string{value=1;val change=~():string{value='two'};value}");
		const type = Type.union(Type.Integer, Type.String);
		expect(expression.type.equate(Type.functionType([[type, [type]]]))).toBe(true);
		const func = expression.evaluate() as (value: bigint | string) => bigint | string;
		expect(func(0n)).toBe(1n);
		expect(func("one")).toBe(1n);
	});
});
