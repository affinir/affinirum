import { Affinirum } from "../../src/index.js";

describe("Reserved words", () => {
	it("rejects reserved words and accepts non-reserved words as identifiers", () => {
		const reservedWords = [
			"var", "val", "func", "function", "if", "then", "else", "match", "when", "while", "loop", "until", "next", "exit",
			"and", "or", "not", "true", "false", "null", "never", "any", "bool", "boolean", "time", "timestamp",
			"f64", "float", "i64", "integer", "buffer", "string",
		];
		const nonReservedWords = ["case", "default", "do", "exitCount", "funcCount", "nextCount"];

		for (const word of reservedWords) {
			expect(Affinirum.keywords).toContain(word);
			expect(() => new Affinirum(`val ${word} = 1`)).toThrow(/missing variable name/);
			expect(() => new Affinirum(`func(${word}:integer) { 1 }`)).toThrow(/missing function argument name/);
		}
		for (const word of nonReservedWords) {
			expect(Affinirum.keywords).not.toContain(word);
			expect(new Affinirum(`val ${word} = 2; ${word}`).evaluate()).toBe(2n);
		}
	});
});
