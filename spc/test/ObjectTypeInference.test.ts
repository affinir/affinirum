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
		expect(() => expression.evaluate({ x: 1n, y: 2n }))
			.toThrow(/object value mismatch with expected type/);
	});

	it("checks later object keys using types established by earlier initializers", () => {
		expect(() => new Affinirum("['init':val f=~():integer{1},f():0]"))
			.toThrow(/type integer mismatch with expected type string/);
		const expression = new Affinirum("['init':val f=~():string{'a'},f():0]");
		expect(expression.evaluate()).toHaveProperty("a", 0n);
	});

	it.each([
		"['a':'ignored','a':value]",
		"['a':'ignored',(''+'a'):value]",
	])("rejects incompatible overwritten property values in %s", (script) => {
		expect(() => new Affinirum(script, { type: Type.objectType([["a", Type.Integer]]) }))
			.toThrow(/mismatch with expected type/);
	});

	it("infers the property constraint for overwritten inputs", () => {
		const expression = new Affinirum("['a':first,'a':second]", {
			type: Type.objectType([["a", Type.Integer]]),
		});
		expect(expression.variables().first.equate(Type.Integer)).toBe(true);
		expect(expression.variables().second.equate(Type.Integer)).toBe(true);
		expect(expression.evaluate({ first: 1n, second: 2n })).toEqual({ a: 2n });
		expect(() => expression.evaluate({ first: "bad", second: 2n }))
			.toThrow(/unexpected type string for variable first of type integer/);
	});

	it("permits unconstrained named properties", () => {
		const expression = new Affinirum("['a':1,'b':'text']", {
			type: Type.objectType([["a", Type.Integer]]),
		});
		expect(expression.evaluate()).toEqual({ a: 1n, b: "text" });
	});

	it.each([
		"['a':1,(key):'text']",
		"[(key):'text','a':1]",
		"[(key):'text',(key):1,'a':1]",
	])("rejects dynamic values that could violate a named constraint in %s", (script) => {
		expect(() => new Affinirum(script, { type: Type.objectType([["a", Type.Integer]]) }))
			.toThrow(/mismatch with expected type/);
	});

	it("checks dynamic values against every possible named property", () => {
		const expression = new Affinirum("['a':1,'b':2,(key):value]", {
			type: Type.objectType([["a", Type.Number], ["b", Type.Integer]]),
		});
		expect(expression.variables().value.equate(Type.Integer)).toBe(true);
		expect(expression.evaluate({ key: "a", value: 3n })).toEqual({ a: 3n, b: 2n });
		expect(() => expression.evaluate({ key: "b", value: 3.5 }))
			.toThrow(/unexpected type float for variable value of type integer/);
		expect(() => new Affinirum("['a':1,'b':'text',(key):1]", {
			type: Type.objectType([["a", Type.Integer], ["b", Type.String]]),
		})).toThrow(/mismatch with expected type/);
	});

	it("permits dynamic overwrites without an expected property constraint", () => {
		const expression = new Affinirum("['a':1,(key):'text']");
		expect(expression.type.equate(Type.Object)).toBe(true);
		expect(expression.evaluate({ key: "a" })).toEqual({ a: "text" });
		expect(expression.evaluate({ key: "b" })).toEqual({ a: 1n, b: "text" });
	});

	it("rejects overwritten values that violate a selected object union alternative", () => {
		expect(() => new Affinirum("['a':1,'a':'text','b':1]", { type: union }))
			.toThrow(/mismatch with expected type/);
	});

	it("propagates expected types through nested object properties", () => {
		const type = Type.objectType([["child", Type.objectType([["a", Type.Integer]])]]);
		const expression = new Affinirum("['child':['a':value]]", { type });
		expect(expression.variables().value.equate(Type.Integer)).toBe(true);
		expect(expression.evaluate({ value: 3n })).toEqual({ child: { a: 3n } });
	});

	it("keeps the compiled property type when a broader result type accepts it", () => {
		const expression = new Affinirum("['a':1]", { type: Type.objectType([["a", Type.Number]]) });
		expect(expression.type.equate(Type.objectType([["a", Type.Integer]]))).toBe(true);
	});

	it("checks overwritten entries through an assignment result", () => {
		expect(() => new Affinirum("var value:object=['a':'bad','a':1]", { type: Type.objectType([["a", Type.Integer]]) }))
			.toThrow(/mismatch with expected type/);
	});

	it.each<[string, Type]>([
		["var value:object=[(key):1]", Type.objectType([["a", Type.Integer]])],
		["var n=0;while n<1{n=1;[(key):1]}", Type.union(Type.Void, Type.objectType([["a", Type.Integer]]))],
	])("checks dynamic entries through the result of %s", (script, type) => {
		const expression = new Affinirum(script, { type });
		expect(expression.evaluate({ key: "a" })).toEqual({ a: 1n });
		expect(() => expression.evaluate({ key: "b" })).toThrow(/object value mismatch with expected type/);
	});

	it("checks a nested dynamic object before a later entry overwrites it", () => {
		const type = Type.objectType([["child", Type.objectType([["a", Type.Integer]])]]);
		const expression = new Affinirum("['child':[(key):1],'child':['a':2]]", { type });
		expect(expression.evaluate({ key: "a" })).toEqual({ child: { a: 2n } });
		expect(() => expression.evaluate({ key: "b" })).toThrow(/object value mismatch with expected type/);
	});

	it("checks overwritten and dynamic properties in an overloaded call", () => {
		const type = Type.objectType([["a", Type.Integer]]);
		const f = Type.functionType([[Type.Integer, [type]], [Type.String, [Type.Integer]]]);
		expect(() => new Affinirum("f(['a':'bad','a':1])", { variables: { f } })).toThrow(/mismatch with expected type/);
		const expression = new Affinirum("f([(key):1])", { variables: { f } });
		expect(expression.evaluate({ key: "a", f: () => 1n })).toBe(1n);
		expect(() => expression.evaluate({ key: "b", f: () => 1n })).toThrow(/object value mismatch with expected type/);
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

describe("Uniform object compilation test", () => {
	const type = Type.objectType([[undefined, Type.Integer]]);

	it.each<[string, Record<string, bigint>]>([
		["[:]", {}],
		["['a':1,'b':2]", { a: 1n, b: 2n }],
		["['':3]", { "": 3n }],
	])("accepts uniform object arguments in %s", (script, expected) => {
		const expression = new Affinirum(`(~(a:[:integer]):[:integer]{a})(${script})`);
		expect(expression.evaluate()).toEqual(expected);
	});

	it.each([
		"(~(a:[:integer]):float{1.0})(['a':1,'b':2.0])",
		"(~(a:[:integer?]):float{1.0})(['a':'bad'])",
	])("rejects incompatible uniform object arguments in %s", (script) => {
		expect(() => new Affinirum(script)).toThrow(/cannot be called/);
	});

	it.each(["['a':value]", "[(key):value]"])("infers uniform values in %s", (script) => {
		const expression = new Affinirum(script, { type });
		expect(expression.variables().value.equate(Type.Integer)).toBe(true);
		expect(expression.evaluate({ key: "a", value: 1n })).toEqual({ a: 1n });
		expect(() => expression.evaluate({ key: "a", value: "bad" }))
			.toThrow(/unexpected type string for variable value of type integer/);
	});

	it.each([
		"['a':'ignored','a':value]",
		"['a':'ignored',(''+'a'):value]",
	])("rejects incompatible overwritten uniform values in %s", (script) => {
		expect(() => new Affinirum(script, { type })).toThrow(/mismatch with expected type/);
	});

	it.each([
		"['a':'ignored',(''+'a'):value]",
		"['a':'ignored',(key):value]",
	])("rejects incompatible overwritten uniform arguments in %s", (script) => {
		expect(() => new Affinirum(`(~(a:[:integer]):[:integer]{a})(${script})`))
			.toThrow(/cannot be called/);
	});

	it("evaluates compatible duplicate initializers once in order", () => {
		const expression = new Affinirum("var count=0;['a':count=count+1,'a':count=count+1]", { type });
		expect(expression.evaluate()).toEqual({ a: 2n });
	});

	it("rejects incompatible uniform values before dynamic overwrites", () => {
		expect(() => new Affinirum("['a':'ignored',(key):1]", { type }))
			.toThrow(/mismatch with expected type/);
	});

	it("infers uniform constraints for dynamic entries followed by named entries", () => {
		const expression = new Affinirum("[(key):value,'a':1]", { type });
		expect(expression.variables().value.equate(Type.Integer)).toBe(true);
		expect(expression.evaluate({ key: "a", value: 2n })).toEqual({ a: 1n });
		expect(expression.evaluate({ key: "b", value: 2n })).toEqual({ a: 1n, b: 2n });
		expect(() => expression.evaluate({ key: "a", value: "bad" }))
			.toThrow(/unexpected type string for variable value of type integer/);
	});

	it("propagates nested uniform constraints", () => {
		const expression = new Affinirum("['child':['a':value]]", {
			type: Type.objectType([[undefined, type]]),
		});
		expect(expression.variables().value.equate(Type.Integer)).toBe(true);
		expect(expression.evaluate({ value: 3n })).toEqual({ child: { a: 3n } });
		expect(() => new Affinirum("['child':['a':'bad','a':1]]", {
			type: Type.objectType([[undefined, type]]),
		})).toThrow(/mismatch with expected type/);
	});

	it("narrows uniform union alternatives using known values", () => {
		const expression = new Affinirum("['a':1,'b':value]", {
			type: Type.union(
				Type.objectType([[undefined, Type.Number]]),
				Type.objectType([[undefined, Type.String]]),
			),
		});
		expect(expression.variables().value.equate(Type.Number)).toBe(true);
		expect(expression.evaluate({ value: 2.5 })).toEqual({ a: 1n, b: 2.5 });
	});

	it("uses uniform constraints when compiling casts", () => {
		expect(() => new Affinirum("['a':'bad']::[:integer]")).toThrow(/cannot cast type/);
		const expression = new Affinirum("value::[:string]", { variables: { value: type } });
		expect(expression.evaluate({ value: {} })).toEqual({});
		expect(() => expression.evaluate({ value: { a: 1n } })).toThrow(/cannot cast value/);
	});
});
