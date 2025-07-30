import { Affinirum } from "../src/index.js";
import { equate } from "../src/constant/Unknown.js";
import { formatAN } from "../src/constant/notation/AN.js";

describe("Constant Expression", ()=> {
	([
		["null", undefined],
		["false", false],
		["true", true],
		["@2020-01-02T16:10.Year", 2020n],
		["@2020-01-02T16:10:10.120Z.Year(true)", 2020n],
		["@2020-01-02T16:10:10.120.Month", 1n],
		["@2020-01-02T16:10:10.120Z.Month(true)", 1n],
		["@2000-01-02 03:04:05.999.MonthIndex", 0n],
		["@2000-01-02 03:04:05.999Z.MonthIndex(true)", 0n],
		["@2025-04-22 03:04:05.99.WeekdayIndex", 2n],
		["@2025-04-22 03:04:05.99Z.WeekdayIndex(true)", 2n],
		["@2025-04-22 03:04:05.99.Hour", 3n],
		["@2025-04-22 03:04:05.99Z.Hour(true)", 3n],
		["@2025-04-22 03:04:05.99.Minute", 4n],
		["@2025-04-22 03:04:05.99Z.Minute(true)", 4n],
		["Timestamp.Now().Year > 2000", true],
		["Timestamp.Now().Year(true) > 2000", true],
		["Float.NAN == Float.NAN", true],
		["Float.PositiveInfinity", Number.POSITIVE_INFINITY],
		["Float.NegativeInfinity", Number.NEGATIVE_INFINITY],
		["Float.Epsilon", Number.EPSILON],
		["Float.NAN.Cast", 0n],
		["Float.PositiveInfinity.Cast", 0x7FFFFFFFFFFFFFFFn],
		["Float.NegativeInfinity.Cast", -0x8000000000000000n],
		["Float.Epsilon.Cast", 0n],
		["0.5", 0.5],
		["0.434e+2", 43.4],
		["0.434e2", 43.4],
		["0.434e000002", 43.4],
		["4.1e-1", 0.41],
		["4.1e-01", 0.41],
		["0", 0n],
		["123", 123n],
		["100.Add(10)", 110n],
		["100.Multiply(10)", 1000n],
		["#0#.Format()", "00"],
		["#ffff#.Format", "ffff"],
		["#AAAA#.Format()", "aaaa"],
		["##.Format()", ""],
		["#ffff0001#.Slice(1).Format", "ff0001"],
		["\"\"", ""],
		["\"0 \"", "0 "],
		["\"0\"+\"1\"+`2`", "012"],
		["[100,200,300][1]+[1,2,3][0]", 201n],
		["[0,1,2,3].Add([10,20,30,40])[5]", 20n],
		["Array.Join([[10]], [4], [12])[0]", 10n],
		["Integer.Sum([1, 2, 3, 4].Add([5]))", 15n],
		["Integer.Sum([0,1,2,3]+[10,20,30,40],100)", 206n],
		["[[[10]]][0][0][0]", 10n],
		["var a=[0,10,200,3000,40000]; a[1] + a.At(2)", 210n],
		["[1,2,3,4].Reduce(\n~float (a:float, b : float){a.Subtract(b)}\n)", -8n],
	] as [string, any][]).forEach(([expr, expectation])=> {
		it(`compiles expression '${expr}' and tests the value`, ()=> {
			try {
				const script = new Affinirum(expr);
				expect(script).toBeDefined();
				try {
					const value = script.evaluate();
					if (!equate(value, expectation)) {
						fail(`value ${formatAN(value)} not matching expectation ${expectation}`);
					}
				}
				catch (err) {
					fail(`evaluation error\n${(err as Error).message}`);
				}
			}
			catch (err) {
				fail(`compilation error\n${(err as Error).message}`);
			}
		});
	});
});
