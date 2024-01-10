# expression-service
Service to compile and evaluate math expressions.

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
* Greater than: >
* Less than: <
* Greater than or equal to: >=
* Less than or equal to: <=
* Equals to: =
* Not equals to: !=
* String begins with: \=\*
* String ends with: \*\=
* String contains substring: \*\=\*
* String similar to: \~
* String not similar: !\~
* String begins similar to: \~\*
* String ends similar to: \*\~
* String contains substring similar to: \*\~\*
* Null coalescence: ?=
#### Functions
* Disjunction: or(boolean ...args)
* Conjunction: and(boolean ...args)
* Negation: not(boolean arg)
* Greater than: gt(number arg1, number arg2)
* Less than: lt(number arg1, number arg2)
* Greater than or equals to: ge(number arg1, number arg2)
* Less than or equals to: le(number arg1, number arg2)
* Equals to: eq(var arg1, var arg2)
* Not equals to: ne(var arg1, var arg2)
* String begins with: beginsWith(string arg1, string arg2, number? arg3)
* String ends with: endsWith(string arg1, string arg2, number? arg3)
* String contains substring: contains(string arg1, string arg2, number? arg3)
* String similar to: like(string arg1, string arg2)
* String not similar to: unlike(string arg1, string arg2)
* String begins similar to: beginslike(string arg1, string arg2, number? arg3)
* String ends similar to: endsLike(string arg1, string arg2, number? arg3)
* String contains substring similar to: containsLike(string arg1, string arg2, number? arg3)
* Conditional switch: switch(boolean arg1, var arg2, var arg3)
* Null coalescence: nullco(var arg1, var arg2)
* Number or string addition: add(number|string ...args)
* Subtraction: sub(number arg1, number arg2)
* Negation: neg(number arg)
* Multiplication: mul(number ...args)
* Division: div(number arg1, number arg2)
* Percentage: pct(number arg1, number arg2)
* Exponent: exp(number arg)
* Logarithm: log(number arg)
* Power: pow(number arg1, number arg2)
* Root: rt(number arg1, number arg2)
* Square: sq(number arg)
* Square root: sqrt(number arg)
* Absolute value: abs(number arg)
* Ceil: ceil(number arg)
* Floor: floor(number arg)
* Rounded value: round(number arg)
* Minimum: min(number ...args)
* Maximum: max(number ...args)
* Trim: trim(string arg)
* Substring: substr(string arg1, number arg2)
* Char at index: char(string arg1, number arg2)
* Concatination into array: concat(array ...args)
* Element at index: at(array arg1, number arg2)
* Reverse order of items in array: reverse(array arg)
* Flatten array items to specified depth: flatten(array arg1, number arg2)
* Slice items into new array: slice(array arg1, number ...args)
* First item iterator: first(array arg1, function arg2)
* Last item iterator: last(array arg1, function arg2)
* First index iterator: firstindex(array arg1, function arg2)
* Last index iterator: lastindex(array arg1, function arg2)
* Map items iterator: map(array arg1, function arg2)
* Filter items iterator: filter(array arg1, function arg2)
* Any item iterator: any(array arg1, function arg2)
* Every item iterator: every(array arg1, function arg2)
* Object construction from name-value pairs: constr(array ...args)
* Object join: join(array ...args)
* Object property by name: by(object arg1, string arg2)
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

	<disjunction> = {<disjunction>"|"}<conjunction>
	<conjunction> = {<conjunction>"&"}<comparison>
	<comparison> = {"!"}{<comparison>(">"|">="|"<"|"<="|"="|"=="|"!="|"=*"|"*="|"*=*"|"~"|"!~"|"~*"|"*~"|"*~*)}<aggregate>
	<aggregate> = {<aggregate>("$"|"#"|"+"|"-")}<product>
	<product> = {<product>("*"|"/"|"%")}<factor>
	<factor> = {"-"}{<factor>"^"}<coalescence>
	<coalescence> = {<coalescence>("?=")}<index>
	<index> = <term>|{<index>("."<property>|"["<disjunction>"]")}
	<term> = <constant>|<array>|<object>|<variable>|<function>|<closure>|<statement>|"("<disjunction>")"
	<constant> = <boolean-value>|<numberic-value>|<string-value>
	<array> = "["<disjunction>,{","<disjunction>}"]"
	<object> = "{"<property-name>"="<disjunction>,{",""<property-name>"="<disjunction>}"}"
	<function> = <function-name>"("<disjunction>{","<disjunction>}")"
	<closure> = <type-name>"("<type-name> <argument>{,<type-name> <argument>}")"
	<statement> = {<variable>"="<disjunction>,}<disjunction>
	<type-name> = "boolean"|"number"|"string"|"array"|"object"|"function"|"var"{"?"}

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
	'arr.map(number(number a) -> a*2).filter(boolean(number a) -> a>3).add()'
);
const iValue = iteratorExpr.evaluate( { arr: [ 1, 2, 3 ] } ); // 10
...
const complexExpr = new ExpressionService( 'a:myvar1/10, b:myvar2-100, a/b'
);
const value = complexExpr.evaluate( { myvar1: 40, myvar2: 104 } ); // 1
...
```
