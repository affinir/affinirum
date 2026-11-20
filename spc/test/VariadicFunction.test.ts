import { Affinirum, Type } from "../../src/index.js";

describe("Variadic function test", () => {
	it("binds fixed and rest arguments from script calls", () => {
		const expression = new Affinirum("val f={=(first:integer,rest:...integer):array -> [first,rest]};f(value,1,2,3,4)");
		expect(expression.evaluate({ value: 10n })).toEqual([10n, [1n, 2n, 3n, 4n]]);
	});
});

describe("Variadic function argument test", () => {
	it.each([
		"Integer.Sum([1,2])",
		"Integer.Min([1,2])",
		"Integer.Max([1,2])",
		"Float.Sum(1,[2.0])",
		"Float.Min([1.0,2])",
		"Float.Max([1,2.0])",
		"Object.Merge([['a':1],['b':2]])",
		"IP.Match(['192.0.2.1'],['192.0.2.1'])",
		"'a-b'.ReplaceWith('',['-'])",
	])("rejects an array as an individual variadic argument in %s", (source) => {
		expect(() => new Affinirum(source)).toThrow(/mismatch with expected type/);
	});
	it("evaluates non-constant variadic arguments with the current inputs", () => {
		const expression = new Affinirum("Integer.Sum(x,2)");
		expect(expression.evaluate({ x: 1n }) as bigint).toBe(3n);
		expect(expression.evaluate({ x: 5n }) as bigint).toBe(7n);
	});
	it("preserves variadic parameters when producing concatenated results", () => {
		const expression = new Affinirum("val f={=(a:...integer):[...integer] -> val extended=a+[9];[a.Length,extended.Length]};val g={=():[...integer] -> f(1,2)};[g(),g()]");
		expect(expression.evaluate()).toEqual([[2n, 3n], [2n, 3n]]);
		expect(expression.evaluate()).toEqual([[2n, 3n], [2n, 3n]]);
	});
	it("binds rest arguments when JavaScript calls a script function", () => {
		const expression = new Affinirum("{=(first:integer,rest:...integer):array -> [first,rest]}");
		const func = expression.evaluate() as (first: bigint, ...values: bigint[]) => [bigint, bigint[]];
		expect(func(2n, 3n, 4n)).toEqual([2n, [3n, 4n]]);
	});
	it("binds rest arguments when a variable has no declared function signature", () => {
		const expression = new Affinirum("var f;f={=(items:...integer):[...integer] -> items};f(1,2)");
		expect(expression.evaluate()).toEqual([1n, 2n]);
	});
	it("binds an untyped variadic parameter as an array", () => {
		const expression = new Affinirum("{=(items:...) -> items}");
		expect(expression.type.equals(Type.functionType([[Type.Any, [Type.Array], true]]))).toBe(true);
		const collect = expression.evaluate() as (...items: (bigint | string)[]) => unknown;
		expect(collect(1n, "two")).toEqual([1n, "two"]);
	});
	it("uses the complete variadic overload for a numeric union", () => {
		const overloaded = Type.functionType([
			[Type.Integer, [Type.Integer, Type.Integer]],
			[Type.Float, [Type.arrayType(Type.Number)], true],
		]);
		const expression = new Affinirum("f(value, 2)", { variables: { f: overloaded } });
		expect(expression.variables().value.equals(Type.Number)).toBe(true);
		expect(expression.type.equals(Type.Float)).toBe(true);
		expect(expression.evaluate({
			value: 1.5,
			f: (...args: unknown[]) => args.length,
		})).toBe(2);
	});
	it.each(["var items:[...string]=['two'];f(items[0]::string)", "f(g('two'))"])("uses a variadic overload after compiling the argument in %s", (script) => {
		const variadicOverloads = Type.functionType([
			[Type.Integer, [Type.Integer]],
			[Type.String, [Type.arrayType(Type.String)], true],
		]);
		const fixedOverloads = Type.functionType([
			[Type.Integer, [Type.Integer]],
			[Type.String, [Type.String]],
		]);
		const expression = new Affinirum(script, { variables: { f: variadicOverloads, g: fixedOverloads } });
		expect(expression.type.equals(Type.String)).toBe(true);
		expect(expression.evaluate({
			f: (...values: string[]) => values.join(" "),
			g: (value: bigint | string) => value,
		})).toBe("two");
	});
	it("uses a variadic overload when compiled arguments match no complete fixed signature", () => {
		const overloads = Type.functionType([
			[Type.Integer, [Type.Integer, Type.String]],
			[Type.Integer, [Type.String, Type.Integer]],
			[Type.Integer, [Type.arrayType(Type.Integer)], true],
		]);
		const expression = new Affinirum("var items:[...integer]=[1,2];f(items[0]::integer,items[1]::integer)", { variables: { f: overloads } });
		expect(expression.evaluate({ f: (...values: bigint[]) => values.reduce((sum, value) => sum + value, 0n) })).toBe(3n);
	});
	it("collects zero or more arguments of the declared element type", () => {
		const script = "val f:{=(...integer):[...integer]}={=(items:...integer):[...integer] -> items};";
		expect(new Affinirum(script + "[f(),f(1,2)]").evaluate()).toEqual([[], [1n, 2n]]);
		expect(() => new Affinirum(script + "f('bad')")).toThrow(/mismatch with expected type integer/);
	});
	it("treats a tuple rest element type as one argument", () => {
		const script = "val f={=(items:...[integer,integer]):integer -> items.Length};";
		expect(new Affinirum(script + "f([1,2],[3,4,5])").evaluate()).toBe(2n);
		expect(() => new Affinirum(script + "f([1])")).toThrow(/mismatch with expected type/);
	});
	it("checks the variadic tail against one complete uniform array type", () => {
		const tail = Type.union(
			Type.arrayType(Type.Integer),
			Type.arrayType(Type.String),
		);
		const signature = Type.functionType([[Type.Integer, [tail], true]]);
		expect(() => new Affinirum("f(1,2)", { variables: { f: signature } })).not.toThrow();
		expect(() => new Affinirum("f(1,'two')", { variables: { f: signature } })).toThrow(/cannot be called with 2 argument/);
		const item = Type.union(Type.Integer, Type.String);
		expect(() => new Affinirum("f(x,y)", { variables: { f: signature, x: item, y: item } }))
			.toThrow(/cannot be called with 2 argument/);
	});
	it("uses a matching variadic overload when fixed overloads are incompatible", () => {
		const overloaded = Type.functionType([
			[Type.Integer, [Type.String, Type.String]],
			[Type.Integer, [Type.arrayType(Type.Number)], true],
		]);
		const expression = new Affinirum("f(1, 2)", {
			strict: true,
			variables: { f: overloaded },
		});
		expect(expression.evaluate({
			f: (...values: unknown[]) => BigInt(values.length),
		}) as bigint).toBe(2n);
	});
});
