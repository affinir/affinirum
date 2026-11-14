import { Affinirum, Type, Value } from "../../../../src/index.js";
import { runAffinirumTests } from "../../../util/AffinirumTest.js";

describe("JSON function test", () => {
	runAffinirumTests([
		{
			script: "JSON.Parse(str1)::object.prop1+JSON.Parse(str2)::object.prop2",
			cases: [
				{ values: { str1: "{\"prop1\":1}", str2: "{\"prop2\":20}" }, result: 21 },
			],
		},
		{
			script: "JSON.Parse(str1)::string+JSON.Parse(str2)::string",
			cases: [
				{ values: { str1: "\"p1\"", str2: "\"p2\"" }, result: "p1p2" },
			],
		},
		{
			script: "JSON.Parse(str1)",
			cases: [
				{ values: { str1: undefined }, result: undefined },
				{ values: { str1: null }, result: undefined },
			],
		},
		{
			script: "JSON.Format(obj1)+JSON.Format(obj2)",
			cases: [
				{ values: { obj1: { p1: "a" }, obj2: { p2: "b" } }, result: "{\"p1\":\"a\"}{\"p2\":\"b\"}" }],
		},
		{
			script: "JSON.Format(obj1)",
			cases: [
				{ values: { obj1: undefined }, result: "null" },
				{ values: { obj1: null }, result: "null" },
				{ values: { obj1: { p1: "a" } }, result: "{\"p1\":\"a\"}" },
				{ values: { obj1: { missing: undefined, present: null } }, result: "{\"missing\":null,\"present\":null}" },
				{ values: { obj1: [undefined, null, 1n] }, result: "[null,null,\"1\"]" },
				{ values: { obj1: { nested: { missing: undefined }, items: [{ missing: undefined }] } }, result: "{\"nested\":{\"missing\":null},\"items\":[{\"missing\":null}]}" },
			],
		},
		{
			script: "JSON.Format(null)",
			cases: [{ result: "null" }],
		},
		{
			script: "JSON.Format(JSON.Parse(\"null\"))",
			cases: [{ result: "null" }],
		},
		{
			script: "JSON.Format([null, 1])",
			cases: [{ result: "[null,\"1\"]" }],
		},
		{
			script: "JSON.Format([\"missing\": null, \"count\": 1])",
			cases: [{ result: "{\"missing\":null,\"count\":\"1\"}" }],
		},
		{
			script: "JSON.Format([\"count\": 1], \"  \")",
			cases: [{ result: "{\n  \"count\": \"1\"\n}" }],
		},
	]);

	it("preserves object keys when formatting and parsing JSON", () => {
		const expression = new Affinirum("val original = [\"missing\": null]; val restored = JSON.Parse(JSON.Format(original))::object; [original, restored]");
		const [original, restored] = expression.evaluate() as Record<string, Value>[];
		expect(Object.hasOwn(original, "missing")).toBe(true);
		expect(original.missing).toBeUndefined();
		expect(Object.hasOwn(restored, "missing")).toBe(true);
		expect(restored.missing).toBeNull();
	});

	it("has a string result for runtime inputs", () => {
		const expression = new Affinirum("JSON.Format(value)", {
			strict: true,
			variables: { value: Type.OptionalString },
		});
		expect(expression.type.equals(Type.String)).toBe(true);
		expect(expression.evaluate({ value: undefined })).toBe("null");
		expect(expression.evaluate({ value: "text" })).toBe("\"text\"");
	});
});
