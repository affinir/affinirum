import { Affinirum, Type } from "../../src/index.js";

describe("Loop node test", () => {
	it("preserves incoming variable types when a constant false loop is skipped", () => {
		const expression = new Affinirum("var x:integer|string=1;while false{x='two'};x-1");
		expect(expression.type.equate(Type.Integer)).toBe(true);
		expect(expression.evaluate()).toBe(0n);
	});

	it("retains possible variable types when a runtime loop may be skipped", () => {
		const expression = new Affinirum("var x:integer|string=1;while condition{x='two';exit};x", {
			variables: { condition: Type.Boolean },
		});
		expect(expression.type.equate(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate({ condition: false })).toBe(1n);
		expect(expression.evaluate({ condition: true })).toBe("two");
	});

	it("includes input uses from a skipped loop", () => {
		const expression = new Affinirum("while false{value-1};value.Length");
		expect(expression.variables().value.equate(Type.union(Type.Number, Type.Iterable))).toBe(true);
		expect(expression.type.equate(Type.Integer)).toBe(true);
		expect(expression.evaluate({ value: "kept" })).toBe(4n);
	});

	it("compiles reads of types assigned on earlier iterations", () => {
		const expression = new Affinirum("var x:integer|string=1;var i=0;while i<2{if i==0{x='two'}else{x=x.Length};i+=1};x");
		expect(expression.type.equate(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate()).toBe(3n);
	});

	it("retains variable types from iterations interrupted by exit", () => {
		const expression = new Affinirum("var x:integer|string=1;while condition{x='two';exit;x=2};x", {
			variables: { condition: Type.Boolean },
		});
		expect(expression.type.equate(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate({ condition: false })).toBe(1n);
		expect(expression.evaluate({ condition: true })).toBe("two");
	});

	it("preserves input constraints inferred from the condition", () => {
		const expression = new Affinirum("while count>0{exit};count");
		expect(expression.variables().count.equate(Type.Number)).toBe(true);
		expect(expression.type.equate(Type.Number)).toBe(true);
		expect(expression.evaluate({ count: 0n })).toBe(0n);
		expect(expression.evaluate({ count: 2.5 })).toBe(2.5);
		expect(() => expression.evaluate({ count: "two" })).toThrow(/unexpected type string/);
	});

	it("keeps the body result type distinct from a declared union", () => {
		const expression = new Affinirum("var x:integer|string=1;var i=0;while i<1{i+=1;x='two'}");
		expect(expression.type.equate(Type.OptionalString)).toBe(true);
		expect(expression.evaluate()).toBe("two");
	});

	it("checks a repeated condition against the fixed declared type", () => {
		const expression = new Affinirum("var x:integer|string=1;while if x==1{true}else{x.Length>0}{x=''};x");
		expect(expression.type.equate(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate()).toBe("");
	});
});
