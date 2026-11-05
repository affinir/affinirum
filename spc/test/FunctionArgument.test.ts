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
  f(1, 2, cobj."a" + vobj."b")
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
		"~(n:integer,n:integer):integer{n}",
		"~(n:integer,n:string):string{n}",
		"~(n:integer,m:integer,n:integer):integer{n}",
		"~(n:integer,n:...[integer]):integer{n.Length}",
	])("rejects duplicate function arguments in %s", (definition) => {
		expect(() => new Affinirum(definition)).toThrow(/duplicate function argument name n/);
	});
	it("allows separate functions to reuse the same argument name", () => {
		const script = new Affinirum("val first=~(n:integer):integer{n};val second=~(n:integer):integer{n+1};[first(1),second(2)]");
		expect<unknown>(script.evaluate()).toEqual([1n, 3n]);
	});
	it("compares optional function argument types", () => {
		const expected = Type.functionType(
			Type.Boolean,
			[Type.Integer, Type.OptionalString],
		);

		expect(expected.accept(Type.functionType(
			Type.Boolean,
			[Type.Integer, Type.OptionalString],
		))).toBe(true);

		expect(expected.accept(Type.functionType(
			Type.Boolean,
			[Type.Integer, Type.OptionalBoolean],
		))).toBe(false);
	});

	it("checks function arguments contravariantly", () => {
		const acceptsInteger = Type.functionType(Type.Boolean, [Type.Integer]);
		const acceptsNumber = Type.functionType(Type.Boolean, [Type.Number]);

		expect(acceptsInteger.accept(acceptsNumber)).toBe(true);
		expect(acceptsNumber.accept(acceptsInteger)).toBe(false);
	});

	it("checks optional function argument ranges", () => {
		const acceptsOne = Type.functionType(Type.Boolean, [Type.Integer]);
		const acceptsOneOrTwo = Type.functionType(Type.Boolean, [Type.Integer, Type.OptionalString]);
		const requiresTwo = Type.functionType(Type.Boolean, [Type.Integer, Type.String]);

		expect(acceptsOne.accept(acceptsOneOrTwo)).toBe(true);
		expect(acceptsOneOrTwo.accept(acceptsOne)).toBe(true);
		expect(acceptsOne.accept(requiresTwo)).toBe(false);
	});

	it("does not mix fixed and variadic calling conventions", () => {
		const fixed = Type.functionType(Type.Boolean, [Type.Integer]);
		const variadic = Type.functionType(Type.Boolean, [Type.arrayType([Type.Integer])], true);

		expect(fixed.accept(variadic)).toBe(false);
		expect(variadic.accept(fixed)).toBe(false);
		expect(variadic.accept(Type.functionType(
			Type.Boolean,
			[Type.arrayType([Type.Integer])],
			true,
		))).toBe(true);
	});

	it("does not combine arguments from separate overloads", () => {
		const type = Type.union(
			Type.functionType(Type.Integer, [Type.Integer, Type.String]),
			Type.functionType(Type.Integer, [Type.String, Type.Integer]),
		);
		expect(() => new Affinirum("f(1,1)", { variables: { f: type } }))
			.toThrow(/cannot be called with 2 argument/);
		expect(() => new Affinirum("f(1,\"x\")", { variables: { f: type } })).not.toThrow();
		expect(() => new Affinirum("f(\"x\",1)", { variables: { f: type } })).not.toThrow();
	});

	it("rejects a callback with a narrower argument type", () => {
		expect(() => new Affinirum(`
val use = ~(f: ~(float | integer):integer):integer { f(1.5) };
use(~(x:integer):integer { x })
		`)).toThrow(/type ~\(integer\):integer mismatch with expected type ~\(float\|integer\):integer/);
	});
});
