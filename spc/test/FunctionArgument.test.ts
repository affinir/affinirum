import { Affinirum, Type } from "../../src/index.js";

describe("Function argument test", () => {
	it("parses and evaluates full script", () => {
		const script = new Affinirum(`
val cnum = 1000 + myvr;
val cint = 01000;
val cstr = "thestring";
var $vnum = cnum + cstr.Length;
var #vnum = $vnum + 1;
var vint = if myvr > 1000 {cint + cnum} else {cint - cnum};
var vstr = cstr + cnum.Format; // test comment
val carr1 = [1, 2, 3, 4];
var varr2 = [5, 6, 7, 8] + carr1;
val cobj = [ "a": 1, "b": 2 ];
var vobj = Object.Merge([ "x": 3, "abcdef": 4 ], cobj);
val cfunc = ~ (x: integer, y: integer, z: integer) : string {
  (x + y + z + cnum + vint + #vnum).Format;
};
var vfunc = ~ (f: ~(integer, integer, integer):(string)):string /// tetsstts /// {
  f(1, 2, (cobj."a"::integer) + (vobj."b"::integer))
};
vfunc(cfunc)
		`);
		expect(script.evaluate({ myvr: 100 }) as string).toBe("2116.0");
	});
	it("restores function arguments across recursive calls", () => {
		const script = new Affinirum("val f=~(n:integer):integer{if n<=1{1}else{f(n-1)*n}};f(5)");
		expect(script.evaluate() as bigint).toBe(120n);
	});
	it("restores block-local variables across recursive calls", () => {
		const script = new Affinirum("val f=~(n:integer):integer{if n<=1{1}else{val x=n;f(n-1)*x}};f(5)");
		expect(script.evaluate() as bigint).toBe(120n);
	});
	it.each([
		"~(n,n){n}",
		"~(n:integer,m:integer,n:integer):integer{n}",
	])("rejects duplicate function arguments in %s", (definition) => {
		expect(() => new Affinirum(definition)).toThrow(/duplicate function argument name n/);
	});
	it("allows separate functions to reuse the same argument name", () => {
		const script = new Affinirum("val first=~(n:integer):integer{n};val second=~(n:integer):integer{n+1};[first(1),second(2)]");
		expect<unknown>(script.evaluate()).toEqual([1n, 3n]);
	});
	it("checks different uses of an untyped parameter", () => {
		const expression = new Affinirum("~(x):float|integer{val first=x-1;x='two';first+x.Length}");
		expect(expression.type.equate(Type.functionType([[Type.Number, [Type.Unknown]]]))).toBe(true);
		const func = expression.evaluate() as (value: bigint | number) => bigint | number;
		expect(func(4n)).toBe(6n);
		expect(func(4)).toBe(6);
	});

	it("uses the declared variadic signature after a later assignment", () => {
		const expression = new Affinirum("var f:~(...[integer]):integer=~(items:...[integer]):integer{0};f=~(items:...[integer]):integer{Integer.Sum(items)};f(1,2)");
		expect(expression.type.equate(Type.Integer)).toBe(true);
		expect(expression.evaluate()).toBe(3n);
	});

	it("does not combine arguments from separate overloads", () => {
		const type = Type.functionType([
			[Type.Integer, [Type.Integer, Type.String]],
			[Type.Integer, [Type.String, Type.Integer]],
		]);
		expect(() => new Affinirum("f(1,1)", { variables: { f: type } }))
			.toThrow(/cannot be called with 2 argument/);
		expect(() => new Affinirum("f(1,\"x\")", { variables: { f: type } })).not.toThrow();
		expect(() => new Affinirum("f(\"x\",1)", { variables: { f: type } })).not.toThrow();
	});

	it("requires the static arguments to match one complete overload", () => {
		const type = Type.functionType([
			[Type.Integer, [Type.Integer, Type.String]],
			[Type.Integer, [Type.String, Type.Integer]],
		]);
		const arg = Type.union(Type.Integer, Type.String);
		expect(() => new Affinirum("f(x,y)", { variables: { f: type, x: arg, y: arg } }))
			.toThrow(/cannot be called with 2 argument/);
	});

	it.each(["x + y", "x.Add(y)"])("requires compatible operand types in %s", (script) => {
		const arg = Type.union(Type.Integer, Type.String);
		expect(() => new Affinirum(script, { variables: { x: arg, y: arg } })).toThrow(/cannot be called/);
		const expression = new Affinirum(script, { variables: { x: Type.String, y: Type.String } });
		expect(expression.evaluate({ x: "one", y: "two" })).toBe("onetwo");
	});

	it.each(["Float.Abs(x)", "val abs=Float.Abs;abs(x)"])("uses the same argument checks for %s", (script) => {
		expect(() => new Affinirum(script, { variables: { x: Type.OptionalInteger } })).toThrow(/cannot be called/);
		const expression = new Affinirum(script, { variables: { x: Type.Integer } });
		expect(expression.evaluate({ x: -2n })).toBe(2);
	});

	it.each([
		"~(s:string):string{s.UpperCase}",
		"~(a:integer,b:integer):integer{a+b}",
		"2",
		"null",
	])("requires the call to match both functions in a union with %s", (alternative) => {
		const script = `val f=if flag{~(n:integer):integer{n}}else{${alternative}};f(1)`;
		expect(() => new Affinirum(script)).toThrow(/cannot be called with 1 argument/);
	});

	it("matches one signature per callable when a union includes an overloaded function", () => {
		const overloaded = Type.functionType([
			[Type.Integer, [Type.Integer]],
			[Type.String, [Type.String]],
		]);
		const config = { variables: { overloaded } };
		const script = "val f=if flag{overloaded}else{~(n:integer):string{n.Format}};";
		const expression = new Affinirum(script + "f(1)", config);
		expect(expression.type.equate(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate({ flag: true, overloaded: (value: bigint | string) => value })).toBe(1n);
		expect(expression.evaluate({ flag: false, overloaded: (value: bigint | string) => value })).toBe("1");
		expect(() => new Affinirum(script + "f('two')", config)).toThrow(/cannot be called with 1 argument/);
	});

	it("checks the static arguments against each callable type in a union", () => {
		const integer = Type.functionType([[Type.Integer, [Type.Integer]]]);
		const either = Type.functionType([[Type.Integer, [Type.union(Type.Integer, Type.String)]]]);
		expect(() => new Affinirum("(if flag {f} else {g})(x)", {
			variables: { flag: Type.Boolean, f: integer, g: either, x: Type.union(Type.Integer, Type.String) },
		})).toThrow(/cannot be called/);
	});

	it.each([
		"var f=overloaded;f=~(n:integer):integer{n}",
		"var f=[overloaded];f[0]=~(n:integer):integer{n}",
		"var f=[overloaded];f=[~(n:integer):integer{n}]",
		"var f=['a':overloaded];f=['a':~(n:integer):integer{n}]",
	])("rejects replacing an overloaded callable with a single signature in %s", (script) => {
		const overloaded = Type.functionType([
			[Type.Integer, [Type.Integer]],
			[Type.String, [Type.String]],
		]);
		expect(() => new Affinirum(script, { variables: { overloaded } })).toThrow(/mismatch with expected type/);
	});

	it.each([false, true])("revalidates compiled arguments with variadic=%s", (variadic) => {
		const type = Type.functionType([
			[Type.Integer, [Type.Integer, variadic ? Type.arrayType([Type.String]) : Type.String], variadic],
			[Type.Integer, [Type.String, variadic ? Type.arrayType([Type.Integer]) : Type.Integer], variadic],
		]);
		const call = variadic ? "f(x=1,y=1,y=1)" : "f(x=1,y=1)";
		expect(() => new Affinirum(`var x:integer|string=0;var y:integer|string=0;${call}`, { variables: { f: type } }))
			.toThrow(new RegExp(`cannot be called with ${variadic ? 3 : 2} argument`));
		const expression = new Affinirum("var x:integer|string=0;f(x=1,x='two')", { variables: { f: type } });
		expect(expression.evaluate({ f: (value: bigint | string) => typeof value === "bigint" ? value : BigInt(value.length) }))
			.toBe(1n);
	});

	it("infers an implicit input passed through an argument block", () => {
		const expression = new Affinirum("val f=~(n:integer):integer{n};f({x})");
		expect(expression.variables().x.equate(Type.Integer)).toBe(true);
		expect(expression.evaluate({ x: 1n })).toBe(1n);
	});

	it.each(["{x}", "if choose{x}else{1}", "{val y=x;y}"])("checks the compiled argument type of %s", (argument) => {
		expect(() => new Affinirum(`val f=~(n:integer):integer{n};f(${argument})`, {
			variables: { x: Type.union(Type.Integer, Type.String), choose: Type.Boolean },
		})).toThrow(/cannot be called/);
	});

	it.each<[string, Type]>([
		["[x]", Type.arrayType([Type.Integer])],
		["['n':x]", Type.objectType([["n", Type.Integer]])],
	])("infers an implicit input in %s and checks a declared union at compile time", (argument, type) => {
		const f = Type.functionType([[Type.Integer, [type]]]);
		const expression = new Affinirum(`f(${argument})`, { variables: { f } });
		expect(expression.variables().x.equate(Type.Integer)).toBe(true);
		expect(expression.evaluate({ x: 1n, f: () => 1n })).toBe(1n);
		expect(() => new Affinirum(`f(${argument})`, {
			variables: { f, x: Type.union(Type.Integer, Type.String) },
		})).toThrow(/cannot be called/);
	});

	it("uses the compiled index type to narrow the next argument expectation", () => {
		const type = Type.functionType([
			[Type.Integer, [Type.Integer, Type.arrayType([Type.Integer])]],
			[Type.String, [Type.String, Type.arrayType([Type.String])]],
		]);
		const expression = new Affinirum("var a:[string]=['two'];f(a[0]::string,[value])", { variables: { f: type } });
		expect(expression.variables().value.equate(Type.String)).toBe(true);
		expect(expression.type.equate(Type.String)).toBe(true);
		expect(expression.evaluate({
			f: (first: string, values: string[]) => first + values[0],
			value: "!",
		})).toBe("two!");
	});

	it("preserves the possible result types for a dynamic argument", () => {
		const f = Type.functionType([
			[Type.Integer, [Type.Integer]],
			[Type.String, [Type.String]],
		]);
		const union = Type.union(Type.Integer, Type.String);
		const expression = new Affinirum("f(x)", { variables: { f, x: Type.Unknown } });
		expect(expression.variables().x.equate(Type.Unknown)).toBe(true);
		expect(expression.type.equate(union)).toBe(true);
		expect(() => new Affinirum("f(x)", { type: Type.Integer, variables: { f, x: Type.Unknown } }))
			.toThrow(/type integer\|string mismatch with expected type integer/);
	});

	it("uses the first complete overload for typed arguments", () => {
		const f = Type.functionType([
			[Type.Integer, [Type.Integer]],
			[Type.Number, [Type.Number]],
		]);
		const expression = new Affinirum("f(x)", { variables: { f, x: Type.Integer } });
		expect(expression.type.equate(Type.Integer)).toBe(true);
		expect(expression.evaluate({ f: (value: bigint) => value, x: 1n })).toBe(1n);
	});

	it("retains array overloads until the next argument is compiled", () => {
		const type = Type.functionType([
			[Type.Integer, [Type.arrayType([Type.Integer]), Type.Integer]],
			[Type.String, [Type.arrayType([Type.String]), Type.String]],
		]);
		const expression = new Affinirum("var a:[string]=['two'];f([value],a[0]::string)", { variables: { f: type } });
		expect(expression.type.equate(Type.String)).toBe(true);
		expect(expression.evaluate({
			f: (values: string[], last: string) => values[0] + last,
			value: "one",
		})).toBe("onetwo");
	});

	it.each([false, true])("resolves a complete overload at compile time with variadic=%s", (variadic) => {
		const type = Type.functionType([
			[Type.Integer, [variadic ? Type.arrayType([Type.Integer]) : Type.Integer], variadic],
			[Type.String, [variadic ? Type.arrayType([Type.String]) : Type.String], variadic],
		]);
		const f = (value: bigint | string) => value;
		const expression = new Affinirum("var x:integer|string=0;f(x=1)", { variables: { f: type } });
		expect(expression.type.equate(Type.Integer)).toBe(true);
		expect(expression.evaluate({ f })).toBe(1n);
		const union = Type.union(Type.Integer, Type.String);
		expect(() => new Affinirum("f(value)", { variables: { f: type, value: union } })).toThrow(/cannot be called/);
		if (variadic) {
			expect(() => new Affinirum("var x:integer|string=0;f(x=1,x='two')", { variables: { f: type } }))
				.toThrow(/cannot be called with 2 argument/);
		}
	});

	it("rejects a callback with a narrower argument type", () => {
		expect(() => new Affinirum(`
val use = ~(f: ~(float | integer):integer):integer { f(1.5) };
use(~(x:integer):integer { x })
		`)).toThrow(/cannot be called with 1 argument/);
	});
	it.each<[string, RegExp]>([
		["[1].Derive(~(value:integer):integer{'bad'})", /type string mismatch with expected type integer/],
		["['a'].Compose(~(acc:object,key:string):string{key.Char(0)})", /type void\|string mismatch with expected type string/],
		["[1,2].Reduce(~(a:integer,b:integer):float{a.Subtract(b)})", /type integer mismatch with expected type float/],
	])("rejects a callback whose body does not match its declared return type in %s", (script, error) => {
		expect(() => new Affinirum(script)).toThrow(error);
	});
	it("accepts optional callback results", () => {
		const script = new Affinirum("['','a'].Derive(~(key:string):string?{if key.Length>0 {key.Char(0)} else {null}})");
		expect(script.evaluate()).toEqual([undefined, "a"]);
	});
});
