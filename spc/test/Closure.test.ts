import { Affinirum } from "../../src/index.js";

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

	it("retains captured state after evaluate returns", () => {
		const expression = new Affinirum("var n=7;~():integer{n+=1}");
		const increment = expression.evaluate() as () => bigint;
		expect(increment()).toBe(8n);
		expect(increment()).toBe(9n);
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
});
