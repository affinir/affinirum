import { Affinirum } from '../src/index.js';

describe('Multiple Evaluation test', ()=> {
	it('parses and evaluates multiple times', ()=> {
		const script = new Affinirum('arr0.Any(~boolean(a:float) { a > 0 } )');
		expect(script.evaluate({ arr0: [1, -2, -3, -4] })).toBeTrue();
		expect(script.evaluate({ arr0: [-1, -2, -3, -4] })).toBeFalse();
	});
	it('parses random float function and evaluates multiple times', ()=> {
		const script = new Affinirum('Float.Random(1000000.0)');
		expect(script.evaluate() === script.evaluate()).toBeFalse();
	});
	it('parses random string function and evaluates multiple times', ()=> {
		const script = new Affinirum('String.Random(20)');
		expect(script.evaluate() === script.evaluate()).toBeFalse();
	});
});
