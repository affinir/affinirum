import { Affinirum, Type } from "../../src/index.js";

describe("Assignment test", () => {
	it("returns assignment values and preserves chained writes", () => {
		const expression = new Affinirum("var x=0;var y=0;[x=y=7,x,y]");
		expect(expression.type.equals(Type.arrayType([Type.Integer, Type.Integer, Type.Integer]))).toBe(true);
		expect(expression.evaluate()).toEqual([7n, 7n, 7n]);
	});

	it("reads a compound assignment target before evaluating its right-hand side", () => {
		const expression = new Affinirum("var x=2;x+={x=10;3};x");
		expect(expression.type.equals(Type.Integer)).toBe(true);
		expect(expression.evaluate()).toBe(5n);
	});

	it("preserves the inferred array assignment type", () => {
		const expression = new Affinirum("var x:array|[...string]=['one'];x=[1]");
		expect(expression.type.equals(Type.Array)).toBe(true);
	});

	it("accepts an assignment that fits the object alternative of a union", () => {
		const expression = new Affinirum("var x:object|['a':string]=['a':'one'];x=['a':1]");
		expect(expression.evaluate()).toEqual({ a: 1n });
	});

	it.each(["var", "val"])("retains the declared union after initialization for %s", (declaration) => {
		const expression = new Affinirum(`${declaration} x:integer|string=1;x`);
		expect(expression.type.equals(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate()).toBe(1n);
	});

	it("accepts a narrower array initializer", () => {
		const expression = new Affinirum("val items:[...integer|string]=[1];items");
		expect(expression.evaluate()).toEqual([1n]);
	});

	it("accepts extra fields in an open object initializer", () => {
		const expression = new Affinirum("val record:['a':integer]=['a':1,'b':'two'];record");
		expect(expression.evaluate()).toEqual({ a: 1n, b: "two" });
	});

	it("allows assignments of different members of a declared union", () => {
		const expression = new Affinirum("var x:integer|string=1;x='two';x=2;x");
		expect(expression.type.equals(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate()).toBe(2n);
	});

	it("keeps an inferred union from the initializer on later assignments", () => {
		const expression = new Affinirum("var x=if condition{1}else{'two'};x=2;x='three';x", {
			variables: { condition: Type.Boolean },
		});
		expect(expression.type.equals(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate({ condition: false })).toBe("three");
	});

	it("keeps an unknown initializer type on later assignments", () => {
		const expression = new Affinirum("var x=read();x=1;x");
		expect(expression.type.isUnknown).toBe(true);
		expect(expression.evaluate({ read: () => "two" })).toBe(1n);
	});

	it("rejects assignments outside a declared union", () => {
		expect(() => new Affinirum("var x:integer|string=1;x=true"))
			.toThrow(/mismatch with expected type boolean/);
	});

	it.each(["var y:integer=x;y", "var y:integer=0;y=x;y"])("rejects assigning a wider union in %s", (script) => {
		expect(() => new Affinirum(script, { variables: { x: Type.union(Type.Integer, Type.String) } }))
			.toThrow(/type integer mismatch with expected type integer\|string/);
	});

	it("allows reassignment with an explicitly declared unknown type", () => {
		const expression = new Affinirum("var x:??=1;x='two';x");
		expect(expression.type.isUnknown).toBe(true);
		expect(expression.evaluate()).toBe("two");
	});

	it("rejects an incompatible inferred read type after an earlier read", () => {
		expect(() => new Affinirum("val x='two';x;x-1")).toThrow(/mismatch with expected type float\|integer/);
	});

	it("validates input values against the fixed declared type", () => {
		const expression = new Affinirum("(x::integer)-1", {
			variables: { x: Type.union(Type.Integer, Type.String) },
		});
		expect(expression.variables().x.equals(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate({ x: 3n })).toBe(2n);
		expect(() => expression.evaluate({ x: true })).toThrow(/unexpected type boolean/);
	});

	it("preserves a declared function parameter union across assignments", () => {
		const expression = new Affinirum("~(x:integer|string):integer|string{x=1;x='two';x}");
		const type = Type.union(Type.Integer, Type.String);
		expect(expression.type.equals(Type.functionType([[type, [type]]]))).toBe(true);
		const func = expression.evaluate() as (value: bigint | string) => bigint | string;
		expect(func(0n)).toBe("two");
		expect(func("one")).toBe("two");
	});

	it.each<[string, bigint, bigint]>([
		["x=produce()", 1n, 2n],
		["x+=produce()", 3n, 4n],
	])("evaluates the right-hand side of %s once per evaluation", (assignment, first, second) => {
		let calls = 0;
		const expression = new Affinirum(`var x=2;${assignment};x`, {
			strict: true,
			variables: { produce: Type.functionType([[Type.Integer, []]]) },
		});
		const values = { produce: () => BigInt(++calls) };
		expect(expression.type.equals(Type.Integer)).toBe(true);
		expect(calls).toBe(0);
		expect(expression.evaluate(values)).toBe(first);
		expect(calls).toBe(1);
		expect(expression.evaluate(values)).toBe(second);
		expect(calls).toBe(2);
	});

	it.each(["x=2", "x+=2"])("rejects reassignment of val with %s", (assignment) => {
		expect(() => new Affinirum(`val x=1;${assignment}`)).toThrow(/illegal re-assignment/);
	});

	it.each(["x=2", "x+=2"])("rejects assignment to input with %s", (assignment) => {
		expect(() => new Affinirum(assignment)).toThrow(/illegal re-assignment/);
		expect(() => new Affinirum(assignment, { variables: { x: Type.Integer } })).toThrow(/illegal re-assignment/);
		expect(() => new Affinirum(assignment, { variables: { x: Type.Unknown } })).toThrow(/illegal re-assignment/);
	});

	it("requires an initializer for a non-optional variable", () => {
		expect(() => new Affinirum("var x:integer;x=1;x"))
			.toThrow(/variable x of type integer requires initial value/);
	});

	it("rejects assignment of an incompatible type to a typed variable", () => {
		expect(() => new Affinirum("var x:integer=0;x='text'"))
			.toThrow(/type integer mismatch with expected type string/);
	});
});
