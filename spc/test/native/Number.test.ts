import { Affinirum } from "../../../src/index.js";
import { runAffinirumTests } from "../../util/AffinirumTest.js";

describe("Number function test", () => {
	runAffinirumTests([
		{
			script: "a > b",
			cases: [
				{ values: { a: 1, b: -1 }, result: true },
				{ values: { a: 11, b: 55 }, result: false },
			],
		},
		{
			script: "a < b",
			cases: [
				{ values: { a: 1, b: -1 }, result: false },
				{ values: { a: 11, b: 55 }, result: true },
			],
		},
		{
			script: "a >= b",
			cases: [
				{ values: { a: 1, b: 2 }, result: false },
				{ values: { a: 5, b: -1 }, result: true },
				{ values: { a: 0, b: 0 }, result: true },
			],
		},
		{
			script: "a <= b",
			cases: [
				{ values: { a: 2, b: 1 }, result: false },
				{ values: { a: 1, b: 2 }, result: true },
				{ values: { a: 1, b: 1 }, result: true },
			],
		},
		{
			script: "a.GreaterThan(b) & a.GreaterOrEqual(c) & b.LessThan(a) & b.LessOrEqual(c)",
			cases: [
				{ values: { a: 5, b: 3, c: 5 }, result: true },
				{ values: { a: 3, b: 5, c: 4 }, result: false },
			],
		},
		{
			script: "100+ if c*2 > 10 { a*10 }else {b*20}",
			cases: [
				{ values: { c: 10n, a: 1n, b: 2n }, result: 110n },
				{ values: { c: 1n, a: 1n, b: 2n }, result: 140n },
			],
		},
		{
			script: "100+(if (c*2 > 10) { a*10 } else {b*20-100})",
			cases: [
				{ values: { c: 10n, a: 1n, b: 2n }, result: 110n },
				{ values: { c: 1n, a: 1n, b: 2n }, result: 40n },
			],
		},
		{
			script: "100+(if c*2 > 10 { a*10 } else {b*20})-100",
			cases: [
				{ values: { c: 10n, a: 1n, b: 2n }, result: 10n },
				{ values: { c: 1n, a: 1n, b: 2n }, result: 40n },
			],
		},
		{
			script: "(++a + -b)++--(-c +--+d)",
			cases: [
				{ values: { a: 1, b: 2, c: 3, d: 4 }, result: 0 },
				{ values: { a: -1, b: -2, c: -3, d: -4 }, result: 0 },
			],
		},
		{
			script: "(a + b) * (c + d) - (e - f) / (g + h)",
			cases: [
				{ values: { a: 1, b: 2, c: 3, d: 4, e: 1, f: 0, g: 0.5, h: 0.5 }, result: 20 },
			],
		},
		{
			script: "(x + 10 + 0) * (y - 10) > 0",
			cases: [
				{ values: { x: 10, y: 10 }, result: false },
				{ values: { x: 100, y: 100 }, result: true },
			],
		},
		{
			script: "(a + b + c + d) * (a - b - c + 1) / b + 1 * (if (a < 23) { 10 } else { 20 })",
			cases: [
				{ values: { a: 20, b: 10, c: 1, d: 2 }, result: 43 },
			],
		},
		{
			script: "-a^2 == b",
			cases: [
				{ values: { a: 2, b: -4 }, result: true },
				{ values: { a: 2n, b: -5n }, result: false },
			],
		},
		{
			script: "_1.Power(2) + 40 % 25",
			cases: [
				{ values: { _1: 10 }, result: 115 },
				{ values: { _1: 100n }, result: 10015n },
			],
		},
		{
			script: "a.Subtract(b) + c.Multiply(d) + e.Divide(f) + g.Remainder(h)",
			cases: [
				{ values: { a: 10n, b: 3n, c: 2n, d: 4n, e: 9n, f: 2n, g: 10n, h: 4n }, result: 21n },
			],
		},
		{
			script: "a.Modulo(b)",
			cases: [
				{ values: { a: -7n, b: 5n }, result: 3n },
				{ values: { a: -7, b: 5 }, result: 3 },
			],
		},
		{
			script: "longvariablename.Root(2) - 10",
			cases: [
				{ values: { longvariablename: 100 }, result: 0 },
			],
		},
		{
			script: "a.Root(b)",
			cases: [
				{ values: { a: 27n, b: 3n }, result: 3n },
				{ values: { a: 20n, b: 2n }, result: 4n },
				{ values: { a: -16n, b: 2n }, result: undefined },
				{ values: { a: -20n, b: 3n }, result: -2n },
				{ values: { a: -1n, b: 3n }, result: -1n },
				{ values: { a: -1n, b: 2n }, result: undefined },
				{ values: { a: -9223372036854775808n, b: 3n }, result: -2097152n },
				{ values: { a: -9223372036854775808n, b: 1n }, result: -9223372036854775808n },
			],
		},
		{
			script: "(-27).Root(3)",
			cases: [
				{ result: -3n },
			],
		},
		{
			script: "(-32).Root(5)",
			cases: [
				{ result: -2n },
			],
		},
		{
			script: "a.Negate()",
			cases: [
				{ values: { a: 5n }, result: -5n },
				{ values: { a: -2.5 }, result: 2.5 },
			],
		},
		{
			script: "val a:float=myvar/3;var b=mv*2;a/b",
			cases: [
				{ values: { myvar: 6, mv: 1 }, result: 1 },
				{ values: { myvar: 30, mv: 5 }, result: 1 },
			],
		},
		{
			script: "a+=b",
			cases: [
				{ values: { a: 0, b: 10 }, result: 10 },
				{ values: { a: 1, b: 10 }, result: 11 },
			],
		},
		{
			script: "a-=b",
			cases: [
				{ values: { a: 0, b: 2 }, result: -2 },
				{ values: { a: 1, b: 0 }, result: 1 },
			],
		},
		{
			script: "a*=b",
			cases: [
				{ values: { a: 1, b: 2 }, result: 2 },
				{ values: { a: 0, b: 2 }, result: 0 },
			],
		},
		{
			script: "a/=b",
			cases: [
				{ values: { a: 4, b: 2 }, result: 2 },
				{ values: { a: 0, b: 2 }, result: 0 },
			],
		},
		{
			script: "a %= b",
			cases: [
				{ values: { a: 6, b: 5 }, result: 1 },
				{ values: { a: 0, b: 2 }, result: 0 },
			],
		},
		{
			script: "(a+=10) + (b-=10) + (c*=2) + (d/=2) + (e %= 5)",
			cases: [
				{ values: { a: 1, b: 2, c: 3, d: 4, e: 6 }, result: 12 },
			],
		},
		{
			script: "a+=10 + b-=10 + c*=2 + d/=2 + e %= 2",
			cases: [
				{ values: { a: 10, b: 2, c: 3, d: 4, e: 6 }, result: 0 },
			],
		},
	]);

	describe("Root edge cases", () => {
		runAffinirumTests([
			{
				script: "(-8.0).Root(3)",
				cases: [{ result: -2 }],
			},
			{
				script: "(-32.0).Root(5)",
				cases: [{ result: -2 }],
			},
			{
				script: "(-8).Root(3.0)",
				cases: [{ result: -2 }],
			},
			{
				script: "(-1.0).Root(9007199254740993)",
				cases: [{ result: -1 }],
			},
			{
				script: "a.Root(b)",
				cases: [
					{ values: { a: -8, b: 3n }, result: -2 },
					{ values: { a: -32, b: 5n }, result: -2 },
					{ values: { a: -8n, b: 3 }, result: -2 },
					{ values: { a: Number.NEGATIVE_INFINITY, b: 3n }, result: Number.NEGATIVE_INFINITY },
				],
			},
			{
				script: "a.Root(0)",
				cases: [
					{ values: { a: 8n }, result: undefined },
					{ values: { a: 0n }, result: undefined },
					{ values: { a: 1n }, result: undefined },
				],
			},
			{
				script: "a.Root(-3)",
				cases: [
					{ values: { a: 8n }, result: undefined },
					{ values: { a: -8n }, result: undefined },
					{ values: { a: 0n }, result: undefined },
					{ values: { a: 1n }, result: undefined },
					{ values: { a: -1n }, result: undefined },
				],
			},
		]);

		it("returns NaN for even roots of negative floating-point values", () => {
			const expression = new Affinirum("(-16.0).Root(2)");
			expect(expression.evaluate() as number).toBeNaN();
		});

		it("returns NaN for non-integer root indices of negative values", () => {
			const expression = new Affinirum("(-8).Root(2.5)");
			expect(expression.evaluate() as number).toBeNaN();
		});

		it("preserves negative zero for odd floating-point roots", () => {
			const literal = new Affinirum("(-0.0).Root(3)");
			expect(Object.is(literal.evaluate(), -0)).toBe(true);
			const input = new Affinirum("a.Root(3)");
			expect(Object.is(input.evaluate({ a: -0 }), -0)).toBe(true);
		});

		it("computes non-perfect odd floating-point roots", () => {
			const expression = new Affinirum("(-2.0).Root(3)");
			expect(expression.evaluate() as number).toBeCloseTo(-1.2599210498948732, 12);
		});
	});
});
