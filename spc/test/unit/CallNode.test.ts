import { Type, Value } from "../../../src/index.js";
import { Constant } from "../../../src/Constant.js";
import { ParserState } from "../../../src/ParserState.js";
import { ArrayNode } from "../../../src/node/ArrayNode.js";
import { CallNode } from "../../../src/node/CallNode.js";
import { ConstantNode } from "../../../src/node/ConstantNode.js";
import { FinalNode } from "../../../src/node/FinalNode.js";
import { VariableNode } from "../../../src/node/VariableNode.js";
import { CallFrame } from "../../../src/CallFrame.js";
import { InputVariable } from "../../../src/Variable.js";
import { funcLength } from "../../../src/native/Iterable.js";

describe("Constant folding test", () => {
	const referenceFactories: [string, Type, () => Value][] = [
		["array", Type.Array, () => []],
		["object", Type.Object, () => ({})],
		["function", Type.Function, () => () => 1n],
		["optional array", Type.OptionalArray, () => []],
		["optional object", Type.OptionalObject, () => ({})],
		["optional function", Type.OptionalFunction, () => () => 1n],
		["mixed union", Type.union(Type.Integer, Type.Array), () => []],
		["unknown", Type.Any, () => []],
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
		}, Type.functionType([[Type.Integer, [Type.arrayType(Type.Integer)]]])));
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
			Type.functionType([[Type.Integer, [Type.arrayType(Type.Integer)]]])));
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
		}, Type.functionType([[Type.Integer, [Type.Integer, Type.arrayType(Type.Integer)], true]])));
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
		}, Type.functionType([[Type.Array, [Type.arrayType(Type.Integer)], true]])));
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

describe("Optional calls", () => {
	it("preserves Never when evaluating the callee exits early", () => {
		const span = new ParserState("(return 1)(2)");
		const value = new ConstantNode(span, new Constant(1n));
		const callee = new FinalNode(span, "return", value, Type.Integer);
		const argument = new ConstantNode(span, new Constant(2n));
		const node = new CallNode(span, callee, [argument], true).compile();
		expect(node.type.isNever).toBe(true);
	});

	it("includes null in the initial type for enclosing overload resolution", () => {
		const span = new ParserState("select(value, null?.Length())");
		const select = new ConstantNode(span, new Constant((value: Value) => value, Type.functionType([
			[Type.Integer, [Type.Integer, Type.Integer]],
			[Type.String, [Type.String, Type.Null]],
		])));
		const length = new ConstantNode(span, funcLength);
		const receiver = new ConstantNode(span, Constant.Null);
		const optionalLength = new CallNode(span, length, [receiver], true);
		expect(optionalLength.type.equals(Type.OptionalInteger)).toBe(true);

		const value = new InputVariable();
		const node = new CallNode(span, select, [new VariableNode(span, value), optionalLength]).compile();
		const frame = new CallFrame();
		frame.add(value, "text");
		expect(node.type.equals(Type.String)).toBe(true);
		expect(node.evaluate(frame)).toBe("text");
	});

	it("requires the receiver and rest to match the same variadic array type", () => {
		const span = new ParserState("count()");
		const itemsType = Type.union(Type.arrayType(Type.Integer), Type.arrayType(Type.String));
		const count = new ConstantNode(span, new Constant((...items: Value[]) => BigInt(items.length),
			Type.functionType([[Type.Integer, [itemsType], true]])));
		const compile = (...items: Value[]) => new CallNode(span, count,
			items.map((item) => new ConstantNode(span, new Constant(item))), true).compile();
		const frame = new CallFrame();

		expect(compile(1n, 2n).evaluate(frame)).toBe(2n);
		expect(compile("a", "b").evaluate(frame)).toBe(2n);
		expect(compile(undefined, 1n, 2n).evaluate(frame)).toBeUndefined();
		expect(() => compile(1n, "b")).toThrow(/cannot be called/);
		expect(() => compile("a", 2n)).toThrow(/cannot be called/);
	});
});
