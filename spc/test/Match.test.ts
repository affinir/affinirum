import { Affinirum, Type } from "../../src/index.js";

describe("Match expressions", () => {
	it.each(["match 1 { 1: 2 }", "match(1) { 1: 2 }"])("accepts %s", (source) => {
		expect(new Affinirum(source).evaluate()).toBe(2n);
	});

	it("evaluates the subject once and stops at the first matching key", () => {
		const expression = new Affinirum(`
			var log = "";
			val mark = func(tag:string, n:integer):integer { log += tag; n };
			val value = match mark("s", 2) {
				mark("a", 1): mark("x", 0),
				mark("b", 2): mark("y", 7),
				mark("c", 2): mark("z", 0),
				else: mark("e", 0),
			};
			[value, log]
		`);
		expect(expression.evaluate()).toEqual([7n, "saby"]);
	});

	it("uses Affinirum equality and returns null on a miss without an else arm", () => {
		const expression = new Affinirum("match(value) { ['x': [2]]: false, }");
		expect(expression.type.equals(Type.OptionalBoolean)).toBe(true);
		expect(expression.evaluate({ value: { x: [2.0] } })).toBe(false);
		expect(expression.evaluate({ value: { x: ["2"] } })).toBeUndefined();
	});

	it("allows empty matches and matches with only an else arm", () => {
		const empty = new Affinirum("match(1) {}");
		expect(empty.type.isNull).toBe(true);
		expect(empty.evaluate()).toBeUndefined();
		expect(new Affinirum("match(1) { else: 42 }").evaluate()).toBe(42n);
	});

	it("parses nested expressions and keeps default usable as an identifier", () => {
		const expression = new Affinirum(`
			val default = 3;
			match status {
				default * 2: match status + 1 { 7: { val n = 9; n }, else: 0 },
				else: default,
			} + 1
		`, { variables: { status: Type.Integer }, strict: true });
		expect(expression.evaluate({ status: 6n })).toBe(10n);
		expect(expression.evaluate({ status: 0n })).toBe(4n);
	});

	it("propagates expected types to arms and accounts for the implicit null", () => {
		const config = { type: Type.Integer };
		const expression = new Affinirum("match(x) { 1: hit, else: miss }", config);
		expect(expression.variables().hit.equals(Type.Integer)).toBe(true);
		expect(expression.variables().miss.equals(Type.Integer)).toBe(true);
		expect(() => new Affinirum("match(x) { 1: 2 }", config)).toThrow(/type null mismatch/);
	});

	it("allows a selected arm to return from its enclosing function", () => {
		const expression = new Affinirum(`
			val adjust = func(n:integer):integer {
				match(n) { 0: -> 10 };
				n + 1
			};
			[adjust(0), adjust(2)]
		`);
		expect(expression.evaluate()).toEqual([10n, 3n]);
	});

	it.each([
		["match(1 { 1: 2 }", "missing closing parentheses"],
		["match 1 1: 2", "missing opening braces"],
		["match(1) { 1: 2", "missing closing braces"],
		["match(1) { 1 2 }", "missing colon separator"],
		["match(1) { else 2 }", "missing colon separator"],
		["match(1) { 1: }", "unexpected closing braces"],
		["match(1) { 1: 2 3: 4 }", "expected ',' or '}' after match arm"],
		["match(1) { else: 1, 2: 3 }", "else must be the last match arm"],
		["match(1) { else: 1, else: 2 }", "else must be the last match arm"],
	])("rejects %s", (script, message) => {
		expect(() => new Affinirum(script)).toThrow(message);
	});
});
