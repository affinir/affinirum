import { Affinirum, Type, Value } from "../../src/index.js";

describe("Cast test", () => {
	it.each(["boolean", "any"])("keeps Boolean operators outside a cast to %s", (type) => {
		const expression = new Affinirum(`(value:${type}) & flag`);
		expect(expression.evaluate({ value: true, flag: true })).toBe(true);
		expect(expression.evaluate({ value: true, flag: false })).toBe(false);
		expect(expression.evaluate({ value: false, flag: true })).toBe(false);
		const disjunction = new Affinirum(`(value:${type}) | flag`);
		expect(disjunction.evaluate({ value: false, flag: false })).toBe(false);
		expect(disjunction.evaluate({ value: false, flag: true })).toBe(true);
		expect(disjunction.evaluate({ value: true, flag: false })).toBe(true);
	});

	it("checks a union inside the cast parentheses", () => {
		const expression = new Affinirum("(value:integer|string)", { variables: { value: Type.Any } });
		expect(expression.type.equals(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate({ value: 1n })).toBe(1n);
		expect(expression.evaluate({ value: "one" })).toBe("one");
		expect(() => expression.evaluate({ value: true })).toThrow(/cannot cast value/);
	});

	it("casts the complete enclosed expression", () => {
		const expression = new Affinirum("(a+b:integer)", { variables: { a: Type.Number, b: Type.Number } });
		expect(expression.evaluate({ a: 1n, b: 2n })).toBe(3n);
		expect(() => expression.evaluate({ a: 1, b: 2n })).toThrow(/cannot cast value/);
	});

	it("distinguishes a cast key from an object separator and a grouped value", () => {
		const expression = new Affinirum("val key='answer';[(key:string):(1+2)]");
		expect(expression.evaluate()).toEqual({ answer: 3n });
	});

	it("calls a cast function with a cast argument", () => {
		const expression = new Affinirum("(callback:~(integer):integer{})((value:integer))", {
			variables: { callback: Type.Any, value: Type.Any },
		});
		expect(expression.evaluate({ callback: (value: bigint) => value + 1n, value: 2n })).toBe(3n);
	});

	it.each([
		"(=>1:integer)",
		"val f=~() { (~>1:integer)};f()",
		"while true {(exit:integer)}",
		"({=>1;2}:integer)",
		"(if true {=>1}else{2}:integer)",
	])("rejects a cast operand that cannot produce a value in %s", (source) => {
		expect(() => new Affinirum(source)).toThrow("cast operand must produce a value");
	});

	it("permits a cast operand that returns on only one branch", () => {
		const expression = new Affinirum("(if stop {=>7}else{value}:integer)", {
			variables: { stop: Type.Boolean, value: Type.Any },
		});
		expect(expression.evaluate({ stop: true, value: "unused" })).toBe(7n);
		expect(expression.evaluate({ stop: false, value: 2n })).toBe(2n);
		expect(() => expression.evaluate({ stop: false, value: "two" })).toThrow(/cannot cast value/);
	});

	it("checks a cast before an early function return", () => {
		const expression = new Affinirum("val f=~(item:any):integer { ~>(item:integer)};f(value)");
		expect(expression.evaluate({ value: 2n })).toBe(2n);
		expect(() => expression.evaluate({ value: "two" })).toThrow(/cannot cast value/);
	});

	it("requires a closing parenthesis after the cast type", () => {
		expect(() => new Affinirum("(value:integer")).toThrow(/missing closing parentheses/);
	});

	it.each<[string, string]>([
		["[...never]", "([]:[...never])"],
		["[...:never]", "([:]:[...:never])"],
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
		const expression = new Affinirum(`(JSON.Parse(value):${type})`);
		expect(expression.evaluate({ value: valid })).toEqual(expected);
		expect(() => expression.evaluate({ value: invalid })).toThrow(/cannot cast/);
	});

	it("checks tuple prefixes and permits additional values", () => {
		const expression = new Affinirum("(JSON.Parse(value):[float,string])");
		expect(expression.evaluate({ value: "[1,\"two\",true]" }))
			.toEqual([1, "two", true]);
		expect(() => expression.evaluate({ value: "[1]" }))
			.toThrow(/cannot cast/);
		expect(() => expression.evaluate({ value: "[1,false]" }))
			.toThrow(/cannot cast/);
		expect(new Affinirum("(JSON.Parse(value):[float,string?])").evaluate({ value: "[1]" }))
			.toEqual([1]);
	});

	it("checks required, optional, additional, and nested object properties", () => {
		const expression = new Affinirum("(JSON.Parse(value):[\"items\":[...float],\"label\":string?])");
		expect(expression.evaluate({ value: "{\"items\":[1,2],\"extra\":true}" }))
			.toEqual({ items: [1, 2], extra: true });
		expect(() => expression.evaluate({ value: "{\"label\":\"missing items\"}" }))
			.toThrow(/cannot cast/);
		expect(() => expression.evaluate({ value: "{\"items\":[1,\"two\"]}" }))
			.toThrow(/cannot cast/);
	});
});
