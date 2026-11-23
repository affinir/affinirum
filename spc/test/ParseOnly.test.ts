import { Affinirum } from "../../src/index.js";

describe("Parse-only mode test", () => {
	it("accepts syntactically valid scripts that fail compilation", () => {
		expect(() => new Affinirum("1 / 0")).toThrow();
		expect(() => new Affinirum("1 / 0", { parseOnly: true })).not.toThrow();
		expect(() => new Affinirum("'a' + 1", { parseOnly: true })).not.toThrow();
	});
	it("rejects syntax errors", () => {
		expect(() => new Affinirum("if true 1", { parseOnly: true })).toThrow(/expected 'then'/);
		expect(() => new Affinirum("(1 + 2", { parseOnly: true })).toThrow(/missing closing parentheses/);
		expect(() => new Affinirum("1 + @", { parseOnly: true })).toThrow();
	});
	it("still reports errors raised while parsing", () => {
		expect(() => new Affinirum("-> 1", { parseOnly: true })).toThrow(/outside of a function/);
		expect(() => new Affinirum("next", { parseOnly: true })).toThrow(/outside of a loop/);
	});
	it("produces a tree for toString and refuses evaluation", () => {
		const script = new Affinirum("val a = 1; a + 2", { parseOnly: true });
		expect(typeof script.toString()).toBe("string");
		expect(() => script.evaluate()).toThrow(/parse-only/);
	});
	it("leaves default behavior unchanged", () => {
		expect(new Affinirum("1 + 2", { parseOnly: false }).evaluate()).toBe(3n);
	});
});
