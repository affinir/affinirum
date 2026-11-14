import { Affinirum, Type } from "../../src/index.js";

describe("Jump command test", () => {
	it("rejects the removed block return operator", () => {
		expect(() => new Affinirum("{->1;2}")).toThrow();
	});
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
		for (const jump of ["exit", "next"]) {
			const script = new Affinirum(`val f=~():void{${jump}};var i=0;while i<1{i+=1;f()};i`);
			expect(() => script.evaluate()).toThrow(new RegExp(`unexpected ${jump} jump`));
		}
	});
	it("uses exit and next in nested loops and conditional branches", () => {
		const script = new Affinirum("var iteration=0;var visits=0;while iteration<3{iteration+=1;while true{visits+=1;exit};if iteration>1|iteration>=3{next};visits+=10};[iteration,visits]");
		expect(script.evaluate()).toEqual([3n, 13n]);
	});
	it("reserves exit and next as loop keywords", () => {
		for (const keyword of ["exit", "next"]) {
			expect(Affinirum.keywords).toContain(keyword);
			expect(() => new Affinirum(`var ${keyword}=0`)).toThrow(/missing variable name/);
			expect(() => new Affinirum(`val f=~(${keyword}:integer):integer{1};f(0)`)).toThrow(/missing function argument name/);
		}
	});
	it("allows identifiers that contain loop keywords", () => {
		const script = new Affinirum("val nextCount=2;val exitCount=3;nextCount+exitCount");
		expect(script.evaluate()).toBe(5n);
	});
	it("rejects loop jumps outside a loop", () => {
		for (const jump of ["exit", "next"]) {
			expect(() => new Affinirum(jump).evaluate()).toThrow(new RegExp(`unexpected ${jump} jump`));
		}
	});
	it("rejects the removed symbolic loop jumps", () => {
		for (const operator of [">>", ">|"]) {
			expect(() => new Affinirum(`while true{${operator}}`)).toThrow();
		}
	});
	it("propagates a global return from a callback to the script boundary", () => {
		const script = new Affinirum("[1,2,3].Derive(~(x:integer):integer{=>x*2});99");
		expect(script.evaluate() as bigint).toBe(2n);
	});
	it.each([
		"Integer.Sum({=>'done'},1)",
		"val f=~(a:[integer]):integer{0};f([=>'done'])",
		"val g=~(a:integer):string{'fallback'};val f=~(n:integer):integer{n};f(g({=>'done'}))",
	])("infers the global result when an argument exits before a call in %s", (source) => {
		const script = new Affinirum(source, { type: Type.String });
		expect(script.type.equals(Type.String)).toBe(true);
		expect(script.evaluate()).toBe("done");
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
	it("checks global returns against the script type through nested blocks and callbacks", () => {
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
	it("parses and evaluates a global return inside a loop", () => {
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
	it("parses and evaluates a function return inside a loop", () => {
		const script = new Affinirum(`
var i = a::integer;
val f = ~():integer? while i<100 {
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
	it("parses and evaluates a loop expression with exit", () => {
		const script = new Affinirum(`
var i = a;
val r = while i<100 {
  if i>50 {
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
