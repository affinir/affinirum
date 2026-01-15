# Affinirum
A fast, embeddable scripting language powered by a lightweight recursive descent parser,
 designed to evaluate complex algorithmic logic with precision and flexibility.
Ideal for embedding in host applications, it offers clear syntax, dynamic typing,
 and extensibility for custom operations—enabling rapid prototyping, advanced rule evaluation,
 and safe script execution in constrained environments.

Supports algebraic and boolean expressions, variables, conditionals, loops, and a rich standard library for working with numbers, buffers, strings, arrays, and objects.

Runs in browser and NodeJS.

Target: ES2022 [browser+NodeJS][ESM+CJS].

## Features

- Efficient execution: Parse once, execute many times with different variable values.
- Variable support: Input and statement-scoped variables.
- Function support: Variadic and first-order function support for expressive scripting.
- Optimized evaluation: Constant expression folding with type checks.
- Comprehensive set of operators: Boolean, arithmetic, buffer, string, comparison, and indexing support.
- Built-in functions: Rich set of mathematical and composition utilities.

## Specifications

A script may contain multiple expressions separated by semicolons, as well as blocks of statements.
The value of a block is defined by the value of its last expression.
- Scientific notation is supported for floating point numbers, like *0.1281e+2*.
- ISO Timestamps prefixed with **@**, like *@2025-05-11T19:09:21.320Z*.
- Hexadecimal buffer values are enclosed in backticks (**\`**), like *\`10ab0901\`*.
- String literals may be enclosed in single (**'**), or double (**"**) quotes, like *'string value1'*, or *"string value2"*.
- Line comments begin with a double slash (**//**), while block comments are enclosed in triple slashes (**///**).

### Arrays
Array is an ordered sequence of values of any type.
It is defined by comma-separated values enclosed in brackets (**[]**),
 like  *[0,1,2]*, *["a","b","c"]*.
<br>An empty array is represented as **[]**.

Array elements can be accessed using the access operator (**.**),
 or using brackets with a zero-based numeric index, like *theArray.23*, *theArray[0]*, *theArray[10]*, *theArray[indexVar]*.

Easy way to check if array contains an index is to use presence operator (**?**), like *theArray?50*.

### Objects
Object is a container of named values of any type.
It is defined by comma-separated key-value pair enclosed in brackets (**[]**) where key is separated from value by colon (**:**),
 like *["key1":100, "key2":"abc"]*, *["a":0,"b":"str":"c":valueVar]*.
<br>An empty object is represented as **[\:]**.

Object properties can be accessed using the access operator (**.**) with a string literal, token,
 or with brackets containing a string key,
 like *theObject."key"*, *theObject.key*, or *theObject["key"]*.

Easy way to check if object contains a key is to use presence operator (**?**), like *theObject?myKey*.

### Functions
A function is a callable code unit that produces a value.
The set of built-in functions can be extended through configuration entries.
Additionally, subroutines (functions defined in code) can be created.

Valid variable and function names must start with a letter, number sign (**\#**), dollar sign (**\$**), or underscore (**\_**)
 and can be followed by any combination of alphanumeric characters, number signs, dollar signs, or underscores,
 like *x*, *\_a1$*, *abc25*.

Whitespace characters are ignored.

### Types
- **void** for value **null**
- **boolean** for values **true** and **false**
- **timestamp** for date-time values, millisecons since Unix epoch
- **float** for 64-bit floating point values in binary64, IEEE 754 binary floating-point format
- **integer** for 64-bit integer values
- **buffer** for ordered sequences of bytes
- **string** for ordered sequences of characters, text strings
- **array** for ordered sequences of values
- **object** for collections of named values
- **function** for built-in, injected or script-defined subroutines

Type modifier **?** can be used to make any type optional (nullable).
<br>Examples: *float? optNumVar*, *array? optArrayVar*

Unknown or variant type is declared as **??**.

### Definitions
- Value grouping: **(...)**
- Unit grouping: **{...}**
- Value and unit separator: **,**
- Array element at numeric index, or object property by string key: **[]**
- Object property by string key or method function call: **.**
- Array definiton: **[item1, ...]**
- Object definition: **[propery1-key: property1-value, ...]**
- Subroutine definition: **~return-type(argument1-name: argument1-type, ...) {...}**
- Conditional switch definition, returns first or second value if prefix is true or false: **if condition {value1} else {value2}**,
 and if **else** clause is ommited second value deemed null
- Loop definition, iteratively evaluates suffix while prefix is true, returns last evaluated value: **while condition {...}**

### Operators
- Boolean negation (Logical NOT): **!**
- Boolean disjunction (Logical OR): **|**
- Boolean conjunction (Logical AND): **&**
- Greater than: **>**
- Less than: **<**
- Greater than or equals to: **>=**
- Less than or equals to: **<=**
- Equals to: **==**
- Not equals to: **!=**
- Null coalescence: **?:**
- Arithmetic addition, or buffer, string, and array concatination: **+**
- Arithmetic subtraction or negation: **-**
- Arithmetic multiplication: **\***
- Arithmetic division: **/**
- Arithmetic remainder: **%**
- Exponentiation operator: **^**
- Access operator: **.**
- Presence operator: **?**
- Assignment: **=**
- Boolean disjunction (Logical OR) assignment: **|=**
- Boolean conjunction (Logical AND) assignment: **&=**
- Arithmetic addition assignment: **+=**
- Arithmetic subtraction assignment: **-=**
- Arithmetic multiplication assignment: ***=**
- Arithmetic division assignment: **/=**
- Arithmetic remainder assignment: **%=**

### Predefined Constants

#### Boolean
- **boolean Boolean.Or(values:array...)** — Boolean disjunction
- **boolean Boolean.And(values: array...)** — Boolean conjunction
- **boolean Boolean.Not(value: boolean)** — Boolean negation
- **boolean? Boolean.Decode(value: buffer, offset: integer?)** — Decode boolean from buffer
- **boolean? Boolean.ParseBoolean()** — Parse boolean from string

#### Timestamp
- **timestamp Timestamp.Now()** — Current date and time
- **timestamp Timestamp.Epoch(value: float | integer, epoch: timestamp?)** — Create timestamp from milliseconds
- **timestamp? Timestamp.Decode(value: buffer, offset: integer?)** — Decode timestamp from buffer
- **timestamp? Timestamp.Parse(value: string)** — Parse string to timestamp

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
- **float? Float.Decode(value: buffer, encoding: string, offset: integer?)** — Decode float from buffer
- **float? Float.Parse(value: string)** — Parse float from string

#### Integer
- **integer Integer.Sum(values: array...)** — Numeric sum
- **integer Integer.Min(values: array...)** — Numeric minimum
- **integer Integer.Max(values: array...)** — Numeric maximum
- **integer Integer.Random(exclusiveTo: integer)** — Random integer up to value
- **integer? Integer.Decode(value: buffer, encoding: string, offset: integer?)** — Decode integer from buffer
- **integer? Integer.Parse(value: string)** — Parse integer from string

#### String
- **string String.Random(length: integer)** — Random alphanumeric string
- **string? String.Decode(value: buffer, encoding: string?, offset: integer?, length: integer?)** — Decode buffer to string

#### Buffer
- **buffer Buffer.Random(length: integer)** — Buffer of given length filled with random bytes
- **buffer? Buffer.ParseBuffer(value: string)** — Parse buffer from hexadecimal string

#### Array
- **array Array.Join(values: array...)** — Join arrays of any depths into a single array
- **array Array.Range(inclusiveFrom: integer, exclusiveTo: integer)** — New array filled with integers in range
- **array Array.Unique()** — Array of unique values
- **array Array.Intersection(a1: array, a2: array)** — Common values from two arrays
- **array Array.Difference(a1: array, a2: array)** — Symmetrical difference between arrays

#### Object
- **object Object.Merge(values: array...)** — Merge multiple objects

#### AN
- **string AN.Format(value: ??, whitespace: string?)** — Format string as AN

#### JSON
- **string JSON.Format(value: void | boolean | float | string | array | object, whitespace: string?)** — Format as JSON string
- **void | boolean | float | string | array | object JSON.Parse(value: string)** — Parse JSON-formatted string


### Predefined Functions

#### General Functions
- **?? ??.Coalesce(otherwise: ??)** — Null coalescence
- **boolean ??.Equal(value: ??)** — Equals to
- **boolean ??.Unequal(value: ??)** — Not equals to
- **buffer float | integer | string.Encode(encoding: string?)** — Encode value to buffer
- **string ??.Format(formatting: integer? | string?)** — Format value to string

#### Array Functions
- **?? array.First(condition: function)** — First item satisfying condition
- **?? array.Last(condition: function)** — Last item satisfying condition
- **integer array.FirstIndex(condition: function)** — First index satisfying condition
- **integer array.LastIndex(condition: function)** — Last index satisfying condition
- **boolean array.Every(condition: function)** — All items satisfy condition
- **boolean array.Any(condition: function)** — Any item satisfies condition
- **array array.Reverse()** — Reversed array
- **array array.Flatten(depth: integer = 1)** — Flatten array
- **array array.Derive(transformation: function)** — Derived array
- **array array.Filter(condition: function)** — Filtered array
- **?? array.Reduce(reducer: function)** — Reduced value
- **object array.Compose(generator: function)** — Compose object from array
- **array array.Prepend(items: array...)** — Prepend items
- **array array.Append(items: array...)** — Append items

#### Buffer Functions
- **buffer buffer.Byte(pos: integer)** — Byte at position
- **string Buffer.FormatBuffer(value: buffer)** — Hexadecimal string from buffer

#### Enumerable Functions
- **float | integer | buffer | string | array.Add(values: array...)** — Add or concatenate values
- **buffer | string | array.Slice(start: integer?, end: integer?)** — Slice section
- **buffer | string | array.Splice(start: integer, remove: integer, inject: array...)** — Splice section
- **buffer | string | array.Inject(start: integer, inject: array...)** — Inject section

#### Iterable Functions
- **integer buffer | string | array | object.Length()** — Get length
- **boolean buffer | string | array | object.Contains(search: buffer | string | ??, startPos: integer?, ignoreCaseSpaceEtc: boolean?)** — Substring check
- **?? void | array | object.At(index: integer | string)** — Access item in array or object by index or key
- **?? void | array | object.Has(index: integer | string)** — Identify if array or object has index or key

#### Number Functions
- **boolean float | integer.GreaterThan(value)** — Greater than
- **boolean float | integer.LessThan(value)** — Less than
- **boolean float | integer.GreaterOrEqual(value)** — Greater or equal
- **boolean float | integer.LessOrEqual(value)** — Less or equal
- **float | integer float | integer.Subtract(subtrahend)** — Subtract value
- **float | integer float | integer.Negate()** — Negate number
- **float | integer float | integer.Multiply(values: array...)** — Multiply values
- **float | integer float | integer.Divide(divisor)** — Divide value
- **float | integer float | integer.Remainder(divisor)** — Remainder
- **float | integer float | integer.Modulo(divisor)** — Modulo
- **float | integer float | integer.Power(exponent)** — Power
- **float | integer float | integer.Root(index)** — Root
- **float | integer float | integer.Cast()** — Cast to integer or float
- **float integer.CastToFloat()** — Cast to float
- **integer float.CastToInteger()** — Cast to integer

#### Object Functions
- **array object.Entries()** — Key-value pairs
- **array object.Keys()** — Object keys
- **array object.Values()** — Object values

#### String Functions
- **boolean string.Like(value: string)** — Alphanumeric equality
- **boolean string.Unlike(value: string)** — Alphanumeric inequality
- **boolean string.StartsWith(search: string, startPos: integer?, ignoreCaseSpaceEtc: boolean?)** — Prefix check
- **boolean string.EndsWith(search: string, endPos: integer?, ignoreCaseSpaceEtc: boolean?)** — Suffix check
- **string string.Char(pos: integer)** — Character at position
- **integer string.CharCode(pos: integer)** — Character code
- **string string.Alphanum()** — Alphanumeric digest
- **string string.Trim()** — Trim whitespace
- **string string.TrimStart()** — Trim leading whitespace
- **string string.TrimEnd()** — Trim trailing whitespace
- **string string.LowerCase()** — To lowercase
- **string string.UpperCase()** — To uppercase
- **array string.Split(separator: string = ' ')** — Split into array
- **string string.ReplaceWith(replacement: string, search: array...)** — Replace all instances of substring with another

#### Timestamp Functions
- **integer timestamp.Year(utc: boolean?)** — Get year
- **integer timestamp.Month(utc: boolean?)** — Get month
- **integer timestamp.MonthIndex(utc: boolean?)** — Month index
- **integer timestamp.WeekdayIndex(utc: boolean?)** — Weekday index
- **integer timestamp.Day(utc: boolean?)** — Day of month
- **integer timestamp.Hour(utc: boolean?)** — Hour
- **integer timestamp.Minute(utc: boolean?)** — Minute
- **integer timestamp.Second(utc: boolean?)** — Second
- **integer timestamp.Millisecond(utc: boolean?)** — Millisecond
- **integer timestamp.EpochTime(epoch: timestamp?)** — Milliseconds since epoch

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
const arrExpr = new Affinirum( 'Integer.Sum([ 1, 2, 3, a, b, c ])' );
const valueSum = arrExpr.evaluate( { a: 10, b: 20, c: 30 } ); // 66
...
const objExpr = new Affinirum( '[`prop1`:a,`prop2`:`abc`].prop1+10' );
const oValue = objExpr.evaluate( { a: 50 } ); // 60
...
const iteratorExpr = new Affinirum(
	'Float.Sum(arr1.Derive(float(a:float){a*2}).Filter(boolean(a:float){a>3}))'
);
const iValue = iteratorExpr.evaluate( { arr1: [ 1, 2, 3 ] } ); // 10
...
const complexExpr = new Affinirum(
	'var a=myvar1/10, val b=myvar2-100, a/b + b*a + 600'
);
const value = complexExpr.evaluate( { myvar1: 40, myvar2: 104 } ); // 4761
...
```
