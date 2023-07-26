import { ExpressionService } from '../src';

let passed = 0, failed = 0;
console.log( `testExpressionService started...` );
[
	[ 'false', [ { result: false } ] ],
	[ 'true', [ { result: true } ] ],
	[ '0', [ { result: 0 } ] ],
	[ '"0"', [ { result: '0' } ] ],
	[ '(x + 10) * (y - 10)>0', [ { x: 10, y: 10, result: false }, { x: 100, y: 100, result: true } ] ],
	[ 'pow(x,2)', [ { x: 10, result: 100 } ] ],
	[ 'sqrt(v)-10', [ { v: 100, result: 0 } ] ],
	[ 'min(x,2) + max(y,3)', [ { x: 10, y: 20, result: 22 } ] ],
	[ 'substr(a,3,4)', [ { a: 'abcdef', result: 'd' } ] ],
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
