import { Affinirum, Type } from "../../src/index.js";

describe("Jump command test", () => {
	it("rejects a function return in a block outside a function", () => {
		expect(() => new Affinirum("{->1;2}")).toThrow();
	});
	it("returns from each callback without terminating the array operation", () => {
		const script = new Affinirum("[1,2,3].Derive(func(x:integer):integer { ->x*2})");
		expect<unknown>(script.evaluate()).toEqual([2n, 4n, 6n]);
	});
	it("points to the return arrow when a call argument always returns", () => {
		for (const arrow of ["->", "=>"]) {
			const source = `val f=func():integer { Integer.Sum({${arrow}7},1);9};f()`;
			expect(() => new Affinirum(source))
				.toThrow(`call argument must be a value at position ${source.indexOf(arrow)}:`);
		}
	});
	it("restores function arguments across recursive early returns", () => {
		const script = new Affinirum("val f=func(n:integer):integer { if n<=1 then {->1};val result=f(n-1);->result*n};f(5)");
		expect(script.evaluate() as bigint).toBe(120n);
	});
	it("rejects loop jumps in a function with no loop of its own", () => {
		for (const jump of ["exit", "next"]) {
			expect(() => new Affinirum(`while true loop {val f=func():null { ${jump}}; f(); exit}`))
				.toThrow(`unexpected ${jump} outside of a loop`);
		}
	});
	it("uses exit and next in nested loops and conditional branches", () => {
		const script = new Affinirum("var iteration=0;var visits=0;while iteration<3 loop {iteration+=1;while true loop {visits+=1;exit};if iteration>1|iteration>=3 then {next};visits+=10};[iteration,visits]");
		expect(script.evaluate()).toEqual([3n, 13n]);
	});
	it("rejects loop jumps outside a loop", () => {
		for (const jump of ["exit", "next"]) {
			expect(() => new Affinirum(jump)).toThrow(`unexpected ${jump} outside of a loop`);
		}
	});
	it("rejects function returns outside a function", () => {
		expect(() => new Affinirum("->42")).toThrow("unexpected -> outside of a function");
	});
	it("propagates a global return from a callback to the script boundary", () => {
		const script = new Affinirum("[1,2,3].Derive(func(x:integer):integer { =>x*2});99");
		expect(script.evaluate() as bigint).toBe(2n);
	});
	it.each([
		"Integer.Sum({=>'done'},1)",
		"val f=func(a:[integer]):integer { 0};f([=>'done'])",
		"val g=func(a:integer):string { 'fallback'};val f=func(n:integer):integer { n};f(g({=>'done'}))",
	])("rejects a call argument that always exits the script in %s", (source) => {
		expect(() => new Affinirum(source, { type: Type.String })).toThrow(/call argument must be a value/);
	});
	it("checks return types through nested blocks and function boundaries", () => {
		const invalidReturns: [string, RegExp][] = [
			["val f=func():integer { {if true then {while true loop {{->'bad'}}}};1};f()", /type string mismatch with expected type integer/],
			["val outer=func():integer { val inner=func():string { {->1};'fallback'};1};outer()", /type integer mismatch with expected type string/],
		];
		for (const [script, error] of invalidReturns) {
			expect(() => new Affinirum(script)).toThrow(error);
		}
		for (const script of [
			"val outer=func():integer { val inner=func():string { {->'inner'};'fallback'};inner();{{->7}};0};outer()",
			"val outer=func():integer { val inner=func() { {->'inner'};0};inner();->7};outer()",
		]) {
			expect(new Affinirum(script).evaluate()).toBe(7n);
		}
	});
	it("checks global returns against the script type through nested blocks and callbacks", () => {
		for (const script of [
			"{{if true then {while true loop {{=>'bad'}}}}};1",
			"[1,2,3].Derive(func(x:integer):string { {{=>'bad'}}});99",
		]) {
			expect(() => new Affinirum(script, { type: Type.Integer }))
				.toThrow(/type string mismatch with expected type integer/);
		}
		expect(new Affinirum("[1,2,3].Derive(func(x:integer):string { {{=>x*2}}});99", { type: Type.Integer }).evaluate())
			.toBe(2n);
		expect(new Affinirum("val f=func():integer { {{=>'done'}}};f();'fallback'", { type: Type.String }).evaluate())
			.toBe("done");
	});
	it("parses and evaluates a global return inside a loop", () => {
		const script = new Affinirum(`
var i = a;
val r = while i<100 loop {
  if i>50 then {
		800;
		=>i*1000;
	}
	else {
		i+=1
	};
	i*100;
};
r;
		`);
		expect(script.evaluate({ a: 1n }) as bigint).toBe(51000n);
		expect(script.evaluate({ a: 200n }) as bigint).toBeUndefined();
	});
	it("parses and evaluates a function return inside a loop", () => {
		const script = new Affinirum(`
var i = (a:integer);
val f = func():integer? { while i<100 loop {
  if i>50 then {
		800;
		->i*1000;
	}
	else {
		i+=1
	};
	i*100;
}};
f();
		`);
		expect(script.evaluate({ a: 1n }) as bigint).toBe(51000n);
		expect(script.evaluate({ a: 200n }) as bigint).toBeUndefined();
	});
	it("parses and evaluates a loop expression with exit", () => {
		const script = new Affinirum(`
var i = a;
val r = while i<100 loop {
  if i>50 then {
		800;
		exit;
	}
	else {
		i+=1
	};
	i*100
};
r
		`);
		expect(script.evaluate({ a: 1n }) as bigint).toBe(5100n);
		expect(script.evaluate({ a: 200n }) as bigint).toBeUndefined();
	});
	it("parses and evaluates a loop expression with next", () => {
		const script = new Affinirum(`
var i = a;
val r = while i<100 loop {
  if i==90 then {
		i=555;
		next;
	}
	else { i+=1 };
	i+555
};
r
		`);
		expect(script.evaluate({ a: 10n }) as bigint).toBe(645n);
		expect(script.evaluate({ a: 200n }) as bigint).toBeUndefined();
	});
});
