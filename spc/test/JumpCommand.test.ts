import { Affinirum } from "../../src/index.js";

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
		for (const jump of ["stop", "next"]) {
			const script = new Affinirum(`val f=~():void{${jump}};var i=0;while i<1{i+=1;f()};i`);
			expect(() => script.evaluate()).toThrowError(new RegExp(`unexpected ${jump} jump`));
		}
	});
	it("propagates exit from a callback to the script boundary", () => {
		const script = new Affinirum("[1,2,3].Derive(~(x:integer):integer{=>x*2});99");
		expect(script.evaluate() as bigint).toBe(2n);
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
	it("parses and evaluates loop expression with stop operator", () => {
		const script = new Affinirum(`
var i = a;
val r = while i<100 {
  if i>50 {
		800;
		stop;
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
	it("parses and evaluates loop expression with next operator", () => {
		const script = new Affinirum(`
var i = a;
val r = while i<100 {
  if i==90 {
		i=555;
		next;
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
