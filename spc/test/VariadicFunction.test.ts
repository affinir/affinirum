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
	it("evaluates non-constant variadic arguments with the current inputs", () => {
		const expression = new Affinirum("Integer.Sum(x,2)");
		expect(expression.evaluate({ x: 1n }) as bigint).toBe(3n);
		expect(expression.evaluate({ x: 5n }) as bigint).toBe(7n);
	});
	it("keeps mutations to variadic parameters local to each call", () => {
		const expression = new Affinirum("val f=~(a:...[integer]):integer{a.Append(9);a.Length};val g=~():integer{f(1,2)};[g(),g()]");
		expect<unknown>(expression.evaluate()).toEqual([3n, 3n]);
		expect<unknown>(expression.evaluate()).toEqual([3n, 3n]);
	});
	it("prefers a matching fixed overload over a variadic overload", () => {
		const overloaded = Type.union(
			Type.functionType(
				Type.Integer,
				[Type.Integer, Type.Integer],
			),
			Type.functionType(
				Type.Integer,
				[Type.arrayType([Type.Number])],
				true,
			),
		);
		const expression = new Affinirum("f(1, 2)", {
			strict: true,
			variables: { f: overloaded },
		});
		expect(expression.evaluate({
			f: (...args: unknown[]) => BigInt(args.length),
		}) as bigint).toBe(2n);
	});
	it("uses a matching variadic overload when fixed overloads are incompatible", () => {
		const overloaded = Type.union(
			Type.functionType(Type.Integer, [Type.String, Type.String]),
			Type.functionType(Type.Integer, [Type.arrayType([Type.Number])], true),
		);
		const expression = new Affinirum("f(1, 2)", {
			strict: true,
			variables: { f: overloaded },
		});
		expect(expression.evaluate({
			f: (values: unknown[]) => BigInt(values.length),
		}) as bigint).toBe(2n);
	});
});
