import { Affinirum, Type, Value } from "../../src/index.js";

describe("Constant folding test", () => {
	it("creates fresh array literals for each function call and evaluation", () => {
		const expression = new Affinirum("val f=~():array{[]};[f(),f()]");
		const first = expression.evaluate() as Value[][];
		expect(first).toEqual([[], []]);
		expect(first[0]).not.toBe(first[1]);
		first[0].push(1n);
		expect(first[1]).toEqual([]);
		const second = expression.evaluate() as Value[][];
		expect(second).toEqual([[], []]);
		expect(second[0]).not.toBe(first[0]);
	});

	it.each([true, false])("creates fresh nested arrays in the selected branch when the condition is %s", (condition) => {
		const expression = new Affinirum(`val f=~():array{if ${condition}{[1,[2]]}else{[3,[4]]}};[f(),f()]`);
		const expected = condition ? [1n, [2n]] : [3n, [4n]];
		const first = expression.evaluate() as Value[][];
		expect(first).toEqual([expected, expected]);
		expect(first[0]).not.toBe(first[1]);
		expect(first[0][1]).not.toBe(first[1][1]);
		(first[0][1] as Value[]).push(9n);
		expect(first[1]).toEqual(expected);
		const second = expression.evaluate() as Value[][];
		expect(second).toEqual([expected, expected]);
		expect(second[0]).not.toBe(first[0]);
		expect(second[0][1]).not.toBe(first[0][1]);
	});

	it.each<[boolean, Type, Value]>([
		[true, Type.Integer, 5n],
		[false, Type.String, "fallback"],
	])("selects the compiled branch for condition %s even when a branch is non-constant", (condition, type, expected) => {
		const expression = new Affinirum(`if ${condition}{value}else{'fallback'}`, {
			variables: { value: Type.Integer },
		});
		expect(expression.type.equals(type)).toBe(true);
		expect(expression.evaluate({ value: 5n })).toEqual(expected);
	});

	it("checks the selected result against the expected type after folding", () => {
		const expression = new Affinirum("if true{1}else{'other'}", { type: Type.Integer });
		expect(expression.type.equals(Type.Integer)).toBe(true);
		expect(expression.evaluate()).toBe(1n);
		expect(() => new Affinirum("if false{1}else{'other'}", { type: Type.Integer }))
			.toThrow(/type string mismatch with expected type integer/);
	});

	it("creates fresh object literals and nested containers for each evaluation", () => {
		const expression = new Affinirum("[\"items\":[1,2],\"child\":[\"value\":3]]");
		const first = expression.evaluate() as { items: bigint[], child: { value: bigint } };
		first.items.push(9n);
		first.child.value = 4n;
		const second = expression.evaluate() as typeof first;
		expect(second).toEqual({ items: [1n, 2n], child: { value: 3n } });
		expect(second).not.toBe(first);
		expect(second.items).not.toBe(first.items);
		expect(second.child).not.toBe(first.child);
	});

	it("creates fresh array results for each function call and evaluation", () => {
		const expression = new Affinirum("val f=~():array{Array.Range(0,2)};[f(),f()]");
		const first = expression.evaluate() as Value[][];
		expect(first).toEqual([[0n, 1n], [0n, 1n]]);
		expect(first[0]).not.toBe(first[1]);
		first[0].push(9n);
		const second = expression.evaluate() as Value[][];
		expect(second).toEqual([[0n, 1n], [0n, 1n]]);
		expect(second[0]).not.toBe(first[0]);
	});

	it("creates fresh object results for functions with union return types", () => {
		const expression = new Affinirum("JSON.Parse('{\"items\":[1]}')");
		const first = expression.evaluate() as { items: number[] };
		first.items.push(2);
		const second = expression.evaluate() as typeof first;
		expect(second).toEqual({ items: [1] });
		expect(second).not.toBe(first);
		expect(second.items).not.toBe(first.items);
	});

	it("preserves an existing array value when another binding is reassigned", () => {
		const expression = new Affinirum("var a=[1];val b=a;a+=[2];[a,b]");
		expect(expression.evaluate()).toEqual([[1n, 2n], [1n]]);
	});
});
