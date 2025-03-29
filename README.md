# expression-evaluation
A recursive descent parser for efficient evaluation of algorithmic expressions.

Parser supports boolean expressions, regular algebraic expressions,
 various numeric, buffer, string, array, and object functions.
It also supports global, and local variables, along with
 first-order functions and type checking.

Supports boolean, algebraic, conditional expressions and loops,
 along with a comprehensive set of numeric, buffer, string, array, and object functions.
Also includes global and local variables, first-order functions, and shallow type checking.

Target: ES2022 [browser+NodeJS][ESM+CJS].

## Features

* Parse once, execute multiple times for provided variable values
* Constant expression optimization and basic type checking
* Boolean, arithmetic, buffer, string and indexing operators
* Comparison operators for numeric, buffer, and string types
* Variadic functions, first-order functions
* Support for input and statement variables
* Standard mathematical and composition functions
* Ability to inject custom functions and constants

## Language Specifications

Expressions can contain multiple comma-separated sub-expressions.
The value of an expression is determined by the value of the last sub-expression in the program.
* Scientific notation is supported for numbers
* Hexadecimal integer values are prefixed with **#**
* Hexadecimal buffer values are prefixed with **##**
* String literals are enclosed in single (**'**), double (**"**), or backtick (**`**) quotes

Array is an ordered sequence of values of any type.
It is defined by comma-separated values enclosed in brackets (**[]**).
An empty array is represented as **[]**.
<br>Examples: *[0,1,2]*, *["a","b","c"]*

Array elements can be accessed using brackets with a zero-based numeric index.
<br>Examples: *theArray[0]*, *theArray[10]*, *theArray[indexVar]*

Object is a container of named values of any type.
It is defined by comma-separated key-value pair enclosed in brackets (**[]**).
Key is separated from value by colon (**:**).
An empty object is represented as **[\:]**.
<br>Examples: *["NumericProperty":100, "StringProperty":"abc"]*, *["a":0,"b":"str":"c":valueVar]*

Object properties can be accessed using the dot (**.**) access operator with a string literal,
 or with brackets containing a string key or numeric index.
<br>Examples: *theObject.NumericProperty*, *theObject["StringProperty"]*, *theObject[indexVar]*

A function is a callable code unit that produces a value.
The set of built-in functions can be extended through configuration entries.
Additionally, subroutines (functions defined in code) can be created.

Valid variable and function names must start with a letter or underscore (**\_**)
 and can be followed by any combination of alphanumeric characters or underscores.
<br>Examples: *x*, *\_a1*, *abc25*

Whitespace characters are ignored.

#### Types
* **boolean** for values **true** and **false**
* **number**
* **buffer** for ordered sequences of bytes
* **string** for ordered sequences of characters, text strings
* **array** for ordered sequences of values of any type
* **object** for sets of named values of any type
* **function** for any built-in, injected or script-defined subroutines
* **void** for value **null**

Type modifier **?** can be used to make any type optional (nullable).
<br>Examples: *number? optNumVar*, *array? optArrayVar*

Unknown or variant type is declared as **??**.

#### Definitions
* Value grouping: **(...)**
* Unit grouping: **{...}**
* Value and unit separator: **,**
* Array element at numeric index, or object property by string key: **[]**
* Object property by string key or method function call: **.**
* Array definiton: **[element1, ...]**
* Object definition: **[propery1-key: property1-value, ...]**
* Subroutine definition: **return-type(argument1-type argument1-name, ...)->...**
* Conditional switch definition, returns first or second suffix if prefix is true or false: **...\$...:...**
* Loop definition, iteratively evaluates suffix while prefix is true, returns last evaluated value: **...@...**

Parameterless subroutine definition can be shorthanded as **->...**.

#### Operators
* Boolean negation (Logical NOT): **!**
* Boolean disjunction (Logical OR): **|**
* Boolean conjunction (Logical AND): **&**
* Greater than: **>**
* Less than: **<**
* Greater than or equals to: **>=**
* Less than or equals to: **<=**
* Equals to: **==**
* Not equals to: **!=**
* Null coalescence: **?:**
* Arithmetic addition: **+**
* Arithmetic subtraction or negation: **-**
* Arithmetic multiplication: **\***
* Arithmetic division: **/**
* Arithmetic remainder: **%**
* Buffer, string, or array concatination: **+>**
* Assignment: **=**
* Boolean disjunction (Logical OR) assignment: **|=**
* Boolean conjunction (Logical AND) assignment: **&=**
* Arithmetic addition assignment: **+=**
* Arithmetic subtraction assignment: **-=**
* Arithmetic multiplication assignment: ***=**
* Arithmetic division assignment: **/=**
* Arithmetic remainder assignment: **%=**
#### Global Functions
* Boolean disjunction: **boolean Or(boolean|array ...values)**
* Boolean conjunction: **boolean And(boolean|array ...values)**
* Boolean negation: **boolean Not(boolean value)**
* Numeric sum: **number Sum(number|array ...values)**
* Numeric minimum: **number Min(number|array ...values)**
* Numeric maximum: **number Max(number|array ...values)**
* New array filled with integers in between given two numbers: **array Range(number inclusiveFrom, number exclusiveTo)**
* Chain array of any depths into single array: **array Chain(array ...values)**
* Merge objects into single object: **object Merge(array|object ...values)**
* Current date time as milliseconds since epoch: **number Now()**
* Random number: **number number.RandomNumber()**
* Random integer: **number number.RandomInteger()**
* Random buffer: **buffer number.RandomBuffer()**
* Random alphanumeric string: **string number.RandomString()**
#### Base Method Functions
* Greater than: **boolean number.GreaterThan(number value)**
* Less than: **boolean number.LessThan(number value)**
* Greater than or equals to: **boolean number.GreaterOrEqual(number value)**
* Less than or equals to: **boolean number.LessOrEqual(number value)**
* Equals to: **boolean ??.Equal(?? value)**
* Not equals to: **boolean ??.Unequal(?? value)**
* String alphanumerically equals to: **boolean string.Like(string value)**
* String alphanumerically not equals to: **boolean string.Unlike(string value)**
* Null coalescence: **?? ??.Coalesce(?? valueIfNull)**
* Conditional statement: **?? boolean.Switch(?? valueIfTrue, ?? valueIfFalse)**
* String contains substring: **boolean string.Contains(string search, number? startPos, boolean? boolean? ignoreCaseSpaceEtc)**
* String starts with substring: **boolean string.StartsWith(string search, number? startPos, boolean? ignoreCaseSpaceEtc)**
* String ends with substring: **boolean string.EndsWith(string search, number? endPos, boolean? boolean? ignoreCaseSpaceEtc)**
* Check if every item satisfies condition: **boolean array.Every(function condition)**
* Check if any item satisfies condition: **boolean array.Any(function condition)**
* Get alphanumeric digest of string: **string string.Alphanum()**
* Trim whitespace: **string string.Trim()**
* Trim whitespace at start: **string string.TrimStart()**
* Trim whitespace at end: **string string.TrimEnd()**
* Lower case: **string string.LowerCase()**
* Upper case: **string string.UpperCase()**
* Concatination of array of strings with separator: **string array.Join(string separator = ' ')**
* Split string into array of strings using separator: **array string.Split(string separator = ' ')**
* Array of unique values: **array array.Unique()**
* Intersection of values of two arrays: **array array.Intersection(array value)**
* Symmetrical difference between two arrays: **array array.Difference(array value)**
#### Composite Method Functions
* Append buffer, string or array: **buffer|string|array buffer|string|array.Append(buffer|string|array ...values)**
* Length of buffer, string, array or object: **number buffer|string|array|object.Length()**
* New buffer, string or array slice: **buffer|string|array buffer|string|array.Slice(number? beginIndex, number? endIndex)**
* Byte at position: **buffer buffer.Byte(number pos)**
* Character at position: **string string.Char(number pos)**
* Character code at position: **number string.CharCode(number pos)**
* Find first item satisfying condition: **?? array.First(function condition)**
* Find last item satisfying condition: **?? array.Last(function condition)**
* Find first index of item satisfying condition: **number array.FirstIndex(function condition)**
* Find last index of item satisfying condition: **number array.LastIndex(function condition)**
* Array or object key-value pairs: **array? array?|object?.Entries()**
* Array or object keys: **array? array?|object?.Keys()**
* Array or object values: **array? array?|object?.Values()**
* Array or object value at index: **?? array?|object?.At(number|string index)**
* New array with reverse order of items: **array array.Reverse()**
* New array flattened to specified depth: **array array.Flatten(number depth)**
* Transform items: **array array.Transform(function transformation)**
* Filter items: **array array.Filter(function condition)**
* Reduce array to a single value: **?? array.Reduce(function reducer)**
* Object composition from array of keys with generator function: **object array.Compose(function generator)**
#### Math Method Functions
* Arithmetic addition: **number number.Add(number ...values)**
* Arithmetic subtraction: **number number.Subtract(number subtrahend)**
* Arithmetic negation: **number number.Negate()**
* Arithmetic multiplication: **number number.Multiply(number ...values)**
* Arithmetic division: **number number.Divide(number divisor)**
* Arithmetic remainder: **number number.Remainder(number divisor)**
* Arithmetic modulo: **number number.Modulo(number divisor)**
* Exponent: **number number.Exponent()**
* Logarithm: **number number.Logarithm()**
* Power: **number number.Power(number exponent)**
* Root: **number number.Root(number index)**
* Absolute value: **number number.Abs()**
* Ceil: **number number.Ceil()**
* Floor: **number number.Floor()**
* Rounded value: **number number.Round()**
#### Mutation Method Functions
* Get UTC time array from milliseconds since 1970: **array number.ToUniversalTime()**
* Get milliseconds since 1970 from UTC time array: **number array.FromUniversalTime()**
* Get local time array from milliseconds since 1970: **array number.ToLocalTime()**
* Get milliseconds since 1970 from local time array: **number array.FromLocalTime()**
* Get UTC time month index from milliseconds since 1970: **array number.ToUniversalTimeMonthIndex()**
* Get local time month index from milliseconds since 1970: **array number.ToLocalTimeMonthIndex()**
* Get UTC time weekday index from milliseconds since 1970: **array number.ToUniversalTimeWeekdayIndex()**
* Get local time weekday index from milliseconds since 1970: **array number.ToLocalTimeWeekdayIndex()**
* Get ISO time string from milliseconds since 1970: **string number.ToTimeString()**
* Get milliseconds since 1970 from ISO time string: **number string.FromTimeString()**
* Encode number: **buffer number.ToNumberBuffer(string encoding)**
* Decode number: **number buffer.FromNumberBuffer(string encoding, number? offset)**
* Encode string: **buffer string.ToStringBuffer(string encoding)**
* Decode string: **string buffer.FromStringBuffer(string? encoding, number? offset, number? length)**
* Create decimal string from number: **string number.ToNumberString()**
* Parse number from decimal string: **buffer string.FromNumberString()**
* Create hexadecimal string from buffer: **string buffer.ToBufferString()**
* Parse buffer from hexadecimal string: **buffer string.FromBufferString()**
* Parse object from JSON-formatted string: **boolean?|number?|string?|array?|object? string?.FromJsonString()**
* Create JSON-formatted string from object: **string? boolean?|number?|string?|array?|object?.ToJsonString()**
#### Constants
* Not-a-number **NAN**
* Positive infinity **POSINF**
* Negative infinity **NEGINF**
* Epsilon **EPSILON**
* Pi **PI**

## Language Grammar

The expression parsing is performed using the following grammar:

	<program> = <unit>{ ","<unit> }
	<unit> = <loop>
	<loop> = <condition>{ "@" <condition> }
	<condition> = <disjunction>{ "$" <unit> ":" <unit> }
	<disjunction> = <conjunction>{ "|"<conjunction> }
	<conjunction> = <comparison>{ "&"<comparison> }
	<comparison> = { "!" }<aggregate>{ ( ">" | ">=" | "<" | "<=" | "==" | "!=" )<aggregate> }
	<aggregate> = <product>{ ( "+>" | "+" | "-" )<product> }
	<product> = <factor>{ ( "*" | "/" | "%" )<factor> }
	<factor> = { "-" }<coalescence>{ "^"<coalescence> }
	<coalescence> = <accessor>{ "?:"<accessor> }
	<accessor> = <term>{ ( "." ( <property> | <function-name-string> ) | "("{ <unit> }{ ","<unit> }")" | "["<unit>"]" ) }
	<term> = <literal> | <constant-name-string> | <function-name-string> | <variable> | <subroutine> |
		"{"<program>"}" | "("<unit>")" | <array> | <object>
	<literal> = <decimal-number> | #<hexadecimal-number> | ##<hexadecimal-binary> | "'"<text-string>"'"
	<array> = "["{ <unit> }{ ","<unit> }"]"
	<object> = "["{ <unit>:<unit> }{ "," <unit>:<unit> }"]"
	<variable> = { <type> } <variable-name-string>{ "="<unit> }
	<subroutine> = { <type>"("{ <type> <argument-name-string> }{ ","<type> <argument-name-string> }")" } "->" <unit>
	<type> = ( "void" | "boolean" | "number" | "buffer" | "string" | "array" | "object" | "function" ){ "?" } | "??"

## Reference

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
const arrExpr = new Expression( 'Sum([ 1, 2, 3, a, b, c ])' );
const valueSum = arrExpr.evaluate( { a: 10, b: 20, c: 30 } ); // 66
...
const objExpr = new Expression( '[`prop1`:a,`prop2`:`abc`].prop1+10' );
const oValue = objExpr.evaluate( { a: 50 } ); // 60
...
const iteratorExpr = new Expression(
	'arr1.Transform(number(number a)->a*2).Filter(boolean(number a)->a>3).Sum()'
);
const iValue = iteratorExpr.evaluate( { arr1: [ 1, 2, 3 ] } ); // 10
...
const complexExpr = new Expression(
	'?? a=myvar1/10, ?? b=myvar2-100, a/b + b*a + 600'
);
const value = complexExpr.evaluate( { myvar1: 40, myvar2: 104 } ); // 4761
...
```
