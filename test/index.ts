import { ExpressionService } from '../src/index.js';

let passed = 0, failed = 0;
console.log( `testExpressionService started...` );
[
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
	[ 'add([[100, [[10]]], [10], 13])', [ { result: 133 } ] ],
	[ 'len("my long string") + 100', [ { result: 114 } ] ],
	[ 'abc.len() * 10 - 5', [ { abc: 'abc', result: 25 } ] ],
	[ '(a[n+1] + 2)^2', [ { a: [ 0, 1, 2 ], n: 1, result: 16 } ] ],
	[ '"0"+"1"+`2`', [ { result: '012' } ] ],
	[ 'a.len() % 50', [ { a: 'abcd', result: 2 }, { a: 'abcdef', result: 3 } ] ],
	[ 'len(trim(a)) == 6', [ { a: '  abcdef  ', result: true } ] ],
	[ '-a^2 == b', [ { a: 2, b: -4, result: true } ] ],
	[ '(x + 10) * (y - 10)>0', [ { x: 10, y: 10, result: false }, { x: 100, y: 100, result: true } ] ],
	[ '(a + b + c + d) * ( a -b-c + 1 ) / b + 1*if(a<23,10,20)', [ { a: 20, b: 10, c: 1, d: 2, result: 43 } ] ],
	[ '[[[10]]][0][0][0]', [ { result: 10 } ] ],
	[ 'pow(_1,2)+40 % 25', [ { _1: 10, result: 110 } ] ],
	[ 'sqrt(longvariablename)-10', [ { longvariablename: 100, result: 0 } ] ],
	[ 'min(x,2) + max(y,3)', [ { x: 10, y: 20, result: 22 } ] ],
	[ 'lowercase(trim(x))', [ { x: '  ABC  ', result: 'abc' }, { x: 'ABCD  ', result: 'abcd' } ] ],
	[ 'uppercase(substr(a,3,4))', [ { a: 'abcdef', result: 'D' }, { a: 'abcDef---', result: 'D' } ] ],
	[ 'a+b+(c+d)', [ { a: '1', b: 'b', c: 'c', d: '3', result: '1bc3' } ] ],
	[ 'concat([0,1,2,3], [10,20,30,40])[1][0]', [ { result: 10 } ] ],
	[ 'flatten([0,1,2,3]#[10,20,30,40]#100, 0).add()', [ { result: 206 } ] ],
	[ 'str *=* `abc def abc`', [ { str: 'abc', result: true } ] ],
	[ '[a, b, c] + [ 1, 2, 3, 4 ]', [ { a: 1, b: 2, c: 3, result: 16 } ] ],
	[ 'len([a, b, c]) + len([ 1, 2, 3, 4 ])', [ { a: 1, b: 2, c: 3, result: 7 } ] ],
	[ 'obj1.a0', [ { obj1: { a0: 10 }, result: 10 }, { obj1: { a0: '10' }, result: '10' } ] ],
	[ 'obj2["prop"].a', [ { obj2: { prop: { a: 10 } }, result: 10 }, { obj2: { prop: { a: '10' } }, result: '10' } ] ],
	[ 'val*myobj[a["prop"]]+1', [ { val: 1, myobj: { test: 10 }, a: { prop: 'test' }, result: 11 } ] ],
	[ 'obj3["prop1"]+obj3["prop2"]', [ { obj3: { prop1: 1, prop2: 2 }, result: 3 } ] ],
	[ 'test[0].prop1==test[1]["prop2"]', [ { test: [ { prop1: 1, prop2: 2 }, { prop1: 2, prop2: 1 } ], result: true } ] ],
	[ 'arr1.firstindex(boolean(number v, number i)->v==2)', [ { arr1: [ 1, 2, 3 ], result: 1 } ] ],
	[ 'arr1.lastindex(boolean(number v, number i)->i==1)', [ { arr1: [ 1, 2, 3 ], result: 1 } ] ],
	[ 'arr1.first(boolean(number v, number i)->v==2)', [ { arr1: [ 1, 2, 3 ], result: 2 } ] ],
	[ 'arr1.last(boolean(number v, number i)->i==1)', [ { arr1: [ 1, 2, 3 ], result: 2 } ] ],
	[ 'arr1.filter(boolean(number v, number i, array a)->a[i]*i>2)[1]', [ { arr1: [ 1, 1, 5, 4, 1 ], result: 4 } ] ],
	[ 'arr.map(number(number val)->val*2).filter(boolean(number val)->val>3)[1]+[9].len()', [ { arr: [ 1, 2, 3 ], result: 7 } ] ],
	[ 'arr.map(array(array a)->a.map(number(number b)->b+12)).add()', [ { arr: [ [ 1 ], [ 1, 2 ], [ 2, 3, 4 ] ], result: 85 } ] ],
	[ 'arr.any(boolean(number a)->a < 0)', [ { arr: [ 1, 2, 3, 4 ], result: false } ] ],
	[ 'arr.every(boolean(number a)->a > 0)', [ { arr: [ 1, 2, 3, 4 ], result: true } ] ],
	[ '[50,a = 10,b=`my string`][`0`]', [ { result: 50 } ] ],
	[ 'constr([`a`, 10],[`b`, `my string`]).a', [ { result: 10 } ] ],
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
		console.log( `test ${ ix } compilation failed on ${ ( err as Error ).message }` );
	}
} );
console.log( `result: passed ${ passed } failed ${ failed }` );
