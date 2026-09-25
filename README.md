# Affinirum
A fast, embeddable scripting language powered by a lightweight recursive descent parser,
 designed to evaluate complex algorithmic logic with precision and flexibility.
Ideal for embedding in host applications, it offers clear syntax, type inference, permissive type checking,
 and support for host-provided values and functions—enabling rapid prototyping and advanced rule evaluation
 in applications that control which capabilities are exposed to scripts.

Supports algebraic and boolean expressions, variables, conditionals, loops, and a rich standard library for working with numbers, buffers, strings, arrays, and objects.

Runs in browsers and Node.js.

Target: ES2022 [browser+Node.js][ESM+CJS].

## Features

- Efficient execution: Parse once, execute many times with different variable values.
- Variable support: Input and statement-scoped variables.
- Function support: Variadic and first-class functions for expressive scripting.
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

An easy way to check whether an array contains an index is to use the presence operator (**?**), like *theArray?50*.

### Objects
Object is a container of named values of any type.
It is defined by comma-separated key-value pairs enclosed in brackets (**[]**), where each key is separated from its value by a colon (**:**),
 like *["key1":100, "key2":"abc"]*, *["a":0, "b":"str", "c":valueVar]*.
<br>An empty object is represented as **[\:]**.

Object properties can be accessed using the access operator (**.**) with a string literal, token,
 or with brackets containing a string key,
 like *theObject."key"*, *theObject.key*, or *theObject["key"]*.

An easy way to check whether an object contains a key is to use the presence operator (**?**), like *theObject?myKey*.

### Functions
A function is a callable code unit that produces a value.
The standard library provides built-in functions. Host functions can be supplied as typed input variables,
and subroutines can be defined in Affinirum code.

### Variables
Valid variable and function names must start with a letter, number sign (**\#**), dollar sign (**\$**), or underscore (**\_**)
 and can be followed by any combination of alphanumeric characters, number signs, dollar signs, or underscores,
 like *x*, *\_a1$*, *abc25*.

Whitespace characters are ignored.

### Types
- **void** for the absence of a value; the **null** literal and injected JavaScript `null` or `undefined` values have this type, and a **void** result is returned as JavaScript `undefined`
- **boolean** (alias **bool**) for values **true** and **false**
- **timestamp** (alias **time**) for date-time values backed by JavaScript `Date` objects
- **float** (alias **f64**) for 64-bit floating point values in binary64, IEEE 754 binary floating-point format
- **integer** (alias **i64**) for signed 64-bit integer values; arithmetic overflow wraps to the signed 64-bit range
- **buffer** for ordered sequences of bytes
- **string** for ordered sequences of characters, text strings
- **array** for ordered sequences of values
- **object** for collections of named values
- **function** for built-in, injected or script-defined subroutines
- **[type]** for a homogeneous array whose items have the specified type, such as **[string]**
- **[type1, type2, ...]** for a tuple whose items have the corresponding types
- **??** for unknown or variant type
- Type grouping: **(...)**
- Type union: **|**
- Type optionality modifier: **?**

Canonical type names and their aliases are reserved and cannot be used as variable or function names.

### Type-checking policy
Affinirum uses intentionally permissive type checking. Type information helps reject clearly incompatible expressions,
select function overloads, and report useful compilation errors; it is not intended to enforce strict static
substitutability or prove that every accepted expression is safe for every possible runtime value.

- **??** is the unknown or variant type and is compatible with every type. It includes **void**, so a **??**
  function parameter may receive **null**, `undefined`, or be omitted.
- An optional type such as **integer?** is the union **void | integer**. Optional parameters may receive **null**, `undefined`,
  or be omitted.
- Function compatibility is deliberately flexible. The accepted argument-count ranges only need to overlap;
  one function's complete arity range does not need to contain the other's.
- A callback may declare fewer parameters than the caller provides. Additional arguments are ignored at runtime,
  following JavaScript function-call behavior.
- Function parameter types are checked contravariantly where both signatures declare a parameter, while **??**
  remains compatible with any parameter type. Return types are checked covariantly.
- Fixed and variadic signatures are not interchangeable. Variadic arguments use a distinct packed-array calling
  convention and are only compatible with corresponding variadic signatures.

For example, a callback declared as `~(value: float):boolean` is compatible with an expected callback type such as
`~(value: ??, index: integer?, values: array?):boolean`: the arities overlap, **??** accepts the concrete value type,
and the callback may ignore the additional arguments. This behavior is intentional. Affinirum does not enforce strict
function subtyping.

### Type casting
A postfix type cast declares the expected type of an expression using **::type**,
like `value::object` or `JSON.Parse(json)::object.property`.

A cast does not convert the value. The source and target types must be compatible at compile time,
and the evaluated value must satisfy the target type at runtime. An incompatible cast raises an error.
Casts can be followed by property access, index access, function calls, or another cast.

### Definitions
- Unit grouping: **{...}**
- Unit separator: **;**
- Value grouping: **(...)**
- Value separator: **,**
- Array element at numeric index, or object property by string key: **[]**
- Object property by string key or method function call: **.**
- Array definition: **[item1, ...]**
- Object definition: **[property1-key: property1-value, ...]**
- Subroutine definition: **~(argument1-name: argument1-type, ...):return-type {...}**
- Conditional switch definition, returns first or second value if prefix is true or false: **if condition {value1} else {value2}**,
 and if the **else** clause is omitted, the second value is **void**
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
- Arithmetic addition, or buffer, string, and array concatenation: **+**
- Arithmetic subtraction or negation: **-**
- Arithmetic multiplication: **\***
- Arithmetic division: **/**
- Arithmetic remainder: **%**
- Exponentiation operator: **^**
- Property access operator: **.**
- Property existence operator: **?**
- Null coalescence operator: **?:**
- Type cast operator: **::**
- Assignment: **=**
- Boolean disjunction (Logical OR) assignment: **|=**
- Boolean conjunction (Logical AND) assignment: **&=**
- Arithmetic addition assignment: **+=**
- Arithmetic subtraction assignment: **-=**
- Arithmetic multiplication assignment: ***=**
- Arithmetic division assignment: **/=**
- Arithmetic remainder assignment: **%=**

### Native Global Functions

Native conversions use the following **void** handling:

- `Format` returns an empty string for **void**.
- `Encode` returns a zero-length buffer for **void**.
- `Decode` and `Parse` return **void** when their input value is **void**.

Empty strings and zero-length buffers remain ordinary values; they are not serialized void markers.
Invalid non-void inputs are function-specific and may raise an evaluation error.

#### Boolean
- **Boolean.Or(values: ...(boolean | [boolean])):boolean** — Boolean disjunction of booleans and arrays of booleans
- **Boolean.And(values: ...(boolean | [boolean])):boolean** — Boolean conjunction of booleans and arrays of booleans
- **Boolean.Not(value: boolean):boolean** — Boolean negation
- **Boolean.Decode(value: buffer?, offset: integer?):boolean?** — Decode a byte at the optional offset; missing or out-of-range input returns **void**
- **Boolean.Parse(value: string?):boolean?** — Parse case-insensitive `true` or `false`; other values return **void**

#### Timestamp
- **Timestamp.Now():timestamp** — Current date and time
- **Timestamp.Epoch(value: float | integer, epoch: timestamp?):timestamp** — Create timestamp from milliseconds
- **Timestamp.Decode(value: buffer?, encoding: string?, offset: integer?):timestamp?** — Decode a timestamp using `i64` (default) or `i64le`
- **Timestamp.Parse(value: string?):timestamp?** — Parse a string as a timestamp

#### Float
- **Float.NAN** — Not-a-number
- **Float.PositiveInfinity** — Positive infinity
- **Float.NegativeInfinity** — Negative infinity
- **Float.Epsilon** — Smallest positive float
- **Float.Sum(values: ...(float | integer | [float | integer])):float** — Numeric sum
- **Float.Min(values: ...(float | integer | [float | integer])):float** — Numeric minimum
- **Float.Max(values: ...(float | integer | [float | integer])):float** — Numeric maximum
- **Float.Exponent(value: float | integer):float** — Natural exponential
- **Float.Logarithm(value: float | integer):float** — Natural logarithm
- **Float.Abs(value: float | integer):float** — Absolute value
- **Float.Ceil(value: float | integer):float** — Smallest integer greater than or equal to the value
- **Float.Floor(value: float | integer):float** — Largest integer less than or equal to the value
- **Float.Round(value: float | integer):float** — Rounded value
- **Float.Truncate(value: float | integer):float** — Integer portion of the value
- **Float.Random(exclusiveTo: float | integer):float** — Random float up to value
- **Float.Decode(value: buffer?, encoding: string?, offset: integer?):float?** — Decode using `f64` (default), `f64le`, `f32`, or `f32le`
- **Float.Parse(value: string?):float?** — Parse a string as a float

#### Integer
- **Integer.Sum(values: ...(integer | [integer])):integer** — Numeric sum
- **Integer.Min(values: ...(integer | [integer])):integer** — Numeric minimum
- **Integer.Max(values: ...(integer | [integer])):integer** — Numeric maximum
- **Integer.Random(exclusiveTo: integer):integer** — Random integer up to value
- **Integer.Decode(value: buffer?, encoding: string?, offset: integer?):integer?** — Decode using signed `i8`, `i16`, `i16le`, `i32`, `i32le`, `i64` (default), or `i64le`, or unsigned `n8`, `n16`, `n16le`, `n32`, `n32le`
- **Integer.Parse(value: string?):integer?** — Parse a string as an integer

#### String
- **String.Alphanum(value: string):string** — Keep only ASCII letters and digits
- **String.Random(length: integer):string** — Random alphanumeric string
- **String.Decode(value: buffer?, encoding: string?, offset: integer?, length: integer?):string?** — Decode using `utf8` (default), `sbcs`, `ucs2`, or `ucs2le`

#### Buffer
- **Buffer.Random(length: integer):buffer** — Buffer of given length filled with random bytes
- **Buffer.Parse(value: string?):buffer?** — Parse a hexadecimal string as a buffer

#### Array
- **Array.Join(values: ...array):array** — Join arrays of any depths into a single array
- **Array.Range(inclusiveFrom: integer, exclusiveTo: integer):array** — New array filled with integers in range
- **Array.Unique(value: array):array** — Array of unique values
- **Array.Intersection(a1: array, a2: array):array** — Common values from two arrays
- **Array.Difference(a1: array, a2: array):array** — Symmetrical difference between arrays

#### Object
- **Object.Merge(values: ...(object | [object])):object** — Merge objects and arrays of objects

#### AN
- **AN.Format(value: ??, whitespace: string?):string** — Format a value as AN notation

#### JSON
- **JSON.Format(value: (void | boolean | timestamp | float | integer | string | array | object), whitespace: string?):string** — Format a value as JSON
- **JSON.Parse(value: string?):(void | boolean | timestamp | float | integer | string | array | object)** — Parse a JSON-formatted string; standard JSON values are not revived as timestamps or integers

#### IP
- **IP.Match(values: [string], search: ...(string | [string])):boolean** — Check whether any searched IPv4 or IPv6 address belongs to the supplied addresses or CIDR ranges
- **IP.Encode(value: string?):buffer** — Encode an IPv4, IPv6, or CIDR string as a network-byte-order buffer; malformed or **void** input returns a zero-length buffer
- **IP.Decode(value: buffer?):string?** — Decode a 4-, 5-, 16-, or 17-byte buffer as canonical IPv4, IPv6, or CIDR notation; malformed or **void** input returns **void**

### Native Method Functions

#### General Functions
- **??.Coalesce(otherwise: ??):??** — Null coalescence
- **??.Equal(value: ??):boolean** — Equals to
- **??.Unequal(value: ??):boolean** — Not equals to
- **(boolean | buffer | function).Encode():buffer** — Encode value to buffer
- **(void | timestamp | float | integer | string | array | object).Encode(encoding: string?):buffer** — Encode a value; defaults are `i64` for timestamps and integers, `f64` for floats, and `utf8` for strings
- **(boolean | string | function).Format():string** — Format value to string
- **(void | timestamp | float | integer | buffer | array | object).Format(formatting: string?):string** — Format a value; buffers use `hex` by default and also support `base64`

#### Aggregable Functions
- **float.Add(value: integer):float** — Add an integer
- **integer.Add(value: float):float** — Add a float
- **integer.Add(value: integer):integer** — Add an integer
- **buffer.Add(value: buffer):buffer** — Concatenate buffers
- **string.Add(value: string):string** — Concatenate strings
- **array.Add(value: array):array** — Concatenate arrays

#### Array Functions
- **array.First(condition: ~(??, integer?, array?):boolean):??** — First item satisfying condition
- **array.Last(condition: ~(??, integer?, array?):boolean):??** — Last item satisfying condition
- **array.FirstIndex(condition: ~(??, integer?, array?):boolean):integer?** — First index satisfying condition, or **void** if none does
- **array.LastIndex(condition: ~(??, integer?, array?):boolean):integer?** — Last index satisfying condition, or **void** if none does
- **array.Every(condition: ~(??, integer?, array?):boolean):boolean** — All items satisfy condition
- **array.Any(condition: ~(??, integer?, array?):boolean):boolean** — Any item satisfies condition
- **array.Reverse():array** — Reversed array
- **array.Flatten(depth: integer = 1):array** — Flatten array
- **array.Derive(transformation: ~(??, integer?, array?):??):array** — Derived array
- **array.Filter(condition: ~(??, integer?, array?):boolean):array** — Filtered array
- **array.Reduce(reducer: ~(??, ??, integer?, array?):??, initial: ?? = void):??** — Reduced value
- **array.Compose(generator: ~(object, string, integer?, array?):??):object** — Compose object from array
- **array.Prepend(items: ...??):array** — Prepend items
- **array.Append(items: ...??):array** — Append items

#### Buffer Functions
- **buffer.Byte(pos: integer):buffer?** — Byte at position, or **void** when unavailable

#### Enumerable Functions
- **buffer.Slice(start: integer?, end: integer?):buffer** — Slice section
- **string.Slice(start: integer?, end: integer?):string** — Slice section
- **array.Slice(start: integer?, end: integer?):array** — Slice section
- **buffer.Splice(start: integer, remove: integer, inject: ...(buffer | string | array)):buffer** — Splice section
- **string.Splice(start: integer, remove: integer, inject: ...(buffer | string | array)):string** — Splice section
- **array.Splice(start: integer, remove: integer, inject: ...(buffer | string | array)):array** — Splice section
- **buffer.Inject(start: integer, inject: ...(buffer | string | array)):buffer** — Inject section
- **string.Inject(start: integer, inject: ...(buffer | string | array)):string** — Inject section
- **array.Inject(start: integer, inject: ...(buffer | string | array)):array** — Inject section

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
- **(float | integer).GreaterThan(value: float | integer):boolean** — Greater than
- **(float | integer).LessThan(value: float | integer):boolean** — Less than
- **(float | integer).GreaterOrEqual(value: float | integer):boolean** — Greater or equal
- **(float | integer).LessOrEqual(value: float | integer):boolean** — Less or equal
- **float.Subtract(subtrahend: integer):float** — Subtract an integer
- **integer.Subtract(subtrahend: float):float** — Subtract a float
- **integer.Subtract(subtrahend: integer):integer** — Subtract an integer
- **float.Negate():float** — Negate number
- **integer.Negate():integer** — Negate number
- **float.Multiply(value: integer):float** — Multiply by an integer
- **integer.Multiply(value: float):float** — Multiply by a float
- **integer.Multiply(value: integer):integer** — Multiply by an integer
- **float.Divide(divisor: integer):float** — Divide by an integer
- **integer.Divide(divisor: float):float** — Divide by a float
- **integer.Divide(divisor: integer):integer** — Divide by an integer
- **float.Remainder(divisor: integer):float** — Remainder after division by an integer
- **integer.Remainder(divisor: float):float** — Remainder after division by a float
- **integer.Remainder(divisor: integer):integer** — Remainder after division by an integer
- **float.Modulo(divisor: integer):float** — Modulo by an integer
- **integer.Modulo(divisor: float):float** — Modulo by a float
- **integer.Modulo(divisor: integer):integer** — Modulo by an integer
- **float.Power(exponent: integer):float** — Raise to an integer power
- **integer.Power(exponent: float):float** — Raise to a float power
- **integer.Power(exponent: integer):integer** — Raise to an integer power
- **float.Root(index: integer):float** — Take an integer root
- **integer.Root(index: float):float** — Take a float root
- **integer.Root(index: integer):integer** — Take an integer root
- **(boolean | timestamp | integer).Float():float** — Convert to a float; timestamps use milliseconds since the Unix epoch
- **(boolean | timestamp | float).Integer():integer** — Convert to an integer; timestamps use milliseconds since the Unix epoch
- **(timestamp | float | integer).Boolean():boolean** — Convert to a boolean by testing whether the numeric or epoch value is non-zero

#### Object Functions
- **object.Entries():array** — Key-value pairs
- **object.Keys():[string]** — Object keys
- **object.Values():array** — Object values

#### String Functions
- **string.Like(value: string):boolean** — Alphanumeric equality
- **string.Unlike(value: string):boolean** — Alphanumeric inequality
- **string.StartsWith(search: string, startPos: integer?, ignoreCaseSpaceEtc: boolean?):boolean** — Prefix check
- **string.EndsWith(search: string, endPos: integer?, ignoreCaseSpaceEtc: boolean?):boolean** — Suffix check
- **string.Char(pos: integer):string?** — Character at position, or **void** when unavailable
- **string.CharCode(pos: integer):integer?** — Character code, or **void** when unavailable
- **string.Trim():string** — Trim whitespace
- **string.TrimStart():string** — Trim leading whitespace
- **string.TrimEnd():string** — Trim trailing whitespace
- **string.LowerCase():string** — To lowercase
- **string.UpperCase():string** — To uppercase
- **string.Split(separator: string = ' '):[string]** — Split into an array of strings
- **string.ReplaceWith(replacement: string, search: ...(string | [string])):string** — Replace all instances of the searched strings

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
- **timestamp.DaysSince(value: timestamp):float** — Difference from another timestamp in days
- **timestamp.HoursSince(value: timestamp):float** — Difference from another timestamp in hours
- **timestamp.MinutesSince(value: timestamp):float** — Difference from another timestamp in minutes
- **timestamp.SecondsSince(value: timestamp):float** — Difference from another timestamp in seconds

## Reference

Install the package:

```sh
npm install affinirum
```

Create an `Affinirum` instance with a script and optional compilation configuration, then call `evaluate`
with the script's input variables:

```ts
import { Affinirum } from "affinirum";

const expression = new Affinirum("a + b");
const result = expression.evaluate({ a: 10n, b: 20n }); // 30n
```

During parsing, any valid name that is not recognized as a keyword, constant, or built-in function is treated as an input variable.
Use the optional constructor configuration to specify the expected result `type`, enable `strict` handling of undeclared variables,
or declare input `variables` and their types. An instance exposes the original `script`, its inferred result `type`,
the inferred input types through `variables()`, and the parsed tree through `toString()`. `Affinirum.format()` formats
a JavaScript value using Affinirum Notation.

JavaScript `number` values map to **float**, while **integer** values map to `bigint`. Timestamps use `Date`, buffers use
`ArrayBuffer`, and a **void** result is returned as `undefined`. Arrays, objects, and functions use their corresponding
JavaScript values. Injected values are checked against the types inferred or declared during compilation.

Use **val** for a local value that cannot be reassigned and **var** for a reassignable local variable. Statements are
separated with semicolons.

Sample code:

```ts
const expr = new Affinirum("x * (y + abc / 5) > 10");
const value1 = expr.evaluate({ x: 10, y: 20, abc: 10 }); // true
const value2 = expr.evaluate({ x: 1, y: 4, abc: 5 }); // false

const arrExpr = new Affinirum("Integer.Sum([1, 2, 3, a, b, c])");
const valueSum = arrExpr.evaluate({ a: 10n, b: 20n, c: 30n }); // 66n

const objExpr = new Affinirum('["prop1":a, "prop2":"abc"].prop1 + 10');
const oValue = objExpr.evaluate({ a: 50n }); // 60n

const iteratorExpr = new Affinirum(
	"Float.Sum(arr1.Derive(~(a:float):float{a*2}).Filter(~(a:float):boolean{a>3}))"
);
const iValue = iteratorExpr.evaluate({ arr1: [1, 2, 3] }); // 10

const complexExpr = new Affinirum(
	"var a = myvar1 / 10; val b = myvar2 - 100; a / b + b * a + 600"
);
const value = complexExpr.evaluate({ myvar1: 40, myvar2: 104 }); // 617
```
