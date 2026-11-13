import { Affinirum, Type } from "../../src/index.js";

describe("Ternary node test", () => {
	it.each<[string, string, bigint | string, bigint | string]>([
		["x='two'", "x=(x::integer)-1", "two", 1n],
		["x=(x::integer)-1", "x='two'", 1n, "two"],
	])("compiles branches independently for %s and %s", (thenBranch, elseBranch, thenValue, elseValue) => {
		const expression = new Affinirum(`var x:integer|string=2;if condition{${thenBranch}}else{${elseBranch}};x`, {
			variables: { condition: Type.Boolean },
		});
		expect(expression.type.equate(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate({ condition: true })).toBe(thenValue);
		expect(expression.evaluate({ condition: false })).toBe(elseValue);
	});

	it("retains the incoming type when the else branch is omitted", () => {
		const expression = new Affinirum("var x:integer|string=1;if condition{x='two'};x", {
			variables: { condition: Type.Boolean },
		});
		expect(expression.type.equate(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate({ condition: true })).toBe("two");
		expect(expression.evaluate({ condition: false })).toBe(1n);
	});

	it("keeps a local without an initializer unknown across branch assignments", () => {
		const expression = new Affinirum("var x;if condition{x='two';x=2}else{x=3};x", {
			variables: { condition: Type.Boolean },
		});
		expect(expression.type.isUnknown).toBe(true);
		expect(expression.evaluate({ condition: true })).toBe(2n);
		expect(expression.evaluate({ condition: false })).toBe(3n);
	});

	it("combines implicit input types from both branches", () => {
		const expression = new Affinirum("if condition{value-1}else{value.Length}", {
			type: Type.Number,
			variables: { condition: Type.Boolean },
		});
		expect(expression.type.equate(Type.Number)).toBe(true);
		expect(expression.variables().value.equate(Type.union(Type.Number, Type.OptionalIterable))).toBe(true);
		expect(expression.evaluate({ condition: true, value: 3n })).toBe(2n);
		expect(expression.evaluate({ condition: false, value: "two" })).toBe(3n);
	});

	it("retains a declared union across nested branches", () => {
		const expression = new Affinirum("var x:integer|string=1;{if outer{if inner{x='two'}else{x=2}}else{x=(x::integer)-1}};x", {
			variables: { outer: Type.Boolean, inner: Type.Boolean },
		});
		expect(expression.type.equate(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate({ outer: true, inner: true })).toBe("two");
		expect(expression.evaluate({ outer: true, inner: false })).toBe(2n);
		expect(expression.evaluate({ outer: false, inner: true })).toBe(0n);
	});

	it("preserves declared parameter types across branch assignments", () => {
		const expression = new Affinirum("~(x:integer|string,condition:boolean):integer|string{x=2;if condition{x='two'}else{x=(x::integer)-1};x}");
		const type = Type.union(Type.Integer, Type.String);
		expect(expression.type.equate(Type.functionType([[type, [type, Type.Boolean]]]))).toBe(true);
		const func = expression.evaluate() as (value: bigint | string, condition: boolean) => bigint | string;
		expect(func("one", true)).toBe("two");
		expect(func(0n, false)).toBe(1n);
	});

	it("preserves the compiled result type after later assignments", () => {
		const expression = new Affinirum("var x:integer|string=1;val result=if condition{x=2}else{x='two'};x=3;result", {
			variables: { condition: Type.Boolean },
		});
		expect(expression.type.equate(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate({ condition: true })).toBe(2n);
		expect(expression.evaluate({ condition: false })).toBe("two");
	});

	it("uses current branch types when selecting an overload before compilation", () => {
		const type = Type.functionType([
			[Type.Integer, [Type.Integer]],
			[Type.String, [Type.arrayType([Type.String])], true],
		]);
		const expression = new Affinirum("var x='kept';f(if condition{x}else{x})", {
			variables: { f: type, condition: Type.Boolean },
		});
		const f = (value: string) => value;
		expect(expression.type.equate(Type.String)).toBe(true);
		expect(expression.evaluate({ f, condition: true })).toBe("kept");
		expect(expression.evaluate({ f, condition: false })).toBe("kept");
	});


	it.each([
		"if true{value-1}else{value.Length}",
		"if false{value.Length}else{value-1}",
	])("includes input uses from the discarded branch in %s", (script) => {
		const expression = new Affinirum(script);
		expect(expression.variables().value.equate(Type.union(Type.Number, Type.OptionalIterable))).toBe(true);
		expect(expression.evaluate({ value: 2n })).toBe(1n);
	});

	it("widens an implicit input used as a callable in another branch", () => {
		const expression = new Affinirum("if condition{value-1}else{value()}", {
			variables: { condition: Type.Boolean },
		});
		expect(expression.variables().value.equate(Type.union(Type.Number, Type.Function))).toBe(true);
		expect(expression.evaluate({ condition: true, value: 3n })).toBe(2n);
		expect(expression.evaluate({ condition: false, value: () => 9n })).toBe(9n);
	});
});
