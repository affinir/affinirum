import { ExpressionService } from '../src/index.js';

let passed = 0, failed = 0;
console.log( `testExpressionService started...` );
[
	//[ '0+(', [ { result: 0 } ] ],
	[ 'false', [ { result: false } ] ],
	[ 'true', [ { result: true } ] ],
	[ '0.5', [ { result: 0.5 } ] ],
	[ '"0"', [ { result: '0' } ] ],
	[ 'a == b', [ { a: 1, b: '1', result: false } ] ],
	[ 'a != b', [ { a: 1, b: '1', result: true } ] ],
	[ 'a > b', [ { a: 1, b: -1, result: true } ] ],
	[ 'a <= b', [ { a: 1, b: -1, result: false } ] ],
	[ 'or(a <= b, c)', [ { a: 1, b: -1, c: true, result: true } ] ],
	[ 'and(a <= b, c, true)', [ { a: 1, b: -1, c: true, result: false } ] ],
	[ 'len("my long string") + 100', [ { result: 114 } ] ],
	[ 'abc.len() * 10 - 5', [ { abc: 'abc', result: 25 } ] ],
	[ '(a[n+1] + 2)^2', [ { a: [ 0, 1, 2 ], n: 1, result: 16 } ] ],
	[ '"0"+"1"+`2`', [ { result: '012' } ] ],
	[ 'a.len() % 50', [ { a: 'abcd', result: 2 }, { a: 'abcdef', result: 3 } ] ],
	[ 'len(trim(a)) = 6', [ { a: '  abcdef  ', result: true } ] ],
	[ '-a^2 == b', [ { a: 2, b: -4, result: true } ] ],
	[ '(x + 10) * (y - 10)>0', [ { x: 10, y: 10, result: false }, { x: 100, y: 100, result: true } ] ],
	[ '(a + b + c + d) * ( a -b-c + 1 ) / b + 10', [ { a: 20, b: 10, c: 1, d: 2, result: 43 } ] ],
	[ '[[[10]]][0][0][0]', [ { result: 10 } ] ],
	[ 'pow(_1,2)+40 % 25', [ { _1: 10, result: 110 } ] ],
	[ 'sqrt(longvariablename)-10', [ { longvariablename: 100, result: 0 } ] ],
	[ 'min(x,2) + max(y,3)', [ { x: 10, y: 20, result: 22 } ] ],
	[ 'lowercase(trim(x))', [ { x: '  ABC  ', result: 'abc' }, { x: 'ABCD  ', result: 'abcd' } ] ],
	[ 'uppercase(substr(a,3,4))', [ { a: 'abcdef', result: 'D' }, { a: 'abcDef---', result: 'D' } ] ],
	[ 'a+b+(c+d)', [ { a: '1', b: 'b', c: 'c', d: '3', result: '1bc3' } ] ],
	[ '[a, b, c][ 0 ]', [ { a: 1, b: 2, c: 3, result: 1 } ] ],
	[ '[a, b, c] + [ 1, 2, 3, 4 ]', [ { a: 1, b: 2, c: 3, result: 16 } ] ],
	[ 'len([a, b, c]) + len([ 1, 2, 3, 4 ])', [ { a: 1, b: 2, c: 3, result: 7 } ] ],
	[ 'obj.a0', [ { obj: { a0: 10 }, result: 10 }, { obj: { a0: '10' }, result: '10' } ] ],
	[ 'obj["prop"].a', [ { obj: { prop: { a: 10 } }, result: 10 }, { obj: { prop: { a: '10' } }, result: '10' } ] ],
	[ 'val*obj[a["prop"]]+1', [ { val: 1, obj: { test: 10 }, a: { prop: 'test' }, result: 11 } ] ],
	[ 'obj["first"]+obj["second"]', [ { obj: { first: 1, second: 2 }, result: 3 } ] ],
	[ 'test[0].first=test[1]["second"]', [ { test: [ { first: 1, second: 2 }, { first: 2, second: 1 } ], result: true } ] ],
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
				console.log( `test ${ ix }:${ i } failed on ${ value } expected ${ v.result }` );
			}
		} );
	}
	catch ( err ) {
		++failed;
		console.log( `test ${ ix } compilation failed on ${ ( err as Error ).message }` );
	}
} );
console.log( `result: passed ${ passed } failed ${ failed }` );
