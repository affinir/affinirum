import { Affinirum, Type } from "../../src/index.js";

describe("Strict mode test", () => {
	it("defines variables in strict mode and evaluates", () => {
		const script = new Affinirum("predefined1*2 + predefined2 + 26 * 13",
			{ strict: true, variables: { predefined1: Type.Integer, predefined2: Type.Integer, myvar: Type.String } });
		expect(script.evaluate({ predefined1: 10n, predefined2: 20n }) as bigint).toBe(378n);
	});
	it("errors on undefined variables in strict mode", () => {
		expect(() => new Affinirum(
			"undefined1*2 + undefined2",
			{ strict: true, variables: { defined: Type.Float } },
		)).toThrow(/undefined variable undefined1/);
	});
	it("validates injected structured values recursively", () => {
		const script = new Affinirum("items", {
			strict: true,
			variables: { items: Type.arrayType(Type.Integer) },
		});
		expect(() => script.evaluate({ items: [1n, "two"] })).toThrow(/unexpected type array/);
	});

	it.each([true, false])("checks configured input types with strict=%s", (strict) => {
		expect(() => new Affinirum("value.UpperCase", { strict, variables: { value: Type.Integer } }))
			.toThrow(/mismatch with expected type string/);
	});

	it("keeps explicitly unknown inputs from acquiring inferred types", () => {
		const script = new Affinirum("value-1", { strict: true, variables: { value: Type.Unknown } });
		expect(script.variables().value.isUnknown).toBe(true);
		expect(script.evaluate({ value: 2n })).toBe(1n);
	});
});
