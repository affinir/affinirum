import { Affinirum, Type, Value } from "../../src/index.js";

describe("Value normalization test", () => {
	it("normalizes input integers on a copy while preserving cycles", () => {
		const integer = 1n << 100n;
		const value: Value[] = [integer];
		const object: Record<string, Value> = { integer, value };
		value.push(object);
		const result = new Affinirum("value").evaluate({ value }) as Value[];
		expect(result).not.toBe(value);
		expect(result[0] as bigint).toBe(0n);
		expect((result[1] as Record<string, Value>).integer as bigint).toBe(0n);
		expect((result[1] as Record<string, Value>).value === result).toBe(true);
		expect(value[0]).toBe(integer);
		expect(object.integer).toBe(integer);
	});

	it("copies frozen records as enumerable data in a null-prototype object", () => {
		const value = { ["__proto__"]: 2n };
		Object.setPrototypeOf(value, { inherited: 1n });
		Object.defineProperty(value, "hidden", { value: 3n });
		Object.freeze(value);
		const result = new Affinirum("value").evaluate({ value }) as Record<string, Value>;
		expect(Object.getPrototypeOf(result)).toBeNull();
		expect(Object.keys(result)).toEqual(["__proto__"]);
		expect(result["__proto__"]).toBe(2n);
	});

	it("normalizes inputs before numeric functions consume them", () => {
		const expression = new Affinirum("Float.Sum(values[0],values[1])");
		expect(expression.evaluate({ values: [1n << 64n, 2n] })).toBe(2);
	});

	it("wraps scalar host results before the script compares them", () => {
		const expression = new Affinirum("f()==expected", { variables: { f: Type.functionType([[Type.Integer, []]]) } });
		const min = -0x8000000000000000n;
		const max = 0x7FFFFFFFFFFFFFFFn;
		expect(expression.evaluate({ f: () => max + 1n, expected: min })).toBe(true);
		expect(expression.evaluate({ f: () => min - 1n, expected: max })).toBe(true);
	});

	it("wraps scalar results when Derive invokes an input callback", () => {
		const transform = Type.functionType([[Type.Integer, [Type.Any, Type.Integer, Type.Array]]]);
		const expression = new Affinirum("values.Derive(f)", { variables: { f: transform } });
		const max = 0x7FFFFFFFFFFFFFFFn;
		const f = (value: bigint, index: bigint) => value + index;
		expect(expression.evaluate({ values: [max, max], f })).toEqual([max, -0x8000000000000000n]);
	});

	it("shares the wrapper across input references and preserves a function returned by the host", () => {
		const f = () => 1n;
		const type = Type.functionType([[Type.Integer, []]]);
		const expression = new Affinirum("[f,nested[0],get()]", { variables: { get: Type.functionType([[type, []]]) } });
		const [direct, nested, returned] = expression.evaluate({ f, nested: [f], get: () => f }) as Value[];
		expect(direct).not.toBe(f);
		expect(nested).toBe(direct);
		expect(returned).toBe(f);
	});

	it.each([
		"f()",
		"=>f()",
		"val g=func():[] { f()};g()",
		"val g=func():[] { ->f()};g()",
	])("returns trusted immutable function results in %s", (script) => {
		const expression = new Affinirum(script, {
			strict: true,
			variables: { f: Type.functionType([[Type.Array, []]]) },
		});
		const result = [Object.freeze(Object.assign(Object.create(null) as Record<string, Value>, { integer: 0x7FFFFFFFFFFFFFFFn }))];
		Object.freeze(result);
		expect(expression.evaluate({ f: () => result })).toBe(result);
	});

	it.each(["f()", "=>f()"])("returns undefined for a null host result in %s", (script) => {
		const expression = new Affinirum(script, { variables: { f: Type.functionType([[Type.Null, []]]) } });
		expect(expression.evaluate({ f: () => null })).toBeUndefined();
	});

	it("accepts valid i64 arguments when JavaScript invokes a script function", () => {
		const func = new Affinirum("func(value:integer):integer { value/2}").evaluate() as (value: bigint) => bigint;
		expect(func(0n)).toBe(0n);
		expect(func(0x7FFFFFFFFFFFFFFFn)).toBe(0x3FFFFFFFFFFFFFFFn);
		expect(func(-0x8000000000000000n)).toBe(-0x4000000000000000n);
	});

	it("accepts valid immutable composite arguments without rewriting them", () => {
		const func = new Affinirum("func(values:[]):float { values.Reduce(func(total:float,item:integer):float { total+item},0.0)}").evaluate() as (values: Value[]) => number;
		const values = [1n, 2n];
		Object.freeze(values);
		expect(func(values)).toBe(3);
		expect(values).toEqual([1n, 2n]);
	});

	it.each([
		"f().Length",
		"val g=func():[] { f()};g().Length",
		"val g=func():[] { ->f()};g().Length",
		"f().Derive(func(value:integer,index:integer,values:[]):integer { values.Length}).Length",
	])("uses trusted immutable function results without rewriting them in %s", (script) => {
		const values = [1n, 2n];
		Object.freeze(values);
		const expression = new Affinirum(script, { variables: { f: Type.functionType([[Type.Array, []]]) } });
		expect(expression.evaluate({ f: () => values })).toBe(2n);
	});

	it.each([
		"val f=func(x:integer):integer { x+1};f(value)<0",
		"val f=func(x:integer):integer { ->x+1};f(value)<0",
	])("wraps integer arithmetic before consuming function results in %s", (script) => {
		const expression = new Affinirum(script);
		expect(expression.evaluate({ value: 0x7FFFFFFFFFFFFFFFn })).toBe(true);
	});
});
