# Affinirum
A scripting language with a recursive descent parser for efficient evaluation of algorithmic expressions.

Language supports regular algebraic expressions,
 various numeric, buffer, string, array, and object functions,
 global, and local variables, first-order functions, type checking,
 boolean, algebraic, conditional expressions and loops,
 along with a comprehensive set of numeric, buffer, string, array, and object functions.

It can be run in browser or in NodeJS.

Target: ES2022 [browser+NodeJS][ESM+CJS].

## Features

* Parse once, execute multiple times for provided variable values
* Constant expression optimization and basic type checking
* Boolean, arithmetic, buffer, string and indexing operators
* Comparison operators for numeric, buffer, and string types
* Variadic functions, first-order functions
* Support for input and statement variables
* Standard mathematical and composition functions

## Specifications

Script can contain multiple comma-separated expressions, and blocks of statements.
The value of a block is determined by the value of the last expression.
* Scientific notation is supported for numbers, like *0.1281e+2*
* ISO Timestamps prefixed with **@**, like *@2025-05-11T19:09:21.320Z*
* Variable size integers are supported and prefixed with **0**, like *00*, *-045*
* Hexadecimal buffer values are prefixed with **#**, like *#10ab0901*
* String literals are enclosed in single (**'**), double (**"**), or backtick (**`**) quotes, like *'string value'*

Array is an ordered sequence of values of any type.
It is defined by comma-separated values enclosed in brackets (**[]**),
 like  *[0,1,2]*, *["a","b","c"]*.
<br>An empty array is represented as **[]**.

Array elements can be accessed using the dot (**.**) access operator with a index,
 or using brackets with a zero-based numeric index, like *theArray.23*, *theArray[0]*, *theArray[10]*, *theArray[indexVar]*

Object is a container of named values of any type.
It is defined by comma-separated key-value pair enclosed in brackets (**[]**) where key is separated from value by colon (**:**),
 like *["NumericProperty":100, "StringProperty":"abc"]*, *["a":0,"b":"str":"c":valueVar]*.
<br>An empty object is represented as **[\:]**.

Object properties can be accessed using the dot (**.**) access operator with a string literal,
 or with brackets containing a string key or numeric index,
 like *theObject."StringProperty"*, *theObject["StringProperty"]*, *theObject[indexVar]*

A function is a callable code unit that produces a value.
The set of built-in functions can be extended through configuration entries.
Additionally, subroutines (functions defined in code) can be created.

Valid variable and function names must start with a letter or underscore (**\_**)
 and can be followed by any combination of alphanumeric characters or underscores,
 like *x*, *\_a1*, *abc25*

Whitespace characters are ignored.

### Types
* **void** for value **null**
* **number** IEEE 754 double-precision binary floating-point format: binary64
* **boolean** for values **true** and **false**
* **timestamp** for date-time values, millisecons since Unix epoch
* **integer** for variable sized integer values
* **buffer** for ordered sequences of bytes
* **string** for ordered sequences of characters, text strings
* **array** for ordered sequences of valuese
* **object** for sets of named values
* **function** for built-in, injected or script-defined subroutines

Type modifier **?** can be used to make any type optional (nullable).
<br>Examples: *number? optNumVar*, *array? optArrayVar*

Unknown or variant type is declared as **??**.

### Definitions
* Value grouping: **(...)**
* Unit grouping: **{...}**
* Value and unit separator: **,**
* Array element at numeric index, or object property by string key: **[]**
* Object property by string key or method function call: **.**
* Array definiton: **[element1, ...]**
* Object definition: **[propery1-key: property1-value, ...]**
* Subroutine definition: **return-type(argument1-type argument1-name, ...) {...}**
* Conditional switch definition, returns first or second value if prefix is true or false: **if condition {value1} else {value2}**,
 and if **else** clause is ommited second value deemed null
* Loop definition, iteratively evaluates suffix while prefix is true, returns last evaluated value: **while condition {...}**

### Operators
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
* Arithmetic addition, or buffer, string, and array concatination: **+**
* Arithmetic subtraction or negation: **-**
* Arithmetic multiplication: **\***
* Arithmetic division: **/**
* Arithmetic remainder: **%**
* Exponentiation operator: **^**
* Assignment: **=**
* Boolean disjunction (Logical OR) assignment: **|=**
* Boolean conjunction (Logical AND) assignment: **&=**
* Arithmetic addition assignment: **+=**
* Arithmetic subtraction assignment: **-=**
* Arithmetic multiplication assignment: ***=**
* Arithmetic division assignment: **/=**
* Arithmetic remainder assignment: **%=**

### Constants

#### Array
* **array Array.Range(inclusiveFrom:number, exclusiveTo:number)** - New array filled with integers in between given two numbers
* **array Array.Chain(...values:array)** - Chain array of any depths into single array
* **array Array.Unique()** - Array of unique values
* **array Array.Intersection(a1:array, a2:array)** - Intersection of values of two arrays
* **array Array.Difference(a1:array, a2:array)** - Symmetrical difference between two arrays

#### Boolean
* **boolean Boolean.Or(...values:boolean|array)** - Boolean disjunction
* **boolean Boolean.And(...values:boolean|array)** - Boolean conjunction
* **boolean Boolean.Not(value:boolean)** - Boolean negation
* **string Boolean.FormatBoolean()** - Format string from boolean
* **boolean Boolean.ParseBoolean()** - Parse boolean from string

#### Buffer
* **buffer Bufer.Random(length:number)** - Buffer of given length filled with random bytes
* **string Buffer.FormatBuffer(value:buffer)** - Create hexadecimal string from buffer
* **buffer Buffer.ParseBuffer(value:string)** Parse buffer from hexadecimal string

#### Integer
* **integer Integer.Sum(...values:integer|array)** - Numeric sum
* **integer Integer.Min(...values:integer|array)** - Numeric minimum
* **integer Integer.Max(...values:integer|array)** - Numeric maximum
* **integer Integer.Random(exclusiveTo:integer)** - Random integer up to given value

#### Number
* **Number.NAN** - Not-a-number
* **Number.PositiveInfinity** - Positive infinity
* **Number.NegativeInfinity** - Negative infinity
* **Number.Epsilon** - Epsilon
* **number Number.Sum(...values:number|array)** - Numeric sum
* **number Number.Min(...values:number|array)** - Numeric minimum
* **number Number.Max(...values:number|array)** - Numeric maximum
* **number Number.Exponent()** - Exponent
* **number Number.Logarithm()** - Logarithm
* **number Number.Abs()** - Absolute value
* **number Number.Ceil()** - Ceil
* **number Number.Floor()** - Floor
* **number Number.Round()** - Rounded value
* **number Number.Random(exclusiveTo:number)** - Random number up to given value
* **buffer Number.Encode(value:number, encoding:string)** - Encode number
* **number Number.Decode(value:buffer, encoding:string, offset:number?)** - Decode number
* **string Number.Format(value:number, radix:number)** - Format string from number of given radix
* **number Number.Parse(value:string)** - Parse number from string

#### Object
* **object Object.Merge(...values:array|object)** - Merge objects into single object

#### String
* **string String.Random(length:number)** - Random alphanumeric string
* **buffer String.Encode(value:string, encoding:string?)** - Encode string
* **string String.Decode(value:buffer, encoding:string?, offset:number?, length:number?)** - Decode string

#### Timestamp
* **timestamp Timestamp.Now()** - Current date time
* **string Timestamp.Format(value:timestamp)** - Format ISO timestamp
* **timestamp Timestamp.Parse(value:string)** - Parse timestamp from string

#### AVN
* **string AVN.Format(whitespace:string?)** - Create AVN-formatted string

#### JSON
* **boolean?|number?|string?|array?|object? JSON.Parse(value:string?)** - Parse JSON-formatted string
* **string? JSON.Format(boolean?|number?|string?|array?|object?, whitespace:string?)** - Create JSON-formatted string

### Functions

#### General Functions
* Null coalescence: **?? ??.Coalesce(otherwise:??)**
* Equals to: **boolean ??.Equal(value:??)**
* Not equals to: **boolean ??.Unequal(value:??)**
* Greater than: **boolean number|integer.GreaterThan(value:number|integer)**
* Less than: **boolean number|integer.LessThan(value:number|integer)**
* Greater than or equals to: **boolean number|integer.GreaterOrEqual(value:number|integer)**
* Less than or equals to: **boolean number|integer.LessOrEqual(value:number|integer)**
* Arithmetic addition or concatination of buffers, strings and arrays: **number|buffer|string|array number|buffer|string|array.Add(...values:number|buffer|string|array)**
* Arithmetic subtraction: **number|integer number|integerSubtract(subtrahend:number|integer)**
* Arithmetic negation: **number|integer number|integerNegate()**
* Arithmetic multiplication: **number|integer number|integer.Multiply(...values:number|integer)**
* Arithmetic division: **number|integer number|integer.Divide(divisor:number|integer)**
* Arithmetic remainder: **number|integer number|integer.Remainder(divisor:number|integer)**
* Arithmetic modulo: **number|integer number|integer.Modulo(divisor:number|integer)**
* Power: **number|integer number|integer.Power(exponent:number|integer)**
* Root: **number|integer number|integer.Root(index:number|integer)**
* Length of buffer, string, array or object: **number buffer|string|array|object.Length()**
* New buffer, string or array slice: **buffer|string|array buffer|string|array.Slice(beginIndex:number?, endIndex:number?)**
* Array or object value at index: **?? array?|object?.At(number|string index)**

#### Array Functions
* Find first item satisfying condition: **?? array.First(condition:function)**
* Find last item satisfying condition: **?? array.Last(condition:function)**
* Find first index of item satisfying condition: **number array.FirstIndex(condition:function)**
* Find last index of item satisfying condition: **number array.LastIndex(condition:function)**
* Check if every item satisfies condition: **boolean array.Every(condition:function)**
* Check if any item satisfies condition: **boolean array.Any(condition:function)**
* New array with reverse order of items: **array array.Reverse()**
* New array flattened to specified depth: **array array.Flatten(number depth)**
* Mutate items: **array array.Mutate(function transformation)**
* Filter items: **array array.Filter(condition:function)**
* Reduce array to a single value: **?? array.Reduce(function reducer)**
* Object composition from array of keys with generator function: **object array.Compose(function generator)**
* Concatination of array of strings with separator: **string array.Join(string separator = ' ')**

#### Buffer Functions
* Byte at position: **buffer buffer.Byte(pos:number)**

#### String Functions
* String alphanumerically equals to: **boolean string.Like(value:string)**
* String alphanumerically not equals to: **boolean string.Unlike(value:string)**
* String contains substring: **boolean string.Contains(search:string, startPos:number?, ignoreCaseSpaceEtc:boolean?)**
* String starts with substring: **boolean string.StartsWith(search:string, startPos:number?, ignoreCaseSpaceEtc:boolean?)**
* String ends with substring: **boolean string.EndsWith(search:string, endPos:number?, ignoreCaseSpaceEtc:boolean?)**
* Get alphanumeric digest of string: **string string.Alphanum()**
* Trim whitespace: **string string.Trim()**
* Trim whitespace at start: **string string.TrimStart()**
* Trim whitespace at end: **string string.TrimEnd()**
* Lower case: **string string.LowerCase()**
* Upper case: **string string.UpperCase()**
* Split string into array of strings using separator: **array string.Split(string separator = ' ')**
* Character at position: **string string.Char(pos:number)**
* Character code at position: **number string.CharCode(pos:number)**

#### Object Functions
* Object key-value pairs: **array object.Entries()**
* Object keys: **array object.Keys()**
* Object values: **array object.Values()**

#### Timestamp Functions
* Get year: **number timestamp.Year(utc:boolean?)**
* Get month: **number timestamp.Month(utc:boolean?)**
* Get month index: **number timestamp.MonthIndex(utc:boolean?)**
* Get weekday index: **number timestamp.WeekdayIndex(utc:boolean?)**
* Get day of a month: **number timestamp.Day(utc:boolean?)**
* Get hour: **number timestamp.Hour(utc:boolean?)**
* Get minute: **number timestamp.Minute(utc:boolean?)**
* Get second: **number timestamp.Second(utc:boolean?)**
* Get millisecond: **number timestamp.Millisecond(utc:boolean?)**
* Get milliseconds since epoch: **number timestamp.EpochTime(epoch:timestamp?)**

## Language Grammar

The script parsing is performed using the following grammar:

	<block> = <unit>{ ","<unit> }
	<unit> = <disjunction>
	<disjunction> = <conjunction>{ "|"<conjunction> }
	<conjunction> = <comparison>{ "&"<comparison> }
	<comparison> = { "!" }<aggregate>{ ( ">" | ">=" | "<" | "<=" | "==" | "!=" )<aggregate> }
	<aggregate> = <product>{ ( "+>" | "+" | "-" )<product> }
	<product> = <factor>{ ( "*" | "/" | "%" )<factor> }
	<factor> = { "-" }<coalescence>{ "^"<coalescence> }
	<coalescence> = <accessor>{ "?:"<accessor> }
	<accessor> = <term>{ ( "." ( <property> | <function-name> ) | <function> | "["<unit>"]" ) }
	<term> = <literal> | <constant-name> | <variable> | <function> | <subroutine> |
		"{"<block>"}" | "("<unit>")" | <array> | <object> | <loop> | <switch>
	<literal> = <decimal-number> | #<hexadecimal-binary> | "'"<text-string>"'"
	<array> = "["{ <unit> }{ ","<unit> }"]"
	<object> = "["{ <unit>:<unit> }{ "," <unit>:<unit> }"]"
	<variable> = { ( "const" | "var" ) } <variable-name> { ":"<type>} { ( "=" | "|=" | "&=" | "+=" | "-=" | "*=" | "/=" | "%=" )<unit> }
	<function> = <function-name>"("{ <unit> }{ ","<unit> }")"
	<subroutine> = <type>"("{ <argument-name>":"<type> }{ ","<argument-name>":"<type> }")" "{"<unit>"}"
	<type> = "??" | ( "void" | "number" | "boolean" | "timestamp" | "integer" | "buffer" | "string" |
		"array" | "object" | "function" ){ "?" }
	<loop> = while <unit> "{" <block> "}"
	<switch> = if <unit> "{" <unit> "} else {" <unit> "}"

## Reference

Create instance of Affinirum class with a string containing script and optional compilation configuration.
During the parsing any alphanumeric sequence not identified as
number value, string value, operator, or a function name is assumed to be variable.
Evaluate the expression by providing variable values.

Sample code:

```ts
...
const expr = new Affinirum( 'x * (y + abc / 5) > 10' );
const value1 = expr.evaluate( { x: 10, y: 20, abc: 10 } ); // true
const value2 = expr.evaluate( { x: 1, y: 4, abc: 5 } ); // false
...
const arrExpr = new Affinirum( 'Sum([ 1, 2, 3, a, b, c ])' );
const valueSum = arrExpr.evaluate( { a: 10, b: 20, c: 30 } ); // 66
...
const objExpr = new Affinirum( '[`prop1`:a,`prop2`:`abc`].prop1+10' );
const oValue = objExpr.evaluate( { a: 50 } ); // 60
...
const iteratorExpr = new Affinirum(
	'Number.Sum(arr1.Mutate(number(a:number)->a*2).Filter(boolean(a:number)->a>3))'
);
const iValue = iteratorExpr.evaluate( { arr1: [ 1, 2, 3 ] } ); // 10
...
const complexExpr = new Affinirum(
	'var a=myvar1/10, const b=myvar2-100, a/b + b*a + 600'
);
const value = complexExpr.evaluate( { myvar1: 40, myvar2: 104 } ); // 4761
...
```
