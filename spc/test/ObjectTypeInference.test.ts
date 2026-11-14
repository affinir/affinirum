import { Affinirum, Type } from "../../src/index.js";

describe("Object type inference test", () => {
	const union = Type.union(
		Type.objectType([["a", Type.Integer], ["b", Type.String]]),
		Type.objectType([["a", Type.String], ["b", Type.Integer]]),
	);

	it("infers input types from known object properties", () => {
		const type = Type.objectType([["count", Type.Integer]]);
		const expression = new Affinirum("['count':value]", { type });
		expect(expression.variables().value.equals(Type.Integer)).toBe(true);
		expect(expression.type.equals(type)).toBe(true);
		expect(expression.evaluate({ value: 1n })).toEqual({ count: 1n });
		expect(() => expression.evaluate({ value: "text" }))
			.toThrow(/unexpected type string for variable value of type integer/);
	});

	it.each<[string, Record<string, bigint | string>]>([
		["['a':1,'b':value]", { a: 1n, b: "text" }],
		["['a':value,'b':1]", { a: "text", b: 1n }],
	])("narrows object union alternatives using known properties in %s", (script, expected) => {
		const expression = new Affinirum(script, { type: union });
		expect(expression.variables().value.equals(Type.String)).toBe(true);
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
			.toThrow(/type integer mismatch with expected type string/);
		const expression = new Affinirum("['init':val f=~():string{'a'},f():0]");
		expect(expression.evaluate()).toHaveProperty("a", 0n);
	});

	it("permits unconstrained named properties", () => {
		const expression = new Affinirum("['a':1,'b':'text']", {
			type: Type.objectType([["a", Type.Integer]]),
		});
		expect(expression.evaluate()).toEqual({ a: 1n, b: "text" });
	});

	it("allows a computed key alongside a required named field", () => {
		const type = Type.objectType([["a", Type.Integer]]);
		const expression = new Affinirum("['a':1,(key):value]", { type });
		expect(expression.type.equals(type)).toBe(true);
		expect(expression.variables().value.isUnknown).toBe(true);
		expect(expression.evaluate({ key: "b", value: "text" })).toEqual({ a: 1n, b: "text" });
		expect(() => expression.evaluate({ key: "a", value: "text" }))
			.toThrow(/object value mismatch with expected type/);
		expect(new Affinirum("[(key):'text','a':1]", { type }).evaluate({ key: "a" }))
			.toEqual({ a: 1n });
	});

	it("propagates expected types through nested object properties", () => {
		const type = Type.objectType([["child", Type.objectType([["a", Type.Integer]])]]);
		const expression = new Affinirum("['child':['a':value]]", { type });
		expect(expression.variables().value.equals(Type.Integer)).toBe(true);
		expect(expression.evaluate({ value: 3n })).toEqual({ child: { a: 3n } });
	});

	it("keeps the compiled property type when a broader result type accepts it", () => {
		const expression = new Affinirum("['a':1]", { type: Type.objectType([["a", Type.Number]]) });
		expect(expression.type.equals(Type.objectType([["a", Type.Integer]]))).toBe(true);
	});

	it("rejects a bare object expression where a named field is required", () => {
		const type = Type.objectType([["a", Type.Integer]]);
		expect(() => new Affinirum("var value:object=[(key):1]", { type }))
			.toThrow(/mismatch with expected type/);
	});

	it("requires a known named field in a loop result", () => {
		const type = Type.union(Type.Void, Type.objectType([["a", Type.Integer]]));
		expect(() => new Affinirum("var n=0;while n<1{n=1;[(key):1]}", { type }))
			.toThrow(/mismatch with expected type/);
	});

	it("requires known named fields in nested records", () => {
		const type = Type.objectType([["child", Type.objectType([["a", Type.Integer]])]]);
		expect(() => new Affinirum("['child':[(key):1]]", { type })).toThrow(/mismatch with expected type/);
	});

	it("checks named properties in an overloaded call", () => {
		const type = Type.objectType([["a", Type.Integer]]);
		const f = Type.functionType([[Type.Integer, [type]], [Type.String, [Type.Integer]]]);
		expect(() => new Affinirum("f([(key):1])", { variables: { f } })).toThrow(/mismatch with expected type/);
		const expression = new Affinirum("f(['a':1,(key):'text'])", { variables: { f } });
		expect(expression.evaluate({ key: "b", f: () => 1n })).toBe(1n);
	});

	it("preserves variadic calls used as object property values", () => {
		const expression = new Affinirum(
			"val sum=~(first:integer,rest:...integer):integer{first+Integer.Sum(rest)};['a':sum(1,value,3)]",
			{ type: Type.objectType([["a", Type.Integer]]) },
		);
		expect(expression.variables().value.equals(Type.Integer)).toBe(true);
		expect(expression.evaluate({ value: 2n })).toEqual({ a: 6n });
	});
});

describe("Uniform object compilation test", () => {
	const type = Type.objectType(Type.Integer);

	it.each<[string, Record<string, bigint>]>([
		["[:]", {}],
		["['a':1,'b':2]", { a: 1n, b: 2n }],
		["['':3]", { "": 3n }],
	])("accepts uniform object arguments in %s", (script, expected) => {
		const expression = new Affinirum(`(~(a:[...:integer]):[...:integer]{a})(${script})`);
		expect(expression.evaluate()).toEqual(expected);
	});

	it.each([
		"(~(a:[...:integer]):float{1.0})(['a':1,'b':2.0])",
		"(~(a:[...:integer?]):float{1.0})(['a':'bad'])",
	])("rejects incompatible uniform object arguments in %s", (script) => {
		expect(() => new Affinirum(script)).toThrow(/mismatch with expected type/);
	});

	it.each(["['a':value]", "[(key):value]"])("infers uniform values in %s", (script) => {
		const expression = new Affinirum(script, { type });
		expect(expression.variables().value.equals(Type.Integer)).toBe(true);
		expect(expression.evaluate({ key: "a", value: 1n })).toEqual({ a: 1n });
		expect(() => expression.evaluate({ key: "a", value: "bad" }))
			.toThrow(/unexpected type string for variable value of type integer/);
	});

	it("checks computed entries against a uniform parameter", () => {
		const script = "[(key):'bad']";
		expect(() => new Affinirum(`(~(a:[...:integer]):[...:integer]{a})(${script})`))
			.toThrow(/mismatch with expected type integer/);
	});

	it("rejects incompatible uniform values before dynamic overwrites", () => {
		expect(() => new Affinirum("['a':'ignored',(key):1]", { type }))
			.toThrow(/mismatch with expected type/);
	});

	it("infers uniform constraints for dynamic entries followed by named entries", () => {
		const expression = new Affinirum("[(key):value,'a':1]", { type });
		expect(expression.variables().value.equals(Type.Integer)).toBe(true);
		expect(expression.evaluate({ key: "a", value: 2n })).toEqual({ a: 1n });
		expect(expression.evaluate({ key: "b", value: 2n })).toEqual({ a: 1n, b: 2n });
		expect(() => expression.evaluate({ key: "a", value: "bad" }))
			.toThrow(/unexpected type string for variable value of type integer/);
	});

	it("propagates nested uniform constraints", () => {
		const expression = new Affinirum("['child':['a':value]]", {
			type: Type.objectType(type),
		});
		expect(expression.variables().value.equals(Type.Integer)).toBe(true);
		expect(expression.evaluate({ value: 3n })).toEqual({ child: { a: 3n } });
		expect(() => new Affinirum("['child':['a':'bad']]", {
			type: Type.objectType(type),
		})).toThrow(/mismatch with expected type/);
	});

	it("narrows uniform union alternatives using known values", () => {
		const expression = new Affinirum("['a':1,'b':value]", {
			type: Type.union(
				Type.objectType(Type.Number),
				Type.objectType(Type.String),
			),
		});
		expect(expression.variables().value.equals(Type.Number)).toBe(true);
		expect(expression.evaluate({ value: 2.5 })).toEqual({ a: 1n, b: 2.5 });
	});

	it("uses uniform constraints when compiling casts", () => {
		expect(() => new Affinirum("['a':'bad']::[...:integer]")).toThrow(/cannot cast type/);
		const expression = new Affinirum("value::[...:string]", { variables: { value: type } });
		expect(expression.evaluate({ value: {} })).toEqual({});
		expect(() => expression.evaluate({ value: { a: 1n } })).toThrow(/cannot cast value/);
	});
});
