import { Affinirum } from "../src/index.js";

describe("Variadic Function test", ()=> {
	it("parses and evaluates variadic function", ()=> {
		const script = new Affinirum(`
val f = ~integer(x: integer, a: [integer]...) {
	x * Integer.Sum(a)
};
f(x, 11, 2, 3, 4)
		`);
		expect(script.evaluate({ x: 10n }) as bigint).toBe(200n);
	});
});
