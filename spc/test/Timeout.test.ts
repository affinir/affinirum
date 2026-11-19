import { jest } from "@jest/globals";
import { Affinirum, Type } from "../../src/index.js";

describe("Execution timeout", () => {
	const variables = { advance: Type.functionType([[Type.Integer, []]]) };
	const advance = () => {
		jest.setSystemTime(11);
		return 7n;
	};
	const factory = "val make={=():{=():integer} -> {=():integer -> 7}};";

	beforeEach(() => {
		jest.useFakeTimers({ now: 0 });
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("checks the next loop condition against the outer evaluation's deadline", () => {
		const inner = new Affinirum("1", { timeout: 100 });
		const outer = new Affinirum("while condition(){next}", {
			timeout: 10,
			variables: { condition: Type.functionType([[Type.Boolean, []]]) },
		});
		let conditions = 0;
		const condition = () => {
			inner.evaluate();
			advance();
			return ++conditions === 1;
		};
		expect(() => outer.evaluate({ condition })).toThrow("execution timeout");
		expect(conditions).toBe(1);
		expect(new Affinirum("while false{0};1").evaluate()).toBe(1n);
	});

	it("checks the shared deadline when invoking a script function from a child frame", () => {
		const expression = new Affinirum(factory + "val run=make();advance();run()", { timeout: 10, variables });
		expect(() => expression.evaluate({ advance })).toThrow("execution timeout");
	});

	it("ends the deadline for a closure returned by evaluate", () => {
		const expression = new Affinirum(factory + "make()", { timeout: 10 });
		const run = expression.evaluate() as () => bigint;
		advance();
		expect(run()).toBe(7n);
	});

	it.each(["advance()", "=>advance()"])("returns a late result from %s", (script) => {
		const expression = new Affinirum(script, { timeout: 10, variables });
		expect(expression.evaluate({ advance })).toBe(7n);
	});
});
