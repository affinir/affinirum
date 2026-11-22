import { Affinirum } from "../../../src/index.js";

describe("AN function test", () => {
	it("points to a non-string key in the first or a later object entry", () => {
		for (const source of ["[123:3]", "['a':1, 123:3]"]) {
			expect(() => Affinirum.parse(source))
				.toThrow(`object key must be a string at position ${source.indexOf("123")}:`);
		}
	});

	it("formats top-level null and undefined as null", () => {
		for (const value of [undefined, null]) {
			for (const whitespace of [undefined, " "]) {
				const notation = Affinirum.format(value, whitespace);
				expect(notation).toBe("null");
				expect(Affinirum.parse(notation)).toBeUndefined();
			}
		}
	});

	it("preserves trailing undefined array elements when formatting and parsing AN", () => {
		for (const value of [[undefined], [1n, undefined], [undefined, undefined], [1n, undefined, undefined]]) {
			for (const whitespace of [undefined, " "]) {
				expect<unknown>(Affinirum.parse(Affinirum.format(value, whitespace))).toEqual(value);
			}
		}
	});

	it("formats empty array slots as null", () => {
		const notation = Affinirum.format(new Array<undefined>(2));
		expect(notation).toBe("[null,null]");
		expect<unknown>(Affinirum.parse(notation)).toEqual([undefined, undefined]);
	});

	it("preserves nested undefined values when formatting and parsing AN", () => {
		const value = { a: undefined, b: [undefined, { c: undefined }] };
		for (const whitespace of [undefined, " "]) {
			expect<unknown>(Affinirum.parse(Affinirum.format(value, whitespace))).toEqual(value);
		}
	});

	it.each([1e21, -1e21, 1.25e21, Number.MAX_VALUE, -Number.MAX_VALUE, Number.MIN_VALUE])(
		"round-trips the scientific-notation float %s through AN",
		(value) => {
			const notation = Affinirum.format(value);
			expect(notation).toBe(value.toString());
			expect(Affinirum.parse(notation)).toBe(value);
		},
	);

	it("preserves the float type below the scientific-notation threshold", () => {
		const value = 1e20;
		const notation = Affinirum.format(value);
		expect(notation).toBe("100000000000000000000.0");
		expect(Affinirum.parse(notation)).toBe(value);
	});

	it("round-trips scientific-notation floats in nested AN values", () => {
		const value = { positive: 1e21, negative: -1e21, limits: [Number.MAX_VALUE, -Number.MAX_VALUE] };
		for (const whitespace of [undefined, " "]) {
			expect<unknown>(Affinirum.parse(Affinirum.format(value, whitespace))).toEqual(value);
		}
	});
});
