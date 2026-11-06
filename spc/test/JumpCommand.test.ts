import { Affinirum, Type } from "../../src/index.js";

describe("Jump command test", () => {
	it("returns from each callback without terminating the array operation", () => {
		const script = new Affinirum("[1,2,3].Derive(~(x:integer):integer{~>x*2})");
		expect<unknown>(script.evaluate()).toEqual([2n, 4n, 6n]);
	});
	it("returns from the enclosing function while evaluating a call argument", () => {
		const script = new Affinirum("val f=~():integer{Integer.Sum({~>7},1);9};f()");
		expect(script.evaluate() as bigint).toBe(7n);
	});
	it("restores function arguments across recursive early returns", () => {
		const script = new Affinirum("val f=~(n:integer):integer{if n<=1{~>1};val result=f(n-1);~>result*n};f(5)");
		expect(script.evaluate() as bigint).toBe(120n);
	});
	it("rejects loop jumps that escape a function called inside a loop", () => {
		for (const [operator, jump] of [[">|", "stop"], [">>", "next"]]) {
			const script = new Affinirum(`val f=~():void{${operator}};var i=0;while i<1{i+=1;f()};i`);
			expect(() => script.evaluate()).toThrow(new RegExp(`unexpected ${jump} jump`));
		}
	});
	it("parses compact loop jumps with former keywords as identifiers", () => {
		expect(Affinirum.keywords).not.toContain("stop");
		expect(Affinirum.keywords).not.toContain("next");
		const script = new Affinirum("var stop=0;var next=0;while stop<3{stop+=1;while true{next+=1;>|};if stop>1|stop>=3{>>};next+=10};[stop,next]");
		expect(script.evaluate()).toEqual([3n, 13n]);
	});
	it("propagates exit from a callback to the script boundary", () => {
		const script = new Affinirum("[1,2,3].Derive(~(x:integer):integer{=>x*2});99");
		expect(script.evaluate() as bigint).toBe(2n);
	});
	it("checks return types through nested blocks and function boundaries", () => {
		const invalidReturns: [string, RegExp][] = [
			["val f=~():integer{{if true{while true{{~>'bad'}}}};1};f()", /type string mismatch with expected type integer/],
			["val outer=~():integer{val inner=~():string{{~>1};'fallback'};1};outer()", /type integer mismatch with expected type string/],
		];
		for (const [script, error] of invalidReturns) {
			expect(() => new Affinirum(script)).toThrow(error);
		}
		for (const script of [
			"val outer=~():integer{val inner=~():string{{~>'inner'};'fallback'};inner();{{~>7}};0};outer()",
			"val outer=~():integer{val inner=~(){{~>'inner'};0};inner();~>7};outer()",
		]) {
			expect(new Affinirum(script).evaluate()).toBe(7n);
		}
	});
	it("checks exits against the script type through nested blocks and callbacks", () => {
		for (const script of [
			"{{if true{while true{{=>'bad'}}}}};1",
			"[1,2,3].Derive(~(x:integer):string{{{=>'bad'}}});99",
		]) {
			expect(() => new Affinirum(script, { type: Type.Integer }))
				.toThrow(/type string mismatch with expected type integer/);
		}
		expect(new Affinirum("[1,2,3].Derive(~(x:integer):string{{{=>x*2}}});99", { type: Type.Integer }).evaluate())
			.toBe(2n);
		expect(new Affinirum("val f=~():integer{{{=>'done'}}};f();'fallback'", { type: Type.String }).evaluate())
			.toBe("done");
	});
	it("parses and evaluates expression with exit operator inside loop", () => {
		const script = new Affinirum(`
var i = a;
val r = while i<100 {
  if i>50 {
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
	it("parses and evaluates expression with exit operator inside loop in function", () => {
		const script = new Affinirum(`
var i = a;
val f = ~():integer while i<100 {
  if i>50 {
		800;
		~>i*1000;
	}
	else {
		i+=1
	};
	i*100;
};
f();
		`);
		expect(script.evaluate({ a: 1n }) as bigint).toBe(51000n);
		expect(script.evaluate({ a: 200n }) as bigint).toBeUndefined();
	});
	it("parses and evaluates loop expression with >| operator", () => {
		const script = new Affinirum(`
var i = a;
val r = while i<100 {
  if i>50 {
		800;
		>|;
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
	it("parses and evaluates loop expression with >> operator", () => {
		const script = new Affinirum(`
var i = a;
val r = while i<100 {
  if i==90 {
		i=555;
		>>;
	}
	else
		i+=1;
	i+555
};
r
		`);
		expect(script.evaluate({ a: 10n }) as bigint).toBe(645n);
		expect(script.evaluate({ a: 200n }) as bigint).toBeUndefined();
	});
});
