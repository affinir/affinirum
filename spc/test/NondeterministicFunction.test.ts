import { jest } from "@jest/globals";
import { Affinirum, Type, Value } from "../../src/index.js";

describe("Nondeterministic function test", () => {
	afterEach(() => {
		jest.restoreAllMocks();
		jest.useRealTimers();
	});

	it.each(["Integer.Random(100)", "Float.Random(100.0)", "String.Random(1)"])("evaluates %s independently at runtime", (source) => {
		const random = jest.spyOn(Math, "random").mockReturnValue(0.25);
		const expression = new Affinirum(`[${source},change(),${source}]`, {
			variables: { change: Type.functionType([[Type.Null, []]]) },
		});
		expect(random).not.toHaveBeenCalled();
		// Change between calls without assuming how many random draws each call uses.
		const change = () => {
			random.mockReturnValue(0.75);
			return undefined;
		};
		const [first, , second] = expression.evaluate({ change }) as Value[];
		expect(first).not.toEqual(second);
		expect(expression.evaluate({ change })).toEqual([second, undefined, second]);
	});

	it("reads the current time on each evaluation", () => {
		jest.useFakeTimers({ now: 1000 });
		const expression = new Affinirum("Timestamp.Now().EpochTime");
		expect(expression.evaluate()).toBe(1000n);
		jest.setSystemTime(2000);
		expect(expression.evaluate()).toBe(2000n);
	});
});
