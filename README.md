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

Script can contain multiple semicolon-separated expressions, and blocks of statements.
The value of a block is determined by the value of the last expression.
* Scientific notation is supported for floating point numbers, like *0.1281e+2*
* ISO Timestamps prefixed with **@**, like *@2025-05-11T19:09:21.320Z*
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
* **boolean** for values **true** and **false**
* **timestamp** for date-time values, millisecons since Unix epoch
* **float** IEEE 754 double-precision binary floating-point format: binary64
* **integer** for 64-bit integer values
* **buffer** for ordered sequences of bytes
* **string** for ordered sequences of characters, text strings
* **array** for ordered sequences of valuese
* **object** for sets of named values
* **function** for built-in, injected or script-defined subroutines

Type modifier **?** can be used to make any type optional (nullable).
<br>Examples: *float? optNumVar*, *array? optArrayVar*

Unknown or variant type is declared as **??**.

### Definitions
* Value grouping: **(...)**
* Unit grouping: **{...}**
* Value and unit separator: **,**
* Array element at numeric index, or object property by string key: **[]**
* Object property by string key or method function call: **.**
* Array definiton: **[item1, ...]**
* Object definition: **[propery1-key: property1-value, ...]**
* Subroutine definition: **~return-type(argument1-name: argument1-type, ...) {...}**
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
- **array Array.Join(values: array...)** — Join arrays of any depths into a single array  
- **array Array.Range(inclusiveFrom: integer, exclusiveTo: integer)** — New array filled with integers in range  
- **array Array.Unique()** — Array of unique values  
- **array Array.Intersection(a1: array, a2: array)** — Common values from two arrays  
- **array Array.Difference(a1: array, a2: array)** — Symmetrical difference between arrays  

#### Boolean
- **boolean Boolean.Or(values:array...)** — Boolean disjunction  
- **boolean Boolean.And(values: array...)** — Boolean conjunction  
- **boolean Boolean.Not(value: boolean)** — Boolean negation  
- **boolean? Boolean.ParseBoolean()** — Parse boolean from string  

#### Buffer
- **buffer Buffer.Random(length: integer)** — Buffer of given length filled with random bytes  
- **buffer? Buffer.ParseBuffer(value: string)** — Parse buffer from hexadecimal string  

#### Float
- **Float.NAN** — Not-a-number  
- **Float.PositiveInfinity** — Positive infinity  
- **Float.NegativeInfinity** — Negative infinity  
- **Float.Epsilon** — Smallest positive float  
- **float Float.Sum(values: array...)** — Numeric sum  
- **float Float.Min(values: array...)** — Numeric minimum  
- **float Float.Max(values: array...)** — Numeric maximum  
- **float Float.Exponent()** — Exponent  
- **float Float.Logarithm()** — Logarithm  
- **float Float.Abs()** — Absolute value  
- **float Float.Ceil()** — Ceil  
- **float Float.Floor()** — Floor  
- **float Float.Round()** — Rounded value  
- **float Float.Truncate()** — Truncated value  
- **float Float.Random(exclusiveTo: float)** — Random float up to value  
- **float? Float.Decode(value: buffer, encoding: string, offset?: integer)** — Decode float from buffer  
- **float? Float.Parse(value: string)** — Parse float from string  

#### Integer
- **integer Integer.Sum(values: array...)** — Numeric sum  
- **integer Integer.Min(values: array...)** — Numeric minimum  
- **integer Integer.Max(values: array...)** — Numeric maximum  
- **integer Integer.Random(exclusiveTo: integer)** — Random integer up to value  
- **integer? Integer.Decode(value: buffer, encoding: string, offset?: integer)** — Decode integer from buffer  
- **integer? Integer.Parse(value: string)** — Parse integer from string  

#### Object
- **object Object.Merge(values: array...)** — Merge multiple objects  

#### String
- **string String.Random(length: integer)** — Random alphanumeric string  
- **string? String.Decode(value: buffer, encoding?: string, offset?: integer, length?: integer)** — Decode buffer to string  

#### Timestamp
- **timestamp Timestamp.Now()** — Current date and time  
- **timestamp Timestamp.Epoch(value: float | integer, epoch?: timestamp)** — Create timestamp from milliseconds  
- **timestamp? Timestamp.Parse(value: string)** — Parse string to timestamp  

#### AVN
- **string AVN.Format(value: string, whitespace?: string)** — Format string as AVN  

#### JSON
- **string JSON.Format(value: void | boolean | float | string | array | object, whitespace?: string)** — Format as JSON string  
- **void | boolean | float? | string? | array? | object? JSON.Parse(value?: string)** — Parse JSON-formatted string  


### Functions

#### General Functions
- Null coalescence: **?? ??.Coalesce(otherwise: ??)**  
- Equals to: **boolean ??.Equal(value: ??)**  
- Not equals to: **boolean ??.Unequal(value: ??)**  
- **buffer float | integer | string.Encode(encoding?: string)** — Encode value to buffer  
- **string boolean | float | integer | buffer | string | array | object.Format(radix?: integer, separator?: string)** — Format value to string  

#### Array Functions
- **?? array.First(condition: function)** — First item satisfying condition  
- **?? array.Last(condition: function)** — Last item satisfying condition  
- **integer array.FirstIndex(condition: function)** — First index satisfying condition  
- **integer array.LastIndex(condition: function)** — Last index satisfying condition  
- **boolean array.Every(condition: function)** — All items satisfy condition  
- **boolean array.Any(condition: function)** — Any item satisfies condition  
- **array array.Reverse()** — Reversed array  
- **array array.Flatten(depth: integer = 1)** — Flatten array  
- **array array.Mutate(transformation: function)** — Transform items  
- **array array.Filter(condition: function)** — Filtered array  
- **?? array.Reduce(reducer: function)** — Reduced value  
- **object array.Compose(generator: function)** — Compose object from array  
- **array array.Prepend(items: array...)** — Prepend items  
- **array array.Append(items: array...)** — Append items  

#### Buffer Functions
- **buffer buffer.Byte(pos: integer)** — Byte at position  
- **string Buffer.FormatBuffer(value: buffer)** — Hexadecimal string from buffer  

#### Enumerable Functions
- **float | integer | buffer | string | array.Add(values:array...)** — Add or concatenate values  
- **buffer | string | array.Slice(start?: integer, end?: integer)** — Slice section  
- **buffer | string | array.Splice(start: integer, remove: integer, inject: array...)** — Splice section  
- **buffer | string | array.Inject(start: integer, inject: array...)** — Inject section  

#### Iterable Functions
- **integer buffer | string | array | object.Length()** — Get length  
- **?? array? | object?.At(index: integer | string)** — Access by index or key  

#### Number Functions
- **boolean float | integer.GreaterThan(value)** — Greater than  
- **boolean float | integer.LessThan(value)** — Less than  
- **boolean float | integer.GreaterOrEqual(value)** — Greater or equal  
- **boolean float | integer.LessOrEqual(value)** — Less or equal  
- **float | integer float | integer.Subtract(subtrahend)** — Subtract value  
- **float | integer float | integer.Negate()** — Negate number  
- **float | integer float | integer.Multiply(values:array...)** — Multiply values  
- **float | integer float | integer.Divide(divisor)** — Divide value  
- **float | integer float | integer.Remainder(divisor)** — Remainder  
- **float | integer float | integer.Modulo(divisor)** — Modulo  
- **float | integer float | integer.Power(exponent)** — Power  
- **float | integer float | integer.Root(index)** — Root  
- **float | integer float | integer.Cast()** — Cast to number  

#### Object Functions
- **array object.Entries()** — Key-value pairs  
- **array object.Keys()** — Object keys  
- **array object.Values()** — Object values  

#### String Functions
- **boolean string.Like(value: string)** — Alphanumeric equality  
- **boolean string.Unlike(value: string)** — Alphanumeric inequality  
- **boolean string.Contains(search: string, startPos?: integer, ignoreCaseSpaceEtc?: boolean)** — Substring check  
- **boolean string.StartsWith(search: string, startPos?: integer, ignoreCaseSpaceEtc?: boolean)** — Prefix check  
- **boolean string.EndsWith(search: string, endPos?: integer, ignoreCaseSpaceEtc?: boolean)** — Suffix check  
- **string string.Char(pos: integer)** — Character at position  
- **integer string.CharCode(pos: integer)** — Character code  
- **string string.Alphanum()** — Alphanumeric digest  
- **string string.Trim()** — Trim whitespace  
- **string string.TrimStart()** — Trim leading whitespace  
- **string string.TrimEnd()** — Trim trailing whitespace  
- **string string.LowerCase()** — To lowercase  
- **string string.UpperCase()** — To uppercase  
- **array string.Split(separator: string = ' ')** — Split into array  

#### Timestamp Functions
- **integer timestamp.Year(utc?: boolean)** — Get year  
- **integer timestamp.Month(utc?: boolean)** — Get month  
- **integer timestamp.MonthIndex(utc?: boolean)** — Month index  
- **integer timestamp.WeekdayIndex(utc?: boolean)** — Weekday index  
- **integer timestamp.Day(utc?: boolean)** — Day of month  
- **integer timestamp.Hour(utc?: boolean)** — Hour  
- **integer timestamp.Minute(utc?: boolean)** — Minute  
- **integer timestamp.Second(utc?: boolean)** — Second  
- **integer timestamp.Millisecond(utc?: boolean)** — Millisecond  
- **integer timestamp.EpochTime(epoch?: timestamp)** — Epoch milliseconds  

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
	'Float.Sum(arr1.Mutate(float(a:float)->a*2).Filter(boolean(a:float)->a>3))'
);
const iValue = iteratorExpr.evaluate( { arr1: [ 1, 2, 3 ] } ); // 10
...
const complexExpr = new Affinirum(
	'var a=myvar1/10, const b=myvar2-100, a/b + b*a + 600'
);
const value = complexExpr.evaluate( { myvar1: 40, myvar2: 104 } ); // 4761
...
```
