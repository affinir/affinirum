import { ExpressionService } from '../src';

let passed = 0, failed = 0;
console.log( `testExpressionService started...` );
[
	[ 'false', [ { result: false } ] ],
	[ 'true', [ { result: true } ] ],
	[ '0', [ { result: 0 } ] ],
	[ '"0"', [ { result: '0' } ] ],
	[ 'a == b', [ { a: 1, b: '1', result: false } ] ],
	[ 'a != b', [ { a: 1, b: '1', result: true } ] ],
	[ 'a > b', [ { a: 1, b: -1, result: true } ] ],
	[ 'a <= b', [ { a: 1, b: -1, result: false } ] ],
	[ '"my long string"$ + 100', [ { result: 114 } ] ],
	[ 'abc$ * 10 - 5', [ { abc: 'abc', result: 25 } ] ],
	[ '(a@n # `def`)$^2', [ { a: 'abc', n: 1, result: 16 } ] ],
	[ '"0"#"1"#`2`', [ { result: '012' } ] ],
	[ 'a$ % 50', [ { a: 'abcd', result: 2 } ] ],
	[ 'trim(a)$ = 6', [ { a: '  abcdef  ', result: true } ] ],
	[ '-a^2 == b', [ { a: 2, b: -4, result: true } ] ],
	[ '(x + 10) * (y - 10)>0', [ { x: 10, y: 10, result: false }, { x: 100, y: 100, result: true } ] ],
	[ '(a + b) * ( a -b ) / a + 10', [ { a: 20, b: 10, result: 25 } ] ],
	[ '40 % 25', [ { result: 10 } ] ],
	[ 'pow(_1,2)', [ { _1: 10, result: 100 } ] ],
	[ 'sqrt(longvariablename)-10', [ { longvariablename: 100, result: 0 } ] ],
	[ 'min(x,2) + max(y,3)', [ { x: 10, y: 20, result: 22 } ] ],
	[ 'substr(a,3,4)', [ { a: 'abcdef', result: 'd' } ] ],
	[ 'concat(a,b,c,d)', [ { a: '1', b: 'b', c: 'c', d: '3', result: '1bc3' } ] ],
].forEach( ( prm, ix ) => {
	const expr = prm[ 0 ] as string;
	const args = prm[ 1 ] as Record<string, any>[];
	try {
		const service = new ExpressionService( expr as string );
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
		console.log( ( err as Error ).message );
	}
} );
console.log( `result: passed ${ passed } failed ${ failed }` );
