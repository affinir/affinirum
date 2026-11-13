import { Type, Value } from "../../../src/index.js";
import { Constant } from "../../../src/Constant.js";
import { ParserState } from "../../../src/ParserState.js";
import { ArrayNode } from "../../../src/node/ArrayNode.js";
import { CallNode } from "../../../src/node/CallNode.js";
import { ConstantNode } from "../../../src/node/ConstantNode.js";
import { CallFrame } from "../../../src/CallFrame.js";

describe("Constant folding test", () => {
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
			}, Type.functionType([[type, []]])));
			const node = new CallNode(span, functionNode, []).compile();
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
		}, Type.functionType([[Type.Integer, []]])));
		const node = new CallNode(span, functionNode, []).compile();
		const frame = new CallFrame();
		expect(calls).toBe(1);
		expect(node.evaluate(frame) as bigint).toBe(6n);
		expect(node.evaluate(frame) as bigint).toBe(6n);
		expect(calls).toBe(1);
	});

	it.each<[bigint[]]>([
		[[]],
		[[1n, 2n, 3n]],
	])("folds deterministic scalar calls with a constant array %s", (values) => {
		let calls = 0;
		const span = new ParserState("sum([1,2,3])");
		const functionNode = new ConstantNode(span, new Constant((items: bigint[]) => {
			++calls;
			return items.reduce((sum, value) => sum + value, 0n);
		}, Type.functionType([[Type.Integer, [Type.arrayType([Type.Integer])]]])));
		const arrayNode = new ArrayNode(span, values.map((value) => new ConstantNode(span, new Constant(value))));
		const node = new CallNode(span, functionNode, [arrayNode]).compile();
		const frame = new CallFrame();
		const expected = values.reduce((sum, value) => sum + value, 0n);
		expect(calls).toBe(1);
		expect(node.evaluate(frame)).toBe(expected);
		expect(node.evaluate(frame)).toBe(expected);
		expect(calls).toBe(1);
	});

	it("does not fold arrays containing volatile calls", () => {
		let calls = 0;
		const span = new ParserState("sum([next()])");
		const next = new ConstantNode(span, new Constant(() => BigInt(++calls),
			Type.functionType([[Type.Integer, []]], true)));
		const sum = new ConstantNode(span, new Constant((items: bigint[]) => items[0],
			Type.functionType([[Type.Integer, [Type.arrayType([Type.Integer])]]])));
		const arrayNode = new ArrayNode(span, [new CallNode(span, next, [])]);
		const node = new CallNode(span, sum, [arrayNode]).compile();
		const frame = new CallFrame();
		expect(calls).toBe(0);
		expect(node.evaluate(frame)).toBe(1n);
		expect(node.evaluate(frame)).toBe(2n);
		expect(calls).toBe(2);
	});

	it("folds deterministic scalar calls with fixed and variadic constant arguments", () => {
		let calls = 0;
		const span = new ParserState("sum(1,2,3)");
		const functionNode = new ConstantNode(span, new Constant((first: bigint, ...rest: bigint[]) => {
			++calls;
			return rest.reduce((sum, value) => sum + value, first);
		}, Type.functionType([[Type.Integer, [Type.Integer, Type.arrayType([Type.Integer])], true]])));
		const arguments_ = [1n, 2n, 3n].map((value) => new ConstantNode(span, new Constant(value)));
		const node = new CallNode(span, functionNode, arguments_).compile();
		const frame = new CallFrame();
		expect(calls).toBe(1);
		expect(node.evaluate(frame) as bigint).toBe(6n);
		expect(node.evaluate(frame) as bigint).toBe(6n);
		expect(calls).toBe(1);
	});

	it("creates fresh variadic argument arrays for reference-returning calls", () => {
		let calls = 0;
		const span = new ParserState("items(1,2)");
		const functionNode = new ConstantNode(span, new Constant((...items: bigint[]) => {
			++calls;
			return items;
		}, Type.functionType([[Type.Array, [Type.arrayType([Type.Integer])], true]])));
		const arguments_ = [1n, 2n].map((value) => new ConstantNode(span, new Constant(value)));
		const node = new CallNode(span, functionNode, arguments_).compile();
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
