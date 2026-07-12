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

### Variables
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
- **??** for unknown or variant type
- Type grouping: **(...)**
- Type union: **|**
- Type optionality modifier: **?**

### Definitions
- Unit grouping: **{...}**
- Unit separator: **;**
- Value grouping: **(...)**
- Value separator: **,**
- Array element at numeric index, or object property by string key: **[]**
- Object property by string key or method function call: **.**
- Array definiton: **[item1, ...]**
- Object definition: **[propery1-key: property1-value, ...]**
- Subroutine definition: **~(argument1-name: argument1-type, ...):return-type {...}**
- Conditional switch definition, returns first or second value if prefix is true or false: **if condition {value1} else {value2}**,
 and if **else** clause is ommited second value deemed *null*
- Loop definition, iteratively evaluates suffix while prefix is true, returns last evaluated value: **while condition {...}**
- Stop iteration: **stop**
- Proceed to next iteration: **next**
- Function return operator: **~>value**
- Execution exit operator: **=>value**

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
- Property access operator: **.**
- Property existance operator: **?**
- Assignment: **=**
- Boolean disjunction (Logical OR) assignment: **|=**
- Boolean conjunction (Logical AND) assignment: **&=**
- Arithmetic addition assignment: **+=**
- Arithmetic subtraction assignment: **-=**
- Arithmetic multiplication assignment: ***=**
- Arithmetic division assignment: **/=**
- Arithmetic remainder assignment: **%=**

### Native Global Functions

#### Boolean
- **Boolean.Or(values:...array):boolean** — Boolean disjunction
- **Boolean.And(values: ...array):boolean** — Boolean conjunction
- **Boolean.Not(value: boolean):boolean** — Boolean negation
- **Boolean.Decode(value: buffer, offset: integer?):boolean?** — Decode boolean from buffer
- **Boolean.Parse():boolean?** — Parse boolean from string

#### Timestamp
- **Timestamp.Now():timestamp** — Current date and time
- **Timestamp.Epoch(value: float | integer, epoch: timestamp?):timestamp** — Create timestamp from milliseconds
- **Timestamp.Decode(value: buffer, offset: integer?):timestamp?** — Decode timestamp from buffer
- **Timestamp.Parse(value: string):timestamp?** — Parse string to timestamp

#### Float
- **Float.NAN** — Not-a-number
- **Float.PositiveInfinity** — Positive infinity
- **Float.NegativeInfinity** — Negative infinity
- **Float.Epsilon** — Smallest positive float
- **Float.Sum(values: ...array):float** — Numeric sum
- **Float.Min(values: ...array):float** — Numeric minimum
- **Float.Max(values: ...array):float** — Numeric maximum
- **Float.Exponent():float** — Exponent
- **Float.Logarithm():float** — Logarithm
- **Float.Abs():float** — Absolute value
- **Float.Ceil():float** — Ceil
- **Float.Floor():float** — Floor
- **Float.Round():float** — Rounded value
- **Float.Truncate():float** — Truncated value
- **Float.Random(exclusiveTo: float):float** — Random float up to value
- **Float.Decode(value: buffer, encoding: string, offset: integer?):float?** — Decode float from buffer
- **Float.Parse(value: string):float?** — Parse float from string

#### Integer
- **Integer.Sum(values: ...array):integer** — Numeric sum
- **Integer.Min(values: ...array):integer** — Numeric minimum
- **Integer.Max(values: ...array):integer** — Numeric maximum
- **Integer.Random(exclusiveTo: integer):integer** — Random integer up to value
- **Integer.Decode(value: buffer, encoding: string, offset: integer?):integer?** — Decode integer from buffer
- **Integer.Parse(value: string):integer?** — Parse integer from string

#### String
- **String.Random(length: integer):string** — Random alphanumeric string
- **String.Decode(value: buffer, encoding: string?, offset: integer?, length: integer?):string?** — Decode buffer to string

#### Buffer
- **Buffer.Random(length: integer):buffer** — Buffer of given length filled with random bytes
- **Buffer.Parse(value: string):buffer?** — Parse buffer from hexadecimal string

#### Array
- **Array.Join(values: ...array):array** — Join arrays of any depths into a single array
- **Array.Range(inclusiveFrom: integer, exclusiveTo: integer):array** — New array filled with integers in range
- **Array.Unique():array** — Array of unique values
- **Array.Intersection(a1: array, a2: array):array** — Common values from two arrays
- **Array.Difference(a1: array, a2: array):array** — Symmetrical difference between arrays

#### Object
- **Object.Merge(values: ...array):object** — Merge multiple objects

#### AN
- **AN.Format(value: ??, whitespace: string?):string** — Format string as AN

#### JSON
- **JSON.Format(value: (void | boolean | float | string | array | object), whitespace: string?):string** — Format as JSON string
- **JSON.Parse(value: string):(void | boolean | float | string | array | object)** — Parse JSON-formatted string


### Native Method Functions

#### General Functions
- **??.Coalesce(otherwise: ??):??** — Null coalescence
- **??.Equal(value: ??):boolean** — Equals to
- **??.Unequal(value: ??):boolean** — Not equals to
- **(boolean | buffer | function).Encode():buffer** — Encode value to buffer
- **(timestamp | float | integer | string | array | object).Encode(encoding: string?):buffer** — Encode value to buffer
- **(boolean | string | function).Format():string** — Format value to string
- **(timestamp | float | integer | buffer | array | object).Format(formatting: string?):string** — Format value to string

#### Aggregable Functions
- **float.Add(values: ...array):float** — Add or concatenate values
- **integer.Add(values: ...array):integer** — Add or concatenate values
- **buffer.Add(values: ...array):buffer** — Add or concatenate values
- **string.Add(values: ...array):string** — Add or concatenate values
- **array.Add(values: ...array):array** — Add or concatenate values

#### Array Functions
- **array.First(condition: function):??** — First item satisfying condition
- **array.Last(condition: function):??** — Last item satisfying condition
- **array.FirstIndex(condition: function):integer** — First index satisfying condition
- **array.LastIndex(condition: function):integer** — Last index satisfying condition
- **array.Every(condition: function):boolean** — All items satisfy condition
- **array.Any(condition: function):boolean** — Any item satisfies condition
- **array.Reverse():array** — Reversed array
- **array.Flatten(depth: integer = 1):array** — Flatten array
- **array.Derive(transformation: function):array** — Derived array
- **array.Filter(condition: function):array** — Filtered array
- **array.Reduce(reducer: function):??** — Reduced value
- **array.Compose(generator: function):object** — Compose object from array
- **array.Prepend(items: ...array):array** — Prepend items
- **array.Append(items: ...array):array** — Append items

#### Buffer Functions
- **buffer.Byte(pos: integer):buffer** — Byte at position
- **Buffer.FormatBuffer(value: buffer):string** — Hexadecimal string from buffer

#### Enumerable Functions
- **buffer.Slice(start: integer?, end: integer?):buffer** — Slice section
- **string.Slice(start: integer?, end: integer?):string** — Slice section
- **array.Slice(start: integer?, end: integer?):array** — Slice section
- **buffer.Splice(start: integer, remove: integer, inject: ...array):buffer** — Splice section
- **string.Splice(start: integer, remove: integer, inject: ...array):string** — Splice section
- **array.Splice(start: integer, remove: integer, inject: ...array):array** — Splice section
- **buffer.Inject(start: integer, inject: ...array):buffer** — Inject section
- **string.Inject(start: integer, inject: ...array):string** — Inject section
- **array.Inject(start: integer, inject: ...array):array** — Inject section

#### Iterable Functions
- **(buffer | string | array | object).Length():integer** — Get length
- **buffer.Contains(search: buffer, startPos: integer?):boolean** — Check if buffer contains another buffer
- **string.Contains(search: string, startPos: integer?, ignoreCaseSpaceEtc: boolean?):boolean** — Check if string contains another string
- **array.Contains(search: ??, startPos: integer?):boolean** — Check if array contains value
- **object.Contains(search: ??):boolean** — Check if object contains value
- **array.At(index: integer):??** — Access item in array by index
- **object.At(index: string):??** — Access item in object by key
- **array.Has(index: integer):boolean** — Identify if array has index
- **object.Has(index: string):boolean** — Identify if object has key

#### Number Functions
- **(float | integer).GreaterThan(value):boolean** — Greater than
- **(float | integer).LessThan(value):boolean** — Less than
- **(float | integer).GreaterOrEqual(value):boolean** — Greater or equal
- **(float | integer).LessOrEqual(value):boolean** — Less or equal
- **float.Subtract(subtrahend):float** — Subtract value
- **integer.Subtract(subtrahend):integer** — Subtract value
- **float.Negate():float** — Negate number
- **integer.Negate():integer** — Negate number
- **float.Multiply(values: ...array):float** — Multiply values
- **integer.Multiply(values: ...array):integer** — Multiply values
- **float.Divide(divisor):float** — Divide value
- **integer.Divide(divisor):integer** — Divide value
- **float.Remainder(divisor):float** — Remainder
- **integer.Remainder(divisor):integer** — Remainder
- **float.Modulo(divisor):float** — Modulo
- **integer.Modulo(divisor):integer** — Modulo
- **float.Power(exponent):float** — Power
- **integer.Power(exponent):integer** — Power
- **float.Root(index):float** — Root
- **integer.Root(index):integer** — Root
- **float.Cast():integer** — Cast to integer
- **integer.Cast():float** — Cast to float
- **integer.CastToFloat():float** — Cast to float
- **float.CastToInteger():integer** — Cast to integer

#### Object Functions
- **object.Entries():array** — Key-value pairs
- **object.Keys():array** — Object keys
- **object.Values():array** — Object values

#### String Functions
- **string.Like(value: string):boolean** — Alphanumeric equality
- **string.Unlike(value: string):boolean** — Alphanumeric inequality
- **string.StartsWith(search: string, startPos: integer?, ignoreCaseSpaceEtc: boolean?):boolean** — Prefix check
- **string.EndsWith(search: string, endPos: integer?, ignoreCaseSpaceEtc: boolean?):boolean** — Suffix check
- **string.Char(pos: integer):string** — Character at position
- **string.CharCode(pos: integer):integer** — Character code
- **string.Alphanum():string** — Alphanumeric digest
- **string.Trim():string** — Trim whitespace
- **string.TrimStart():string** — Trim leading whitespace
- **string.TrimEnd():string** — Trim trailing whitespace
- **string.LowerCase():string** — To lowercase
- **string.UpperCase():string** — To uppercase
- **string.Split(separator: string = ' '):array** — Split into array
- **string.ReplaceWith(replacement: string, search: ...array):string** — Replace all instances of substring with another

#### Timestamp Functions
- **timestamp.Year(utc: boolean?):integer** — Get year
- **timestamp.Month(utc: boolean?):integer** — Get month
- **timestamp.MonthIndex(utc: boolean?):integer** — Month index
- **timestamp.WeekdayIndex(utc: boolean?):integer** — Weekday index
- **timestamp.Day(utc: boolean?):integer** — Day of month
- **timestamp.Hour(utc: boolean?):integer** — Hour
- **timestamp.Minute(utc: boolean?):integer** — Minute
- **timestamp.Second(utc: boolean?):integer** — Second
- **timestamp.Millisecond(utc: boolean?):integer** — Millisecond
- **timestamp.EpochTime(epoch: timestamp?):integer** — Milliseconds since epoch or 1970-01-01 00:00:00 UTC

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
	'Float.Sum(arr1.Derive(~(a:float):float{a*2}).Filter(~(a:float):boolean{a>3}))'
);
const iValue = iteratorExpr.evaluate( { arr1: [ 1, 2, 3 ] } ); // 10
...
const complexExpr = new Affinirum(
	'var a=myvar1/10, val b=myvar2-100, a/b + b*a + 600'
);
const value = complexExpr.evaluate( { myvar1: 40, myvar2: 104 } ); // 4761
...
```
