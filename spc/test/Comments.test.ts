import { execFileSync } from "node:child_process";
import { Affinirum } from "../../src/index.js";

describe("Script comments", () => {
	it.each<[string, bigint]>([
		["//\n1", 1n],
		["//x\n1", 1n],
		["//\r\n1", 1n],
		["//x\r\n1", 1n],
		["//////1", 1n],
		["///ignored///1", 1n],
		["///\nignored\n///1", 1n],
		["1+//////2", 3n],
		["//////\n//////1", 1n],
	])("preserves code after comments in %s", (source, expected) => {
		expect(new Affinirum(source).evaluate()).toBe(expected);
	});

	it.each(["//", "//x", "//////"])("accepts a comment-only script %s", (source) => {
		expect(new Affinirum(source).evaluate()).toBeUndefined();
	});

	it.each(["///", "////", "/////", "///unfinished"])("rejects an unterminated block comment %s", (source) => {
		expect(() => new Affinirum(source)).toThrow(/missing closing comment mark/);
	});
});

describe("Buffer comments", () => {
	it.each<[string, number[]]>([
		["00//ab\n11", [0x00, 0x11]],
		["00//\n11", [0x00, 0x11]],
		["00//ab", [0x00]],
		["00//", [0x00]],
		["00///ab///11", [0x00, 0x11]],
		["00///ab///", [0x00]],
		["00//////11", [0x00, 0x11]],
		["00//////", [0x00]],
		["00//ab\n11//cd\n22", [0x00, 0x11, 0x22]],
		["00///ab///11///cd///22", [0x00, 0x11, 0x22]],
		["00///ab///11//cd\n22", [0x00, 0x11, 0x22]],
	])("preserves bytes and the closing quote around comments in %s", (contents, expected) => {
		const expression = new Affinirum("val b=`" + contents + "`;b");
		expect(new Uint8Array(expression.evaluate() as ArrayBuffer)).toEqual(new Uint8Array(expected));
	});

	it.each(["`00/11`", "`00///ab///g`"])("rejects invalid characters in %s", (source) => {
		expect(() => new Affinirum(source)).toThrow(/unexpected symbol/);
	});

	it.each<[string, RegExp]>([
		["`///", /missing closing comment mark/],
		["`////`", /missing closing comment mark/],
		["`00///ab///", /missing closing buffer quotation mark/],
	])("rejects an unterminated buffer or comment in %s", (source, error) => {
		expect(() => new Affinirum(source)).toThrow(error);
	});

	it("rejects a line comment at EOF without hanging", () => {
		// Isolate parsing so a synchronous infinite loop cannot hang Jest.
		const moduleURL = new URL("../../src/index.js", import.meta.url).href;
		const source = `
import assert from "node:assert/strict";
import { Affinirum } from ${JSON.stringify(moduleURL)};
for (const source of ${JSON.stringify(["`//", "`//unfinished"])}) {
	assert.throws(() => new Affinirum(source), /missing closing buffer quotation mark/);
}
`;
		execFileSync(process.execPath, ["--input-type=module", "--eval", source], { timeout: 5000 });
	}, 10000);
});
