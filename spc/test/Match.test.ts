import { Affinirum, Type } from "../../src/index.js";

describe("Match expressions", () => {
	it("selects the first or second arm and falls back when neither matches", () => {
		const expression = new Affinirum("match a when 2 then 5 when 8 then 10 else 111");
		expect(expression.evaluate({ a: 2n })).toBe(5n);
		expect(expression.evaluate({ a: 8n })).toBe(10n);
		expect(expression.evaluate({ a: 0n })).toBe(111n);
	});

	it("evaluates the subject once and stops at the first matching key", () => {
		const expression = new Affinirum(`
			var log = "";
			val mark = func(tag:string, n:integer):integer { log += tag; n };
			val value = match mark("s", 2)
				when mark("a", 1) then { mark("x", 0) }
				when mark("b", 2) then { mark("y", 7) }
				when mark("c", 2) then { mark("z", 0) }
				else { mark("e", 0) };
			[value, log]
		`);
		expect(expression.evaluate()).toEqual([7n, "saby"]);
	});

	it("uses Affinirum equality and returns null on a miss without an else arm", () => {
		const expression = new Affinirum("match(value) when ['x': [2]] then { false }");
		expect(expression.type.equals(Type.OptionalBoolean)).toBe(true);
		expect(expression.evaluate({ value: { x: [2.0] } })).toBe(false);
		expect(expression.evaluate({ value: { x: ["2"] } })).toBeUndefined();
	});

	it("evaluates the subject even with only an else block", () => {
		const empty = new Affinirum("match 1 else {}");
		expect(empty.type.isNull).toBe(true);
		expect(empty.evaluate()).toBeUndefined();
		expect(new Affinirum("var calls=0; match (calls+=1) else { calls }").evaluate()).toBe(1n);
	});

	it("selects the first true condition in a chain of match arms", () => {
		const expression = new Affinirum("match true when score >= 90 then 'A' when score >= 80 then 'B' else 'C'");
		expect(expression.evaluate({ score: 95n })).toBe("A");
		expect(expression.evaluate({ score: 80n })).toBe("B");
		expect(expression.evaluate({ score: 79n })).toBe("C");
	});

	it("parses nested match expressions with computed keys", () => {
		const expression = new Affinirum(`
			val base = 3;
			(match status
				when base * 2 then {
					match status + 1 when 7 then { val n = 9; n } else { 0 }
				}
				else base) + 1
		`, { variables: { status: Type.Integer }, strict: true });
		expect(expression.evaluate({ status: 6n })).toBe(10n);
		expect(expression.evaluate({ status: 0n })).toBe(4n);
	});

	it("propagates expected types to arms and accounts for the implicit null", () => {
		const config = { type: Type.Integer };
		const expression = new Affinirum("match(x) when 1 then { hit } else { miss }", config);
		expect(expression.variables().hit.equals(Type.Integer)).toBe(true);
		expect(expression.variables().miss.equals(Type.Integer)).toBe(true);
		expect(() => new Affinirum("match(x) when 1 then { 2 }", config)).toThrow(/type null mismatch/);
	});

	it("allows a selected arm to return from its enclosing function", () => {
		const expression = new Affinirum(`
			val adjust = func(n:integer):integer {
				match(n) when 0 then { -> 10 };
				n + 1
			};
			[adjust(0), adjust(2)]
		`);
		expect(expression.evaluate()).toEqual([10n, 3n]);
	});

	it.each([
		["when 1 case 1 then 2", "unexpected expression token"],
		["match(1 when 1 then { 2 }", "missing closing parentheses"],
		["match 1", "expected 'when' or 'else'"],
		["match 1 { 1: 2 }", "expected 'when' or 'else'"],
		["match 1 when 1 then { 2", "missing closing braces"],
		["match 1 when 1 2", "expected 'then' after when key"],
		["match 1 when 1 { 2 }", "expected 'then' after when key"],
		["match 1 when 1 then { 2 }, when 2 then { 3 }", "unexpected expression token"],
		["match 1 else { 1 } when 2 then { 3 }", "unexpected expression token"],
		["match 1 else { 1 } else { 2 }", "unexpected expression token"],
	])("rejects %s", (script, message) => {
		expect(() => new Affinirum(script)).toThrow(message);
	});
});
