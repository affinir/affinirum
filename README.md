# expression-service
Service to parse and evaluate math expressions.

Compact recursive descent expression parser, and evaluation service 
for closed-form analytic expressions.
Service supports boolean expressions, regular algebraic expressions, 
numeric and string functions and comparsions.

Target: ES2022 [browser+NodeJS][ESM+CJS].

## Why

* Parse once, execute multiple times
* Efficient expression evaluation and type checking
* Boolean, arithmetic, string and index operators
* Numeric and string comparison operators
* Variadic functions and closures
* Input and statement variables
* Standard math functions
* Easy to add custom functions or constants
* All operators support literal equivalent
* Method-style invocation is supported for all functions,
  i.e. pow(a,2) is the same as a.pow(2)

## What

#### Operators
* Boolean disjunction: |
* Boolean conjunction: &
* Boolean negation: !
* Greater than: >
* Less than: <
* Greater than or equal to: >=
* Less than or equal to: <=
* Equals to: =
* Not equals to: !=
* String similar to: \~
* String not similar: !\~
* Null coalescence: ?=
* Arithmetic addition or string concatination: +
* Arithmetic subtraction: -
* Arithmetic negation: -
* Arithmetic multiplication: \*
* Arithmetic division: /
* Arithmetic percentage: %
* Array element at literal index: @
* Array element at numeric value: []
* Array concatination: #
* Object property by literal name: .
* Object property by string value: {}
* Object join: $
#### Functions
* Boolean disjunction: or(boolean ...values)
* Boolean conjunction: and(boolean ...values)
* Bolean negation: not(boolean value)
* Greater than: gt(number value1, number value2)
* Less than: lt(number value1, number value2)
* Greater than or equals to: ge(number value1, number value2)
* Less than or equals to: le(number value1, number value2)
* Equals to: eq(var value1, var value2)
* Not equals to: neq(var value1, var value2)
* String similar to: like(string value1, string value2)
* String not similar to: nlike(string value1, string value2)
* If conditional statement: ifc(boolean condition, var valueIfTrue, var valueIfFalse)
* Null coalescence: nullco(var value, var valueIfNull)
* Arithmetic addition or string concatination: add(number|string ...values)
* Arithmetic subtraction: sub(number minuend, number subtrahend)
* Arithmetic negation: neg(number value)
* Arithmetic multiplication: mul(number ...values)
* Arithmetic division: div(number dividend, number divisor)
* Arithmetic percentage: pct(number dividend, number divisor)
* Exponent: exp(number value)
* Logarithm: log(number value)
* Power: pow(number base, number exponent)
* Root: rt(number value, number index)
* Square: sq(number value)
* Square root: sqrt(number value)
* Absolute value: abs(number value)
* Ceil: ceil(number value)
* Floor: floor(number value)
* Rounded value: round(number value)
* Minimum: min(number ...values)
* Maximum: max(number ...values)
* String contains substring: contains(string value, string search, number? startPos, boolean? boolean? ignoreCaseSpaceEtc)
* String starts with substring: startsWith(string value, string search, number? startPos, boolean? ignoreCaseSpaceEtc)
* String ends with substring: endsWith(string value, string search, number? endPos, boolean? boolean? ignoreCaseSpaceEtc)
* Get alphanum of string: alphanum(string value)
* Trim: trim(string value)
* Trim start: trimStart(string value)
* Trim end: trimEnd(string value)
* Substring: substr(string value, number beginPos, number? endPos)
* Char at position: char(string value, number pos)
* Char code at position: charCode(string value, number pos)
* Array element at index: at(array value, number index)
* Concatination of values and arrays into an array: concat(array ...values)
* New array with reverse order of items: reverse(array value)
* New array flattened to specified depth: flatten(array value, number depth)
* New array sliced from given array: slice(array value, number? beginIndex, number? endIndex)
* New array of numbers between given two numbers: range(number inclusiveFrom, number exclusiveTo)
* Find first item satisfying condition: first(array value, function condition)
* Find last item satisfying condition: last(array value, function condition)
* Find first index of item satisfying condition: firstIndex(array value, function condition)
* Find last index of item satisfying condition: lastIndex(array value, function condition)
* Iterate items: iterate(array value, function iterator)
* Map items: map(array value, function transform)
* Filter items satisfying condition: filter(array value, function condition)
* Check if any item satisfies condition: any(array value, function condition)
* Check if every item satisfies condition: every(array value, function condition)
* Object construction from name-value pairs: construct(array ...values)
* Object property by name: by(object value, string name)
* Object join: join(object ...values)
#### Constants
* null
* true
* false
* NaN
* PosInf
* NegInf
* Epsilon
* Pi

### Grammar
The expression parsing is performed using the following grammar:

	<list> = <disjunction>{ ","<disjunction> }
	<disjunction> = <conjunction>{ "|"<conjunction> }
	<conjunction> = <comparison>{ "&"<comparison> }
	<comparison> = { "!" }<aggregate>{ ( ">" | ">=" | "<" | "<=" | "=" | "!=" | "~" | "!~" )<aggregate> }
	<aggregate> = <product>{ ( "+" | "-" | "#" | "$" )<product> }
	<product> = <factor>{ ( "*" | "/" | "%" )<factor> }
	<factor> = { "-" }<coalescence>{ "^"<coalescence> }
	<coalescence> = <accessor>{ "?="<accessor> }
	<accessor> = <term>{ ( "["<disjunction>"]" | "@"<array-index> | "{"<disjunction>"}" |
		"."( <property-name> | <function-name>"("{ <disjunction> }{ ","<disjunction> }")" ) ) }
	<term> = <null> |<boolean> | <number> | <string> | <constant-name> |
		<function-name>"("{ <disjunction> }{ ","<disjunction> }")" |
		<variable-name>{":"<disjunction>} |
		<type> <variable-name>{ ":"<disjunction> } |
		<type>"("<type> <argument>{ ","<type> <argument> }")" "=>"<list> |
		"("<disjunction>")" |
		"["{ <disjunction> }{ ","<disjunction> }"]" |
		"{"{ <property-name>:<disjunction> }{ ","<property-name>:<disjunction> }"}" |
		"if" <condition> "then" <disjunction> "else" <disjunction>
	<type> = ( "null" | "boolean" | "number" | "string" | "array" | "object" | "function" ){ "?" } | "var"

Whitespace characters are ignored.

Valid variable or function names consist of a letter, or "\_" characters followed by any combination
of alphanumeric characters, and "\_". For example: *x*, *\_a1*, *abc25*


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
const objExpr = new ExpressionService( '{prop1:a,prop2:`abc`}.prop1+10' );
const oValue = objExpr.evaluate( { a: 50 } ); // 60
...
const iteratorExpr = new ExpressionService(
	'arr.map(number(number a) -> a*2).filter(boolean(number a) => a>3).add()'
);
const iValue = iteratorExpr.evaluate( { arr: [ 1, 2, 3 ] } ); // 10
...
const complexExpr = new ExpressionService(
	'var a:myvar1/10, var b:myvar2-100, a/b + b*a + 600'
);
const value = complexExpr.evaluate( { myvar1: 40, myvar2: 104 } ); // 4761
...
```
