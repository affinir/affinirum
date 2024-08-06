# expression-evaluation
Recursive descent parsing and evaluation of closed-form analytic expressions.

Parser supports boolean expressions, regular algebraic expressions, 
numeric and string functions, variables, and closures.

Target: ES2022 [browser+NodeJS][ESM+CJS].

## Why

* Parse once, execute multiple times
* Efficient expression evaluation and basic type checking
* Support for boolean, number, buffer, string, array, object, function, void, variant
  and nullable types
* Boolean, arithmetic, buffer, string and index operators
* Numeric, buffer and string comparison operators
* Variadic functions and closures
* Input and statement variables
* Standard math functions
* Easy to add custom functions or constants
* All operators support literal equivalent
* Method-style invocation is supported for all functions,
  i.e. pow(a,2) is the same as a.pow(2)

## What

#### Operators
* Boolean disjunction: **|**
* Boolean conjunction: **&**
* Boolean negation: **!**
* Greater than: **>**
* Less than: **<**
* Greater than or equal to: **>=**
* Less than or equal to: **<=**
* Equals to: **=**
* Not equals to: **!=**
* String similar to: **\~**
* String not similar: **!\~**
* Null coalescence: **?:**
* Arithmetic addition, buffer or string concatination: **+**
* Arithmetic subtraction or negation: **-**
* Arithmetic multiplication: **\***
* Arithmetic division: **/**
* Arithmetic percentage: **%**
* Array element at literal index: **@**
* Array element at numeric value: **[]**
* Array concatination: **#**
* Object property by literal name: **.**
* Object property by string value: **{}**
* Object merging: **$**
* Assignment: **:**
* Grouping: **(...)**
* Next statement: **,**
* Conditional statement: **if...then...else...**
#### Functions
* Boolean disjunction: **boolean or(boolean ...values)**
* Boolean conjunction: **boolean and(boolean ...values)**
* Bolean negation: **boolean not(boolean value)**
* Greater than: **boolean gt(number value1, number value2)**
* Less than: **boolean lt(number value1, number value2)**
* Greater than or equals to: **boolean ge(number value1, number value2)**
* Less than or equals to: **boolean le(number value1, number value2)**
* Equals to: **boolean eq(var value1, var value2)**
* Not equals to: **boolean neq(var value1, var value2)**
* String alphanumerically similar to: **boolean like(string value1, string value2)**
* String alphanumerically not similar to: **boolean nlike(string value1, string value2)**
* Conditional statement: **variant ifte(boolean condition, variant valueIfTrue, variant valueIfFalse)**
* Null coalescence: **variant nullco(variant value, variant valueIfNull)**
* Arithmetic addition or string concatination: **number|string add(number|string ...values)**
* Arithmetic subtraction: **number sub(number minuend, number subtrahend)**
* Arithmetic negation: **number neg(number value)**
* Arithmetic multiplication: **number mul(number ...values)**
* Arithmetic division: **number div(number dividend, number divisor)**
* Arithmetic percentage: **number pct(number dividend, number divisor)**
* Exponent: **number exp(number value)**
* Logarithm: **number log(number value)**
* Power: **number pow(number base, number exponent)**
* Root: **number rt(number value, number index)**
* Square: **number sq(number value)**
* Square root: **number sqrt(number value)**
* Absolute value: **number abs(number value)**
* Ceil: **number ceil(number value)**
* Floor: **number floor(number value)**
* Rounded value: **number round(number value)**
* Minimum: **number min(number ...values)**
* Maximum: **number max(number ...values)**
* Parse buffer from hexadecimal string: **buffer fromHex(string value)**
* Create hexadecimal string from buffer: **string toHex(buffer value)**
* Subbuffer: **buffer subbuf(buffer value, number beginPos, number? endPos)**
* Byte at position: **buffer byte(buffer value, number pos)**
* String contains substring: **boolean contains(string value, string search, number? startPos, boolean? boolean? ignoreCaseSpaceEtc)**
* String starts with substring: **boolean startsWith(string value, string search, number? startPos, boolean? ignoreCaseSpaceEtc)**
* String ends with substring: **boolean endsWith(string value, string search, number? endPos, boolean? boolean? ignoreCaseSpaceEtc)**
* Get alphanumeric digest of string: **string alphanum(string value)**
* Trim whitespace: **string trim(string value)**
* Trim whitespace at start: **string trimStart(string value)**
* Trim whitespace at end: **string trimEnd(string value)**
* Substring: **string substr(string value, number beginPos, number? endPos)**
* Character at position: **string char(string value, number pos)**
* Character code at position: **number charCode(string value, number pos)**
* Array element at index: **variant at(array value, number index)**
* Concatination of arrays or singular values into a flat array: **array concat(array ...values)**
* New array with reverse order of items: **array reverse(array value)**
* New array flattened to specified depth: **array flatten(array value, number depth)**
* New array sliced from given array: **array slice(array value, number? beginIndex, number? endIndex)**
* New array filled with numbers in between given two numbers: **array range(number inclusiveFrom, number exclusiveTo)**
* Find first item satisfying condition: **variant first(array value, function condition)**
* Find last item satisfying condition: **variant last(array value, function condition)**
* Find first index of item satisfying condition: **number firstIndex(array value, function condition)**
* Find last index of item satisfying condition: **number lastIndex(array value, function condition)**
* Iterate items: **void iterate(array value, function iteration)**
* Map items: **array map(array value, function transformation)**
* Filter items satisfying condition: **array filter(array value, function condition)**
* Check if any item satisfies condition: **boolean any(array value, function condition)**
* Check if every item satisfies condition: **boolean every(array value, function condition)**
* Object construction from name-value pairs: **object construct(array ...values)**
* Object property by name: **variant by(object value, string name)**
* Object merging: **object merge(object ...values)**
* Parse object from JSON-formatted string: **void|boolean|number|string|array|object fromJson(string|void value)**
* Create JSON-formatted string from object: **string|void toJson(void|boolean|number|string|array|object value)**
#### Constants
* **void null**
* **boolean true**
* **boolean false**
* **number NaN**
* **number PosInf**
* **number NegInf**
* **number Epsilon**
* **number Pi**

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
	<term> = <number> | <string> | <constant-name> |
		<function-name>"("{ <disjunction> }{ ","<disjunction> }")" |
		{ <type> } <variable-name>{ ":"<disjunction> } |
		<type>"("<type> <argument>{ ","<type> <argument> }")" "=>"<list> |
		"("<disjunction>")" |
		"["{ <disjunction> }{ ","<disjunction> }"]" |
		"{"{ <property-name>:<disjunction> }{ ","<property-name>:<disjunction> }"}" |
		"if" <condition> "then" <disjunction> "else" <disjunction>
	<type> = ( "void" | "boolean" | "bool" | "number" | "num" | "buffer" | "buf" | "string" | "str" |
		"array" | "arr" | "object" | "obj" | "function" | "func" ){ "?" } | "var"

Whitespace characters are ignored.

Number literals in scientific notation are not supported.
Hexadecimal integers require prefix **\\v**.
Buffer literals in hexadecimal format require prefix **\\x**.

Arrays may contain values of any type.
Type of any array is **array**.
Type of any object is **object**.
Type of any function is **function**, and type of **null** is **void**.

Valid variable or function names consist of a letter, or **\_** characters followed by any combination
of alphanumeric characters, and **\_**. For example: *x*, *\_a1*, *abc25*


## How

Create instance of Expression class with a string containing expression.
During the parsing any alphanumeric sequence not identified as
number value, string value, operator, or a function name is assumed to be variable.
Evaluate the expression by providing variable values.

Sample code:

```ts
...
const expr = new Expression( 'x * (y + abc / 5) > 10' );
const value1 = expr.evaluate( { x: 10, y: 20, abc: 10 } ); // true
const value2 = expr.evaluate( { x: 1, y: 4, abc: 5 } ); // false
...
const arrExpr = new Expression( '[ 1, 2, 3, a, b, c ].add()' );
const valueSum = arrExpr.evaluate( { a: 10, b: 20, c: 30 } ); // 66
...
const objExpr = new Expression( '{prop1:a,prop2:`abc`}.prop1+10' );
const oValue = objExpr.evaluate( { a: 50 } ); // 60
...
const iteratorExpr = new Expression(
	'arr1.map(number(number a) -> a*2).filter(boolean(number a) => a>3).add()'
);
const iValue = iteratorExpr.evaluate( { arr1: [ 1, 2, 3 ] } ); // 10
...
const complexExpr = new Expression(
	'var a:myvar1/10, var b:myvar2-100, a/b + b*a + 600'
);
const value = complexExpr.evaluate( { myvar1: 40, myvar2: 104 } ); // 4761
...
```
