import { Affinirum, Type, Value } from "../src/index.js";
import { Constants } from "../src/Constants.js";

type ObjectValue = Record<string, Value>;

describe("Prototype property test", () => {
	it("creates object values with null prototypes and preserves special own keys", () => {
		const expression = new Affinirum("[\"__proto__\":[\"polluted\":true], \"constructor\":2, \"prototype\":3]");
		const result = expression.evaluate({}) as ObjectValue;
		expect(Object.getPrototypeOf(result)).toBeNull();
		expect(Object.hasOwn(result, "__proto__")).toBeTrue();
		expect(Object.hasOwn(result, "constructor")).toBeTrue();
		expect(Object.hasOwn(result, "prototype")).toBeTrue();
		expect((result["__proto__"] as ObjectValue).polluted).toBeTrue();
		expect(result.polluted).toBeUndefined();
		expect(result["constructor"] as bigint).toBe(2n);
		expect(result["prototype"] as bigint).toBe(3n);
		expect(expression.type.toString()).toBe("[\"__proto__\":[\"polluted\":boolean],\"constructor\":integer,\"prototype\":integer]");
	});

	it("safely creates a dynamically named prototype property", () => {
		const expression = new Affinirum("[key:value]");
		const result = expression.evaluate({ key: "__proto__", value: { polluted: true } }) as ObjectValue;
		expect(Object.getPrototypeOf(result)).toBeNull();
		expect(Object.hasOwn(result, "__proto__")).toBeTrue();
		expect((result["__proto__"] as ObjectValue).polluted).toBeTrue();
		expect(result.polluted).toBeUndefined();
	});

	it("safely merges objects containing prototype property names", () => {
		const source = JSON.parse("{\"__proto__\":{\"polluted\":true},\"constructor\":2,\"prototype\":3}") as ObjectValue;
		const result = new Affinirum("Object.Merge(source)").evaluate({ source }) as ObjectValue;
		expect(Object.getPrototypeOf(result)).toBeNull();
		expect(Object.hasOwn(result, "__proto__")).toBeTrue();
		expect((result["__proto__"] as ObjectValue).polluted).toBeTrue();
		expect(result.polluted).toBeUndefined();
		expect(result["constructor"] as number).toBe(2);
		expect(result["prototype"] as number).toBe(3);
	});

	it("safely composes objects containing prototype property names", () => {
		const expression = new Affinirum("keys.Compose(~(acc:object, key:string):string{key})");
		const result = expression.evaluate({ keys: ["__proto__", "constructor", "prototype"] }) as ObjectValue;
		expect(Object.getPrototypeOf(result)).toBeNull();
		expect(result["__proto__"] as string).toBe("__proto__");
		expect(result["constructor"] as string).toBe("constructor");
		expect(result["prototype"] as string).toBe("prototype");
	});

	it("does not resolve properties inherited from input object prototypes", () => {
		const value = Object.create({ inherited: 42 });
		expect(new Affinirum("value.inherited").evaluate({ value })).toBeUndefined();
		expect(new Affinirum("value.__proto__").evaluate({ value })).toBeUndefined();
		expect(new Affinirum("value.constructor").evaluate({ value })).toBeUndefined();
		expect(new Affinirum("value.prototype").evaluate({ value })).toBeUndefined();
	});

	it("allows special property names when they are own properties", () => {
		const value = JSON.parse("{\"__proto__\":{\"polluted\":true},\"constructor\":2,\"prototype\":3}") as ObjectValue;
		expect(new Affinirum("value.__proto__.polluted").evaluate({ value }) as boolean).toBeTrue();
		expect(new Affinirum("value.constructor").evaluate({ value }) as number).toBe(2);
		expect(new Affinirum("value.prototype").evaluate({ value }) as number).toBe(3);
	});

	it("does not expose the JavaScript Function constructor through parsed objects", () => {
		const propertyExpression = new Affinirum("val a = JSON.Parse(\"{}\"); a.constructor");
		expect(propertyExpression.evaluate({})).toBeUndefined();
		const castPropertyExpression = new Affinirum("JSON.Parse(\"{}\")::object.constructor");
		expect(castPropertyExpression.evaluate({})).toBeUndefined();
		expect(() => new Affinirum("JSON.Parse(\"{}\")::object.constructor(\"return 7\")()"))
			.toThrowError(/value of type void cannot be called/);
	});

	it("supports prototype property names as variables without altering record prototypes", () => {
		for (const name of ["__proto__", "constructor", "prototype"]) {
			const expression = new Affinirum(name);
			const variables = expression.variables();
			const values = { [name]: 5n };
			expect(Object.getPrototypeOf(variables)).toBeNull();
			expect(Object.hasOwn(variables, name)).toBeTrue();
			expect(expression.evaluate(values) as bigint).toBe(5n);
		}
	});

	it("ignores inherited variable type declarations", () => {
		const variables = Object.create({ inherited: Type.Integer }) as Record<string, Type>;
		expect(() => new Affinirum("inherited", { strict: true, variables })).toThrowError(/undefined variable inherited/);
	});

	it("accepts own prototype property names as strict variable declarations", () => {
		const variables = Object.create(null) as Record<string, Type>;
		variables["__proto__"] = Type.Integer;
		variables["constructor"] = Type.Integer;
		variables["prototype"] = Type.Integer;
		const expression = new Affinirum("__proto__ + constructor + prototype", { strict: true, variables });
		const values = { ["__proto__"]: 1n, ["constructor"]: 2n, ["prototype"]: 3n };
		expect(expression.evaluate(values) as bigint).toBe(6n);
	});

	it("stores every constant namespace in a null-prototype record", () => {
		for (const [name, constants] of Constants) {
			expect(Object.getPrototypeOf(constants)).withContext(name).toBeNull();
			expect(() => new Affinirum(`${name}.constructor`)).withContext(name).toThrowError(/unknown constant constructor/);
		}
	});
});
