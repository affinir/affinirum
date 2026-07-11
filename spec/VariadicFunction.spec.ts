import { runAffinirumTests } from "./helpers/AffinirumTest.js";

describe("Variadic function test", ()=> {
	runAffinirumTests([
		{
			script: `
val f = ~integer(x: integer, a: ...[integer]) {
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
