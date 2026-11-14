import { Affinirum, Type, Value } from "../../src/index.js";

describe("Indexed assignment test", () => {
	it.each<[string, Value]>([
		["var items=[1,2];items.1=7;items", [1n, 7n]],
		["var items=[1,2];items[-1]+=3;items", [1n, 5n]],
		["var record=['a':1];record['b']=2;record", { a: 1n, b: 2n }],
		["var record=['a':1];record.\"a\"+=2;record", { a: 3n }],
		["var value=['items':[['count':1]]];((value.items::array)[0]::['count':integer]).count+=2;value", { items: [{ count: 3n }] }],
		["var items=[1,2];items[0]=items[1]=7;items", [7n, 7n]],
		["var items=[[1],[2]];items[0]+=[3];items", [[1n, 3n], [2n]]],
		["var items=[1,2];val original=items;items[0]=7;original", [7n, 2n]],
	])("evaluates %s", (script, expected) => {
		const expression = new Affinirum(script);
		expect(expression.evaluate()).toEqual(expected);
	});

	it.each<[string, bigint]>([
		["=", 3n],
		["+=", 23n],
	])("resolves the target once before the right-hand side for %s", (operator, expected) => {
		const original = [10n, 20n];
		const replacement = [90n, 100n];
		let items = original;
		let indexes = 0;
		const events: string[] = [];
		const expression = new Affinirum(`items()[index()]${operator}rhs()`, {
			strict: true,
			variables: {
				items: Type.functionType([[Type.Array, []]]),
				index: Type.functionType([[Type.Integer, []]]),
				rhs: Type.functionType([[Type.Integer, []]]),
			},
		});
		expect(events).toEqual([]);
		expect(expression.evaluate({
			items: () => { events.push("items"); return items; },
			index: () => { events.push("index"); return -BigInt(++indexes); },
			rhs: () => {
				events.push("rhs");
				items = replacement;
				original[1] = 100n;
				original.push(30n);
				return 3n;
			},
		})).toBe(expected);
		expect(events).toEqual(["items", "index", "rhs"]);
		expect(original).toEqual([10n, expected, 30n]);
		expect(replacement).toEqual([90n, 100n]);
	});

	it("evaluates a computed object key once", () => {
		let calls = 0;
		const expression = new Affinirum("var record=['a':1];record[key()]+=2;record.a", {
			variables: { key: Type.functionType([[Type.String, []]]) },
		});
		expect(expression.evaluate({ key: () => { ++calls; return "a"; } })).toBe(3n);
		expect(calls).toBe(1);
	});

	it("rejects a missing typed item before a compound operation", () => {
		const expression = new Affinirum("var items:[...integer]=[];items[0]+=1");
		expect(() => expression.evaluate()).toThrow(/indexed value mismatch with expected type integer/);
	});

	it.each<[string, boolean]>([
		["|=", true],
		["&=", false],
	])("resolves a Boolean compound target once for %s", (operator, expected) => {
		let calls = 0;
		const expression = new Affinirum(`var items=[${expected}];items[index()]${operator}{items[0]=${!expected};${!expected}};items[0]`, {
			variables: { index: Type.functionType([[Type.Integer, []]]) },
		});
		expect(expression.evaluate({ index: () => { ++calls; return 0n; } })).toBe(expected);
		expect(calls).toBe(1);
	});

	it.each<[string, number, bigint]>([
		["=", 0, 2n],
		["+=", 1, 12n],
	])("reads the target only when needed for %s", (operator, expectedReads, expected) => {
		let reads = 0;
		const record = { get a() { ++reads; return 10n; } };
		const expression = new Affinirum(`record().a${operator}2`, {
			variables: { record: Type.functionType([[Type.Object, []]]) },
		});
		expect(expression.evaluate({ record: () => record })).toBe(expected);
		expect(reads).toBe(expectedReads);
		expect(record.a).toBe(expected);
	});

	it.each([
		"val items=[1];items[0]=2",
		"val record=['a':1];record.a+=2",
		"val record=['nested':['a':1]];record.nested.a=2",
		"(1+2)=3",
	])("rejects a non-assignable target in %s", (script) => {
		expect(() => new Affinirum(script)).toThrow(/illegal re-assignment/);
	});

	it.each(["items[0]=2", "items[0]+=2"])("rejects indexed assignment through an input in %s", (script) => {
		expect(() => new Affinirum(script)).toThrow(/illegal re-assignment/);
		expect(() => new Affinirum(script, { variables: { items: Type.arrayType(Type.Integer) } }))
			.toThrow(/illegal re-assignment/);
	});

	it.each([
		"var items:[...integer]=[1,2];items[0]='bad'",
		"var record:['a':integer]=['a':1];record.a='bad'",
		"var value:['items':[...integer]]=['items':[1]];value.items[0]='bad'",
		"var value:['child':['count':integer]]=['child':['count':1]];value.child.count='bad'",
		"var value:[...[...integer]]=[[1],[2]];value[index][0]='bad'",
	])("rejects an assignment incompatible with a known member type in %s", (script) => {
		expect(() => new Affinirum(script)).toThrow(/mismatch with expected type/);
	});

	it("preserves the type of an array written through a broader alias", () => {
		const values = [1n];
		const expression = new Affinirum("var typed:[...integer]=values;var alias:array=typed;alias[0]=replacement;typed", {
			variables: { values: Type.Array },
		});
		expect(() => expression.evaluate({ values, replacement: "bad" })).toThrow(/indexed value mismatch with expected type/);
		expect(values).toEqual([1n]);
		expect(expression.evaluate({ values, replacement: 2n })).toBe(values);
		expect(values).toEqual([2n]);
	});

	it("checks the whole array against the receiver type before an indexed write", () => {
		const type = Type.union(Type.arrayType(Type.Integer), Type.arrayType(Type.String));
		const expression = new Affinirum("items()[0]='two'", {
			variables: { items: Type.functionType([[type, []]]) },
		});
		const pair = [1n, 2n];
		expect(() => expression.evaluate({ items: () => pair })).toThrow(/indexed value mismatch with expected type/);
		expect(pair).toEqual([1n, 2n]);
		const single: Value[] = [1n];
		expect(expression.evaluate({ items: () => single })).toBe("two");
		expect(single).toEqual(["two"]);
	});

	it("checks own array getters against the proposed indexed write", () => {
		const items = new Array<Value>(3);
		items[0] = 1n;
		Object.defineProperty(items, 1, {
			get(this: Value[]) { return this[0] === 1n ? 2n : "bad"; },
		});
		Object.setPrototypeOf(items, Object.assign(Object.create(Array.prototype), { 2: "inherited" }));
		const expression = new Affinirum("items()[0]=replacement", {
			variables: { items: Type.functionType([[Type.arrayType(Type.OptionalInteger), []]]) },
		});
		expect(expression.evaluate({ items: () => items, replacement: 1n })).toBe(1n);
		expect(() => expression.evaluate({ items: () => items, replacement: 2n }))
			.toThrow(/indexed value mismatch with expected type/);
		expect(items[0]).toBe(1n);
		expect(Object.hasOwn(items, 2)).toBe(false);
	});

	it("preserves all recorded constraints on an object written through an alias", () => {
		const record = Object.defineProperty({ b: "one" }, "a", { value: 1n, writable: true });
		const expression = new Affinirum("var alias:object=first;second;alias[key]=replacement;alias", {
			variables: {
				first: Type.objectType([["a", Type.Integer]]),
				second: Type.objectType([["b", Type.String]]),
			},
		});
		expect(() => expression.evaluate({ first: record, second: record, key: "a", replacement: "bad" }))
			.toThrow(/indexed value mismatch with expected type/);
		expect(() => expression.evaluate({ first: record, second: record, key: "b", replacement: 2n }))
			.toThrow(/indexed value mismatch with expected type/);
		expect(record).toHaveProperty("a", 1n);
		expect(record.b).toBe("one");
		expect(expression.evaluate({ first: record, second: record, key: "b", replacement: "two" })).toBe(record);
		expect(record.b).toBe("two");
	});

	it.each<[string, Type, Value]>([
		["var value:['items':[...integer]]=['items':[1]];value.items", Type.arrayType(Type.Integer), [1n]],
		["var value:['child':['count':integer]]=['child':['count':1]];(value.child::['count':integer]).count", Type.Integer, 1n],
		["var value:[...[...integer]]=[[1]];value[0]", Type.arrayType(Type.Integer), [1n]],
	])("reports the indexed member type as optional in %s", (script, type, expected) => {
		const expression = new Affinirum(script);
		expect(expression.type.equals(type.toOptional())).toBe(true);
		expect(expression.evaluate()).toEqual(expected);
	});

	it.each<[string, Record<string, Value>, Record<string, Value>, Value]>([
		[
			"var value:[[integer],[string]]=[[1],['two']];value[index][0]='bad';value",
			{ index: -2n }, { index: -1n }, [[1n], ["bad"]],
		],
		[
			"var value:['a':['count':integer],'b':['count':string]]=['a':['count':1],'b':['count':'two']];value[key].count='bad';value",
			{ key: "a" }, { key: "b" }, { a: { count: 1n }, b: { count: "bad" } },
		],
	])("checks the member selected by a computed key in %s", (script, rejected, accepted, expected) => {
		const expression = new Affinirum(script);
		expect(() => expression.evaluate(rejected)).toThrow(/indexed value mismatch with expected type integer/);
		expect(expression.evaluate(accepted)).toEqual(expected);
	});

	it("preserves uniform object member types through a computed key", () => {
		const type = Type.arrayType(Type.Integer);
		const expression = new Affinirum("var value=values;(value[key]::[...integer])[0]=2;value[key]", {
			variables: { values: Type.objectType(type), key: Type.String },
		});
		expect(expression.type.equals(type.toOptional())).toBe(true);
		expect(expression.evaluate({ values: { a: [1n] }, key: "a" })).toEqual([2n]);
	});

	it.each<[string, boolean, string, bigint]>([
		["sealed", true, "+=", 3n],
		["non-enumerable", false, "=", 2n],
	])("preserves the descriptor of a %s writable property", (name, enumerable, operator, expected) => {
		const record = Object.defineProperty({}, "a", { value: 1n, writable: true, enumerable, configurable: true });
		if (name === "sealed") {
			Object.seal(record);
		}
		const descriptor = Object.getOwnPropertyDescriptor(record, "a");
		const expression = new Affinirum(`record().a${operator}2`, {
			variables: { record: Type.functionType([[Type.Object, []]]) },
		});
		expect(expression.evaluate({ record: () => record })).toBe(expected);
		expect(Object.getOwnPropertyDescriptor(record, "a")).toEqual({ ...descriptor, value: expected });
	});

	it("rejects writes to a frozen data property", () => {
		const record = Object.freeze({ a: 1n });
		const expression = new Affinirum("record().a=2", {
			variables: { record: Type.functionType([[Type.Object, []]]) },
		});
		expect(() => expression.evaluate({ record: () => record })).toThrow(TypeError);
		expect(record.a).toBe(1n);
	});

	it("leaves the target unchanged when the right-hand side throws", () => {
		const items = [10n];
		let indexes = 0;
		const expression = new Affinirum("items()[index()]+=fail()", {
			variables: {
				items: Type.functionType([[Type.Array, []]]),
				index: Type.functionType([[Type.Integer, []]]),
				fail: Type.functionType([[Type.Integer, []]]),
			},
		});
		expect(() => expression.evaluate({
			items: () => items,
			index: () => { ++indexes; return 0n; },
			fail: () => { throw new Error("rhs failed"); },
		})).toThrow(/rhs failed/);
		expect(items).toEqual([10n]);
		expect(indexes).toBe(1);
	});

	it.each([undefined, 1n])("rejects a non-collection receiver at runtime for %s", (receiver) => {
		const expression = new Affinirum("value().missing.Length", {
			variables: { value: Type.functionType([[Type.Unknown, []]]) },
		});
		expect(() => expression.evaluate({ value: () => receiver })).toThrow(/indexed value must be an array or object/);
	});

	it("returns the assigned value with its inferred type", () => {
		const expression = new Affinirum("var items=[1];items[0]=2");
		expect(expression.type.equals(Type.Integer)).toBe(true);
		expect(expression.evaluate()).toBe(2n);
	});
});
