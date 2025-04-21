import { Expression, Type } from '../src/index.js';

describe('Expression Value Type test', ()=> {
	([
		['null', 'void'],
		['true', 'boolean'],
		['false', 'boolean'],
		['0', 'number'],
		['142.4', 'number'],
		['-0.4', 'number'],
		['#', 'number'],
		['#0', 'number'],
		['##', 'buffer'],
		['#0#', 'buffer'],
		['#00#', 'buffer'],
		['#01ff#', 'buffer'],
		['""', 'string'],
		['``', 'string'],
		['" "', 'string'],
		['"	"', 'string'],
		['[]', 'array'],
		['[0]', 'array'],
		['[0,1,2,3]', 'array'],
		['["0",1,2,"3"]', 'array'],
		['[:]', 'object'],
		['[`a`:100,`b`:"100"]', 'object'],
		['void ()->null', 'void()'],
		['boolean (number i)->i==0', 'boolean(number)'],
	] as [string, string][]).forEach(([expr, expected])=> {
		it(`parses expression ${expr} and determines value type`, ()=> {
			try {
				const expression = new Expression(expr);
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
