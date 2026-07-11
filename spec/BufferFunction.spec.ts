import { runAffinirumTests } from "./helpers/AffinirumTest.js";

describe("Buffer function test", ()=> {
	runAffinirumTests([
		{
			script: "a.Byte(b).Format()",
			cases: [
				{ values: { a: new Uint8Array([0xff, 0xff, 0x00, 0x01]).buffer, b: 3n }, result: "01" },
				{ values: { a: new Uint8Array([0x10, 0x00]).buffer, b: 0n }, result: "10" },
				{ values: { a: new Uint8Array([0x10, 0x00]).buffer, b: 2n }, result: "" },
			],
		},
		{
			script: "Buffer.Parse(v).Format()",
			cases: [
				{ values: { v: "ff0001" }, result: "ff0001" },
				{ values: { v: "AAAA" }, result: "aaaa" },
				{ values: { v: "0" }, result: "00" },
			],
		},
		{
			script: "Buffer.Parse(v).Format(f)",
			cases: [
				{ values: { v: "ff00", f: "hex" }, result: "ff00" },
				{ values: { v: "ff00", f: "base64" }, result: "/wA=" },
			],
		},
		{
			script: "Buffer.Parse(v).Length",
			cases: [
				{ values: { v: "" }, result: 0n },
				{ values: { v: "abcd" }, result: 2n },
			],
		},
		{
			script: "Buffer.Random(c).Length",
			cases: [
				{ values: { c: -1n }, result: 0n },
				{ values: { c: 0n }, result: 0n },
				{ values: { c: 8n }, result: 8n },
			],
		},
	]);
});
