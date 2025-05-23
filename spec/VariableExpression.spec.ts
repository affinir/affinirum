import { Affinirum } from '../src/index.js';
import { formatJSON } from '../src/constant/notation/JSON.js';

describe('Variable Expression test', ()=> {
	([
		['a.Format()', [
			{ a: new Uint8Array().buffer, result: '' },
		]],
		['AN.Format(obj0)', [
			{ obj0: undefined, result: 'null' },
			{
				obj0: { xbool: true, xbuf: new Uint8Array([10, 20, 30, 0, 4]).buffer, xstr: 'string', xfunc: ()=> '1234', xarr: [1n, 2n, 3n], xobj: { a: 1, b: 2 } },
				result: '["xbool":true,"xbuf":#0a141e0004,"xstr":"string","xfunc":function,"xarr":[1,2,3],"xobj":["a":1.0,"b":2.0]]'
			},
		]],
		['_var', [
			{ _var: undefined, result: undefined },
			{ _var: 0, result: 0 },
			{ _var: 'str0', result: 'str0' }, { _var: true, result: true },
		]],
		['!b', [
			{ b: true, result: false },
			{ b: false, result: true },
		]],
		['i==0 & Boolean.And(b, c, true)', [
			{ i: 1, b: true, c: true, result: false },
			{ i: 0, b: true, c: false, result: false },
		]],
		['i==0 | Boolean.Or(b, c, false)', [
			{ i: 1, b: true, c: false, result: true },
			{ i: 0, b: false, c: false, result: true },
		]],
		['a > b', [
			{ a: 1, b: -1, result: true },
			{ a: 11, b: 55, result: false },
		]],
		['a < b', [
			{ a: 1, b: -1, result: false },
			{ a: 11, b: 55, result: true },
		]],
		['a >= b', [
			{ a: 1, b: 2, result: false },
			{ a: 5, b: -1, result: true },
			{ a: 0, b: 0, result: true },
		]],
		['a <= b', [
			{ a: 2, b: 1, result: false },
			{ a: 1, b: 2, result: true },
			{ a: 1, b: 1, result: true },
		]],
		['a == b', [
			{ a: 1, b: '1', result: false },
			{ a: 1, b: 1.0001, result: false },
			{ a: 1, b: 1, result: true },
		]],
		['a != b', [
			{ a: 1, b: '1', result: true },
			{ a: 1, b: 1.0001, result: true },
			{ a: 1, b: 1, result: false },
		]],
		['a.Like(b)', [
			{ a: '   Abcd  0123  !', b: 'abcd-0123 ', result: true },
			{ a: 'ab', b: 'ba', result: false },
		]],
		['a.Unlike(b)', [
			{ a: '  abcd  0123  !', b: 'abcd-00123  ', result: true },
			{ a: '  abcd  0123  ! ', b: 'Ab cD-0123  ', result: false },
		]],
		['v.Contains(s)', [
			{ v: { a: 'abc', b: 4 }, s: 4, result: true },
			{ v: { a: 'abc', b: 4 }, s: 6, result: false },
		]],
		['v.Contains(s, pos)', [
			{ v: ' abc def abc', s: 'def', pos: 2n, result: true },
			{ v: ' abc ', s: 'aba', pos: 1n, result: false },
			{ v: new Uint32Array([100, 200, 300, 400]).buffer, s: new Uint32Array([200, 300]).buffer, pos: 2n, result: true },
			{ v: new Uint32Array([100, 202, 303, 400]).buffer, s: new Uint32Array([200, 300]).buffer, pos: 0n, result: false },
			{ v: [0, 1, 2, 3, 4, 5], s: 4, pos: undefined, result: true },
			{ v: [0, 1, 2, 3, 4, 5], s: 6, pos: 0n, result: false },
		]],
		['v.Contains(s, pos, true)', [
			{ v: '', s: '', pos: null, result: true },
			{ v: '', s: '123', pos: 0n, result: false },
			{ v: '  ab CD  0123   ', s: ' A Bcd ', pos: null, result: true },
			{ v: '  ab C-D  0123   ', s: ' A+Bcd ', pos: null, result: true },
		]],
		['v.StartsWith(str0, pos, true)', [
			{ v: '', str0: '', pos: undefined, result: true },
			{ v: '', str0: '123', pos: 0n, result: false },
			{ v: '  ab CD  0123   ', str0: ' A++Bcd ', pos: undefined, result: true },
			{ v: 'ab CD  0123   ', str0: 'abcd', pos: 2n, result: false },
		]],
		['v.EndsWith(str0, pos, true,) & true', [
			{ v: '', str0: '', pos: undefined, result: true },
			{ v: '', str0: '123', pos: 0n, result: false },
			{ v: ' ab CD  01+2+ 3 ', str0: ' 0123 ', pos: undefined, result: true },
			{ v: ' abcdeeeeeef 123', str0: '123', pos: 7n, result: false },
		]],
		['if v {a}else{b}', [
			{ v: true, a: 1, b: 2, result: 1 },
			{ v: false, a: 'f', b: undefined, result: undefined },
		]],
		['100+ if c*2 > 10 { a*10 }else {b*20}', [
			{ c: 10n, a: 1n, b: 2n, result: 110n },
			{ c: 1n, a: 1n, b: 2n, result: 140n },
		]],
		['100+(if (c*2 > 10) { a*10 } else {b*20-100})', [
			{ c: 10n, a: 1n, b: 2n, result: 110n },
			{ c: 1n, a: 1n, b: 2n, result: 40n },
		]],
		['100+(if c*2 > 10 { a*10 } else {b*20})-100', [
			{ c: 10n, a: 1n, b: 2n, result: 10n },
			{ c: 1n, a: 1n, b: 2n, result: 40n },
		]],
		['a?:b', [
			{ a: 1, b: 2, result: 1 },
			{ a: undefined, b: 0, result: 0 },
			{ a: undefined, b: undefined, result: undefined },
		]],
		['(a + b) * (c + d) - (e - f) / (g + h)', [
			{ a: 1, b: 2, c: 3, d: 4, e: 1, f: 0, g: 0.5, h: 0.5, result: 20 },
		]],
		['a + b + (c + d)', [
			{ a: '1', b: 'b', c: 'c', d: '3', result: '1bc3' }
		]],
		['(x + 10 + 0) * (y - 10) > 0', [
			{ x: 10, y: 10, result: false },
			{ x: 100, y: 100, result: true },
		]],
		['(a + b + c + d) * (a - b - c + 1) / b + 1 * (if (a < 23) { 10 } else { 20 })', [
			{ a: 20, b: 10, c: 1, d: 2, result: 43 },
		]],
		['[a, b, c].Add([1, 2, 3, 4]).Reduce(~float(acc:float, val) { acc + val })', [
			{ a: 1, b: 2, c: 3, result: 16 },
		]],
		['-a^2 == b', [
			{ a: 2, b: -4, result: true },
			{ a: 2n, b: -5n, result: false },
		]],
		['_1.Power(2) + 40 % 25', [
			{ _1: 10, result: 115 },
			{ _1: 100n, result: 10015n },
		]],
		['longvariablename.Root(2) - 10', [
			{ longvariablename: 100, result: 0 },
		]],
		['Integer.Min([x, 2]) + Integer.Max([y, 3])', [
			{ x: 10n, y: 20n, result: 22n }
		]],
		['Float.Round(x)', [
			{ x: 10.1, result: 10 },
			{ x: 10.9, result: 11 },
		]],
		['Boolean.Decode(v.Encode())', [
			{ v: true, result: true },
			{ v: false, result: false },
		]],
		['Timestamp.Decode(Timestamp.Epoch(v).Encode).EpochTime', [
			{ v: 60n, result: 60n },
			{ v: 1055n, result: 1055n },
		]],
		['Float.Decode(v.Encode(enc), enc)', [
			{ v: 50, enc: 'float32le', result: 50 },
			{ v: 10, enc: 'float64', result: 10 },
		]],
		['Integer.Decode(v.Encode(enc), enc)', [
			{ v: 0n, enc: 'uint16', result: 0n },
			{ v: 1055n, enc: 'uint32', result: 1055n },
			{ v: 1055n, enc: 'uint16le', result: 1055n },
		]],
		['String.Decode(v.Encode(enc), enc)', [
			{ v: '', enc: 'utf8', result: '' },
			{ v: '1055', enc: 'utf8', result: '1055' },
			{ v: '1055', enc: 'ucs2le', result: '1055' },
		]],
		['a.Byte(b).Format()', [
			{ a: new Uint8Array([0xff, 0xff, 0x00, 0x01]).buffer, b: 3n, result: '01' },
			{ a: new Uint8Array([0x10, 0x00]).buffer, b: 0n, result: '10' },
		]],
		['s.Length()', [
			{ s: 'my long string', result: 14n },
			{ s: 'my', result: 2n },
			{ s: '', result: 0n },
		]],
		['abc.Length * 10 - 5', [
			{ abc: 'abc', result: 25n },
		]],
		['a.Trim().Length() == 6', [
			{ a: '  abcdef  ', result: true },
		]],
		['[a, b, c].Length() + [1, 2, 3, 4].Length()', [
			{ a: 1n, b: 2n, c: 3n, result: 7n },
		]],
		['a.Length() % 3', [
			{ a: 'abcd', result: 1n },
			{ a: 'abcdef', result: 0n },
		]],
		['String.Alphanum(a)', [
			{ a: '---abcd===', result: 'abcd' },
			{ a: '+abc-def!', result: 'abcdef' },
		]],
		['a.Splice(1, 1, b)', [
			{ a: 'abcdef', b: '12', result: 'a12cdef' },
		]],
		['a.Inject(1, b)', [
			{ a: 'abcdef', b: '12', result: 'a12bcdef' },
		]],
		['a.Splice(1, 1, b).Format', [
			{ a: 'abcdef'.split(''), b: '12'.split(''), result: 'a12cdef' },
		]],
		['a.Inject(1, b).Format', [
			{ a: 'abcdef'.split(''), b: '12'.split(''), result: 'a12bcdef' },
		]],
		['str1.Trim() + str2.TrimStart() + str3.TrimEnd()', [
			{ str1: ' abcd ', str2: '  a', str3: '0  ', result: 'abcda0' },
		]],
		['x.Trim.LowerCase()', [
			{ x: '  ABC  ', result: 'abc' },
			{ x: 'ABCD  ', result: 'abcd' },
		]],
		['a.Slice(3, 4).UpperCase()', [
			{ a: 'abcdef', result: 'D' },
			{ a: 'abcDef---', result: 'D' },
		]],
		['s.Char(p)', [
			{ s: 'my long string', p: 1n, result: 'y' },
			{ s: 'my+', p: 0n, result: 'm' },
			{ s: '1', p: 1n, result: '' },
		]],
		['str0.Char(2) == `a`', [
			{ str0: 'bca', result: true },
			{ str0: 'bce', result: false },
		]],
		['[0,1][i]==null', [
			{ i: 2n, result: true },
			{ i: 1n, result: false },
		]],
		['[0,1][2]?:n', [
			{ n: 5, result: 5 },
			{ n: undefined, result: undefined },
		]],
		['(a[n+1] + 2)^2', [
			{ a: [0, 1, 2], n: 1n, result: 16 },
		]],
		['[20,21,22,23,24].Format(f, sep)', [
			{ f: undefined, sep: undefined, result: '2021222324' },
			{ f: undefined, sep: ':', result: '20:21:22:23:24' },
			{ f: 16n, sep: ':', result: '14:15:16:17:18' },
		]],
		['v.Split()[i]', [
			{ v: 'The quick brown fox', i: 2n, result: 'brown' },
			{ v: 'The quick brown fox', i: 0n, result: 'The' },
		]],
		['v.Split(s)[i]', [
			{ v: 'The quick brown fox', s: ' ', i: 2n, result: 'brown' },
			{ v: 'The~quick~brown~~fox', s: '~', i: 1n, result: 'quick' },
		]],
		['Object.Merge([:], [:], ["a":x], [`b`:x]).Length', [
			{ x: 1n, result: 2n },
			{ x: undefined, result: 2n },
		]],
		['Array.Unique(a).Reduce(~?? (acc,val){acc+val})', [
			{ a: [1, 2, 3, 3, 2, 1], result: 6 },
			{ a: ['a', 'b', 'c', 'a', 'b', 'c'], result: 'abc' },
		]],
		['arr0[3] == 50', [
			{ arr0: [10, 20, 30, 50], result: true },
			{ arr0: [], result: false },
		]],
		['arr0[i]', [
			{ arr0: [10, 20, 30, 50], i: 0n, result: 10 },
			{ arr0: [], i: 5n, result: undefined },
		]],
		['arr0[1] + obj0[1]', [
			{ arr0: [undefined, 10, 20], obj0: { a: undefined, '1': 100 }, result: 110 },
			{ arr0: [1, 2], obj0: { a: 1, '1': 1 }, result: 3 },
		]],
		['Array.Range(start, end)[0] + Array.Range(start, end)[1]', [
			{ start: 5n, end: 10n, result: 11n },
			{ start: -5n, end: -10n, result: -19n },
		]],
		['var s:integer=0;Array.Range(start, end).Mutate(~void(x:float){s=s+x});s', [
			{ start: 1n, end: 11n, result: 55n },
			{ start: -1n, end: -11n, result: -65n },
		]],
		['[p,11].Mutate(~ integer?(a:integer) {const t=10; if (a>10){t}else{null} } )[i]', [
			{ i: 1n, p: 10n, result: 10n },
			{ i: 0n, p: 1n, result: undefined },
		]],
		['[p,p,1, 2, 3].Mutate(~integer?(a:integer?){a?:10})[1]', [
			{ p: undefined, result: 10n },
			{ p: 0n, result: 0n },
		]],
		['arr1.First(~boolean(v:float, i:integer){v==2})', [
			{ arr1: [1, 2, 3], result: 2 },
			{ arr1: [2, 2, 3], result: 2 },
		]],
		['arr1.Last(~boolean(v:float, i:integer){(i==1)})', [
			{ arr1: [1, 2, 3], result: 2 },
			{ arr1: [10, 20, 30], result: 20 },
		]],
		['arr1.FirstIndex(~boolean(v:float, i:integer){(v==2)})', [
			{ arr1: [1, 2, 3], result: 1n },
		]],
		['arr1.LastIndex(~boolean(v:float, i:integer){i==1})', [
			{ arr1: [1, 2, 3], result: 1n },
		]],
		['arr1.Filter(~boolean(v:float, i:integer, a:array){(a[i]*i>2)})[1]', [
			{ arr1: [1, 1, 5, 4, 1], result: 4 },
		]],
		['arr0.Mutate(~float(val:float){val*2*t}).Filter(~boolean(val:float){val>5})[1]+[9].Length()', [
			{ arr0: [1, 2, 3], t: 2, result: 13 },
		]],
		['Float.Sum(arr0.Mutate( ~ array(a:array){ a.Mutate(~float(b:float){b+12.0})} ).Flatten())', [
			{ arr0: [[1], [1, 2], [2, 3, 4]], result: 85 },
		]],
		['arr0.Any(~boolean(a:object){a.i>0 & a.d>0})', [
			{ arr0: [{ i: -1, d: -1 }, { i: -1, d: 5 }, { i: 1, d: 1 }], result: true }
		]],
		['arr0.Any(~boolean(a:float) { a > 0 } )', [
			{ arr0: [1, -2, -3, -4], result: true },
			{ arr0: [-1, -2, -3, -4], result: false },
		]],
		['arr0.Every(~boolean(a:float) { a > 0 } )', [
			{ arr0: [1, 2, 3, 4], result: true },
			{ arr0: [1, -2, 3, 4], result: false },
		]],
		['const x=arr0.Any(~boolean(a:float){a<0});var b:boolean=c;x&b', [
			{ arr0: [0, -1], c: true, result: true },
		]],
		['[`a`:a1+a2, "b": b1, "c": "10", `d`: a1*a2, "p": 10][p]', [
			{ a1: 1, a2: 2, b1: 'b', p: 'd', result: 2 },
			{ a1: -2, a2: 18, b1: 'bb', p: 'a', result: 16 },
		]],
		['[`n`:50,"a" : 10,"b":`my string`,][p]', [
			{ p: 'n', result: 50n },
			{ p: 'a', result: 10n },
			{ p: 'b', result: 'my string' },
		]],
		['(Object.Merge(a,b)).i == 0', [
			{ a: { f: 0, d: 0 }, b: { i: 0 }, result: true },
			{ a: { i: 50, d: 0 }, b: { i: 0 }, result: true },
		]],
		['Object.Merge(a, b,c).i == 0', [
			{ a: { f: 0, d: 0 }, b: { i: 0 }, c: {}, result: true },
			{ a: { i: 50, d: 0 }, b: { i: 0 }, c: { prop: 1 }, result: true },
		]],
		['a.Compose(~string (acc:object, key:string){key.Char(0)})."a"', [
			{ a: ['a', 'b', 'c'], result: 'a' },
			{ a: ['b', 'a'], result: 'a' },
		]],
		['ooo.Entries()[0]."1"', [
			{ ooo: { a: 0, b: 1 }, result: 0 },
			{ ooo: { b: 'b', a: 'a' }, result: 'b' },
		]],
		['o1.Keys()[i]', [
			{ o1: { a: 0, b: 1 }, i: 0n, result: 'a' },
			{ o1: { b: 'baa', c: 'caa' }, i: 1n, result: 'c' },
		]],
		['o1.Values()[i]', [
			{ o1: { a: 0, b: 1 }, i: 0n, result: 0 },
			{ o1: { b: 'baa', c: 'caa' }, i: 1n, result: 'caa' },
		]],
		['const a:float=myvar/3;var b=mv*2;a/b', [
			{ myvar: 6, mv: 1, result: 1 },
			{ myvar: 30, mv: 5, result: 1 },
		]],
		['obj1.`a0`', [
			{ obj1: { a0: 10 }, result: 10 },
			{ obj1: { a0: '10' }, result: '10' },
		]],
		['obj2["prop"].a', [
			{ obj2: { prop: { a: 10 } }, result: 10 },
			{ obj2: { prop: { a: '10' } }, result: '10' },
		]],
		['val*myobj[a["prop"]]+1', [
			{ val: 1, myobj: { test: 10 }, a: { prop: 'test' }, result: 11 },
		]],
		['obj3[prop1]+obj3[prop2]', [
			{ obj3: { prop1: 1, prop2: 2 }, prop1: 'prop1', prop2: 'prop2', result: 3 },
		]],
		['test[0].prop1==test[1]["prop2"]', [
			{ test: [{ prop1: 1, prop2: 2 }, { prop1: 2, prop2: 1 }], result: true },
		]],
		['JSON.Parse(str1).prop1+JSON.Parse(str2).prop2', [
			{ str1: '{"prop1":1}', str2: '{"prop2":20}', result: 21 },
		]],
		['JSON.Parse(str1)+JSON.Parse(str2)', [
			{ str1: '"p1"', str2: '"p2"', result: 'p1p2' },
		]],
		['JSON.Format(obj1)+JSON.Format(obj2)', [
			{ obj1: { p1: 'a' }, obj2: { p2: 'b' }, result: '{"p1":"a"}{"p2":"b"}' }
		]],
		['JSON.Format(obj1)', [
			{ obj1: { p1: 'a' }, result: '{"p1":"a"}' },
		]],
		['Float.Sum(Array.Intersection(a, b))', [
			{ a: [-1, 2, 1, -2], b: [1, 2], result: 3 },
		]],
		['Float.Sum(Array.Difference(a, b))', [
			{ a: [-1, -2, 1, 2], b: [1, 2], result: -3 },
		]],
		['a.b.c.d ?: 10', [
			{ a: { b: { c: undefined } }, result: 10n },
			{ a: { b: {} }, result: 10n },
		]],
		['a[4][0][0] ?: 10', [
			{ a: [0], result: 10n },
			{ a: [[0]], result: 10n },
		]],
		['a.1', [
			{ a: [0, 1], result: 1 },
			{ a: ['-1', '-2'], result: '-2' },
		]],
		['a[x]', [
			{ a: { b: 1 }, x: 'a', result: undefined },
			{ a: { b: 1 }, x: '1', result: undefined },
		], [
			{ a: [0,  1], x: 5, result: undefined },
			{ a: [0], x: -5, result: undefined },
		]],
		['1000 + {while a < b { a = a + 1 }; {b; a+100}}', [
			{ a: 1, b: 10, result: 1110 },
			{ a: -5, b: -1, result: 1099 },
		]],
		['var f=~boolean(a:float){a=a*100; a>0};Float.Sum(a.Filter(f))', [
			{ a: [-10, -20, 1, 2], result: 3 },
		]],
		['const f=~??(){b = b + 1000; true}; Float.Sum(a.Filter(f)) + b', [
			{ a: [10, 20, 1, 2], b: 0, result: 4033 },
		]],
		['var a=~(){b = b + 10}; a(); b', [
			{ b: 0n, result: 10n },
			{ b: -10n, result: 0n },
		]],
		['(~(){~??(){b = b + 10}})()()', [
			{ b: 0n, result: 10n },
		]],
		['if a {b}else{if c{d}else{e}}', [
			{ a: true, b: false, c: false, d: 10, e: 20, result: false },
			{ a: false, b: true, c: false, d: 10, e: 20, result: 20 },
		]],
		['while a<10{a= while a+1<20{a=a+1}}', [
			{ a: 1n, result: 19n },
		]],
		['while while a<10{a=a+1}<20{a=a+1}', [
			{ a: 1n, result: 11n },
		]],
		['d.Minute(true)', [
			{ d: new Date('2025-04-22 03:04:05.99Z'), result: 4n },
		]],
		['Timestamp.Epoch(a.EpochTime).Format(6)', [
			{ a: new Date('2020-02-25 20:30:45.555Z'), result: '45' },
		]],
		['a.Format(1)+a.Format(2) + a.Format(3)+a.Format(4)+a.Format(5)+a.Format(6)+a.Format(7)', [
			{ a: new Date('2020-02-20 20:30:40.555Z'), result: '20200220203040555' },
		]],
		['[a:1, b:2,][c]', [
			{ a: 'abc', b: 'def', c: 'abc', result: 1n },
			{ a: 'abc', b: 'def', c: 'def', result: 2n },
		]],
		['[if (x == `a`) { x } else { `a` } :1].a', [
			{ x: 'a', result: 1n },
			{ x: 'b', result: 1n },
		]],
		['if x > 0 { x }', [
			{ x: 1, result: 1 },
			{ x: -1, result: undefined },
		]],
		['["entity":[d.id:["a1", "a2"]]].entity.abc[0]', [
			{ d: { id: 'abc' }, result: 'a1' },
			{ d: { id: 'a' }, result: undefined },
		]],
		['Buffer.Random(c).Length + String.Random(c).Length', [
			{ c: 0n, result: 0n },
			{ c: 64n, result: 128n },
		]],
		['v.At("prop") + v.z', [
			{ v: { prop: 10n, z: 10n }, result: 20n },
			{ v: { prop: 100n }, result: undefined },
		]],
		['v.Has("prop") & v?z', [
			{ v: { prop: 'abc', z: 10n }, result: true },
			{ v: { prop: 'abc' }, result: false },
		]],
		['a|=b', [
			{ a: true, b: false, result: true },
			{ a: false, b: true, result: true },
			{ a: false, b: false, result: false },
			{ a: true, b: true, result: true },
		]],
		['a&=b', [
			{ a: true, b: false, result: false },
			{ a: false, b: true, result: false },
			{ a: false, b: false, result: false },
			{ a: true, b: true, result: true },
		]],
		['a+=b', [
			{ a: 0, b: 10, result: 10 },
			{ a: 1, b: 10, result: 11 },
		]],
		['a-=b', [
			{ a: 0, b: 2, result: -2 },
			{ a: 1, b: 0, result: 1 },
		]],
		['a*=b', [
			{ a: 1, b: 2, result: 2 },
			{ a: 0, b: 2, result: 0 },
		]],
		['a/=b', [
			{ a: 4, b: 2, result: 2 },
			{ a: 0, b: 2, result: 0 },
		]],
		['a %= b', [
			{ a: 6, b: 5, result: 1 },
			{ a: 0, b: 2, result: 0 },
		]],
		['(a+=10) + (b-=10) + (c*=2) + (d/=2) + (e %= 5)', [
			{ a: 1, b: 2, c: 3, d: 4, e: 6, result: 12 }
		]],
		['a+=10 + b-=10 + c*=2 + d/=2 + e %= 2', [
			{ a: 10, b: 2, c: 3, d: 4, e: 6, result: 0 }
		]],
	] as [string, Record<string, any>][]).forEach(([expr, args])=> {
		(args as Record<string, any>[]).forEach((v)=> {
			it(`compiles expression '${expr}' and evaluates for arguments ${formatJSON(v)}`, ()=> {
				try {
					const script = new Affinirum(expr);
					expect(script).toBeDefined();
					try {
						const value = script.evaluate(v);
						if (value !== v.result) {
							fail(`value ${formatJSON(value as any)} not matching expectation ${v.result}`);
						}
					}
					catch (err) {
						fail(`evaluation error\n${(err as Error).message}`);
					}
				}
				catch (err) {
					fail(`compilation error\n${(err as Error).message}`);
				}
			});
		});
	});
});
