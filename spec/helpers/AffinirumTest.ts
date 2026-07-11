import { Affinirum, Value } from "../../src/index.js";
import { formatJSON } from "../../src/native/notation/JSON.js";

export interface AffinirumTest {
	script: string;
	cases: {
		values?: Record<string, Value>,
		result: Value
	}[];
}

export const runAffinirumTests = (tests: AffinirumTest[])=> {
	tests.forEach(({ script, cases })=> {
		const evaluation = cases.length > 1 ? ` ${cases.length} cases` : "";
		it(`compiles script '${script}' and evaluates${evaluation}`, ()=> {
			try {
				const affinirum = new Affinirum(script);
				if (!affinirum) {
					throw new Error();
				}
				const failures = cases.map(({ values, result })=> {
					try {
						const value = affinirum.evaluate(values);
						if (value !== result) {
							return `arguments ${formatJSON(values)}\nvalue ${formatJSON(value)} not matching expectation ${formatJSON(result)}`;
						}
					}
					catch (err) {
						return `arguments ${formatJSON(values)}\nevaluation error\n${(err as Error).message}`;
					}
					return undefined;
				}).filter((s)=> s != null);
				if (failures.length) {
					fail(`${failures.length}\n\n${failures.join("\n\n")}`);
				}
			}
			catch (err) {
				fail(`compilation error\n${(err as Error).message}`);
			}
		});
	});
};
