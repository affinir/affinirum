import { Expression, Type } from '../src/index.js';

describe('Expression Evaluation Result test', ()=> {
	it('parses and evaluates multiple times', ()=> {
		const expression = new Expression('arr0.Any(boolean(number a) -> (a > 0) )');
		expect(expression.evaluate({ arr0: [1, -2, -3, -4] })).toBeTrue();
		expect(expression.evaluate({ arr0: [-1, -2, -3, -4] })).toBeFalse();
	});
	it('parses and returns undefined variables', ()=> {
		const expression = new Expression('(a-b)*c.prop/d.UpperCase.Length-100');
		const variables = expression.variables();
		expect(variables.a.isNumber).toBeTrue();
		expect(variables.b.isNumber).toBeTrue();
		expect(variables.d.isString).toBeTrue();
	});
	it('defines variables in strict mode and evaluates', ()=> {
		const expression = new Expression('predefined1*2 + predefined2', { strict: true, variables: { predefined1: Type.Number, predefined2: Type.Number, myvar: Type.String } });
		expect(expression.evaluate({ predefined1: 10, predefined2: 20 }) as number).toBe(40);
	});
	it('errors on undefines variables in strict mode', ()=> {
		try {
			new Expression('undefined1*2 + undefined2', { strict: true, variables: { defined: Type.Number } });
		}
		catch (err: any) {
			expect(err.message).toContain('error');
			expect(err.message).toContain('undefined1');
		}
	});
	it('parses random number function and evaluates multiple times', ()=> {
		const expression = new Expression('RandomNumber(1000000)');
		expect(expression.evaluate() === expression.evaluate()).toBeFalse();
	});
	it('parses random string function and evaluates multiple times', ()=> {
		const expression = new Expression('RandomString(20)');
		expect(expression.evaluate() === expression.evaluate()).toBeFalse();
	});
	it('parses and evaluates null value conversion to text', ()=> {
		const expression = new Expression('obj.ToAN()');
		expect(expression.evaluate({ obj: undefined }) as string).toBe('null');
	});
	it('parses and evaluates value conversion to text', ()=> {
		const expression = new Expression('obj.ToAN()');
		expect(expression.evaluate({ obj: {
			bool: true,
			num: -50,
			buf: new Uint8Array([10, 20, 30, 0, 4, 67, 12, 11, 200, 220, 0, 50]).buffer,
			str: 'string value', func: ()=> '1234',
			arr: [1, 2, 3],
			obj: { a: 1, b: 2 },
		} }) as string).toBe('["bool":true,"num":-50,"buf":#0a141e0004430c0bc8dc0032#,"str":"string value","func":function,"arr":[1,2,3],"obj":["a":1,"b":2]]');
	});
});
