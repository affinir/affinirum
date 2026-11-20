import { Affinirum, Value } from "../../src/index.js";

describe("Cast test", () => {
	it.each(["boolean", "any"])("keeps Boolean AND after a cast to %s", (type) => {
		const expression = new Affinirum(`value::${type} & flag`);
		expect(expression.evaluate({ value: true, flag: true })).toBe(true);
		expect(expression.evaluate({ value: true, flag: false })).toBe(false);
		expect(expression.evaluate({ value: false, flag: true })).toBe(false);
	});

	it.each<[string, string]>([
		["[...never]", "[]::[...never]"],
		["[...:never]", "[:]::[...:never]"],
	])("gives %s the same type and empty value as its cast", (literal, cast) => {
		const expression = new Affinirum(literal);
		const equivalent = new Affinirum(cast);
		expect(expression.type.equals(equivalent.type)).toBe(true);
		expect(expression.type.toString()).toBe(literal);
		expect(expression.evaluate()).toEqual(equivalent.evaluate());
	});

	it.each([
		"[never]",
		"[...never,1]",
		"[...:never,1]",
		"[1,...never]",
		"[...:never|string]",
		"[:never]",
		"[...:1]",
	])("rejects malformed exact-empty literal %s", (source) => {
		expect(() => new Affinirum(source)).toThrow();
	});

	it.each<[string, string, string, Value]>([
		["[...never]", "[]", "[1]", []],
		["[...:never]", "{}", "{\"a\":1}", {}],
		["[...:string]", "{\"a\":\"text\"}", "{\"a\":1}", { a: "text" }],
		["[...float]", "[1,2]", "[1,\"two\"]", [1, 2]],
	])("checks runtime collection values against %s", (type, valid, invalid, expected) => {
		const expression = new Affinirum(`JSON.Parse(value)::${type}`);
		expect(expression.evaluate({ value: valid })).toEqual(expected);
		expect(() => expression.evaluate({ value: invalid })).toThrow(/cannot cast/);
	});

	it("checks tuple prefixes and permits additional values", () => {
		const expression = new Affinirum("JSON.Parse(value)::[float,string]");
		expect(expression.evaluate({ value: "[1,\"two\",true]" }))
			.toEqual([1, "two", true]);
		expect(() => expression.evaluate({ value: "[1]" }))
			.toThrow(/cannot cast/);
		expect(() => expression.evaluate({ value: "[1,false]" }))
			.toThrow(/cannot cast/);
		expect(new Affinirum("JSON.Parse(value)::[float,string?]").evaluate({ value: "[1]" }))
			.toEqual([1]);
	});

	it("checks required, optional, additional, and nested object properties", () => {
		const expression = new Affinirum("JSON.Parse(value)::[\"items\":[...float],\"label\":string?]");
		expect(expression.evaluate({ value: "{\"items\":[1,2],\"extra\":true}" }))
			.toEqual({ items: [1, 2], extra: true });
		expect(() => expression.evaluate({ value: "{\"label\":\"missing items\"}" }))
			.toThrow(/cannot cast/);
		expect(() => expression.evaluate({ value: "{\"items\":[1,\"two\"]}" }))
			.toThrow(/cannot cast/);
	});
});
