import { Affinirum, Type, Value } from "../../../src/index.js";
import { Constant } from "../../../src/Constant.js";
import { CallFrame } from "../../../src/CallFrame.js";
import { ParserState } from "../../../src/ParserState.js";
import { CallNode } from "../../../src/node/CallNode.js";
import { ConstantNode } from "../../../src/node/ConstantNode.js";
import { AccessNode } from "../../../src/node/AccessNode.js";

const span = new ParserState("value").next().start();
const constant = (value: Value, type?: Type) => new ConstantNode(span, new Constant(value, type));

describe("Access node test", () => {
	it.each(["inherited", "__proto__"])("reads and writes only the own object property %s", (key) => {
		const prototype = { inherited: 1n };
		const value = Object.create(prototype) as Record<string, Value>;
		const node = new AccessNode(span, constant(value), constant(key));
		node.compileAssignment(Type.Integer);
		const resolver = node.resolver(new CallFrame());
		expect(resolver.get()).toBeUndefined();
		expect(resolver.set(2n)).toBe(2n);
		expect(resolver.get()).toBe(2n);
		expect(Object.hasOwn(value, key)).toBe(true);
		expect(Object.getPrototypeOf(value)).toBe(prototype);
	});

	it.each([2n, -3n])("rejects writing outside the array at index %s", (index) => {
		const node = new AccessNode(span, constant([10n, 20n]), constant(index));
		node.compileAssignment(Type.Integer);
		expect(() => node.resolver(new CallFrame()).set(30n)).toThrow(/array index is out of range/);
	});

	it.each<[Value, Value]>([
		[[1n], "0"],
		[{ a: 1n }, 0n],
		[1n, 0n],
	])("rejects an incompatible container or index for %s", (value, index) => {
		const node = new AccessNode(span, constant(value), constant(index));
		expect(() => node.compile()).toThrow(/mismatch with expected type/);
	});

	it("rejects a receiver union containing a non-collection type", () => {
		expect(() => new Affinirum("x[0]", { variables: { x: Type.union(Type.Integer, Type.Array) } }))
			.toThrow(/type integer\|array mismatch with expected type array\|object/);
	});

	it.each<[string, Type]>([
		["x[0]", Type.OptionalArray],
		["x.key", Type.OptionalObject],
	])("rejects a nullable receiver in %s", (script, x) => {
		expect(() => new Affinirum(script, { variables: { x } }))
			.toThrow(/mismatch with expected type array\|object/);
	});

	it("checks indexed reads against the expected result type", () => {
		const source = new CallNode(span, constant(() => [1n], Type.functionType([[Type.arrayType(Type.Integer), []]])), []);
		const node = new AccessNode(span, source, constant(0n));
		expect(() => node.compile(Type.String)).toThrow(/mismatch with expected type string/);
		expect(node.type.equals(Type.OptionalInteger)).toBe(true);
	});

	it("accepts a string key when the container type is unknown", () => {
		const subnode = new CallNode(span, constant(() => ({ a: 1n }), Type.functionType([[Type.Unknown, []]])), []);
		const node = new AccessNode(span, subnode, constant("a"));
		node.compile();
		expect(node.evaluate(new CallFrame())).toBe(1n);
	});
});
