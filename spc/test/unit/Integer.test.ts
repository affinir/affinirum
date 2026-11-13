import { formatInteger } from "../../../src/native/Integer.js";

describe("Integer formatting test", () => {
	it.each<[string | undefined, string]>([
		[undefined, "42"],
		["\"min_integer_digits\":3", "042"],
	])("formats normalized i64 values with options %s", (formatting, expected) => {
		expect(formatInteger((1n << 64n) + 42n, formatting)).toBe(expected);
	});
});
