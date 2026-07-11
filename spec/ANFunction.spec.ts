import { runAffinirumTests } from "./helpers/AffinirumTest.js";

describe("AN function test", ()=> {
	runAffinirumTests([
		{
			script: "AN.Format(obj0)",
			cases: [
				{ values: { obj0: undefined }, result: "null" },
				{ values: { obj0: false }, result: "false" },
				{ values: { obj0: true }, result: "true" },
				{ values: { obj0: 0 }, result: "0.0" },
				{ values: { obj0: "" }, result: "\"\"" },
				{ values: { obj0: "abc" }, result: "\"abc\"" },
				{ values: { obj0: [] }, result: "[]" },
				{ values: { obj0: [1, 2, 3] }, result: "[1.0,2.0,3.0]" },
				{ values: { obj0: ["a", "b", "c"] }, result: "[\"a\",\"b\",\"c\"]" },
				{ values: { obj0: {} }, result: "[:]" },
				{ values: { obj0: { a: 0, b: 1, c: 2 } }, result: "[\"a\":0.0,\"b\":1.0,\"c\":2.0]" },
				{ values: { obj0: { a: "a", b: "b", c: "c" } }, result: "[\"a\":\"a\",\"b\":\"b\",\"c\":\"c\"]" },
				{
					values: {
						obj0: { xbool: true, xbuf: new Uint8Array([10, 20, 30, 0, 4]).buffer, xstr: "string", xfunc: ()=> "1234", xarr: [1n, 2n, 3n], xobj: { a: 1, b: 2 } },
					},
					result: "[\"xbool\":true,\"xbuf\":#0a141e0004,\"xstr\":\"string\",\"xfunc\":function,\"xarr\":[1,2,3],\"xobj\":[\"a\":1.0,\"b\":2.0]]",
				},
			],
		},
		{
			script: "AN.Format(obj0, \" \")",
			cases: [
				{ values: { obj0: undefined }, result: "null" },
				{
					values: {
						obj0: { xbool: [[[true]]], xbuf: new Uint8Array([10, 20, 30, 0, 4]).buffer, xstr: "string", xfunc: ()=> "1234", xarr: [1n, 2n, 3n], xobj: { a: 1, b: 2 } },
					},
					result: `[
 "xbool": [
  [
   [
    true
   ]
  ]
 ],
 "xbuf": #0a141e0004,
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
});
