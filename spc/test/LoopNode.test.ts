import { Affinirum, Type } from "../../src/index.js";

describe("LoopNode", () => {
	it("infers a boolean condition and rejects an optional boolean", () => {
		const script = "while condition loop {exit}";
		expect(new Affinirum(script).variables().condition.equals(Type.Boolean)).toBe(true);
		expect(() => new Affinirum(script, { variables: { condition: Type.OptionalBoolean } }))
			.toThrow(/mismatch with expected type boolean/);
	});

	it("requires loop before either form of a while body", () => {
		for (const source of ["while true exit", "while true { exit }", "while true do exit"]) {
			expect(() => new Affinirum(source)).toThrow(/expected 'loop' after while condition/);
		}
	});

	it("includes a following operator in the body unless the loop is grouped", () => {
		expect(new Affinirum("while false loop { 1 } ?: 2").evaluate()).toBeUndefined();
		expect(new Affinirum("(while false loop 1) ?: 2").evaluate()).toBe(2n);
	});

	it("lets exit terminate a standalone loop", () => {
		const expression = new Affinirum("var i=0; loop { i+=1; if i==3 then exit; i }", { timeout: 1000 });
		expect(expression.evaluate()).toBe(2n);
	});

	it("preserves incoming variable types when a constant false loop is skipped", () => {
		const expression = new Affinirum("var x:integer|string=1;while false loop {x='two'};(x:integer)-1");
		expect(expression.type.equals(Type.Integer)).toBe(true);
		expect(expression.evaluate()).toBe(0n);
	});

	it("retains possible variable types when a runtime loop may be skipped", () => {
		const expression = new Affinirum("var x:integer|string=1;while condition loop {x='two';exit};x", {
			variables: { condition: Type.Boolean },
		});
		expect(expression.type.equals(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate({ condition: false })).toBe(1n);
		expect(expression.evaluate({ condition: true })).toBe("two");
	});

	it("includes input uses from a skipped loop", () => {
		const expression = new Affinirum("while false loop {value-1};value.Length");
		expect(expression.variables().value.equals(Type.union(Type.Number, Type.OptionalIterable))).toBe(true);
		expect(expression.type.equals(Type.Integer)).toBe(true);
		expect(expression.evaluate({ value: "kept" })).toBe(4n);
	});

	it("compiles reads of types assigned on earlier iterations", () => {
		const expression = new Affinirum("var x:integer|string=1;var i=0;while i<2 loop {if i==0 then {x='two'}else{x=(x:string).Length};i+=1};x");
		expect(expression.type.equals(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate()).toBe(3n);
	});

	it("retains variable types from iterations interrupted by exit", () => {
		const expression = new Affinirum("var x:integer|string=1;while condition loop {x='two';exit;x=2};x", {
			variables: { condition: Type.Boolean },
		});
		expect(expression.type.equals(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate({ condition: false })).toBe(1n);
		expect(expression.evaluate({ condition: true })).toBe("two");
	});

	it("preserves input constraints inferred from the condition", () => {
		const expression = new Affinirum("while count>0 loop {exit};count");
		expect(expression.variables().count.equals(Type.Number)).toBe(true);
		expect(expression.type.equals(Type.Number)).toBe(true);
		expect(expression.evaluate({ count: 0n })).toBe(0n);
		expect(expression.evaluate({ count: 2.5 })).toBe(2.5);
		expect(() => expression.evaluate({ count: "two" })).toThrow(/unexpected type string/);
	});

	it("keeps the body result type distinct from a declared union", () => {
		const expression = new Affinirum("var x:integer|string=1;var i=0;while i<1 loop {i+=1;x='two'}");
		expect(expression.type.equals(Type.OptionalString)).toBe(true);
		expect(expression.evaluate()).toBe("two");
	});

	it("checks a repeated condition against the fixed declared type", () => {
		const expression = new Affinirum("var x:integer|string=1;while if x==1 then {true}else{(x:string).Length>0} loop {x=''};x");
		expect(expression.type.equals(Type.union(Type.Integer, Type.String))).toBe(true);
		expect(expression.evaluate()).toBe("");
	});
});

describe("Until loops", () => {
	it.each<[string, bigint]>([
		["loop {i+=1;i*10}", 30n],
		["loop i+=1", 3n],
		["while i<5 loop {i+=1;i*10}", 30n],
		["while i<5 loop i+=1", 3n],
	])("returns the final body value from %s until i==3", (loop, expected) => {
		const expression = new Affinirum(`var i=0;${loop} until i==3`, { timeout: 1000 });
		expect(expression.evaluate()).toBe(expected);
	});

	it("runs the body once when the until condition starts true", () => {
		const expression = new Affinirum("var visits=0;val result=loop {visits+=1;7} until true;[visits,result]", { timeout: 1000 });
		expect(expression.evaluate()).toEqual([1n, 7n]);
	});

	it("infers a boolean postcondition and rejects non-boolean or nullable conditions", () => {
		const source = "while true loop {1} until condition";
		expect(new Affinirum(source).variables().condition.equals(Type.Boolean)).toBe(true);
		expect(() => new Affinirum(source, { variables: { condition: Type.OptionalBoolean } }))
			.toThrow(/mismatch with expected type boolean/);
		expect(() => new Affinirum("while true loop {1} until 1"))
			.toThrow(/mismatch with expected type boolean/);
	});

	it("evaluates the postcondition exactly once after each completed body", () => {
		const calls: string[] = [];
		let iterations = 0;
		const expression = new Affinirum("loop body() until done()", {
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
		const expression = new Affinirum("while false loop {body()} until done()", {
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
		const expression = new Affinirum("var i=0;var checks=0;val result=while i<5 loop {i+=1;if i==2 then {next};i*10} until {checks+=1;i==2};[result,i,checks]");
		expect(expression.evaluate()).toEqual([10n, 2n, 2n]);
	});

	it("skips until after exit and retains the previous completed result", () => {
		const expression = new Affinirum("var i=0;var checks=0;val result=while i<5 loop {i+=1;if i==2 then {exit};i*10} until {checks+=1;false};[result,i,checks]");
		expect(expression.evaluate()).toEqual([10n, 2n, 1n]);
	});

	it("keeps nested postconditions attached to their own loops", () => {
		const expression = new Affinirum("var outer=0;var inner=0;val result=while true loop {outer+=1;while inner<4 loop {inner+=1;inner} until true;outer*10} until outer==2;[result,outer,inner]", { timeout: 1000 });
		expect(expression.evaluate()).toEqual([20n, 2n, 2n]);
	});

	it.each(["while false loop {1}", "while true loop {exit}"])("does not infer never from a skipped postcondition in %s", (loop) => {
		const expression = new Affinirum(`val f=func():integer? { ${loop} until (->7)};f()`);
		expect(expression.type.equals(Type.OptionalInteger)).toBe(true);
		expect(expression.evaluate()).toBeUndefined();
		expect(() => new Affinirum(`val f=func():integer { ${loop} until (->7)};f()`))
			.toThrow(/mismatch with expected type integer/);
	});

	it.each(["exit", "next"])("rejects %s in a postcondition with no enclosing loop", (jump) => {
		expect(() => new Affinirum(`while true loop {1} until ${jump}`))
			.toThrow(`unexpected ${jump} outside of a loop`);
	});

	it("does not inherit the caller's loop context in a function postcondition", () => {
		expect(() => new Affinirum("while true loop {val f=func():null { while true loop {1} until exit};exit}"))
			.toThrow(/unexpected exit outside of a loop/);
	});
});
