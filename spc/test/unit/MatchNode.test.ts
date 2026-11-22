import { Type, Value } from "../../../src/index.js";
import { CallFrame } from "../../../src/CallFrame.js";
import { Constant } from "../../../src/Constant.js";
import { ParserState } from "../../../src/ParserState.js";
import { InputVariable } from "../../../src/Variable.js";
import { CallNode } from "../../../src/node/CallNode.js";
import { ConstantNode } from "../../../src/node/ConstantNode.js";
import { FinalNode } from "../../../src/node/FinalNode.js";
import { MatchNode } from "../../../src/node/MatchNode.js";
import { VariableNode } from "../../../src/node/VariableNode.js";

const span = new ParserState("match").next().start();
const literal = (value: Value) => new ConstantNode(span, new Constant(value));

describe("MatchNode", () => {
	it("evaluates the subject once and stops at the first equal key", () => {
		const calls: string[] = [];
		const track = (name: string, value: Value) => {
			const fn = new Constant(() => {
				calls.push(name);
				return value;
			}, Type.functionType([[Type.of(value), []]], true));
			return new CallNode(span, new ConstantNode(span, fn), []);
		};
		const match = new MatchNode(span, track("subject", [2n]), [
			[track("first key", [1]), track("first result", 1n)],
			[track("second key", [2]), track("second result", 2n)],
			[track("duplicate key", [2n]), track("third result", 3n)],
		], track("fallback", 0n)).compile();
		expect(calls).toEqual([]);
		expect(match.evaluate(new CallFrame())).toBe(2n);
		expect(calls).toEqual(["subject", "first key", "second key", "second result"]);
	});

	it("uses the fallback when every key misses or there are no arms", () => {
		const subject = literal(1n);
		const fallback = literal("other");
		const match = new MatchNode(span, subject, [[literal(2n), literal(true)]], fallback).compile();
		expect(match.evaluate(new CallFrame())).toBe("other");
		expect(match.type.equals(Type.union(Type.Boolean, Type.String))).toBe(true);
		expect(new MatchNode(span, subject, [], fallback).compile().evaluate(new CallFrame())).toBe("other");
	});

	it("returns null on a miss and infers an optional result when the fallback is omitted", () => {
		const variable = new InputVariable(Type.Integer);
		const match = new MatchNode(span, new VariableNode(span, variable), [[literal(1n), literal(false)]]);
		expect(match.type.equals(Type.OptionalBoolean)).toBe(true);
		expect(match.satisfies(Type.Boolean)).toBe(false);
		match.compile(Type.OptionalBoolean);
		const frame = new CallFrame();
		frame.add(variable, 1n);
		expect(match.evaluate(frame)).toBe(false);
		frame.set(variable, 2n);
		expect(match.evaluate(frame)).toBeUndefined();
		expect(() => match.compile(Type.Boolean)).toThrow(/type null mismatch/);
	});

	it("infers null with no arms and never when the subject exits", () => {
		const empty = new MatchNode(span, literal(1n), []).compile();
		expect(empty.type.isNull).toBe(true);
		expect(empty.evaluate(new CallFrame())).toBeUndefined();
		const stop = new FinalNode(span, "return", literal(1n), Type.Integer);
		expect(new MatchNode(span, stop, []).compile(Type.Integer).type.isNever).toBe(true);
	});

	it("excludes results after a subject or key that exits early", () => {
		const stop = new FinalNode(span, "return", literal(0n), Type.Integer);
		const subject = new MatchNode(span, stop, [], literal(false)).compile(Type.Integer);
		expect(subject.type.isNever).toBe(true);
		const match = new MatchNode(span, literal(1n), [
			[literal(2n), literal(2n)],
			[stop, literal(false)],
		], literal("unreachable")).compile(Type.Integer);
		expect(match.type.equals(Type.Integer)).toBe(true);
		expect(() => match.evaluate(new CallFrame())).toThrow(expect.objectContaining({ level: "return" }));
	});
});
