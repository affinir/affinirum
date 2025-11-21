import { Affinirum } from "../src/index.js";

describe("Compiled Type test", ()=> {
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
		["5.5.Cast", "integer"],
		["6.Cast", "float"],
		["5.5.CastToInteger", "integer"],
		["6.CastToFloat", "float"],
		["``", "buffer"],
		["`0`", "buffer"],
		["`  aabb cc  \n dd`", "buffer"],
		["`01ff`", "buffer"],
		["\"\"", "string"],
		["''", "string"],
		["\" \"", "string"],
		["\"	\"", "string"],
		["[]", "array"],
		["[0]", "array"],
		["[0,1,2,3]", "array"],
		["[\"0\",1,2,\"3\"]", "array"],
		["[:]", "object"],
		["[\"a\":100,\"b\":\"100\"]", "object"],
		["~ void (){null}", "~void()"],
		["~(){25+45}", "~??()"],
		["~(){null}", "~??()"],
		["~ void|float|string (arg: float|string){null}", "~void|float|string(float|string)"],
		["~ void|[float|string] (arg: [float|string]){null}", "~void|[float|string]([float|string])"],
		["~boolean (i:float){i==0}", "~boolean(float)"],
		["~string (x:string, y:array...){y.Append(x); y.Join()}", "~string(string,array...)"],
		["~integer (x:integer, y:array...){y.Prepend(x); y.Length}", "~integer(integer,array...)"],
		["var a:[integer] = [0,1];a", "[integer]"],
		["const a:[[integer]] = [[0,1],[2,3]];a", "[[integer]]"],
		["var o:['a':integer,'b':string] = ['a':0,'b':'1'];o", "[\"a\":integer,\"b\":string]"],
		["const o:['a':['c':integer],'b':string] = ['a':['c':0],'b':'1'];o", "[\"a\":[\"c\":integer],\"b\":string]"],
	] as [string, string][]).forEach(([expr, expected])=> {
		it(`parses expression ${expr} and determines value type`, ()=> {
			try {
				const script = new Affinirum(expr);
				expect(script).toBeDefined();
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
	it("parses pure constant expression and tests return type", ()=> {
		const script = new Affinirum("(\"ABC\" + Timestamp.Parse(\"2000-01-01\").Format(1)).Length");
		expect(script.type.toString()).toBe("integer");
	});
	it("parses expression and tests undefined variable types", ()=> {
		const script = new Affinirum("(a-b)*c.prop/d.UpperCase.Length-100");
		const variables = script.variables();
		expect(variables.a.isNumeric).toBeTrue();
		expect(variables.b.isNumeric).toBeTrue();
		expect(variables.d.isString).toBeTrue();
	});
});
