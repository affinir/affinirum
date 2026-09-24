import { Affinirum } from "../src/index.js";

describe("Cast test", () => {
	it("checks homogeneous array values", () => {
		const expression = new Affinirum("JSON.Parse(value)::[float]");
		expect(() => expression.evaluate({ value: "[1,2]" }))
			.not.toThrow();
		expect(() => expression.evaluate({ value: "[1,\"two\"]" }))
			.toThrowError(/cannot cast value of type array to \[float\]/);
	});

	it("checks tuple prefixes and permits additional values", () => {
		const expression = new Affinirum("JSON.Parse(value)::[float,string]");
		expect(() => expression.evaluate({ value: "[1,\"two\",true]" }))
			.not.toThrow();
		expect(() => expression.evaluate({ value: "[1]" }))
			.toThrowError(/cannot cast value of type array to \[float,string\]/);
		expect(() => expression.evaluate({ value: "[1,false]" }))
			.toThrowError(/cannot cast value of type array to \[float,string\]/);
		expect(() => new Affinirum("JSON.Parse(value)::[float,string?]").evaluate({ value: "[1]" }))
			.not.toThrow();
	});

	it("checks required, optional, additional, and nested object properties", () => {
		const expression = new Affinirum("JSON.Parse(value)::[\"items\":[float],\"label\":string?]");
		expect(() => expression.evaluate({ value: "{\"items\":[1,2],\"extra\":true}" }))
			.not.toThrow();
		expect(() => expression.evaluate({ value: "{\"label\":\"missing items\"}" }))
			.toThrowError(/cannot cast value of type object/);
		expect(() => expression.evaluate({ value: "{\"items\":[1,\"two\"]}" }))
			.toThrowError(/cannot cast value of type object/);
	});
});
