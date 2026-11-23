import { Affinirum, Type } from "../../../../src/index.js";

describe.each([
	{ notation: "JSON", object: "{\"items\":[1]}", emptyObject: "{}", number: 1 },
	{ notation: "AN", object: "[\"items\":[1]]", emptyObject: "[:]", number: 1n },
])("$notation typed parsers", ({ notation, object, emptyObject, number }) => {
	const options = { strict: true, variables: { value: Type.OptionalString } };

	it("parses an object with a known result type", () => {
		const parser = new Affinirum(`${notation}.ParseObject(value)`, options);
		expect(parser.type.equals(Type.Object)).toBe(true);
		expect(parser.evaluate({ value: emptyObject })).toEqual({});
		expect(parser.evaluate({ value: object })).toEqual({ items: [number] });
		expect(() => parser.evaluate({ value: "[]" })).toThrow("type [] mismatch with expected type [:]");
	});

	it("parses an array with a known result type", () => {
		const parser = new Affinirum(`${notation}.ParseArray(value)`, options);
		expect(parser.type.equals(Type.Array)).toBe(true);
		expect(parser.evaluate({ value: "[]" })).toEqual([]);
		expect(parser.evaluate({ value: `[${object}]` })).toEqual([{ items: [number] }]);
		expect(() => parser.evaluate({ value: emptyObject })).toThrow("type [:] mismatch with expected type []");
	});

	it.each(["ParseObject", "ParseArray"])("%s rejects scalars, null and malformed input", (method) => {
		const parser = new Affinirum(`${notation}.${method}(value)`, options);
		for (const value of ["42", "null", null]) {
			expect(() => parser.evaluate({ value })).toThrow(TypeError);
		}
		expect(() => parser.evaluate({ value: "[" })).toThrow();
	});
});
