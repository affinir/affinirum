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
* Function argument type checking
* Boolean, arithmetic, string and access operators supported
* Numeric and string comparision operators supported
* Variadic functions supported
* Standard math functions included
* Easy to add custom functions or constants
* All operators support literal equivalent

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
#### Object operations
* Property at: [], at
#### Array operations
* Element at: [], at
* Concatination: #, concat
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
* Equal to: =, eq
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
#### Boolean constants
* true
* false
#### Numeric constants
* epsilon
* pi

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
number value, string value, operator, or function name is assumed to be variable.
Evaluate the expression by providing variable values.

Sample code:

```ts
...
const expr = new ExpressionService( 'x * (y + abc / 5) > 10' );
const value1 = expr.evaluate( { x: 10, y: 20, abc: 10 } );
const value2 = expr.evaluate( { x: 1, y: 4, abc: 50 } );
...
```
