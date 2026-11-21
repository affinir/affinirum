import { Affinirum, Type } from "../../src/index.js";

describe("Loop node test", () => {
	it("infers a boolean condition and rejects an optional boolean", () => {
		const script = "while condition{exit}";
		expect(new Affinirum(script).variables().condition.equals(Type.Boolean)).toBe(true);
		expect(() => new Affinirum(script, { variables: { condition: Type.OptionalBoolean } }))
			.toThrow(/mismatch with expected type boolean/);
	});

	it("runs a single-expression loop body introduced by do", () => {
		const expression = new Affinirum("var i=0;while i<3 do i+=1;i");
		expect(expression.evaluate()).toBe(3n);
	});

	it("requires do before an unbraced loop body", () => {
		expect(() => new Affinirum("while condition exit"))
			.toThrow("missing 'do' or '{' after the while condition");
	});

	it("preserves incoming variable types when a constant false loop is skipped", () => {
		const expression = new Affinirum("var x:integer|string=1;while false{x='two'};(x:integer)-1");
		expect(expression.type.equals(Type.Integer)).toBe(true);
		expect(expression.evaluate()).toBe(0n);
	});

	it("retains possible variable types when a runtime loop may be skipped", () => {
		const expression = new Affinirum("var x:integer|string=1;while condition{x='two';exit};x", {
			variables: { condition: Type.Boolean },
		});
		expect(expression.type.equals(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate({ condition: false })).toBe(1n);
		expect(expression.evaluate({ condition: true })).toBe("two");
	});

	it("includes input uses from a skipped loop", () => {
		const expression = new Affinirum("while false{value-1};value.Length");
		expect(expression.variables().value.equals(Type.union(Type.Number, Type.OptionalIterable))).toBe(true);
		expect(expression.type.equals(Type.Integer)).toBe(true);
		expect(expression.evaluate({ value: "kept" })).toBe(4n);
	});

	it("compiles reads of types assigned on earlier iterations", () => {
		const expression = new Affinirum("var x:integer|string=1;var i=0;while i<2{if i==0{x='two'}else{x=(x:string).Length};i+=1};x");
		expect(expression.type.equals(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate()).toBe(3n);
	});

	it("retains variable types from iterations interrupted by exit", () => {
		const expression = new Affinirum("var x:integer|string=1;while condition{x='two';exit;x=2};x", {
			variables: { condition: Type.Boolean },
		});
		expect(expression.type.equals(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate({ condition: false })).toBe(1n);
		expect(expression.evaluate({ condition: true })).toBe("two");
	});

	it("preserves input constraints inferred from the condition", () => {
		const expression = new Affinirum("while count>0{exit};count");
		expect(expression.variables().count.equals(Type.Number)).toBe(true);
		expect(expression.type.equals(Type.Number)).toBe(true);
		expect(expression.evaluate({ count: 0n })).toBe(0n);
		expect(expression.evaluate({ count: 2.5 })).toBe(2.5);
		expect(() => expression.evaluate({ count: "two" })).toThrow(/unexpected type string/);
	});

	it("keeps the body result type distinct from a declared union", () => {
		const expression = new Affinirum("var x:integer|string=1;var i=0;while i<1{i+=1;x='two'}");
		expect(expression.type.equals(Type.OptionalString)).toBe(true);
		expect(expression.evaluate()).toBe("two");
	});

	it("checks a repeated condition against the fixed declared type", () => {
		const expression = new Affinirum("var x:integer|string=1;while if x==1{true}else{(x:string).Length>0}{x=''};x");
		expect(expression.type.equals(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate()).toBe("");
	});
});

describe("Until loops", () => {
	it.each<[string, bigint]>([
		["do {i+=1;i*10}", 30n],
		["do i+=1", 3n],
		["while i<5 {i+=1;i*10}", 30n],
		["while i<5 do i+=1", 3n],
	])("returns the final body value from %s until i==3", (loop, expected) => {
		const expression = new Affinirum(`var i=0;${loop} until i==3`, { timeout: 1000 });
		expect(expression.evaluate()).toBe(expected);
	});

	it("runs a do body once before testing an initially true condition", () => {
		const expression = new Affinirum("var visits=0;val result=do {visits+=1;7} until true;[visits,result]", { timeout: 1000 });
		expect(expression.evaluate()).toEqual([1n, 7n]);
	});

	it("infers a boolean postcondition and rejects non-boolean or nullable conditions", () => {
		const source = "do {1} until condition";
		expect(new Affinirum(source).variables().condition.equals(Type.Boolean)).toBe(true);
		expect(() => new Affinirum(source, { variables: { condition: Type.OptionalBoolean } }))
			.toThrow(/mismatch with expected type boolean/);
		expect(() => new Affinirum("do {1} until 1"))
			.toThrow(/mismatch with expected type boolean/);
	});

	it("evaluates the postcondition exactly once after each completed body", () => {
		const calls: string[] = [];
		let iterations = 0;
		const expression = new Affinirum("do body() until done()", {
			variables: {
				body: Type.functionType([[Type.Integer, []]], true),
				done: Type.functionType([[Type.Boolean, []]], true),
			},
		});
		const result = expression.evaluate({
			body: () => {
				calls.push("body");
				if (++iterations > 2) {
					throw new Error("unexpected extra iteration");
				}
				return BigInt(iterations) * 10n;
			},
			done: () => {
				calls.push("until");
				return iterations === 2;
			},
		});
		expect(result).toBe(20n);
		expect(calls).toEqual(["body", "until", "body", "until"]);
	});

	it("skips both the body and postcondition when the while condition is false", () => {
		const expression = new Affinirum("while false {body()} until done()", {
			variables: {
				body: Type.functionType([[Type.Integer, []]], true),
				done: Type.functionType([[Type.Boolean, []]], true),
			},
		});
		expect(expression.evaluate({
			body: () => { throw new Error("unexpected body evaluation"); },
			done: () => { throw new Error("unexpected postcondition evaluation"); },
		})).toBeUndefined();
	});

	it("checks until after next without replacing the previous completed result", () => {
		const expression = new Affinirum("var i=0;var checks=0;val result=while i<5 {i+=1;if i==2{next};i*10} until {checks+=1;i==2};[result,i,checks]");
		expect(expression.evaluate()).toEqual([10n, 2n, 2n]);
	});

	it("skips until after exit and retains the previous completed result", () => {
		const expression = new Affinirum("var i=0;var checks=0;val result=while i<5 {i+=1;if i==2{exit};i*10} until {checks+=1;false};[result,i,checks]");
		expect(expression.evaluate()).toEqual([10n, 2n, 1n]);
	});

	it("keeps nested postconditions attached to their own loops", () => {
		const expression = new Affinirum("var outer=0;var inner=0;val result=do {outer+=1;while inner<4 {inner+=1;inner} until true;outer*10} until outer==2;[result,outer,inner]", { timeout: 1000 });
		expect(expression.evaluate()).toEqual([20n, 2n, 2n]);
	});

	it.each(["while false {1}", "while true {exit}"])("does not infer never from a skipped postcondition in %s", (loop) => {
		const expression = new Affinirum(`val f=~():integer? { ${loop} until (~>7)};f()`);
		expect(expression.type.equals(Type.OptionalInteger)).toBe(true);
		expect(expression.evaluate()).toBeUndefined();
		expect(() => new Affinirum(`val f=~():integer { ${loop} until (~>7)};f()`))
			.toThrow(/mismatch with expected type integer/);
	});

	it.each(["exit", "next"])("rejects %s in a postcondition with no enclosing loop", (jump) => {
		expect(() => new Affinirum(`do {1} until ${jump}`))
			.toThrow(`unexpected ${jump} outside of a loop`);
	});

	it("does not inherit the caller's loop context in a function postcondition", () => {
		expect(() => new Affinirum("while true {val f=~():null { do {1} until exit};exit}"))
			.toThrow(/unexpected exit outside of a loop/);
	});
});
