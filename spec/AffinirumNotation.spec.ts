import { Affinirum } from "../src/index.js";
import { equate } from "../src/constant/Unknown.js";
import { formatAN } from "../src/constant/notation/AN.js";

describe("Affinirum Notation", ()=> {
	([
		[undefined, "null"],
		[false, "false"],
		[true, "true"],
		[0, "0.0"],
		["", "\"\""],
		["abc", "\"abc\""],
		[[], "[]"],
		[[1, 2, 3], "[1.0,2.0,3.0]"],
		[["a", "b", "c"], "[\"a\",\"b\",\"c\"]"],
		[{}, "[:]"],
		[{ a: 0, b: 1, c: 2 }, "[\"a\":0.0,\"b\":1.0,\"c\":2.0]"],
		[{ a: "a", b: "b", c: "c" }, "[\"a\":\"a\",\"b\":\"b\",\"c\":\"c\"]"],
	] as [string, any][]).forEach(([expr, expectation])=> {
		it(`formats value '${JSON.stringify(expr)}' using Affinirum Notation`, ()=> {
			try {
				const notation = Affinirum.format(expr);
				expect(notation).toBe(expectation);
			}
			catch (err) {
				fail(`format error\n${(err as Error).message}`);
			}
		});
	});
});
