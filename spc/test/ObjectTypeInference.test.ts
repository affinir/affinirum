import { Affinirum, Type } from "../../src/index.js";

describe("Object type inference test", () => {
	const union = Type.union(
		Type.objectType([["a", Type.Integer], ["b", Type.String]]),
		Type.objectType([["a", Type.String], ["b", Type.Integer]]),
	);

	it("infers input types from known object properties", () => {
		const type = Type.objectType([["count", Type.Integer]]);
		const expression = new Affinirum("['count':value]", { type });
		expect(expression.variables().value.equate(Type.Integer)).toBe(true);
		expect(expression.type.equate(type)).toBe(true);
		expect(expression.evaluate({ value: 1n })).toEqual({ count: 1n });
		expect(() => expression.evaluate({ value: "text" }))
			.toThrow(/unexpected type string for variable value of type integer/);
	});

	it.each<[string, Record<string, bigint | string>]>([
		["['a':1,'b':value]", { a: 1n, b: "text" }],
		["['a':value,'b':1]", { a: "text", b: 1n }],
	])("narrows object union alternatives using known properties in %s", (script, expected) => {
		const expression = new Affinirum(script, { type: union });
		expect(expression.variables().value.equate(Type.String)).toBe(true);
		expect(expression.evaluate({ value: "text" })).toEqual(expected);
	});

	it("leaves conflicting property constraints unknown when the object union is unresolved", () => {
		const expression = new Affinirum("['a':x,'b':y]", { type: union });
		expect(expression.variables().x.isUnknown).toBe(true);
		expect(expression.variables().y.isUnknown).toBe(true);
		expect(expression.evaluate({ x: 1n, y: "text" })).toEqual({ a: 1n, b: "text" });
	});

	it("checks later object keys using types established by earlier initializers", () => {
		expect(() => new Affinirum("['init':val f=~():integer{1},f():0]"))
			.toThrow(/return a type compatible with string/);
		const expression = new Affinirum("['init':val f=~():string{'a'},f():0]");
		expect(expression.evaluate()).toHaveProperty("a", 0n);
	});

	it.each([
		"['a':'ignored','a':value]",
		"['a':'ignored',(''+'a'):value]",
	])("applies the property constraint to the final duplicate key in %s", (script) => {
		const expression = new Affinirum(script, { type: Type.objectType([["a", Type.Integer]]) });
		expect(expression.variables().value.equate(Type.Integer)).toBe(true);
		expect(expression.evaluate({ value: 2n })).toEqual({ a: 2n });
	});

	it("propagates expected types through nested object properties", () => {
		const type = Type.objectType([["child", Type.objectType([["a", Type.Integer]])]]);
		const expression = new Affinirum("['child':['a':value]]", { type });
		expect(expression.variables().value.equate(Type.Integer)).toBe(true);
		expect(expression.evaluate({ value: 3n })).toEqual({ child: { a: 3n } });
	});

	it("preserves variadic calls used as object property values", () => {
		const expression = new Affinirum(
			"val sum=~(first:integer,rest:...[integer]):integer{first+Integer.Sum(rest)};['a':sum(1,value,3)]",
			{ type: Type.objectType([["a", Type.Integer]]) },
		);
		expect(expression.variables().value.equate(Type.Integer)).toBe(true);
		expect(expression.evaluate({ value: 2n })).toEqual({ a: 6n });
	});
});
