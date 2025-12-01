import { Affinirum } from "../src/index.js";

describe("Jump Evaluation test", ()=> {
	it("parses and evaluates expression with exit operator", ()=> {
		const script = new Affinirum(`
var i = a;
val r = while i<100 {
  if i>50 {
		800;
		=>i*1000;
	}
	else {
		i+=1
	};
	i*100;
};
r;
		`);
		expect(script.evaluate({ a: 1n }) as bigint).toBe(51000n);
		expect(script.evaluate({ a: 200n }) as bigint).toBeUndefined();
	});
	it("parses and evaluates expression with exit operator", ()=> {
		const script = new Affinirum(`
var i = a;
val f = ~integer() while i<100 {
  if i>50 {
		800;
		~>i*1000;
	}
	else {
		i+=1
	};
	i*100;
};
f();
		`);
		expect(script.evaluate({ a: 1n }) as bigint).toBe(51000n);
		expect(script.evaluate({ a: 200n }) as bigint).toBeUndefined();
	});
	it("parses and evaluates loop expression with stop operator", ()=> {
		const script = new Affinirum(`
var i = a;
val r = while i<100 {
  if i>50 {
		800;
		stop;
	}
	else {
		i+=1
	};
	i*100
};
r
		`);
		expect(script.evaluate({ a: 1n }) as bigint).toBe(5100n);
		expect(script.evaluate({ a: 200n }) as bigint).toBeUndefined();
	});
	it("parses and evaluates loop expression with next operator", ()=> {
		const script = new Affinirum(`
var i = a;
val r = while i<100 {
  if i==90 {
		i=555;
		next;
	}
	else
		i+=1;
	i+555
};
r
		`);
		expect(script.evaluate({ a: 10n }) as bigint).toBe(645n);
		expect(script.evaluate({ a: 200n }) as bigint).toBeUndefined();
	});
});
