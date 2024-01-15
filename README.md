# expression-service
Service to parse and evaluate math expressions.

Compact recursive descent expression parser, and evaluation service 
for closed-form analytic expressions.
Service supports boolean expressions, regular algebraic expressions, 
numeric and string functions and comparsions.

Target: ES2020 [browser or NodeJS].

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
* Disjunction: |
* Conjunction: &
* Negation: !
* Greater than: >
* Less than: <
* Greater than or equal to: >=
* Less than or equal to: <=
* Equals to: =
* Not equals to: !=
* String similar to: \~
* String not similar: !\~
* Null coalescence: ?=
* Number or string addition: +
* Subtraction: -
* Negation: -
* Multiplication: \*
* Division: /
* Percentage: %
* Array element at literal index: @
* Array element at numeric value: []
* Array concatination: #
* Object property by literal name: .
* Object property by string value: {}
* Object join: $
#### Functions
* Disjunction: or(boolean ...values)
* Conjunction: and(boolean ...values)
* Negation: not(boolean value)
* Greater than: gt(number value1, number value2)
* Less than: lt(number value1, number value2)
* Greater than or equals to: ge(number value1, number value2)
* Less than or equals to: le(number value1, number value2)
* Equals to: eq(var value1, var value2)
* Not equals to: neq(var value1, var value2)
* String similar to: like(string value1, string value2)
* String not similar to: nlike(string value1, string value2)
* String contains substring: contains(string value, string search, number? startPos, boolean? boolean? ignoreCaseSpaceEtc)
* String starts with: startsWith(string value, string search, number? startPos, boolean? ignoreCaseSpaceEtc)
* String ends with: endsWith(string value, string search, number? endPos, boolean? boolean? ignoreCaseSpaceEtc)
* Conditional switch: switch(boolean condition, var valueIfTrue, var valueIfFalse)
* Null coalescence: nullco(var value, var valueIfNull)
* Number or string addition: add(number|string ...values)
* Subtraction: sub(number minuend, number subtrahend)
* Negation: neg(number value)
* Multiplication: mul(number ...values)
* Division: div(number dividend, number divisor)
* Percentage: pct(number dividend, number divisor)
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
* Trim: trim(string value)
* Substring: substr(string value, number beginPos, number? endPos)
* Char at position: char(string value, number pos)
* Concatination into array: concat(array ...values)
* Element at index: at(array value, number index)
* Reverse order of items in array: reverse(array value)
* Flatten array items to specified depth: flatten(array value, number depth)
* Slice items into new array: slice(array value, number? beginIndex, number? endIndex)
* First item iterator: first(array valu, function iterator)
* Last item iterator: last(array value, function iterator)
* First index iterator: firstindex(array value, function iterator)
* Last index iterator: lastindex(array value, function iterator)
* Map items iterator: map(array value, function iterator)
* Filter items iterator: filter(array value, function iterator)
* Any item iterator: any(array value, function iterator)
* Every item iterator: every(array value, function iterator)
* Object construction from name-value pairs: construct(array ...values)
* Object join: join(object ...values)
* Object property by name: by(object value, string name)
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
	<comparison> = { "!" }<aggregate>{ ( ">" | ">=" | "<" | "<=" | "=" | "==" | "!=" | "~" | "!~" )<aggregate> }
	<aggregate> = <product>{ ( "+" | "-" | "#" | "$" )<product> }
	<product> = <factor>{ ( "*" | "/" | "%" )<factor> }
	<factor> = { "-" }<coalescence>{ "^"<coalescence> }
	<coalescence> = <accessor>{ "?="<accessor> }
	<accessor> = <term>{ ( "["<disjunction>"]" | "@"<array-index> | "{"<disjunction>"}" |
		"."( <property-name> | <function-name>"("{ <disjunction> }{ ","<disjunction> }")" ) ) }
	<term> = <null> |<boolean> | <number> | <string> | <constant-name> | <variable-name> | "("<disjunction>")" |
		"["{ <disjunction> }{ ","<disjunction> }"]" |
		"{"{ <property-name>:<disjunction> }{ ","<property-name>:<disjunction> }"}" | 
		<function-name>"("{ <disjunction> }{ ","<disjunction> }")" |
		<type> <variable-name>{ ":"<disjunction> } |
		<type>"("<type> <argument>{ ","<type> <argument> }")=>"<list>
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
const complexExpr = new ExpressionService( 'var a:myvar1/10, var b:myvar2-100, a/b'
);
const value = complexExpr.evaluate( { myvar1: 40, myvar2: 104 } ); // 1
...
```
