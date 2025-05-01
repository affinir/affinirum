import { Affinirum } from '../src/index.js';

describe('Compiled Type test', ()=> {
	([
		['null', 'void'],
		['true', 'boolean'],
		['false', 'boolean'],
		['0', 'integer'],
		['-0', 'integer'],
		['142.4', 'float'],
		['-0.4', 'float'],
		['@2020-01-02 11:10:10.200Z', 'timestamp'],
		['00', 'integer'],
		['-00', 'integer'],
		['-020', 'integer'],
		['#', 'buffer'],
		['#0', 'buffer'],
		['#', 'buffer'],
		['#0', 'buffer'],
		['#00', 'buffer'],
		['#01ff', 'buffer'],
		['""', 'string'],
		['``', 'string'],
		['" "', 'string'],
		['"	"', 'string'],
		['[]', '[]'],
		['[0]', '[]'],
		['[0,1,2,3]', '[]'],
		['["0",1,2,"3"]', '[]'],
		['[:]', '[:]'],
		['[`a`:100,`b`:"100"]', '[:]'],
		['~ void (){null}', '~void()'],
		['~ void|float|string (arg: float|string){null}', '~void|float|string(float|string)'],
		['~ void|[float|string] (arg: [float|string]){null}', '~void|[float|string]([float|string])'],
		['~boolean (i:float){i==0}', '~boolean(float)'],
		['~string (x:string, y:array...){y.Append(x); y.Join()}', '~string(string,[]...)'],
		['~integer (x:integer, y:array...){y.Prepend(x); y.Length}', '~integer(integer,[]...)'],
	] as [string, string][]).forEach(([expr, expected])=> {
		it(`parses expression ${expr} and determines value type`, ()=> {
			try {
				const expression = new Affinirum(expr);
				expect(expression).toBeDefined();
				expression.evaluate({});
				if (expression.type.toString() !== expected) {
					fail(`value ${expression.type.toString()} not matching expectation ${expected}`)
				}
			}
			catch (err) {
				fail(`parsing error\n${(err as Error).message}`);
			}
		});
	});
	it('parses pure constant expression and tests return type', ()=> {
		const expression = new Affinirum('("ABC" + Timestamp.Parse("2000-01-01").Format(1)).Length');
		expect(expression.type.toString()).toBe('integer');
	});
	it('parses expression and tests undefined variable types', ()=> {
		const expression = new Affinirum('(a-b)*c.prop/d.UpperCase.Length-100');
		const variables = expression.variables();
		expect(variables.a.isNumeric).toBeTrue();
		expect(variables.b.isNumeric).toBeTrue();
		expect(variables.d.isString).toBeTrue();
	});
});
