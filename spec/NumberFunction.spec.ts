import { runAffinirumTests } from "./helpers/AffinirumTest.js";

describe("Number function test", ()=> {
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
			script: "a.Cast()",
			cases: [
				{ values: { a: 5n }, result: 5 },
				{ values: { a: 5.9 }, result: 5n },
				{ values: { a: -5.9 }, result: -5n },
			],
		},
		{
			script: "a.CastToFloat()",
			cases: [
				{ values: { a: 6n }, result: 6 },
			],
		},
		{
			script: "a.CastToInteger()",
			cases: [
				{ values: { a: 6.7 }, result: 6n },
				{ values: { a: -6.7 }, result: -6n },
			],
		},
		{
			script: "Float.NAN.CastToInteger() + Float.PositiveInfinity.CastToInteger() + Float.NegativeInfinity.CastToInteger()",
			cases: [
				{ values: {}, result: -1n },
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
});
