import { Affinirum, Type, Value } from "../../src/index.js";

describe("Value normalization test", () => {
	it("normalizes input integers recursively while preserving composite identity", () => {
		const integer = 1n << 100n;
		const value: Value[] = [integer];
		const object: Record<string, Value> = { integer, value };
		value.push(object);
		const result = new Affinirum("value").evaluate({ value }) as Value[];
		expect(result === value).toBe(true);
		expect(result[0] as bigint).toBe(0n);
		expect((result[1] as Record<string, Value>).integer as bigint).toBe(0n);
		expect((result[1] as Record<string, Value>).value === result).toBe(true);
	});

	it("normalizes inputs before numeric functions consume them", () => {
		const expression = new Affinirum("Float.Sum(values)");
		expect(expression.evaluate({ values: [1n << 64n, 2n] })).toBe(2);
	});

	it.each([
		"f()",
		"=>f()",
		"val g=~():array{f()};g()",
		"val g=~():array{~>f()};g()",
	])("returns trusted immutable function results in %s", (script) => {
		const expression = new Affinirum(script, {
			strict: true,
			variables: { f: Type.functionType([[Type.Array, []]]) },
		});
		const result = [Object.freeze({ integer: 0x7FFFFFFFFFFFFFFFn })];
		Object.freeze(result);
		expect(expression.evaluate({ f: () => result })).toBe(result);
	});

	it.each(["f()", "=>f()"])("returns undefined for a null host result in %s", (script) => {
		const expression = new Affinirum(script, { variables: { f: Type.functionType([[Type.Void, []]]) } });
		expect(expression.evaluate({ f: () => null })).toBeUndefined();
	});

	it("accepts valid i64 arguments when JavaScript invokes a script function", () => {
		const func = new Affinirum("~(value:integer):integer{value/2}").evaluate() as (value: bigint) => bigint;
		expect(func(0n)).toBe(0n);
		expect(func(0x7FFFFFFFFFFFFFFFn)).toBe(0x3FFFFFFFFFFFFFFFn);
		expect(func(-0x8000000000000000n)).toBe(-0x4000000000000000n);
	});

	it("accepts valid immutable composite arguments without rewriting them", () => {
		const func = new Affinirum("~(values:array):float{Float.Sum(values)}").evaluate() as (values: Value[]) => number;
		const values = [1n, 2n];
		Object.freeze(values);
		expect(func(values)).toBe(3);
		expect(values).toEqual([1n, 2n]);
	});

	it.each([
		"f().Length",
		"val g=~():array{f()};g().Length",
		"val g=~():array{~>f()};g().Length",
		"f().Derive(~(value:integer,index:integer,values:array):integer{values.Length}).Length",
	])("uses trusted immutable function results without rewriting them in %s", (script) => {
		const values = [1n, 2n];
		Object.freeze(values);
		const expression = new Affinirum(script, { variables: { f: Type.functionType([[Type.Array, []]]) } });
		expect(expression.evaluate({ f: () => values })).toBe(2n);
	});

	it.each([
		"val f=~(x:integer):integer{x+1};f(value)<0",
		"val f=~(x:integer):integer{~>x+1};f(value)<0",
	])("wraps integer arithmetic before consuming function results in %s", (script) => {
		const expression = new Affinirum(script);
		expect(expression.evaluate({ value: 0x7FFFFFFFFFFFFFFFn })).toBe(true);
	});
});
