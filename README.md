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
* Variadic and iterating functions supported
* Standard math functions included
* Easy to add custom functions or constants
* All operators support literal equivalent
* Method-style invocation is supported for all functions,
  i.e. pow(a,2) is the same as a.pow(2)

## What

#### Boolean operations
* Disjunction: |
* Conjunction: &
* Negation: !
#### Numeric operations
* Addition: +
* Subtraction: -
* Negation: -
* Multiplication: \*
* Division: /
* Percentage: %
#### String operations
* Addition: +
* Character by numeric index: []
#### Array operations
* Concatination: #
* Element by numeric index: []
#### Object operations
* Property by string index: []
* Property by name: .
#### Comparisons
* Equals to: ==
* Not equals to: !=
* Greater than: >
* Less than: <
* Greater than or equal to: >=
* Less than or equal to: <=
* Case insensitive comparison: \~
* Case insensitive comparison: !\~
* Begin of: \=\*
* End of: \*\=
* Part of: \*\*
#### Functions
* Disjunction: or(boolean ...args)
* Conjunction: and(boolean ...args)
* Negation: not(boolean arg)
* Equals to: eq(var arg1, var arg2)
* Not equals to: ne(var arg1, var arg2)
* Greater than: gt(number arg1, number arg2)
* Less than: lt(number arg1, number arg2)
* Greater than or equals to: ge(number arg1, number arg2)
* Less than or equals to: le(number arg1, number arg2)
* Case insensitive equals: like(string arg1, string arg2)
* Case insensitive not equals: unlike(string arg1, string arg2)
* Begin of: beginof(string arg1, string arg2)
* End of: endof(string arg1, string arg2)
* Part of: partof(string arg1, string arg2)
* Addition: add(number|string arg1, number|string arg2)
* Subtraction: sub(number arg1, number arg2)
* Negation: neg(number arg)
* Multiplication: mul(number arg1, number arg2)
* Division: div(number arg1, number arg2)
* Percentage: pct(number arg1, number arg2)
* Power: pow(number arg1, number arg2)
* Root: rt(number arg1, number arg2)
* Square: sq(number arg)
* Square root: sqrt(number arg)
* Absolute value: abs(number arg)
* Rounded value: round(number arg)
* Ceil: ceil(number arg)
* Floor: floor(number arg)
* Logarithm: log(number arg)
* Exponent: exp(number arg)
* Minimum: min(number ...args)
* Maximum: max(number ...args)
* Char/Element/Property at index: at(string|array arg1, number|string arg2)
* Trim: trim(string arg)
* Substring: substr(string arg1, number arg2)
* Concatination into array: concat(array ...args)
* Reverse order of items in array: reverse(array arg)
* Flatten array items to specified depth: flatten(array arg1, number arg2)
* Slice items into new array: slice(array arg1, number ...args)
* Map items iterator: map(array arg1, function arg2)
* Filter items iterator: filter(array arg1, function arg2)
* First item iterator: first(array arg1, function arg2)
* Last item iterator: last(array arg1, function arg2)
* Any item iterator: any(array arg1, function arg2)
* Every item iterator: every(array arg1, function arg2)
* Construction of object: constr(array ...args)
#### Boolean constants
* true
* false
#### Numeric constants
* NaN
* PosInf
* NegInf
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
	<constant> = <boolean>|<number>|<string>|<array>|<object>|<function>
	<object> = "{"<property>":"<constant>,{",""<property>":"<constant>}"}"

Whitespace characters are ignored.

Valid variable or function names consist of a letter, or "\_" characters followed by any combination
of alphanumeric characters, and "\_". For example: *x*, *\_a1*, *abc25*

Declaration of array: [value1, value2, ...]
Declaration of object: [type name1=value1, type name2=value2, ...]
Declaration of iterating function: object iterator-><disjunction>
  where type is boolean, number, string, array, object, function or var (type variation, i.e. any type)
Iterator object has 3 properties: value, index and array.


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
