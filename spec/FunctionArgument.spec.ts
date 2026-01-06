import { Affinirum } from "../src/index.js";

describe("Function Argument test", ()=> {
	it("parses and evaluates full script", ()=> {
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
val cfunc = ~string (x: integer, y: integer, z: integer) {
  (x + y + z + cnum + vint + #vnum).Format;
};
var vfunc = ~string (f: ~string(integer, integer, integer)) /// tetsstts /// {
  f(1, 2, cobj."a" + vobj."b")
};
vfunc(cfunc)
		`);
		expect(script.evaluate({ myvr: 100 }) as string).toBe("2116.0");
	});
});
