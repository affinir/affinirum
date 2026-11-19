import { Affinirum, Type } from "../../src/index.js";

describe("Compiled type test", () => {
	([
		["null", "null"],
		["val x: null = null; x", "null"],
		["val x: null | integer = 1; x", "null|integer"],
		["val x: integer | null = null; x", "null|integer"],
		["val x: [null] = [null]; x", "[null]"],
		["null::null", "null"],
		["true", "boolean"],
		["false", "boolean"],
		["0", "integer"],
		["-0", "integer"],
		["142.4", "float"],
		["-0.4", "float"],
		["@2020-01-02 11:10:10.200Z", "timestamp"],
		["00", "integer"],
		["-00", "integer"],
		["-020", "integer"],
		["5.5.Integer", "integer"],
		["6.Float", "float"],
		["1.Boolean", "boolean"],
		["true.Integer", "integer"],
		["@1970-01-01T00:00:00.001Z.Float", "float"],
		["``", "buffer"],
		["`0`", "buffer"],
		["`  aabb cc  \n dd`", "buffer"],
		["`01ff`", "buffer"],
		["\"\"", "string"],
		["''", "string"],
		["\" \"", "string"],
		["\"	\"", "string"],
		["[]", "[]"],
		["[:]", "[:]"],
		["[0]", "[integer]"],
		["val x=[];x", "[]"],
		["val y=[1];y", "[integer]"],
		["val x=[:];x", "[:]"],
		["val y=['a':5];y", "[\"a\":integer]"],
		["val a:[...float]=[];a", "[...float]"],
		["val a:[float]=[1.0,'extra'];a", "[float]"],
		["val o:[:float]=[:];o", "[:float]"],
		["val o:[:string]=['a':'text'];o", "[:string]"],
		["[0,1,2,3]", "[integer,integer,integer,integer]"],
		["[\"0\",1,2,\"3\"]", "[string,integer,integer,string]"],
		["[\"a\":100,\"b\":\"100\"]", "[\"a\":integer,\"b\":string]"],
		["{=  ():null -> null}", "{=():null}"],
		["{=() -> null}", "{=():any}"],
		["val f:{=():}={=() -> 7};f", "{=():any}"],
		["{= (i:float):boolean -> i==0}", "{=(float):boolean}"],
		["val f:{=(integer):string}|null;f", "null|{=(integer):string}"],
		["{=(f:{=(integer):string|null}) -> }", "{=({=(integer):null|string}):any}"],
		["{=():string? -> null}", "{=():null|string}"],
		["{=():string|null -> null}", "{=():null|string}"],
		["{=():[...string|null] -> [null,'text']}", "{=():[...null|string]}"],
		["{= (x:string, y:...string):[...string] -> y+[x]}", "{=(string,...string):[...string]}"],
		["{= (x:integer, y:...integer):integer -> ([x]+y).Length}", "{=(integer,...integer):integer}"],
		["var a:[integer, integer] = [0,1];a", "[integer,integer]"],
		["val a:[[integer,integer],[integer,integer]] = [[0,1],[2,3]];a", "[[integer,integer],[integer,integer]]"],
		["var o:['a':integer,'b':string] = ['a':0,'b':'1'];o", "[\"a\":integer,\"b\":string]"],
		["val o:['a':['c':integer],'b':string] = ['a':['c':0],'b':'1'];o", "[\"a\":[\"c\":integer],\"b\":string]"],
	] as [string, string][]).forEach(([expr, expected]) => {
		it(`parses expression ${expr} and determines value type`, () => {
			const script = new Affinirum(expr);
			expect(script.type.toString()).toBe(expected);
		});
	});
	it.each<[string, Type, string]>([
		["val x:[]|[...any]=[1];x", Type.Array, "[]"],
		["val x:[:]|[:any]=['a':1];x", Type.Object, "[:]"],
	])("normalizes collection type aliases in %s", (source, expected, formatted) => {
		const { type } = new Affinirum(source);
		expect(type.equals(expected)).toBe(true);
		expect(type.toString()).toBe(formatted);
	});
	it.each([
		"[...]",
		"[...:]",
		"val x:[...]=[];x",
		"val x:[...:]=[:];x",
		"val x:[...:string]=[:];x",
	])("rejects removed collection syntax in %s", (source) => {
		expect(() => new Affinirum(source)).toThrow();
	});
	it.each(["function", "{=}"])("uses the generic function type for %s", (annotation) => {
		const script = new Affinirum(`val f:${annotation}={=() -> 1};f`);
		expect(script.type.equals(Type.Function)).toBe(true);
		expect(script.type.toString()).toBe("{=}");
	});
	it.each(["a\"b", "a\\b", "a\\\"b", "trailing\\"])("round-trips the record key %s", (key) => {
		const type = Type.objectType([[key, Type.String]]);
		const expression = new Affinirum(`value::${type}`, { variables: { value: Type.Any } });
		expect(expression.type.equals(type)).toBe(true);
	});
	it("parses unions after composite and grouped types", () => {
		const script = new Affinirum("{=(value:(float|string)|[...float|string]|['a':integer]|{=():integer}|boolean):(null|[...float|string]|float|string) -> null}");
		const valueType = Type.union(Type.Float, Type.String);
		const arrayType = Type.arrayType(valueType);
		const type = Type.functionType([
			[Type.union(Type.Null, arrayType, valueType), [Type.union(valueType, arrayType, Type.objectType([["a", Type.Integer]]), Type.functionType([[Type.Integer, []]]), Type.Boolean)]],
		]);
		expect(script.type.equals(type)).toBe(true);
	});
	it("round-trips unions at each level of a nested function type", () => {
		const inner = Type.functionType([[Type.OptionalString, [Type.Integer]]]);
		const outer = Type.functionType([[Type.union(inner, Type.Boolean), [Type.Function]]]);
		const type = outer.toOptional();
		const reparsed = new Affinirum(`val f:${type.toString()};f`).type;
		expect(reparsed.equals(type)).toBe(true);
	});
	it.each([
		"{=():any -> 1",
		"{=() -> null",
		"val f:{=():integer={=():integer -> 1};f",
		"val f:{=():any|null;f",
	])("requires a closing brace in %s", (source) => {
		expect(() => new Affinirum(source)).toThrow(/missing closing braces/);
	});
	it.each<[string, RegExp]>([
		["val f:{=(array,...):}|null;f", /missing type name/],
		["val f:{=(...):integer}|null;f", /missing type name/],
		["{=(value:) -> value}", /missing type name/],
		["val f:{=()}|null;f", /missing colon separator/],
		["val f:{=(integer)}|null;f", /missing colon separator/],
	])("rejects a malformed type annotation in %s", (source, error) => {
		expect(() => new Affinirum(source)).toThrow(error);
	});
	it.each<[string, Type]>([
		[":integer", Type.Integer],
		["", Type.Any],
	])("parses a function body and early return with annotation %s", (annotation, returnType) => {
		const expression = new Affinirum(`{=(a:integer)${annotation} -> if a<0{->0};val doubled=a*2;doubled}`);
		expect(expression.type.equals(Type.functionType([[returnType, [Type.Integer]]]))).toBe(true);
		const double = expression.evaluate() as (value: bigint) => bigint;
		expect(double(-1n)).toBe(0n);
		expect(double(3n)).toBe(6n);
	});
	it.each(["{=() ->}", "{=():null ->}"])("allows an empty function body in %s", (source) => {
		const empty = new Affinirum(source).evaluate() as () => unknown;
		expect(empty()).toBeUndefined();
	});
	it.each<[string, RegExp]>([
		["{=():integer}{1}", /missing function body separator/],
		["{=(): -> 1}", /missing type name/],
	])("rejects an invalid function header in %s", (source, error) => {
		expect(() => new Affinirum(source)).toThrow(error);
	});
	it.each(["{:}", "{(integer):integer}"])("rejects the removed function type %s", (annotation) => {
		expect(() => new Affinirum(`value::${annotation}`, { variables: { value: Type.Any } }))
			.toThrow(/missing function marker/);
	});
	it.each(["{() -> 1}", "{(a:integer):integer -> a}"])("requires the function marker in %s", (source) => {
		expect(() => new Affinirum(source)).toThrow();
	});
	it("rejects a generic function type in expression position", () => {
		expect(() => new Affinirum("{=}")).toThrow();
	});
	it("parses pure constant expression and tests return type", () => {
		const script = new Affinirum("(\"ABC\" + Timestamp.Parse(\"2000-01-01\").Format('YY')).Length");
		expect(script.type.equals(Type.Integer)).toBe(true);
	});
	it.each([
		"val a:[float]=[];a",
		"val a:[integer,integer]=[1];a",
		"val x:[]=[]; val y:[integer]=x; y",
		"({=(a:[integer,integer]):integer -> 0})([1])",
		"val o:['a':integer]=[:];o",
	])("rejects missing required entries in %s", (script) => {
		expect(() => new Affinirum(script)).toThrow();
	});
	it("accepts a missing optional tuple item", () => {
		expect(new Affinirum("val a:[integer,string?]=[1];a").evaluate()).toEqual([1n]);
	});
	it.each<[string, Type]>([
		["integer?", Type.OptionalInteger],
		["[]?", Type.OptionalArray],
		["[:]?", Type.OptionalObject],
		["{=}?", Type.OptionalFunction],
		["(integer|string)?", Type.union(Type.Integer, Type.String, Type.Null)],
		["[...integer]?", Type.arrayType(Type.Integer).toOptional()],
		["[:string]?", Type.objectType(Type.String).toOptional()],
		["[integer,string]?", Type.arrayType([Type.Integer, Type.String]).toOptional()],
		["[\"a\":string]?", Type.objectType([["a", Type.String]]).toOptional()],
		["{=():integer}?", Type.functionType([[Type.Integer, []]]).toOptional()],
		["{=():integer?}", Type.functionType([[Type.OptionalInteger, []]])],
		["integer|[]?", Type.union(Type.Integer, Type.OptionalArray)],
		["any?", Type.Any],
	])("parses optional types in %s", (annotation, expected) => {
		const expression = new Affinirum(`value::${annotation}`, { variables: { value: Type.Any } });
		expect(expression.type.equals(expected)).toBe(true);
	});
	it.each(["[]?", "[:]?", "{=}?", "(integer|string)?"])("accepts null for %s", (annotation) => {
		expect(new Affinirum(`val value:${annotation}=null;value`).evaluate()).toBeUndefined();
	});
	it.each(["null?", "never?", "(null)?", "(never)?"])("rejects the invalid optional type %s", (annotation) => {
		expect(() => new Affinirum(`value::${annotation}`)).toThrow(/optional suffix is invalid/);
	});
	it("rejects an empty block for a function declared to return integer", () => {
		expect(() => new Affinirum("val f={=():integer -> }; f()"))
			.toThrow(/type null mismatch with expected type integer/);
	});
	it.each(["7", "->7", "['a':7]", "->['a':7]"])("rejects %s as the result of a function returning null", (body) => {
		expect(() => new Affinirum(`({=():null -> ${body}})()`))
			.toThrow(/mismatch with expected type null/);
	});
	it.each(["null", "->null"])("accepts %s as the result of a function returning null", (body) => {
		expect(new Affinirum(`({=():null -> ${body}})()`).evaluate()).toBeUndefined();
	});
	it("infers float when adding an integer and a float", () => {
		const script = new Affinirum("a + b", { variables: { a: Type.Integer, b: Type.Float } });
		expect(script.type.equals(Type.Float)).toBe(true);
	});
	it("parses expression and tests undefined variable types", () => {
		const script = new Affinirum("(a*b)*c.prop/d.UpperCase.Length-100");
		const variables = script.variables();
		expect(variables.a.equals(Type.Number)).toBe(true);
		expect(variables.b.equals(Type.Number)).toBe(true);
		expect(variables.d.isString).toBe(true);
	});
	it.each([
		"['a':1,'a':2]",
		"['a':1,(''+'a'):2]",
		"[...'a':1,'a':2]",
	])("rejects duplicate object keys in %s", (source) => {
		expect(() => new Affinirum(source)).toThrow(/duplicate object key/);
	});
});

describe("Function overload types", () => {
	const first = Type.functionType([[Type.String, [Type.Integer]]]);
	const second = Type.functionType([[Type.Integer, [Type.String]]]);
	const overloaded = Type.functionType([
		[Type.String, [Type.Integer]],
		[Type.Integer, [Type.String]],
	]);

	it.each([
		"{=(integer):string}&{=(string):integer}|null",
		"null|{=(integer):string}&{=(string):integer}",
		"({=(integer):string}&{=(string):integer})?",
	])("parses overload and union precedence in %s", (annotation) => {
		const expression = new Affinirum(`value::${annotation}`, { variables: { value: Type.Any } });
		expect(expression.type.equals(overloaded.toOptional())).toBe(true);
	});

	it("binds an overload to the adjacent union member", () => {
		const expression = new Affinirum("value::{=(integer):string}|{=(string):integer}&{=():boolean}", {
			variables: { value: Type.Any },
		});
		const expected = Type.union(first, Type.functionType([
			[Type.Integer, [Type.String]],
			[Type.Boolean, []],
		]));
		expect(expression.type.equals(expected)).toBe(true);
	});

	it("merges signatures from a grouped overload", () => {
		const expression = new Affinirum("value::({=(integer):string}&{=(string):integer})&{=():boolean}", {
			variables: { value: Type.Any },
		});
		const expected = Type.functionType([
			[Type.String, [Type.Integer]],
			[Type.Integer, [Type.String]],
			[Type.Boolean, []],
		]);
		expect(expression.type.equals(expected)).toBe(true);
	});

	it.each([
		overloaded,
		Type.functionType([[overloaded.toOptional(), [Type.arrayType(overloaded)]]]).toOptional(),
		Type.functionType([
			[Type.Any, [], true],
			[Type.Integer, [Type.Integer]],
			[Type.String, [Type.arrayType(Type.String)], true],
		]),
	])("round-trips the formatted overload type %s", (type) => {
		const expression = new Affinirum(`value::${type}`, { variables: { value: Type.Any } });
		expect(expression.type.equals(type)).toBe(true);
	});

	it("calls each parsed overload through a declared variable", () => {
		const expression = new Affinirum("val f:{=(integer):string}&{=(string):integer}=host;[f(1),f('text')]", {
			variables: { host: overloaded },
		});
		expect(expression.evaluate({
			host: (value: unknown) => typeof value === "bigint" ? "text" : 1n,
		})).toEqual(["text", 1n]);
	});

	it.each([
		"{=}&integer",
		"{=}&{=}?",
		"{=}?&{=}",
		`(${first}|${second})&{=}`,
	])("rejects a non-function overload operand in %s", (annotation) => {
		expect(() => new Affinirum(`value::${annotation}`, { variables: { value: Type.Any } })).toThrow();
	});
});
