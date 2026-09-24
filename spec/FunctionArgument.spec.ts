import { Affinirum, Type } from "../src/index.js";

describe("Function argument test", () => {
	it("parses and evaluates full script", () => {
		const script = new Affinirum(`
val cnum = 1000 + myvr;
val cint = 01000;
val cstr = "thestring";
var $vnum = cnum + cstr.Length;
var #vnum = $vnum + 1;
var vint = if myvr > 1000 {cint + cnum} else {cint - cnum};
var vstr = cstr + cnum; // test comment
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
	it("compares optional function argument types", () => {
		const expected = Type.functionType(
			Type.Boolean,
			[Type.Integer, Type.OptionalString],
		);

		expect(expected.accept(Type.functionType(
			Type.Boolean,
			[Type.Integer, Type.OptionalString],
		))).toBeTrue();

		expect(expected.accept(Type.functionType(
			Type.Boolean,
			[Type.Integer, Type.OptionalBoolean],
		))).toBeFalse();
	});

	it("checks function arguments contravariantly", () => {
		const acceptsInteger = Type.functionType(Type.Boolean, [Type.Integer]);
		const acceptsNumber = Type.functionType(Type.Boolean, [Type.Number]);

		expect(acceptsInteger.accept(acceptsNumber)).toBeTrue();
		expect(acceptsNumber.accept(acceptsInteger)).toBeFalse();
	});

	it("checks optional function argument ranges", () => {
		const acceptsOne = Type.functionType(Type.Boolean, [Type.Integer]);
		const acceptsOneOrTwo = Type.functionType(Type.Boolean, [Type.Integer, Type.OptionalString]);
		const requiresTwo = Type.functionType(Type.Boolean, [Type.Integer, Type.String]);

		expect(acceptsOne.accept(acceptsOneOrTwo)).toBeTrue();
		expect(acceptsOneOrTwo.accept(acceptsOne)).toBeTrue();
		expect(acceptsOne.accept(requiresTwo)).toBeFalse();
	});

	it("does not mix fixed and variadic calling conventions", () => {
		const fixed = Type.functionType(Type.Boolean, [Type.Integer]);
		const variadic = Type.functionType(Type.Boolean, [Type.arrayType([Type.Integer])], true);

		expect(fixed.accept(variadic)).toBeFalse();
		expect(variadic.accept(fixed)).toBeFalse();
		expect(variadic.accept(Type.functionType(
			Type.Boolean,
			[Type.arrayType([Type.Integer])],
			true,
		))).toBeTrue();
	});

	it("rejects a callback with a narrower argument type", () => {
		expect(() => new Affinirum(`
val use = ~(f: ~(float | integer):integer):integer { f(1.5) };
use(~(x:integer):integer { x })
		`)).toThrowError(/type ~\(integer\):integer mismatch with expected type ~\(float\|integer\):integer/);
	});
});
