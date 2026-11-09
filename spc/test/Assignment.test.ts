import { Affinirum, Type } from "../../src/index.js";

describe("Assignment test", () => {
	it("returns assignment values and preserves chained writes", () => {
		const expression = new Affinirum("var x=0;var y=0;[x=y=7,x,y]");
		expect(expression.type.equate(Type.arrayType([Type.Integer, Type.Integer, Type.Integer]))).toBe(true);
		expect(expression.evaluate()).toEqual([7n, 7n, 7n]);
	});

	it("reads a compound assignment target before evaluating its right-hand side", () => {
		const expression = new Affinirum("var x=2;x+={x=10;3};x");
		expect(expression.type.equate(Type.Integer)).toBe(true);
		expect(expression.evaluate()).toBe(5n);
	});

	it.each<[string, Type]>([
		["var x:array|[string];x=[1]", Type.Array],
		["var x:object|['a':string];x=['a':1]", Type.Object],
	])("preserves inferred assignment types for %s", (script, type) => {
		const expression = new Affinirum(script);
		expect(expression.type.equate(type)).toBe(true);
	});

	it.each<[string, bigint, bigint]>([
		["x=produce()", 1n, 2n],
		["x+=produce()", 3n, 4n],
	])("evaluates the right-hand side of %s once per evaluation", (assignment, first, second) => {
		let calls = 0;
		const expression = new Affinirum(`var x=2;${assignment};x`, {
			strict: true,
			variables: { produce: Type.functionType(Type.Integer, []) },
		});
		const values = { produce: () => BigInt(++calls) };
		expect(expression.type.equate(Type.Integer)).toBe(true);
		expect(calls).toBe(0);
		expect(expression.evaluate(values)).toBe(first);
		expect(calls).toBe(1);
		expect(expression.evaluate(values)).toBe(second);
		expect(calls).toBe(2);
	});

	it.each(["x=2", "x+=2"])("rejects reassignment of val with %s", (assignment) => {
		expect(() => new Affinirum(`val x=1;${assignment}`)).toThrow(/illegal re-assignment/);
	});

	it("rejects assignment of an incompatible type to an uninitialized variable", () => {
		expect(() => new Affinirum("var x:integer;x='text'"))
			.toThrow(/type integer mismatch with expected type string/);
	});
});
