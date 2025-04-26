import { Affinirum } from '../src/index.js';

describe('Expression Value Type test', ()=> {
	([
		['null', 'void'],
		['true', 'boolean'],
		['false', 'boolean'],
		['0', 'number'],
		['-0', 'number'],
		['142.4', 'number'],
		['-0.4', 'number'],
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
		['void (){null}', '{void}()'],
		['boolean (i:number){i==0}', '{boolean}(number)'],
		['string (x:string, y:array...){y.Append(x), y.Join()}', '{string}(string,[]...)'],
		['number (x:integer, y:array...){y.Prepend(x), y.Length}', '{number}(integer,[]...)'],
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
});
