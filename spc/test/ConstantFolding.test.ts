import { Affinirum, Type, Value } from "../../src/index.js";
import { Constant } from "../../src/Constant.js";
import { ParserState } from "../../src/ParserState.js";
import { CallNode } from "../../src/node/CallNode.js";
import { ConstantNode } from "../../src/node/ConstantNode.js";
import { CallFrame } from "../../src/CallFrame.js";

describe("Constant folding test", () => {
	it("creates fresh array literals for each function call and evaluation", () => {
		const expression = new Affinirum("val f=~():integer{var a=[];a.Append(1);a.Length};[f(),f()]");
		expect<unknown>(expression.evaluate()).toEqual([1n, 1n]);
		expect<unknown>(expression.evaluate()).toEqual([1n, 1n]);
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
		const expression = new Affinirum("val f=~():integer{var a=Array.Range(0,2);a.Append(9);a.Length};[f(),f()]");
		expect<unknown>(expression.evaluate()).toEqual([3n, 3n]);
		expect<unknown>(expression.evaluate()).toEqual([3n, 3n]);
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

	it("preserves aliases within one evaluation", () => {
		const expression = new Affinirum("var a=[];val b=a;b.Append(1);a.Length");
		expect(expression.evaluate() as bigint).toBe(1n);
	});

	const referenceFactories: [string, Type, () => Value][] = [
		["array", Type.Array, () => []],
		["object", Type.Object, () => ({})],
		["function", Type.Function, () => () => 1n],
		["optional array", Type.OptionalArray, () => []],
		["optional object", Type.OptionalObject, () => ({})],
		["optional function", Type.OptionalFunction, () => () => 1n],
		["mixed union", Type.union(Type.Integer, Type.Array), () => []],
		["unknown", Type.Unknown, () => []],
	];

	referenceFactories.forEach(([name, type, factory]) => {
		it(`keeps a ${name} factory out of compile-time evaluation`, () => {
			let calls = 0;
			const span = new ParserState("factory()");
			const functionNode = new ConstantNode(span, new Constant(() => {
				++calls;
				return factory();
			}, Type.functionType(type)));
			const node = new CallNode(span, functionNode, []).compile(Type.Unknown);
			const frame = new CallFrame();
			expect(calls).toBe(0);
			const first = node.evaluate(frame);
			const second = node.evaluate(frame);
			expect(calls).toBe(2);
			expect<unknown>(first).not.toBe(second);
		});
	});

	it("still folds deterministic scalar calls", () => {
		let calls = 0;
		const span = new ParserState("scalar()");
		const functionNode = new ConstantNode(span, new Constant(() => {
			++calls;
			return 6n;
		}, Type.functionType(Type.Integer)));
		const node = new CallNode(span, functionNode, []).compile(Type.Unknown);
		const frame = new CallFrame();
		expect(calls).toBe(1);
		expect(node.evaluate(frame) as bigint).toBe(6n);
		expect(node.evaluate(frame) as bigint).toBe(6n);
		expect(calls).toBe(1);
	});

	it("folds deterministic scalar calls with fixed and variadic constant arguments", () => {
		let calls = 0;
		const span = new ParserState("sum(1,2,3)");
		const functionNode = new ConstantNode(span, new Constant((first: bigint, rest: bigint[]) => {
			++calls;
			return rest.reduce((sum, value) => sum + value, first);
		}, Type.functionType(Type.Integer, [Type.Integer, Type.arrayType([Type.Integer])], true)));
		const arguments_ = [1n, 2n, 3n].map((value) => new ConstantNode(span, new Constant(value)));
		const node = new CallNode(span, functionNode, arguments_).compile(Type.Unknown);
		const frame = new CallFrame();
		expect(calls).toBe(1);
		expect(node.evaluate(frame) as bigint).toBe(6n);
		expect(node.evaluate(frame) as bigint).toBe(6n);
		expect(calls).toBe(1);
	});

	it("creates fresh variadic argument arrays for reference-returning calls", () => {
		let calls = 0;
		const span = new ParserState("items(1,2)");
		const functionNode = new ConstantNode(span, new Constant((items: bigint[]) => {
			++calls;
			return items;
		}, Type.functionType(Type.Array, [Type.arrayType([Type.Integer])], true)));
		const arguments_ = [1n, 2n].map((value) => new ConstantNode(span, new Constant(value)));
		const node = new CallNode(span, functionNode, arguments_).compile(Type.Unknown);
		const frame = new CallFrame();
		expect(calls).toBe(0);
		const first = node.evaluate(frame) as bigint[];
		first.push(9n);
		const second = node.evaluate(frame) as bigint[];
		expect(second).toEqual([1n, 2n]);
		expect(second).not.toBe(first);
		expect(calls).toBe(2);
	});
});
