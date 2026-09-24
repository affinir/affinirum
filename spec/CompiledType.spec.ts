import { Affinirum, Type } from "../src/index.js";

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
		["[]", "array"],
		["[:]", "object"],
		["[0]", "[integer]"],
		["[0,1,2,3]", "[integer,integer,integer,integer]"],
		["[\"0\",1,2,\"3\"]", "[string,integer,integer,string]"],
		["[\"a\":100,\"b\":\"100\"]", "[\"a\":integer,\"b\":string]"],
		["~  ():void{null}", "~():void"],
		["~(){25+45}", "~():??"],
		["~(){null}", "~():??"],
		["~ (arg: float|string):void|float|string {null}", "~(float|string):void|float|string"],
		["~ (arg: [float|string]):void|[float|string]{null}", "~([float|string]):void|[float|string]"],
		["~ (i:float):boolean{i==0}", "~(float):boolean"],
		["~ (x:string, y:...[string]):string{y.Append(x); y.Join()}", "~(string,...[string]):string"],
		["~ (x:integer, y:...[integer]):integer{y.Prepend(x); y.Length}", "~(integer,...[integer]):integer"],
		["var a:[integer, integer] = [0,1];a", "[integer,integer]"],
		["val a:[[integer,integer],[integer,integer]] = [[0,1],[2,3]];a", "[[integer,integer],[integer,integer]]"],
		["var o:['a':integer,'b':string] = ['a':0,'b':'1'];o", "[\"a\":integer,\"b\":string]"],
		["val o:['a':['c':integer],'b':string] = ['a':['c':0],'b':'1'];o", "[\"a\":[\"c\":integer],\"b\":string]"],
	] as [string, string][]).forEach(([expr, expected]) => {
		it(`parses expression ${expr} and determines value type`, () => {
			try {
				const script = new Affinirum(expr);
				script.evaluate({});
				if (script.type.toString() !== expected) {
					fail(`value ${script.type.toString()} not matching expectation ${expected}`)
				}
			}
			catch (err) {
				fail(`parsing error\n${(err as Error).message}`);
			}
		});
	});
	it("parses pure constant expression and tests return type", () => {
		const script = new Affinirum("(\"ABC\" + Timestamp.Parse(\"2000-01-01\").Format('YY')).Length");
		expect(script.type.toString()).toBe("integer");
	});
	it("parses expression and tests undefined variable types", () => {
		const script = new Affinirum("(a*b)*c.prop/d.UpperCase.Length-100");
		const variables = script.variables();
		expect(variables.a.equate(Type.Number)).toBeTrue();
		expect(variables.b.equate(Type.Number)).toBeTrue();
		expect(variables.d.isString).toBeTrue();
	});
	it("uses the last duplicate object key for its value and type", () => {
		const script = new Affinirum("[\"a\":1,\"a\":\"two\"]");
		const value = script.evaluate({}) as { a: string };
		expect(script.type.equate(Type.objectType([["a", Type.String]]))).toBeTrue();
		expect(value.a).toBe("two");
	});
});
