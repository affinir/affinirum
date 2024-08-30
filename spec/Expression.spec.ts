import { Expression, typeNumber, typeString } from '../src/index.js';

describe('Expression Evaluation test', ()=> {
	[
		[ 'null', [ { result: undefined } ] ],
		[ 'false', [ { result: false } ] ],
		[ 'true', [ { result: true } ] ],
		[ '0.5', [ { result: 0.5 } ] ],
		[ '0.434e+2', [ { result: 43.4 } ] ],
		[ '0.434e2', [ { result: 43.4 } ] ],
		[ '0.434e000002', [ { result: 43.4 } ] ],
		[ '4.1e-1', [ { result: 0.41 } ] ],
		[ '4.1e-01', [ { result: 0.41 } ] ],
		[ '""', [ { result: '' } ] ],
		[ '"0 "', [ { result: '0 ' } ] ],
		[ '#0', [ { result: 0 } ] ],
		[ '#ffff', [ { result: 65535 } ] ],
		[ '#AAAA', [ { result: 43690 } ] ],
		[ '##.toBufferString', [ { result: '' } ] ],
		[ 'a.toBufferString', [ { a: new Uint8Array().buffer, result: '' } ] ],
		[ '_var', [ { _var: undefined, result: undefined }, { _var: 0, result: 0 }, { _var: 'str0', result: 'str0' }, { _var: true, result: true } ] ],
		[ '!b', [ { b: true, result: false }, { b: false, result: true } ] ],
		[ 'i==0 & and(b, c, true)', [ { i: 1, b: true, c: true, result: false }, { i: 0, b: true, c: false, result: false } ] ],
		[ 'i==0 | or(b, c, false)', [ { i: 1, b: true, c: false, result: true }, { i: 0, b: false, c: false, result: true } ] ],
		[ 'a > b', [ { a: 1, b: -1, result: true }, { a: 11, b: 55, result: false } ] ],
		[ 'a < b', [ { a: 1, b: -1, result: false }, { a: 11, b: 55, result: true } ] ],
		[ 'a >= b', [ { a: 1, b: 2, result: false }, { a: 5, b: -1, result: true }, { a: 0, b: 0, result: true } ] ],
		[ 'a <= b', [ { a: 2, b: 1, result: false }, { a: 1, b: 2, result: true }, { a: 1, b: 1, result: true } ] ],
		[ 'a == b', [ { a: 1, b: '1', result: false }, { a: 1, b: 1.0001, result: false }, { a: 1, b: 1, result: true } ] ],
		[ 'a != b', [ { a: 1, b: '1', result: true }, { a: 1, b: 1.0001, result: true }, { a: 1, b: 1, result: false } ] ],
		[ 'a ~ b', [ { a: '   Abcd  0123  !', b: 'abcd-0123 ', result: true }, { a: 'ab', b: 'ba', result: false } ] ],
		[ 'a.like(b)', [ { a: '   Abcd  0123  !', b: 'abcd-0123 ', result: true }, { a: 'ab', b: 'ba', result: false } ] ],
		[ 'a !~ b', [ { a: '  abcd  0123  !', b: 'abcd-00123  ', result: true }, { a: '  abcd  0123  ! ', b: 'Ab cD-0123  ', result: false } ] ],
		[ 'a.unlike(b)', [ { a: '  abcd  0123  !', b: 'abcd-00123  ', result: true }, { a: '  abcd  0123  ! ', b: 'Ab cD-0123  ', result: false } ] ],
		[ 'v.contains(str0)', [ { v: ' abc def abc', str0: 'def', result: true }, { v: ' abc ', str0: 'aba', result: false } ] ],
		[ 'v.contains(str0, pos, true)', [ { v: '', str0: '', pos: null, result: true }, { v: '', str0: '123', pos: 0, result: false }, { v: '  ab CD  0123   ', str0: ' A Bcd ', pos: null, result: true }, { v: '  ab C-D  0123   ', str0: ' A+Bcd ', pos: null, result: true } ] ],
		[ 'v.startsWith(str0, pos, true)', [ { v: '', str0: '', pos: undefined, result: true }, { v: '', str0: '123', pos: 0, result: false }, { v: '  ab CD  0123   ', str0: ' A++Bcd ', pos: undefined, result: true }, { v: 'ab CD  0123   ', str0: 'abcd', pos: 2, result: false } ] ],
		[ 'v.endsWith(str0, pos, true,) & true', [ { v: '', str0: '', pos: undefined, result: true }, { v: '', str0: '123', pos: 0, result: false }, { v: ' ab CD  01+2+ 3 ', str0: ' 0123 ', pos: undefined, result: true }, { v: ' abcdeeeeeef 123', str0: '123', pos: 7, result: false } ] ],
		[ 'v.switch(a, b)', [ { v: true, a: 1, b: 2, result: 1 }, { v: false, a: 'f', b: undefined, result: undefined } ] ],
		[ 'if v then a else b', [ { v: true, a: 1, b: 2, result: 1 }, { v: false, a: 'f', b: undefined, result: undefined } ] ],
		[ 'v.switch(a, b)', [ { v: true, a: 1, b: 2, result: 1 }, { v: false, a: 'f', b: undefined, result: undefined } ] ],
		[ '100+if c*2 > 10 then a*10 else b*20', [ { c: 10, a: 1, b: 2, result: 110 }, { c: 1, a: 1, b: 2, result: 140 } ] ],
		[ '100+if c*2 > 10 then a*10 else b*20-100', [ { c: 10, a: 1, b: 2, result: 110 }, { c: 1, a: 1, b: 2, result: 40 } ] ],
		[ '100+(if c*2 > 10 then a*10 else b*20)-100', [ { c: 10, a: 1, b: 2, result: 10 }, { c: 1, a: 1, b: 2, result: 40 } ] ],
		[ 'a?:b', [ { a: 1, b: 2, result: 1 }, { a: undefined, b: 0, result: 0 }, { a: undefined, b: undefined, result: undefined } ] ],
		[ '(a+b)*(c+d)-(e-f)/(g+h)', [ { a: 1, b: 2, c: 3, d: 4, e: 1, f: 0, g: 0.5, h: 0.5, result: 20 } ] ],
		[ 'a+>b+>(c+>d)', [ { a: '1', b: 'b', c: 'c', d: '3', result: '1bc3' } ] ],
		[ '"0"+>"1"+>`2`', [ { result: '012' } ] ],
		[ '(x + 10 + #0) * (y - 10)>0', [ { x: 10, y: 10, result: false }, { x: 100, y: 100, result: true } ] ],
		[ '(a + b + c + d) * ( a -b-c + 1 ) / b + 1*((a<23).switch(10,20))', [ { a: 20, b: 10, c: 1, d: 2, result: 43 } ] ],
		[ '[a, b, c].append([ 1, 2, 3, 4 ]).reduce(number(number acc,number val)->acc+val)', [ { a: 1, b: 2, c: 3, result: 16 } ] ],
		[ '100.add(10, 10, 13)', [ { result: 133 } ] ],
		[ '-a^2 == b', [ { a: 2, b: -4, result: true } ] ],
		[ '_1.power(2)+40 % 25', [ { _1: 10, result: 110 } ] ],
		[ 'longvariablename.sqrt()-10', [ { longvariablename: 100, result: 0 } ] ],
		[ 'min([x,2]) + max([y,3])', [ { x: 10, y: 20, result: 22 } ] ],
		[ 'x.round()', [ { x: 10.1, result: 10 }, { x: 10.9, result: 11 } ] ],
		[ 'v.toNumberBuffer(enc).fromNumberBuffer(enc)', [ { v: 0, enc: 'uint8', result: 0 }, { v: 1055, enc: 'uint16', result: 1055 }, { v: 1055, enc: 'uint16le', result: 1055 } ] ],
		[ 'v.toStringBuffer(enc).fromStringBuffer(enc)', [ { v: '', enc: 'utf8', result: '' }, { v: '1055', enc: 'utf8', result: '1055' }, { v: '1055', enc: 'ucs2le', result: '1055' } ] ],
		[ '##ffff0001.slice(1).toBufferString()', [ { result: 'ff0001' } ] ],
		[ 'a.byte(b).toBufferString()', [ { a: new Uint8Array([ 0xff, 0xff, 0x00, 0x01 ]).buffer, b: 3, result: '01' }, { a: new Uint8Array([ 0x10, 0x00 ]).buffer, b: 0, result: '10' } ] ],
		[ 's.length()', [ { s: 'my long string', result: 14 }, { s: 'my', result: 2 }, { s: '', result: 0 } ] ],
		[ 'abc.length * 10 - 5', [ { abc: 'abc', result: 25 } ] ],
		[ 'a.trim().length() == 6', [ { a: '  abcdef  ', result: true } ] ],
		[ '[a, b, c].length() + [ 1, 2, 3, 4 ].length()', [ { a: 1, b: 2, c: 3, result: 7 } ] ],
		[ 'a.length() % 50', [ { a: 'abcd', result: 2 }, { a: 'abcdef', result: 3 } ] ],
		[ 'a.alphanum()', [ { a: '---abcd===', result: 'abcd' }, { a: '+abc-def!', result: 'abcdef' } ] ],
		[ 'str1.trim() +> str2.trimStart() +> str3.trimEnd()', [ { str1: ' abcd ', str2: '  a', str3: '0  ', result: 'abcda0' } ] ],
		[ 'x.trim.lowerCase()', [ { x: '  ABC  ', result: 'abc' }, { x: 'ABCD  ', result: 'abcd' } ] ],
		[ 'a.slice(3,4).upperCase()', [ { a: 'abcdef', result: 'D' }, { a: 'abcDef---', result: 'D' } ] ],
		[ 's.char(p)', [ { s: 'my long string', p: 1, result: 'y' }, { s: 'my+', p: 0, result: 'm' }, { s: '1', p: 1, result: '' } ] ],
		[ 'str0.char(2) == `a`', [ { str0: 'bca', result: true }, { str0: 'bce', result: false } ] ],
		[ 'chain([[[10]]])[0]', [ { result: 10 } ] ],
		[ '[1, 2, 3, 4].append([5]).sum()', [ { result: 15 } ] ],
		[ '[[[10]]][0][0][0]', [ { result: 10 } ] ],
		[ '[0,1][i]==null', [ { i: 2, result: true }, { i: 1, result: false } ] ],
		[ '[0,1][2]?:n', [ { n: 5, result: 5 }, { n: undefined, result: undefined } ] ],
		[ '(a[n+1] + 2)^2', [ { a: [ 0, 1, 2 ], n: 1, result: 16 } ] ],
		[ '[0,1,2,3,4].join(sep)', [ { sep: undefined, result: '0 1 2 3 4' }, { sep: ':', result: '0:1:2:3:4' } ] ],
		[ '[0,1,2,3,4].join(":")', [ { result: '0:1:2:3:4' } ] ],
		[ '?? a=[0,10,200,3000,40000], a.keys()[1] + a.values()[2]', [ { result: 201 } ] ],
		[ '[100,200,300].entries()[1][1]+[1,2,3].entries()[1][0]', [ { result: 201 } ] ],
		[ '[0,1,2,3].append([10,20,30,40])[5]', [ { result: 20 } ] ],
		[ '[1,2,3,4].reduce(number (number a, number b)->a.subtract(b))', [ { result: -8 } ] ],
		[ 'a.unique().reduce(?? (?? acc,?? val)->(acc+val))', [ { a: [ 1, 2, 3, 3, 2, 1 ], result: 6 }, { a: [ 'a', 'b', 'c', 'a', 'b', 'c' ], result: 'abc' } ] ],
		[ 'sum([0,1,2,3]+>[10,20,30,40],100)', [ { result: 206 } ] ],
		[ 'arr0[3] == 50', [ { arr0: [ 10, 20, 30, 50 ], result: true }, { arr0: [], result: false } ] ],
		[ 'arr0[i]', [ { arr0: [ 10, 20, 30, 50 ], i: 0, result: 10 }, { arr0: [], i: 5, result: undefined } ] ],
		[ 'arr0[1] + obj0{1}', [ { arr0: [ undefined, 10, 20 ], obj0: { a: undefined, b: 100 }, result: 110 }, { arr0: [ 1, 2 ], obj0: { a: 1, b: 1 }, result: 3 } ] ],
		[ 'range(start, end)[0] + range(start, end)[1]', [ { start: 5, end: 10, result: 11 }, { start: -5, end: -10, result: -19 } ] ],
		[ 'number s=0,range(start, end).iterate(void(number x)->(s=s+x)),s', [ { start: 1, end: 11, result: 55 }, { start: -1, end: -11, result: -65 } ] ],
		[ '[p,11].map( number?(number a)-> (number t=10, (a>10).switch(t,null) ) )[i]', [ { i: 1, p: 10, result: 10 }, { i: 0, p: 1, result: undefined } ] ],
		[ '[p,p,1, 2, 3].map(number?(number? a)->(a?:10))[1]', [ { p: undefined, result: 10 }, { p: 0, result: 0 } ] ],
		[ 'arr1.first(boolean(number v, number i)->(v==2))', [ { arr1: [ 1, 2, 3 ], result: 2 }, { arr1: [ 2, 2, 3 ], result: 2 } ] ],
		[ 'arr1.last(boolean(number v, number i)->(i==1))', [ { arr1: [ 1, 2, 3 ], result: 2 }, { arr1: [ 10, 20, 30 ], result: 20 } ] ],
		[ 'arr1.firstIndex(boolean(number v, number i)->(v==2))', [ { arr1: [ 1, 2, 3 ], result: 1 } ] ],
		[ 'arr1.lastIndex(boolean(number v, number i)->(i==1))', [ { arr1: [ 1, 2, 3 ], result: 1 } ] ],
		[ 'arr1.filter(boolean(number v, number i, array a)->(a[i]*i>2))[1]', [ { arr1: [ 1, 1, 5, 4, 1 ], result: 4 } ] ],
		[ 'arr0.map(number(number val)->(val*2*t)).filter(boolean(number val)->(val>5))[1]+[9].length()', [ { arr0: [ 1, 2, 3 ], t: 2, result: 13 } ] ],
		[ 'arr0.map( array(array a)->( a.map(number(number b)->(b+12)) )).flatten().sum()', [ { arr0: [ [ 1 ], [ 1, 2 ], [ 2, 3, 4 ] ], result: 85 } ] ],
		[ 'arr0.any(boolean(object a)->(a.i>0 & a.d>0))', [ { arr0: [ { i: -1, d: -1 }, { i: -1, d: 5 }, { i: 1, d: 1 } ], result: true } ] ],
		[ 'arr0.any(boolean(number a) -> a > 0 )', [ { arr0: [ 1, -2, -3, -4 ], result: true }, { arr0: [ -1, -2, -3, -4 ], result: false } ] ],
		[ 'arr0.every(boolean(number a)->( a > 0 ) )', [ { arr0: [ 1, 2, 3, 4 ], result: true }, { arr0: [ 1, -2, 3, 4 ], result: false } ] ],
		[ 'boolean x=arr0.any(boolean(number a)->a<0),boolean b=c,x&b', [ { arr0: [ 0, -1 ], c: true, result: true } ] ],
		[ '{a:a1+a2, "b": b1, c: "10", if a1 > 0 then "  d".trim else "zz": 3, "p": 10}{p}', [ { a1: 1, a2: 2, b1: 'b', p: 'd', result: 3 }, { a1: -2, a2: 18, b1: 'bb', p: 'zz', result: 3 } ] ],
		[ '{n:50,"a" : 10,b:`my string`}{p}', [ { p: 'n', result: 50 }, { p: 'a', result: 10 }, { p: 'b', result: 'my string' } ] ],
		[ '(a.merge(b)).i == 0', [ { a: { f: 0, d: 0 }, b: { i: 0 }, result: true }, { a: { i: 50, d: 0 }, b: { i: 0 }, result: true } ] ],
		[ 'a.merge(b,c).i == 0', [ { a: { f: 0, d: 0 }, b: { i: 0 }, c: {}, result: true }, { a: { i: 50, d: 0 }, b: { i: 0 }, c: { prop: 1 }, result: true } ] ],
		[ 'a.compose(string (object acc, string key)->key.char(0))."a"', [ { a: [ 'a', 'b', 'c' ], result: 'a' }, { a: [ 'b', 'a' ], result: 'a' } ] ],
		[ 'ooo.entries()[0]."1"', [ { ooo: { a: 0, b: 1 }, result: 0 }, { ooo: { b: 'b', a: 'a' }, result: 'b' } ] ],
		[ 'o1.keys()[i]', [ { o1: { a: 0, b: 1 }, i: 0, result: 'a' }, { o1: { b: 'baa', c: 'caa' }, i: 1, result: 'c' } ] ],
		[ 'o1.values()[i]', [ { o1: { a: 0, b: 1 }, i: 0, result: 0 }, { o1: { b: 'baa', c: 'caa' }, i: 1, result: 'caa' } ] ],
		[ 'number a=myvar/3,?? b=mv*2,a/b', [ { myvar: 6, mv: 1, result: 1 }, { myvar: 30, mv: 5, result: 1 } ] ],
		[ 'obj1.`a0`', [ { obj1: { a0: 10 }, result: 10 }, { obj1: { a0: '10' }, result: '10' } ] ],
		[ 'obj2{"prop"}.a', [ { obj2: { prop: { a: 10 } }, result: 10 }, { obj2: { prop: { a: '10' } }, result: '10' } ] ],
		[ 'val*myobj{a{"prop"}}+1', [ { val: 1, myobj: { test: 10 }, a: { prop: 'test' }, result: 11 } ] ],
		[ 'obj3{prop1}+obj3{prop2}', [ { obj3: { prop1: 1, prop2: 2 }, prop1: 'prop1', prop2: 'prop2', result: 3 } ] ],
		[ 'test[0].prop1==test[1]{"prop2"}', [ { test: [ { prop1: 1, prop2: 2 }, { prop1: 2, prop2: 1 } ], result: true } ] ],
		[ 'str1.fromJson.prop1+str2.fromJson().prop2', [ { str1: '{"prop1":1}', str2: '{"prop2":20}', result: 21 } ] ],
		[ 'str1.fromJson()+str2.fromJson()', [ { str1: '"p1"', str2: '"p2"', result: 'p1p2' } ] ],
		[ 'obj1.toJson()+>obj2.toJson()', [ { obj1: { p1: 'a' }, obj2: { p2: 'b' }, result: '{"p1":"a"}{"p2":"b"}' } ] ],
		[ 'obj1.toJson()', [ { obj1: { p1: 'a' }, result: '{"p1":"a"}' } ] ],
		[ 'function f=boolean(number a)->(a=a*100, a>0),a.filter(f).sum()', [ { a: [ -10, -20, 1, 2 ], result: 3 } ] ],
		[ 'a.intersection(b).sum()', [ { a: [ -1, 2, 1, -2 ], b: [ 1, 2 ], result: 3 } ] ],
		[ 'a.difference(b).sum()', [ { a: [ -1, -2, 1, 2 ], b: [ 1, 2 ], result: -3 } ] ],
		[ 'a.b.c.d ?: 10', [ { a: { b: { c: undefined } }, result: 10 }, { a: { b: {} }, result: 10 } ] ],
		[ 'a[4][0][0] ?: 10', [ { a: [ 0 ], result: 10 }, { a: [ [ 0 ] ], result: 10 } ] ],
		[ 'a{x}', [ { a: { b: 1 }, x: 'a', result: undefined }, { a: { b: 1 }, x: '1', result: undefined } ] ],
		[ 'a[x]', [ { a: [ 0,  1 ], x: 5, result: undefined }, { a: [ 0 ], x: -5, result: undefined } ] ],
	].forEach(([ expr, args ])=> {
		(args as Record<string, any>[]).forEach((v)=> {
			it(`parses expression '${expr}' and evaluates it for arguments ${JSON.stringify(v)}`, ()=> {
				try {
					const expression = new Expression(expr as string);
					expect(expression).toBeDefined();
					try {
						const value = expression.evaluate(v);
						if (value !== v.result) {
							fail(`value ${value} not matching expectation ${v.result}`)
						}
					}
					catch (err) {
						fail(`evaluation error\n${(err as Error).message}`);
					}
				}
				catch (err) {
					fail(`parsing error\n${(err as Error).message}`);
				}
			});
		});
	});
	it('parses and evaluates multiple times', ()=> {
		const expression = new Expression('arr0.any(boolean(number a) -> (a > 0) )');
		expect(expression.evaluate({ arr0: [ 1, -2, -3, -4 ] })).toBeTrue();
		expect(expression.evaluate({ arr0: [ -1, -2, -3, -4 ] })).toBeFalse();
	});
	it('parses and returns undefined variables', ()=> {
		const expression = new Expression('(a-b)*c.prop/d.upperCase.length-100');
		const variables = expression.variables();
		expect(variables.a.isNumber).toBeTrue();
		expect(variables.b.isNumber).toBeTrue();
		expect(variables.d.isString).toBeTrue();
	});
	it('defines variables in strict mode and evaluates', ()=> {
		const expression = new Expression('predefined1*2 + predefined2', { strict: true, variables: { predefined1: typeNumber, predefined2: typeNumber, myvar: typeString } });
		expect(expression.evaluate({ predefined1: 10, predefined2: 20 }) as number).toBe(40);
	});
	it('errors on undefines variables in strict mode', ()=> {
		try {
			new Expression('undefined1*2 + undefined2', { strict: true, variables: { defined: typeNumber } });
		}
		catch (err: any) {
			expect(err.message).toContain('error');
			expect(err.message).toContain('undefined1');
		}
	});
});
