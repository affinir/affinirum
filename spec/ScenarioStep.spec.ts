import { Affinirum, Type } from '../src/index.js';

describe('Scenario Step test', ()=> {
	it('parses and evaluates multiple times', ()=> {
		const expression = new Affinirum('arr0.Any(~boolean(a:number) { a > 0 } )');
		expect(expression.evaluate({ arr0: [1, -2, -3, -4] })).toBeTrue();
		expect(expression.evaluate({ arr0: [-1, -2, -3, -4] })).toBeFalse();
	});
	it('parses and returns undefined variables', ()=> {
		const expression = new Affinirum('(a-b)*c.prop/d.UpperCase.Length-100');
		const variables = expression.variables();
		expect(variables.a.isNumeric).toBeTrue();
		expect(variables.b.isNumeric).toBeTrue();
		expect(variables.d.isString).toBeTrue();
	});
	it('defines variables in strict mode and evaluates', ()=> {
		const expression = new Affinirum('predefined1*2 + predefined2 + 26 * 13',
			{ strict: true, variables: { predefined1: Type.Integer, predefined2: Type.Integer, myvar: Type.String } });
		expect(expression.evaluate({ predefined1: 10n, predefined2: 20n }) as bigint).toBe(378n);
	});
	it('errors on undefines variables in strict mode', ()=> {
		try {
			new Affinirum('undefined1*2 + undefined2', { strict: true, variables: { defined: Type.Number } });
		}
		catch (err: any) {
			expect(err.message).toContain('error');
			expect(err.message).toContain('undefined1');
		}
	});
	it('parses random number function and evaluates multiple times', ()=> {
		const expression = new Affinirum('Number.Random(1000000.0)');
		expect(expression.evaluate() === expression.evaluate()).toBeFalse();
	});
	it('parses random string function and evaluates multiple times', ()=> {
		const expression = new Affinirum('String.Random(20)');
		expect(expression.evaluate() === expression.evaluate()).toBeFalse();
	});
	it('parses and evaluates null value conversion to text', ()=> {
		const expression = new Affinirum('AVN.Format(obj0)');
		expect(expression.evaluate({ obj0: undefined }) as string).toBe('null');
	});
	it('parses pure constant expression and compiles to a constant node', ()=> {
		const expression = new Affinirum('("ABC" + Timestamp.Format(Timestamp.Parse("2000-01-01"))).Length');
		expect(expression.type.toString()).toBe('integer');
	});
	it('parses and evaluates value conversion to text', ()=> {
		const expression = new Affinirum('AVN.Format(obj1)');
		expect(expression.evaluate({ obj1: {
			bool: true,
			num: -50,
			buf: new Uint8Array([10, 20, 30, 0, 4, 67, 12, 11, 200, 220, 0, 50]).buffer,
			str: 'string value', func: ()=> '1234',
			arr: [1n, 2n, 3n],
			obj: { a: 1, b: 2 },
		} }) as string).toBe('["bool":true,"num":-50.0,"buf":#0a141e0004430c0bc8dc0032,"str":"string value","func":function,"arr":[1,2,3],"obj":["a":1.0,"b":2.0]]');
	});
});
