import { Affinirum } from '../src/index.js';

describe('Text Format test', ()=> {
	it('parses and evaluates value conversion to text', ()=> {
		const expression = new Affinirum('AN.Format(obj1)');
		expect(expression.evaluate({ obj1: {
			xbool: true,
			xfloat: -50,
			xbuf: new Uint8Array([10, 20, 30, 0, 4, 67, 12, 11, 200, 220, 0, 50]).buffer,
			xstr: 'string value',
			xfunc: ()=> '1234',
			xarr: [1n, 2n, 3n],
			xobj: { a: 1, b: 2 },
		} }) as string).toBe('["xbool":true,"xfloat":-50.0,"xbuf":#0a141e0004430c0bc8dc0032,"xstr":"string value","xfunc":function,"xarr":[1,2,3],"xobj":["a":1.0,"b":2.0]]');
	});
});
