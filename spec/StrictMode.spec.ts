import { Affinirum, Type } from "../src/index.js";

describe("Strict Mode test", ()=> {
	it("defines variables in strict mode and evaluates", ()=> {
		const script = new Affinirum("predefined1*2 + predefined2 + 26 * 13",
			{ strict: true, variables: { predefined1: Type.Integer, predefined2: Type.Integer, myvar: Type.String } });
		expect(script.evaluate({ predefined1: 10n, predefined2: 20n }) as bigint).toBe(378n);
	});
	it("errors on undefines variables in strict mode", ()=> {
		try {
			new Affinirum("undefined1*2 + undefined2", { strict: true, variables: { defined: Type.Real } });
		}
		catch (err: any) {
			expect(err.message).toContain("error");
			expect(err.message).toContain("undefined1");
		}
	});
});
