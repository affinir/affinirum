# expression-service
Service to compile and evaluate math expressions.

Compact recursive descent expression parser, and evaluation service 
for closed-form analytic expressions.
Service supports boolean expressions, regular algebraic expressions, 
numeric and string functions and comparsions.

Target: ES2020 [browser or NodeJS].

## Why

* Parse once, execute multiple times
* Efficient expression evaluation
* Type checking
* Boolean, arithmetic, string and index operators supported
* Numeric and string comparision operators supported
* Variadic and iterator functions supported
* Standard math functions included
* Easy to add custom functions or constants
* All operators support literal equivalent
* Method-style invocation is supported for all functions,
  i.e. pow(a,2) is the same as a.pow(2)

## What

#### Boolean operations
* Disjunction: |, or
* Conjunction: &, and
* Negation: !, not
#### Numeric operations
* Addition: +, add
* Subtraction: -, sub
* Negation: -, neg
* Multiplication: \*, mul
* Division: /, div
* Percentage: %, pct
#### String operations
* Char at: [], at
* Addition: +, add
#### Array operations
* Element at: [], at
* Concat: #, concat
#### Object operations
* Property by name: ., [], at
#### Numeric comparisions
* Greater than: >, gt
* Less than: <, lt
* Greater than or equal to: >=, ge
* Less than or equal to: <=, le
#### String comparisions
* Like [case insensitive comparision]: \~, like
* Unlike [case insensitive comparision]: !\~, unlike
* Begin of: \=\*, beginof
* End of: \*\=, endof
* Part of: \*\*, partof
#### Generic comparisions
* Equal to: ==, eq
* Not equal to: !=, ne
#### Numeric functions
* Power: pow
* Root: rt
* Square: sq
* Square root: sqrt
* Absolute value: abs
* Rounded value: round
* Ceil: ceil
* Floor: floor
* Logarithm: log
* Exponent: exp
* Minimum: min
* Maximum: max
#### String functions
* Trim: trim
* Substring: substr
#### Array functions
* Reverse order of items in array: reverse
* Flatten array items to specified depth: flatten
* Slice items into new array: slice
* Map items iterator: map
* Filter items iterator: filter
* Any item iterator: anyone
* Every item iterator: everyone
#### Boolean constants
* true
* false
#### Numeric constants
* NaN
* Infinity
* Epsilon
* Pi

### Grammar
The expression parsing is performed using the following grammar:

	<disjunction> = {<disjunction>"|"}<conjunction>
	<conjunction> = {<conjunction>"&"}<comparison>
	<comparison> = {"!"}{<comparison>(">"|">="|"<"|"<="|"="|"=="|"!="|"~"|"!~"|"=*"|"*="|"**")}<aggregate>
	<aggregate> = {<aggregate>("#"|"+"|"-")}<product>
	<product> = {<product>("*"|"/"|"%")}<factor>
	<factor> = {"-"}{<factor>"^"}<term>
	<index> = <term>|{<index>("."<property>|"["<disjunction>"]")}
	<term> = <value|<variable>|<function>"("<disjunction>{","<disjunction>}")"|"("<disjunction>")"
	<constant> = <boolean>|<boolean[]>|<number>|<number[]>|<string>|<string[]>|<object>|<object[]>
	<object> = "{"<property>":"<constant>,{",""<property>":"<constant>}"}"

Whitespace characters are ignored.

Valid variable or function names consist of a letter, or "\_" characters followed by any combination
of alphanumeric characters, and "\_". For example *x*, *\_a1*, *abc25*

Constants can be strings or numbers.


## How

Create instance of ExpressionService for math expression.
During the parsing any alphanumeric sequence not identified as
number value, string value, operator, or a function name is assumed to be variable.
Evaluate the expression by providing variable values.

Sample code:

```ts
...
const expr = new ExpressionService( 'x * (y + abc / 5) > 10' );
const value1 = expr.evaluate( { x: 10, y: 20, abc: 10 } ); // true
const value2 = expr.evaluate( { x: 1, y: 4, abc: 5 } ); // false
...
const arrExpr = new ExpressionService( '[ 1, 2, 3, a, b, c ].add()' );
const valueSum = arrExpr.evaluate( { a: 10, b: 20, c: 30 } ); // 66
...
const objExpr = new ExpressionService( '[number prop1=a,var prop2=`abc`].prop1+10' );
const oValue = objExpr.evaluate( { a: 50 } ); // 60
...
const iteratorExpr = new ExpressionService(
	'arr.map(var a -> a.value*2).filter(var a -> a.value>3).add()'
);
const iValue = iteratorExpr.evaluate( { arr: [ 1, 2, 3 ] } ); // 10
...
```
