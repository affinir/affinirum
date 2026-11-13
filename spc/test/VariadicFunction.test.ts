import { Affinirum, Type } from "../../src/index.js";
import { runAffinirumTests } from "../util/AffinirumTest.js";

describe("Variadic function test", () => {
	runAffinirumTests([
		{
			script: `
val f = ~(x: integer, a: ...[integer]):integer {
	x * Integer.Sum(a)
};
f(x, 1, 2, 3, 4)
			`,
			cases: [
				{ values: { x: 0n }, result: 0n },
				{ values: { x: 10n }, result: 100n },
				{ values: { x: -10n }, result: -100n },
			],
		},
	]);
});

describe("Variadic function argument test", () => {
	it.each(["Integer.Sum(x,2)", "Integer.Sum([x,2])"])("evaluates non-constant arguments with the current inputs in %s", (script) => {
		const expression = new Affinirum(script);
		expect(expression.evaluate({ x: 1n }) as bigint).toBe(3n);
		expect(expression.evaluate({ x: 5n }) as bigint).toBe(7n);
	});
	it("preserves variadic parameters when producing concatenated results", () => {
		const expression = new Affinirum("val f=~(a:...[integer]):[integer]{val extended=a+[9];[a.Length,extended.Length]};val g=~():[integer]{f(1,2)};[g(),g()]");
		expect(expression.evaluate()).toEqual([[2n, 3n], [2n, 3n]]);
		expect(expression.evaluate()).toEqual([[2n, 3n], [2n, 3n]]);
	});
	it("binds rest arguments when JavaScript calls a script function", () => {
		const expression = new Affinirum("~(x:integer,a:...[integer]):integer{x*Integer.Sum(a)}");
		const func = expression.evaluate() as (x: bigint, ...values: bigint[]) => bigint;
		expect(func(2n, 3n, 4n)).toBe(14n);
	});
	it("binds rest arguments when a variable has no declared function signature", () => {
		const expression = new Affinirum("var f;f=~(a:...[integer]):integer{Integer.Sum(a)};f(1,2)");
		expect(expression.evaluate()).toBe(3n);
	});
	it("unions the return types of matching fixed and variadic overloads", () => {
		const overloaded = Type.functionType([
			[Type.Integer, [Type.Integer, Type.Integer]],
			[Type.Float, [Type.arrayType([Type.Number])], true],
		]);
		const expression = new Affinirum("f(value, 2)", { variables: { f: overloaded } });
		expect(expression.variables().value.equate(Type.Number)).toBe(true);
		expect(expression.type.equate(Type.Number)).toBe(true);
		expect(expression.evaluate({
			value: 1n,
			f: (...args: unknown[]) => BigInt(args.length),
		}) as bigint).toBe(2n);
	});
	it.each(["var items:[string]=['two'];f(items[0])", "f(g('two'))"])("uses a variadic overload after compiling the argument in %s", (script) => {
		const f = Type.functionType([
			[Type.Integer, [Type.Integer]],
			[Type.String, [Type.arrayType([Type.String])], true],
		]);
		const g = Type.functionType([
			[Type.Integer, [Type.Integer]],
			[Type.String, [Type.String]],
		]);
		const expression = new Affinirum(script, { variables: { f, g } });
		expect(expression.type.equate(Type.String)).toBe(true);
		expect(expression.evaluate({
			f: (...values: string[]) => values.join(" "),
			g: (value: bigint | string) => value,
		})).toBe("two");
	});
	it("uses a variadic overload when compiled arguments match no complete fixed signature", () => {
		const f = Type.functionType([
			[Type.Integer, [Type.Integer, Type.String]],
			[Type.Integer, [Type.String, Type.Integer]],
			[Type.Integer, [Type.arrayType([Type.Integer])], true],
		]);
		const expression = new Affinirum("var items:[integer]=[1,2];f(items[0],items[1])", { variables: { f } });
		expect(expression.evaluate({ f: (...values: bigint[]) => values.reduce((sum, value) => sum + value, 0n) })).toBe(3n);
	});
	it.each([
		"~(items:...[integer,integer]):integer{items.Length}",
		"~(f:~(...[integer,integer]):integer):integer{f(1)}",
	])("rejects a tuple rest parameter in %s", (script) => {
		expect(() => new Affinirum(script)).toThrow(/variadic function argument must be of uniform array type/);
	});
	it("checks the variadic tail against one complete uniform array type", () => {
		const tail = Type.union(
			Type.arrayType([Type.Integer]),
			Type.arrayType([Type.String]),
		);
		const f = Type.functionType([[Type.Integer, [tail], true]]);
		expect(() => new Affinirum("f(1,2)", { variables: { f } })).not.toThrow();
		expect(() => new Affinirum("f(1,'two')", { variables: { f } })).toThrow(/cannot be called with 2 argument/);
	});
	it("uses a matching variadic overload when fixed overloads are incompatible", () => {
		const overloaded = Type.functionType([
			[Type.Integer, [Type.String, Type.String]],
			[Type.Integer, [Type.arrayType([Type.Number])], true],
		]);
		const expression = new Affinirum("f(1, 2)", {
			strict: true,
			variables: { f: overloaded },
		});
		expect(expression.evaluate({
			f: (...values: unknown[]) => BigInt(values.length),
		}) as bigint).toBe(2n);
	});
});
