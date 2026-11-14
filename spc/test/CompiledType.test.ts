import { Affinirum, Type } from "../../src/index.js";

describe("Compiled type test", () => {
	([
		["null", "void"],
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
		["val o:[...:float]=[:];o", "[...:float]"],
		["[0,1,2,3]", "[integer,integer,integer,integer]"],
		["[\"0\",1,2,\"3\"]", "[string,integer,integer,string]"],
		["[\"a\":100,\"b\":\"100\"]", "[\"a\":integer,\"b\":string]"],
		["~  ():void{null}", "~():void"],
		["~(){25+45}", "~():??"],
		["~(){null}", "~():??"],
		["~ (i:float):boolean{i==0}", "~(float):boolean"],
		["~ (x:string, y:...string):[...string]{y+[x]}", "~(string,...string):[...string]"],
		["~ (x:integer, y:...integer):integer{([x]+y).Length}", "~(integer,...integer):integer"],
		["var a:[integer, integer] = [0,1];a", "[integer,integer]"],
		["val a:[[integer,integer],[integer,integer]] = [[0,1],[2,3]];a", "[[integer,integer],[integer,integer]]"],
		["var o:['a':integer,'b':string] = ['a':0,'b':'1'];o", "[\"a\":integer,\"b\":string]"],
		["val o:['a':['c':integer],'b':string] = ['a':['c':0],'b':'1'];o", "[\"a\":[\"c\":integer],\"b\":string]"],
	] as [string, string][]).forEach(([expr, expected]) => {
		it(`parses expression ${expr} and determines value type`, () => {
			const script = new Affinirum(expr);
			script.evaluate({});
			expect(script.type.toString()).toBe(expected);
		});
	});
	it("parses unions after composite and grouped types", () => {
		const script = new Affinirum("~(value:(float|string)|[...float|string]|['a':integer]|(~():integer)|boolean):(void|[...float|string])|float|string{null}");
		const valueType = Type.union(Type.Float, Type.String);
		const arrayType = Type.arrayType(valueType);
		const type = Type.functionType([
			[Type.union(Type.Void, arrayType, valueType), [Type.union(valueType, arrayType, Type.objectType([["a", Type.Integer]]), Type.functionType([[Type.Integer, []]]), Type.Boolean)]],
		]);
		expect(script.type.equals(type)).toBe(true);
	});
	it("parses pure constant expression and tests return type", () => {
		const script = new Affinirum("(\"ABC\" + Timestamp.Parse(\"2000-01-01\").Format('YY')).Length");
		expect(script.type.toString()).toBe("integer");
	});
	it.each([
		"val a:[float]=[];a",
		"val a:[integer,integer]=[1];a",
		"(~(a:[integer,integer]):integer{0})([1])",
		"val o:['a':integer]=[:];o",
	])("rejects missing required entries in %s", (script) => {
		expect(() => new Affinirum(script)).toThrow();
	});
	it("accepts a missing optional tuple item", () => {
		expect(new Affinirum("val a:[integer,string?]=[1];a").evaluate()).toEqual([1n]);
	});
	it("rejects an empty block for a function declared to return integer", () => {
		expect(() => new Affinirum("val f=~():integer {}; f()"))
			.toThrow(/type void mismatch with expected type integer/);
	});
	it.each(["7", "~>7", "['a':7]", "~>['a':7]"])("rejects %s as the result of a void function", (body) => {
		expect(() => new Affinirum(`(~():void{${body}})()`))
			.toThrow(/mismatch with expected type void/);
	});
	it.each(["null", "~>null"])("accepts %s as the result of a void function", (body) => {
		expect(new Affinirum(`(~():void{${body}})()`).evaluate()).toBeUndefined();
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
		expect(() => new Affinirum(source)).toThrow(/duplicate object key "a"/);
	});
});
