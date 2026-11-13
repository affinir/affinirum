import { Affinirum } from "../../../../src/index.js";
import { runAffinirumTests } from "../../../util/AffinirumTest.js";

describe("AN function test", () => {
	runAffinirumTests([
		{
			script: "AN.Format(obj0)",
			cases: [
				{ values: { obj0: undefined }, result: "null" },
				{ values: { obj0: null }, result: "null" },
				{ values: { obj0: false }, result: "false" },
				{ values: { obj0: true }, result: "true" },
				{ values: { obj0: 0 }, result: "0.0" },
				{ values: { obj0: "" }, result: "\"\"" },
				{ values: { obj0: "abc" }, result: "\"abc\"" },
				{ values: { obj0: [] }, result: "[]" },
				{ values: { obj0: [undefined] }, result: "[null]" },
				{ values: { obj0: [1n, undefined] }, result: "[1,null]" },
				{ values: { obj0: [undefined, null] }, result: "[null,null]" },
				{ values: { obj0: [1, 2, 3] }, result: "[1.0,2.0,3.0]" },
				{ values: { obj0: ["a", "b", "c"] }, result: "[\"a\",\"b\",\"c\"]" },
				{ values: { obj0: {} }, result: "[:]" },
				{ values: { obj0: { a: undefined, b: null } }, result: "[\"a\":null,\"b\":null]" },
				{ values: { obj0: { a: 0, b: 1, c: 2 } }, result: "[\"a\":0.0,\"b\":1.0,\"c\":2.0]" },
				{ values: { obj0: { a: "a", b: "b", c: "c" } }, result: "[\"a\":\"a\",\"b\":\"b\",\"c\":\"c\"]" },
				{
					values: {
						obj0: { xbool: true, xbuf: new Uint8Array([10, 20, 30, 0, 4]).buffer, xstr: "string", xfunc: () => "1234", xarr: [1n, 2n, 3n], xobj: { a: 1, b: 2 } },
					},
					result: "[\"xbool\":true,\"xbuf\":`0a141e0004`,\"xstr\":\"string\",\"xfunc\":function,\"xarr\":[1,2,3],\"xobj\":[\"a\":1.0,\"b\":2.0]]",
				},
			],
		},
		{
			script: "AN.Format(obj0, \" \")",
			cases: [
				{ values: { obj0: undefined }, result: "null" },
				{ values: { obj0: null }, result: "null" },
				{ values: { obj0: [1n, undefined] }, result: "[\n 1,\n null\n]" },
				{ values: { obj0: { a: undefined, b: null } }, result: "[\n \"a\": null,\n \"b\": null\n]" },
				{
					values: {
						obj0: { xbool: [[[true]]], xbuf: new Uint8Array([10, 20, 30, 0, 4]).buffer, xstr: "string", xfunc: () => "1234", xarr: [1n, 2n, 3n], xobj: { a: 1, b: 2 } },
					},
					result: `[
 "xbool": [
  [
   [
    true
   ]
  ]
 ],
 "xbuf": \`0a141e0004\`,
 "xstr": "string",
 "xfunc": function,
 "xarr": [
  1,
  2,
  3
 ],
 "xobj": [
  "a": 1.0,
  "b": 2.0
 ]
]`,
				},
			],
		},
	]);

	it("parses nested AN literals", () => {
		const literal = "[\"bool\":true,\"time\":@2020-01-02T16:10:00.000Z,\"float\":-1.25,\"integer\":-2,\"buffer\":`0aff`,\"string\":\"line\\n\",\"array\":[,false],\"object\":[:]]";
		const expression = new Affinirum("AN.Format(AN.Parse(value))");
		expect(expression.evaluate({ value: literal }) as string).toBe(literal.replace("[,false]", "[null,false]"));
	});

	it("formats scientific-notation floats through constant and runtime AN calls", () => {
		const constant = new Affinirum("AN.Format(1e21)");
		expect(constant.evaluate() as string).toBe("1e+21");
		const runtime = new Affinirum("AN.Parse(AN.Format(value))");
		for (const value of [1e21, -1e21, Number.MAX_VALUE, -Number.MAX_VALUE]) {
			expect(runtime.evaluate({ value })).toBe(value);
		}
	});

	it("does not evaluate expressions while parsing AN literals", () => {
		const expression = new Affinirum("AN.Parse(\"Integer(1.2)\")");
		expect(() => expression.evaluate()).toThrow(/invalid value Integer/);
	});
});
