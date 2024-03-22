import { ExpressionService } from '../src/index.js';

//
// Test cases
//
//
let passed = 0, failed = 0;
console.log( `testExpressionService started...` );
[
	[ 'null', [ { result: undefined } ] ],
	[ 'false', [ { result: false } ] ],
	[ 'true', [ { result: true } ] ],
	[ '0.5', [ { result: 0.5 } ] ],
	[ '""', [ { result: '' } ] ],
	[ '"0 "', [ { result: '0 ' } ] ],
	[ '_var', [ { _var: undefined, result: undefined }, { _var: 0, result: 0 }, { _var: 'str', result: 'str' }, { _var: true, result: true } ] ],
	[ '!b', [ { b: true, result: false }, { b: false, result: true } ] ],
	[ 'i=0 & and(b, c, true)', [ { i: 1, b: true, c: true, result: false }, { i: 0, b: true, c: false, result: false } ] ],
	[ 'i=0 | or(b, c, false)', [ { i: 1, b: true, c: false, result: true }, { i: 0, b: false, c: false, result: true } ] ],
	[ 'a > b', [ { a: 1, b: -1, result: true }, { a: 11, b: 55, result: false } ] ],
	[ 'a < b', [ { a: 1, b: -1, result: false }, { a: 11, b: 55, result: true } ] ],
	[ 'a >= b', [ { a: 1, b: 2, result: false }, { a: 5, b: -1, result: true }, { a: 0, b: 0, result: true } ] ],
	[ 'a <= b', [ { a: 2, b: 1, result: false }, { a: 1, b: 2, result: true }, { a: 1, b: 1, result: true } ] ],
	[ 'a = b', [ { a: 1, b: '1', result: false }, { a: 1, b: 1.0001, result: false }, { a: 1, b: 1, result: true } ] ],
	[ 'a != b', [ { a: 1, b: '1', result: true }, { a: 1, b: 1.0001, result: true }, { a: 1, b: 1, result: false } ] ],
	[ 'a ~ b', [ { a: "   Abcd  0123  !", b: "abcd-0123 ", result: true }, { a: "ab", b: "ba", result: false } ] ],
	[ 'a.like(b)', [ { a: "   Abcd  0123  !", b: "abcd-0123 ", result: true }, { a: "ab", b: "ba", result: false } ] ],
	[ 'a !~ b', [ { a: "  abcd  0123  !", b: "abcd-00123  ", result: true }, { a: "  abcd  0123  ! ", b: "Ab cD-0123  ", result: false } ] ],
	[ 'a.nlike(b)', [ { a: "  abcd  0123  !", b: "abcd-00123  ", result: true }, { a: "  abcd  0123  ! ", b: "Ab cD-0123  ", result: false } ] ],
	[ 'v.contains(str)', [ { v: " abc def abc", str: 'def', result: true }, { v: " abc ", str: 'aba', result: false } ] ],
	[ 'v.contains(str, pos, true)', [ { v: "", str: "", pos: null, result: true }, { v: "", str: "123", pos: 0, result: false }, { v: "  ab CD  0123   ", str: " A Bcd ", pos: null, result: true }, { v: "  ab C-D  0123   ", str: " A+Bcd ", pos: null, result: true } ] ],
	[ 'v.startsWith(str, pos, true)', [ { v: "", str: "", pos: undefined, result: true }, { v: "", str: "123", pos: 0, result: false }, { v: "  ab CD  0123   ", str: " A++Bcd ", pos: undefined, result: true }, { v: "ab CD  0123   ", str: "abcd", pos: 2, result: false } ] ],
	[ 'v.endsWith(str, pos, true)', [ { v: "", str: "", pos: undefined, result: true }, { v: "", str: "123", pos: 0, result: false }, { v: " ab CD  01+2+ 3 ", str: " 0123 ", pos: undefined, result: true }, { v: " abcdeeeeeef 123", str: "123", pos: 7, result: false } ] ],
	[ 'v.ifte(a, b)', [ { v: true, a: 1, b: 2, result: 1 }, { v: false, a: 'f', b: undefined, result: undefined } ] ],
	[ 'if v then a else b', [ { v: true, a: 1, b: 2, result: 1 }, { v: false, a: 'f', b: undefined, result: undefined } ] ],
	[ 'v.ifte(a, b)', [ { v: true, a: 1, b: 2, result: 1 }, { v: false, a: 'f', b: undefined, result: undefined } ] ],
	[ '100+if c*2 > 10 then a*10 else b*20', [ { c: 10, a: 1, b: 2, result: 110 }, { c: 1, a: 1, b: 2, result: 140 } ] ],
	[ '100+if c*2 > 10 then a*10 else b*20-100', [ { c: 10, a: 1, b: 2, result: 110 }, { c: 1, a: 1, b: 2, result: 40 } ] ],
	[ '100+(if c*2 > 10 then a*10 else b*20)-100', [ { c: 10, a: 1, b: 2, result: 10 }, { c: 1, a: 1, b: 2, result: 40 } ] ],
	[ 'a?=b', [ { a: 1, b: 2, result: 1 }, { a: undefined, b: 0, result: 0 }, { a: undefined, b: undefined, result: undefined } ] ],
	[ '(a+b)*(c+d)-(e-f)/(g+h)', [ { a: 1, b: 2, c: 3, d: 4, e: 1, f: 0, g: 0.5, h: 0.5, result: 20 } ] ],
	[ 'a+b+(c+d)', [ { a: '1', b: 'b', c: 'c', d: '3', result: '1bc3' } ] ],
	[ '"0"+"1"+`2`', [ { result: '012' } ] ],
	[ '(x + 10) * (y - 10)>0', [ { x: 10, y: 10, result: false }, { x: 100, y: 100, result: true } ] ],
	[ '(a + b + c + d) * ( a -b-c + 1 ) / b + 1*((a<23).ifte(10,20))', [ { a: 20, b: 10, c: 1, d: 2, result: 43 } ] ],
	[ '[a, b, c] + [ 1, 2, 3, 4 ]', [ { a: 1, b: 2, c: 3, result: 16 } ] ],
	[ 'add([[100, [[10]]], [10], 13])', [ { result: 133 } ] ],
	[ '-a^2 = b', [ { a: 2, b: -4, result: true } ] ],
	[ 'pow(_1,2)+40 % 25', [ { _1: 10, result: 110 } ] ],
	[ 'sqrt(longvariablename)-10', [ { longvariablename: 100, result: 0 } ] ],
	[ 'min(x,2) + max(y,3)', [ { x: 10, y: 20, result: 22 } ] ],
	[ 'round(x)', [ { x: 10.1, result: 10 }, { x: 10.9, result: 11 } ] ],
	[ 'len(s)', [ { s: "my long string", result: 14 }, { s: "my", result: 2 }, { s: "", result: 0 } ] ],
	[ 'abc.len() * 10 - 5', [ { abc: 'abc', result: 25 } ] ],
	[ 'len(trim(a)) = 6', [ { a: '  abcdef  ', result: true } ] ],
	[ 'len([a, b, c]) + len([ 1, 2, 3, 4 ])', [ { a: 1, b: 2, c: 3, result: 7 } ] ],
	[ 'a.len() % 50', [ { a: 'abcd', result: 2 }, { a: 'abcdef', result: 3 } ] ],
	[ 'a.alphanum()', [ { a: '---abcd===', result: 'abcd' }, { a: '+abc-def!', result: 'abcdef' } ] ],
	[ 'str1.trim() + str2.trimStart() + str3.trimEnd()', [ { str1: ' abcd ', str2: '  a', str3: '0  ', result: 'abcda0' } ] ],
	[ 'lowerCase(trim(x))', [ { x: '  ABC  ', result: 'abc' }, { x: 'ABCD  ', result: 'abcd' } ] ],
	[ 'upperCase(substr(a,3,4))', [ { a: 'abcdef', result: 'D' }, { a: 'abcDef---', result: 'D' } ] ],
	[ 's.char(p)', [ { s: "my long string", p: 1, result: 'y' }, { s: "my+", p: 0, result: 'm' }, { s: "1", p: 1, result: "" } ] ],
	[ 'str.char(2) = `a`', [ { str: 'bca', result: true }, { str: 'bce', result: false } ] ],
	[ '[[[10]]][0][0][0]', [ { result: 10 } ] ],
	[ '[0,1][i]=null', [ { i: 2, result: true }, { i: 1, result: false } ] ],
	[ '[0,1][2]?=n', [ { n: 5, result: 5 }, { n: undefined, result: undefined } ] ],
	[ '(a[n+1] + 2)^2', [ { a: [ 0, 1, 2 ], n: 1, result: 16 } ] ],
	[ 'concat([0,1,2,3], [10,20,30,40])[1][0]', [ { result: 10 } ] ],
	[ 'flatten([0,1,2,3]#[10,20,30,40]#100, 0).add()', [ { result: 206 } ] ],
	[ 'arr@3 = 50', [ { arr: [ 10, 20, 30, 50 ], result: true }, { arr: [], result: false } ] ],
	[ 'arr[i]', [ { arr: [ 10, 20, 30, 50 ], i: 0, result: 10 }, { arr: [], i: 5, result: undefined } ] ],
	[ 'range(start, end)[0] + range(start, end)[1]', [ { start: 5, end: 10, result: 11 }, { start: -5, end: -10, result: -19 } ] ],
	[ 'number sum:0,range(start, end).iterate(void(number x)=>sum:sum+x),sum', [ { start: 1, end: 11, result: 55 }, { start: -1, end: -11, result: -65 } ] ],
	[ '[p,11].map(number?(number a)=>number t:10,ifte(a>10,t,null))[i]', [ { i: 1, p: 10, result: 10 }, { i: 0, p: 1, result: undefined } ] ],
	[ '[p,p,1, 2, 3].map(number?(number? a)=>a?=10)[1]', [ { p: undefined, result: 10 }, { p: 0, result: 0 } ] ],
	[ 'arr1.first(boolean(number v, number i)=>v=2)', [ { arr1: [ 1, 2, 3 ], result: 2 }, { arr1: [ 2, 2, 3 ], result: 2 } ] ],
	[ 'arr1.last(boolean(number v, number i)=>i=1)', [ { arr1: [ 1, 2, 3 ], result: 2 }, { arr1: [ 10, 20, 30 ], result: 20 } ] ],
	[ 'arr1.firstIndex(boolean(number v, number i)=>v=2)', [ { arr1: [ 1, 2, 3 ], result: 1 } ] ],
	[ 'arr1.lastIndex(boolean(number v, number i)=>i=1)', [ { arr1: [ 1, 2, 3 ], result: 1 } ] ],
	[ 'arr1.filter(boolean(number v, number i, array a)=>a[i]*i>2)[1]', [ { arr1: [ 1, 1, 5, 4, 1 ], result: 4 } ] ],
	[ 'arr.map(number(number val)=>val*2*t).filter(boolean(number val)=>val>5)[1]+[9].len()', [ { arr: [ 1, 2, 3 ], t: 2, result: 13 } ] ],
	[ 'arr.map(array(array a)=>a.map(number(number b)=>b+12)).add()', [ { arr: [ [ 1 ], [ 1, 2 ], [ 2, 3, 4 ] ], result: 85 } ] ],
	[ 'arr.any(boolean(object a)=>a.i>0 & a.d>0)', [ { arr: [ { i: -1, d: -1 }, { i: -1, d: 5 }, { i: 1, d: 1 } ], result: true } ] ],
	[ 'arr.any(boolean(number a)=>a > 0)', [ { arr: [ 1, -2, -3, -4 ], result: true }, { arr: [ -1, -2, -3, -4 ], result: false } ] ],
	[ 'arr.every(boolean(number a)=>a > 0)', [ { arr: [ 1, 2, 3, 4 ], result: true }, { arr: [ 1, -2, 3, 4 ], result: false } ] ],
	[ 'boolean x:arr.any(boolean(number a)=>a<0),boolean b:c,x&b', [ { arr: [ 0, -1 ], c: true, result: true } ] ],
	[ '{a:a1+a2, "b": b1, c: "10", d: 10}{p}', [ { a1: 1, a2: 2, b1: 'b', p: 'a', result: 3 }, { a1: 'a', a2: 'b', b1: 'bb', p: 'b', result: 'bb' } ] ],
	[ '{n:50,"a" : 10,b:`my string`}{p}', [ { p: 'n', result: 50 }, { p: 'a', result: 10 }, { p: 'b', result: 'my string' } ] ],
	[ '(a$b).i = 0', [ { a: { f: 0, d: 0 }, b: { i: 0 }, result: true }, { a: { i: 50, d: 0 }, b: { i: 0 }, result: true } ] ],
	[ 'merge(a,b).i = 0', [ { a: { f: 0, d: 0 }, b: { i: 0 }, result: true }, { a: { i: 50, d: 0 }, b: { i: 0 }, result: true } ] ],
	[ 'construct([a, 10],[`b`, `my string`])."a"', [ { a: 'a', result: 10 }, { a: 'b', result: undefined } ] ],
	[ 'number a:myvar/3,var b:mv*2,a/b', [ { myvar: 6, mv: 1, result: 1 }, { myvar: 30, mv: 5, result: 1 } ] ],
	[ 'obj1.`a0`', [ { obj1: { a0: 10 }, result: 10 }, { obj1: { a0: '10' }, result: '10' } ] ],
	[ 'obj2{"prop"}.a', [ { obj2: { prop: { a: 10 } }, result: 10 }, { obj2: { prop: { a: '10' } }, result: '10' } ] ],
	[ 'val*myobj{a{"prop"}}+1', [ { val: 1, myobj: { test: 10 }, a: { prop: 'test' }, result: 11 } ] ],
	[ 'obj3{prop1}+obj3{prop2}', [ { obj3: { prop1: 1, prop2: 2 }, prop1: "prop1", prop2: "prop2", result: 3 } ] ],
	[ 'test[0].prop1=test[1]{"prop2"}', [ { test: [ { prop1: 1, prop2: 2 }, { prop1: 2, prop2: 1 } ], result: true } ] ],
].forEach( ( prm, ix ) => {
	const expr = prm[ 0 ] as string;
	const args = prm[ 1 ] as Record<string, any>[];
	try {
		const service = new ExpressionService( expr );
		args.forEach( ( v, i ) => {
			const value = service.evaluate( v );
			if ( value === v.result ) {
				++passed;
			}
			else {
				++failed;
				console.log( `test ${ ix }:${ i } failed on ${ JSON.stringify( value ) } expected ${ v.result }` );
			}
		} );
	}
	catch ( err ) {
		++failed;
		console.log( `test ${ ix } error:\n${ ( err as Error ).message }` );
	}
} );
console.log( `result: passed ${ passed } failed ${ failed }` );
