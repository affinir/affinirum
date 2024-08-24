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

#### Types
* boolean
* number
* buffer
* string
* array
* object
* function
* void
#### Operators
* Assignment: **:**
* Grouping: **(...)**
* Next statement: **,**
* Array element at numeric value: **[]**
* Array element at literal index: **@**
* Any valid array element: **@!**
* Object property by string value: **{}**
* Object property by literal name: **.**
* Any valid object property: **.!**
* Boolean negation: **!**
* Boolean disjunction: **|**
* Boolean conjunction: **&**
* Greater than: **>**
* Less than: **<**
* Greater than or equal to: **>=**
* Less than or equal to: **<=**
* Equals to: **=**
* Not equals to: **!=**
* String similar to: **\~**
* String not similar: **!\~**
* Null coalescence: **?:**
* Conditional statement: **if...then...else...**
* Arithmetic addition, buffer or string concatination, or object merging: **+**
* Arithmetic subtraction or negation: **-**
* Arithmetic multiplication: **\***
* Arithmetic division: **/**
* Arithmetic percentage: **%**
* Length of buffer, string, array or object: **$**
#### Access Functions
* Subbuffer: **buffer subbuf(buffer value, number beginPos, number? endPos)**
* Byte at position: **buffer byte(buffer value, number pos)**
* Substring: **string substr(string value, number beginPos, number? endPos)**
* Character at position: **string char(string value, number pos)**
* Character code at position: **number charCode(string value, number pos)**
* New array sliced from given array: **array slice(array value, number? beginIndex, number? endIndex)**
* Find first item satisfying condition: **variant first(array value, function condition)**
* Find last item satisfying condition: **variant last(array value, function condition)**
* Find first index of item satisfying condition: **number firstIndex(array value, function condition)**
* Find last index of item satisfying condition: **number lastIndex(array value, function condition)**
* Array element at index: **variant at(array value, number index)**
* Any valid array element: **variant atValid(array value)**
* Object property by name: **variant by(object value, string name)**
* Any valid object property: **variant byValid(object value)**
* Length of buffer, string, array or object: **number len(buffer|string|array|object value)**
#### Base Functions
* Bolean negation: **boolean not(boolean value)**
* Boolean disjunction: **boolean or(boolean ...values)**
* Boolean conjunction: **boolean and(boolean ...values)**
* Greater than: **boolean gt(number value1, number value2)**
* Less than: **boolean lt(number value1, number value2)**
* Greater than or equals to: **boolean ge(number value1, number value2)**
* Less than or equals to: **boolean le(number value1, number value2)**
* Equals to: **boolean eq(var value1, var value2)**
* Not equals to: **boolean neq(var value1, var value2)**
* String alphanumerically similar to: **boolean like(string value1, string value2)**
* String alphanumerically not similar to: **boolean nlike(string value1, string value2)**
* Null coalescence: **variant nullco(variant value, variant valueIfNull)**
* Conditional statement: **variant ifte(boolean condition, variant valueIfTrue, variant valueIfFalse)**
* String contains substring: **boolean contains(string value, string search, number? startPos, boolean? boolean? ignoreCaseSpaceEtc)**
* String starts with substring: **boolean startsWith(string value, string search, number? startPos, boolean? ignoreCaseSpaceEtc)**
* String ends with substring: **boolean endsWith(string value, string search, number? endPos, boolean? boolean? ignoreCaseSpaceEtc)**
* Check if every item satisfies condition: **boolean every(array value, function condition)**
* Check if any item satisfies condition: **boolean any(array value, function condition)**
* Get alphanumeric digest of string: **string alphanum(string value)**
* Trim whitespace: **string trim(string value)**
* Trim whitespace at start: **string trimStart(string value)**
* Trim whitespace at end: **string trimEnd(string value)**
* Lower case: **string lowerCase(string value)**
* Upper case: **string upperCase(string value)**
* Concatination of array elements into a string with separator: **string join(array value, string separator)**
* Array of unique values: **array unique(array|variant ...values)**
* Intersection of values of two arrays: **array intersect(array value1, array value2)**
* Symmetrical difference between two arrays: **array differ(array value1, array value2)**
* New array with reverse order of items: **array reverse(array value)**
* New array flattened to specified depth: **array flatten(array value, number depth)**
* New array filled with integers in between given two numbers: **array range(number inclusiveFrom, number exclusiveTo)**
* Iterate items: **array iterate(array value, function iteration)**
* Map items: **array map(array value, function transformation)**
* Filter items: **array filter(array value, function condition)**
* Object composition from name-value pairs: **object comp(array ...values)**
* Object decomposition into name-value pairs: **array decomp(object value)**
* Object property keys: **array decompKeys(object value)**
* Object property values: **array decompValues(object value)**
#### Math Functions
* Arithmetic addition, buffer or string concatination: **number|buffer|string add(number|buffer|string ...values)**
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
* Sum: **number sum(number|array ...value)**
* Minimum: **number min(number|array ...value)**
* Maximum: **number max(number|array ...value)**
#### Mutation Functions
* Encode a number: **buffer encodeNum(number value, string encoding)**
* Decode a number: **number decodeNum(buffer value, string encoding, number? offset)**
* Encode a string: **buffer encodeStr(string value, string encoding)**
* Decode a string: **string decodeStr(buffer value, string? encoding, number? offset, number? length)**
* Create decimal string from number: **string toDec(number value)**
* Parse number from decimal string: **buffer fromDec(string value)**
* Create hexadecimal string from buffer: **string toHex(buffer value)**
* Parse buffer from hexadecimal string: **buffer fromHex(string value)**
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

	<program> = <disjunction>{ ","<disjunction> }
	<disjunction> = <conjunction>{ "|"<conjunction> }
	<conjunction> = <comparison>{ "&"<comparison> }
	<comparison> = { "!" }<aggregate>{ ( ">" | ">=" | "<" | "<=" | "=" | "!=" | "~" | "!~" )<aggregate> }
	<aggregate> = <product>{ ( "+" | "-" )<product> }
	<product> = <factor>{ ( "*" | "/" | "%" )<factor> }
	<factor> = { "-" }<coalescence>{ "^"<coalescence> }
	<coalescence> = <accessor>{ "?:"<accessor> }
	<accessor> = <term>{ ( "@!" | ".!" | "$" |
		"["<disjunction>"]" | "@"( <index-decimal-number> | #<index-hexadecimal-number> ) | "{"<disjunction>"}" |
		"."( <property-name-string> | <function> ) ) }
	<term> = <literal> | <group> | <array> | <object> | <constant> | <variable> | <function> | <closure> |
		"if" <condition> "then" <disjunction> "else" <disjunction>
	<literal> = <decimal-number> | #<hexadecimal-number> | ##<hexadecimal-binary> | "<text-string>"
	<group> = "("<program>")"
	<array> = "["{ <disjunction> }{ ","<disjunction> }"]"
	<object> = "{"{ <property-name-string>:<disjunction> }{ ","<property-name-string>:<disjunction> }"}"
	<constant> = <constant-name-string>
	<variable> = { <type> } <variable-name-string>{ ":"<disjunction> }
	<function> = <function-name-string>"("{ <disjunction> }{ ","<disjunction> }")"
	<closure> = <type>"("{ <type> <argument-name-string> }{ ","<type> <argument-name-string> }")" <disjunction>
	<type> = ( "void" | "boolean" | "bool" | "number" | "num" | "buffer" | "buf" | "string" | "str" |
		"array" | "arr" | "object" | "obj" | "function" | "func" ){ "?" } | "variant" | "var"

Whitespace characters are ignored.

Expression may contain multiple comma separated sub-expressions.
The value of an expression is the value of the last sub-expression in the program.

Number scientific notation is supported.
Hexadecimal integer literals start with prefix **#**.
Hexadecimal buffer literals start with prefix **##**.

Array is an ordered sequence of values of any type.
It can be defined using brackets with comma separated elements inside.
Array element can be accessed using operator **@** with numeric literal or using accessor **[]** with numeric value.

Object is a container of named values of any type.
It can be defined using braces with comma separated properties with assigned values.
Object property can be accessed using operator **.** with string literal or using accessor **{}** with string value.

Function is a callable unit producing a value.
It is defined with a return type followed by a comma separated typed function argument list encased in parentheses,
 and a function expression encased in parentheses.

Type of any array is **array**.
Type of any object is **object**.
Type of any function is **function**.
Type of **null** is **void**.

Valid variable or function names consist of a letter, or **\_** characters followed by any combination
of alphanumeric characters, and **\_**. For example: *x*, *\_a1*, *abc25*


## How

Create instance of Expression class with a string containing expression and optional compilation configuration.
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
const arrExpr = new Expression( '[ 1, 2, 3, a, b, c ].sum()' );
const valueSum = arrExpr.evaluate( { a: 10, b: 20, c: 30 } ); // 66
...
const objExpr = new Expression( '{prop1:a,prop2:`abc`}.prop1+10' );
const oValue = objExpr.evaluate( { a: 50 } ); // 60
...
const iteratorExpr = new Expression(
	'arr1.map(number(number a)(a*2)).filter(boolean(number a)(a>3)).sum()'
);
const iValue = iteratorExpr.evaluate( { arr1: [ 1, 2, 3 ] } ); // 10
...
const complexExpr = new Expression(
	'var a:myvar1/10, var b:myvar2-100, a/b + b*a + 600'
);
const value = complexExpr.evaluate( { myvar1: 40, myvar2: 104 } ); // 4761
...
```
