# Affinirum

Affinirum is an embeddable scripting language for expressions, rules, and algorithmic logic in JavaScript applications.
It supports variables, conditionals, loops, first-class functions, and a standard library for numbers, timestamps,
buffers, strings, arrays, and objects. The host application supplies input values and functions.

Runs in browsers and Node.js with an ES2022 runtime. The package provides ESM, CommonJS, and TypeScript declarations.

- Parse once and evaluate repeatedly with different inputs.
- Infer types and fold constant expressions during compilation.
- Use reassignable `var` bindings and indexed array and object updates.
- Define typed functions, callbacks, and variadic parameters.

## Contents

- [Install and quick start](#install-and-quick-start)
- [Language basics](#language-basics)
  - [Statements and literals](#statements-and-literals)
  - [Variables and values](#variables-and-values)
  - [Conditionals](#conditionals)
  - [Loops](#loops)
  - [Functions and returns](#functions-and-returns)
  - [Arrays and objects](#arrays-and-objects)
  - [Method calls and chaining](#method-calls-and-chaining)
  - [Types](#types)
    - [Collection and variadic types](#collection-and-variadic-types)
  - [Operators and precedence](#operators-and-precedence)
- [Embedding API](#embedding-api)
  - [Typed inputs and strict mode](#typed-inputs-and-strict-mode)
  - [Host functions](#host-functions)
  - [JavaScript value mapping](#javascript-value-mapping)
  - [Errors](#errors)
  - [Affinirum Notation](#affinirum-notation)
- [Standard library](#standard-library)
  - [Global functions](#global-functions)
  - [Method functions](#method-functions)
- [Detailed type rules](#detailed-type-rules)

## Install and quick start

```sh
npm install affinirum
```

Create an instance to compile a script, then call `evaluate` with its inputs. Reuse the instance to avoid parsing again:

```js
import { Affinirum } from "affinirum";

const expression = new Affinirum("a + b");
console.log(expression.evaluate({ a: 10n, b: 20n })); // 30n
console.log(expression.evaluate({ a: 40n, b: 2n })); // 42n
```

The `n` suffix belongs to JavaScript's `bigint` syntax. Inside an Affinirum script, write integers as `10`, not `10n`.
JavaScript `number` inputs represent Affinirum floats; `bigint` inputs represent integers.

CommonJS applications can use `require`:

```js
const { Affinirum } = require("affinirum");

console.log(new Affinirum("1 + 2").evaluate()); // 3n
```

The examples under **Language basics** contain Affinirum source. Pass them as strings to `new Affinirum(script)`.
Scripts without external inputs can be evaluated with `evaluate()`.

## Language basics

### Statements and literals

Separate statements with semicolons; a newline alone does not separate them. A script or `{ ... }` block returns the
value of its last expression. An empty block has type `void` and evaluates to JavaScript `undefined`.
Use parentheses to group expressions and commas to separate arguments or collection items.

```text
val base = 10;
val extra = { val factor = 2; factor * 3 };
base + extra // 16
```

| Kind | Literal examples |
| --- | --- |
| Integer | `42`, `-7` |
| Float | `42.0`, `0.5`, `1e3`, `0.1281e+2` |
| Boolean | `true`, `false` |
| String | `'hello'`, `"hello"` |
| Timestamp | `@2025-05-11T19:09:21.320Z` |
| Buffer | `` `10ab0901` `` (hexadecimal bytes) |
| Void | `null` |
| Array | `[1, 2, 3]`, `[]` |
| Object | `["name": "Ada", "score": 10]`, `[:]` |

Integers are signed 64-bit values; overflow wraps to that range. Floats use IEEE 754 binary64.
Integer division truncates toward zero: `7 / 2` is `3`, while `7.0 / 2` is `3.5`.
Arithmetic involving a float produces a float.

Whitespace outside literals and comments is ignored. Names are case-sensitive. Line comments start with `//`;
block comments are enclosed in `/// ... ///`. Strings support escapes such as `\n`, `\r`, `\t`, `\\`, and escaped quotes.

### Variables and values

Use `var` for a reassignable binding and `val` for a fixed binding. Types can be inferred or declared after a colon:

```text
val step = 2;
var count: integer = 1;
count += step;
count // 3
```

Variables follow these rules.

- An explicit type annotation fixes the variable's type, including an explicit `??`.
- A non-optional type requires an initial value in the declaration. A variable declared with an optional type or `??`
  can omit its initializer and starts at `null`.
- A variable without an annotation takes its type from its initializer. Later assignments must be compatible with that type.
- A variable with neither an annotation nor an initializer, or a parameter without an annotation, has type `??`.
  Later reads and assignments leave that binding type unchanged.

A read or assignment expression can have a more specific type than the binding. That type applies only to the expression.

Bindings declared inside a block are local to that block. Names must start with an ASCII letter, `#`, `$`, or `_`,
followed by any combination of those characters and digits, such as `x`, `_a1$`, or `abc25`.
Language keywords, including `var`, `val`, `if`, `else`, `while`, `next`, and `exit`, as well as type names and their
aliases, are reserved.

Collection methods and concatenation produce replacement values while preserving their inputs.
Reassigning a `var` preserves the value held by other bindings:

```text
var items = [1];
val original = items;
items += [2];
[items, original] // [[1,2],[1]]
```

Array items and object properties support `=` and compound assignment. Indexed writes update the existing collection,
so other bindings holding the same collection observe the change. Direct writes through `val` or external input bindings
are rejected. Array writes require an existing index; object writes can create own properties. Negative array indexes
count from the end. For compound assignment, the container, key, and current value are evaluated before the right-hand side.

Array and object literals retain their compiled types as constraints on indexed writes. These constraints apply through
wider bindings and casts that reference the same collection. After `var items: array = [1]`, assigning `'two'` to
`items[0]` raises a runtime type error because the literal has type `[integer]`.

### Conditionals

`if condition { ... } else { ... }` is a conditional expression: it evaluates only the selected branch and returns
that branch's value. The condition must be boolean. If `else` is omitted and the condition is false, the result is `null`.

```text
val score = 82;
val category = if score >= 60 { "pass" } else { "fail" };
category // "pass"
```

### Loops

`while condition { ... }` repeats while its boolean condition is true. Use `next` to skip the rest of the current
iteration and check the condition again, or `exit` to leave the innermost loop:

```text
var i = 0;
var total = 0;
while i < 10 {
    i += 1;
    if i == 3 { next };
    if i == 6 { exit };
    total += i
};
total // 12
```

A loop returns its last completed iteration's value, or `null` if no iteration completes. An iteration interrupted
by `next` or `exit` does not replace that result. Neither keyword can jump from a called function into its caller's loop.

### Functions and returns

Define a function with `~(name: type, ...): return-type { ... }`. Its last expression is its result; use `~>value`
to return from the current function early:

```text
val absolute = ~(value: integer): integer {
    if value < 0 { ~> -value };
    value
};
absolute(-5) // 5
```

Functions are values and can be passed as callbacks. A final variadic parameter collects the remaining arguments into
an array. Use `...integer` for integer arguments and `...??` for arguments of any type.

```text
val sum = ~(values: ...integer): integer { Integer.Sum(values) };
sum(1, 2, 3) // 6
```

Use the global return operator `=>value` to finish the entire script evaluation, including from inside a function or callback:

```text
val stop = ~(): integer { =>42 };
stop();
0 // The script returns 42 before reaching this expression.
```

### Arrays and objects

Arrays hold ordered values of any type and use zero-based indexes. Access an item with brackets or a dot followed by
an integer. The presence operator `?` checks whether an index exists:

```text
val items = [10, 20, 30];
[items[0], items.1, items?2, items?3] // [10,20,true,false]
```

Use `+` to concatenate arrays. Wrap an individual item in an array when adding it:

```text
[1, 2] + [3, 4]; // [1,2,3,4]
[0] + [1, 2];    // [0,1,2]
[1] + [[2, 3]]  // [1,[2,3]]
```

Objects hold named values. Define them with string keys and colons inside brackets; `[:]` is an empty object.
Object literals reject duplicate keys that are known at compile time.
Access properties with `record.key`, `record."key"`, or `record["key"]`. Use `record?key` to check for a literal key,
or `record.Has(keyVariable)` for a computed key.

```text
val original = ["name": "Ada", "score": 10];
val updated = Object.Merge(original, ["score": 20, "active": true]);
[original.score, updated.score, updated.active] // [10,20,true]
```

`Object.Merge` creates a new object; later arguments take precedence for duplicate keys. Array concatenation and
object merging are shallow: nested values are shared by reference, with their contents preserved at the script level.

### Method calls and chaining

Built-in methods use `value.Method(arguments)`. Parentheses can be omitted when no explicit arguments are needed:
`items.Length` and `items.Length()` are equivalent. Method results can be chained:

```text
" hello ".Trim.UpperCase // "HELLO"
```

Callbacks make collection transformations composable:

```text
val values = [1, 2, 3];
values.Derive(~(item: integer): integer { item * 2 })
      .Filter(~(item: integer): boolean { item > 3 }) // [4,6]
```

After a dot, a built-in method name takes precedence over an object property with the same name.
Use brackets or a quoted key to read such a property, for example `record["Length"]` or `record."Length"`.

### Types

| Type | Meaning |
| --- | --- |
| `void` | Absence of a value; the script literal is `null` |
| `boolean` / `bool` | `true` or `false` |
| `timestamp` / `time` | Date and time |
| `float` / `f64` | 64-bit floating-point number |
| `integer` / `i64` | Signed 64-bit integer |
| `buffer` | Sequence of bytes |
| `string` | Text |
| `array` | Sequence of values |
| `object` | Named values |
| `function` | Built-in, host-provided, or script-defined function |
| `??` | Unknown or variant type, compatible with every type |
| `~(integer): string` | Function taking an integer and returning a string |
| `integer?` | Optional integer: `void` or `integer` |
| `integer \| string` | Union of types |

Parentheses group types, for example `(integer | string)?`. Type checking is intentionally permissive; see
[Detailed type rules](#detailed-type-rules) for structural types, callback compatibility, and variadic signatures.

A postfix cast, `expression::type`, checks an expected type without converting the value:

```text
val parsed = JSON.Parse('{"answer":42}');
parsed::object.answer // 42.0
```

Standard JSON numbers are floats. Use conversion methods such as `.Integer()` or `.Float()` to convert numeric types.
An incompatible cast raises an error. Casts can be followed by property access, indexing, calls, or another cast.

#### Collection and variadic types

| Type | Meaning |
| --- | --- |
| `[...float]` | Uniform array. Every item is a float. |
| `[float]` | Tuple with a float at index 0. Extra items may have any type. |
| `[float, string]` | Tuple with a float at index 0 and a string at index 1. Extra items may have any type. |
| `[...:float]` | Uniform object. Every property value is a float. |
| `["a": float]` | Record with a float property named `a`. Extra properties may have any type. |
| `["a": float, "b": string]` | Record with a float property named `a` and a string property named `b`. Extra properties may have any type. |

The ellipsis marks a uniform type for zero or more entries. For example, `[...integer | string]` is a uniform
array whose items may be integers or strings.

Tuples and records use plain brackets. They specify a minimum shape and allow additional entries. The empty shapes
`[]` and `[:]` require no entries. Unannotated array literals infer tuples, and unannotated object literals with
known keys infer records.

A final variadic parameter collects zero or more arguments into an array. `~(...integer):void` is the function
type, and `~(a: ...integer):void{}` is a function value of that type. Each collected argument must be an integer,
and `a` has type `[...integer]` inside the function.

### Operators and precedence

Expression operators are listed from highest precedence to lowest. Parentheses override grouping.

| Precedence | Operators | Meaning |
| --- | --- | --- |
| Highest | `.`, `[]`, `?`, `()`, `::` | Access, presence, calls, and casts |
| | `**` | Exponentiation |
| | Unary `+`, `-` | Arithmetic sign |
| | `*`, `/`, `%` | Multiplication, division, remainder |
| | `+`, `-` | Addition or concatenation; subtraction |
| | `>`, `<`, `>=`, `<=`, `==`, `!=` | Comparison and equality |
| | `!` | Boolean negation |
| | `&` | Boolean AND |
| | `\|` | Boolean OR |
| Lowest | `?:` | Null coalescing |

Binary operators at the same precedence group left to right, including exponentiation:
`2 ** 3 ** 2` means `(2 ** 3) ** 2` and produces `64`. Exponentiation binds before arithmetic sign, so `-2 ** 2` is `-4`.
Boolean negation binds after comparisons: `!a == b` means `!(a == b)`.

`+` adds numbers or concatenates strings, buffers, and arrays. `value ?: fallback` returns `fallback` when `value` is
`null`, otherwise `value`. Operators evaluate their operands eagerly, including `&`, `|`, and `?:`.
Use `if` when only one branch should run.

Assign with `=` or combine assignment with an operation: `+=`, `-=`, `*=`, `/=`, `%=`, `&=`, and `|=`.
Assigning to an external input variable with any of these operators causes a compilation error.
Assignments and returns consume the expression that follows them; separate them into statements for clarity.

## Embedding API

`new Affinirum(script, config?)` parses and compiles the script. `evaluate(inputs?)` executes it with the current inputs.
An input variable is a name that resolves to neither a scope variable nor a built-in. The host supplies its value, and the
script can only read the binding.

- A type supplied in `config.variables` stays fixed in either mode.
- Strict mode requires a configured type for every referenced input.
- Non-strict mode allows implicit inputs. An implicit input starts at `??` and accumulates the union of the types expected
  at its uses. This includes uses in skipped branches, skipped loop bodies, and functions that are never called.
  An unconstrained use contributes no type information.

### Typed inputs and strict mode

Use constructor configuration to declare input value types, require declarations, and constrain the result type:

```js
import { Affinirum, Type } from "affinirum";

const expression = new Affinirum("price * quantity", {
    strict: true,
    type: Type.Float,
    variables: {
        price: Type.Float,
        quantity: Type.Integer,
    },
});

console.log(expression.evaluate({ price: 12.5, quantity: 3n })); // 37.5
```

- `variables` declares input value types; structured types can be built with helpers such as `Type.arrayType(Type.Integer)`
  and `Type.objectType([["name", Type.String]])`.
- `strict: true` rejects undeclared input names during compilation. It does not change the language's type compatibility rules.
- `type` specifies the expected result type to be checked during compilation.

Every referenced input must be supplied as an own property of the object passed to `evaluate`, even if its value is `undefined`.
Before checking input values against their inferred or declared types, `evaluate()` wraps input `bigint` values to the signed
64-bit range, including integers inside arrays and objects.

| Instance member | Result |
| --- | --- |
| `script` | Original script text |
| `type` | Inferred result `Type`; use `.toString()` for its readable form |
| `variables()` | Record of referenced input names and their inferred or declared types |
| `toString()` | Compiled tree representation |
| `evaluate(inputs?)` | Script result as a JavaScript value |

### Host functions

Declare a function's type in `variables`, then supply its JavaScript implementation on evaluation.
`Type.functionType` takes an array of signatures. Each signature lists the return type and parameter types.
The optional third entry defaults to `false`. Set it to `true` for a variadic signature.

```ts
import { Affinirum, Type } from "affinirum";

const expression = new Affinirum("discount(total)", {
    strict: true,
    type: Type.Float,
    variables: {
        total: Type.Float,
        discount: Type.functionType([[Type.Float, [Type.Float]]]),
    },
});

const result = expression.evaluate({
    total: 100,
    discount: (amount: number) => amount * 0.9,
}); // 90
```

Affinirum checks that injected functions are callable and trusts their behavior and return values. Supply synchronous
functions that return values matching their declared Affinirum types. Every returned `bigint` must be in the signed 64-bit
range, including integers inside arrays and objects. `evaluate()` passes the final result through unchanged, with a top-level
`null` returned as `undefined`.

List multiple signatures in one `Type.functionType` call when the implementation supports overloads:

```ts
const identityType = Type.functionType([
    [Type.Integer, [Type.Integer]],
    [Type.String, [Type.String]],
]);
```

Pass `true` as the second argument to `Type.functionType` for a volatile function.

### JavaScript value mapping

| Affinirum type | JavaScript value |
| --- | --- |
| `void` | `undefined` on output; `null` or `undefined` accepted as input |
| `boolean` | `boolean` |
| `float` | `number` |
| `integer` | `bigint` |
| `timestamp` | `Date` |
| `buffer` | `ArrayBuffer` |
| `string` | `string` |
| `array` | Array of supported values |
| `object` | Object containing supported values |
| `function` | Synchronous JavaScript function |

For example, supply `quantity: 3n` for an integer input; `quantity: 3` supplies a float.

### Errors

Syntax and compilation errors are thrown by the constructor. Missing inputs, incompatible input values, and other
evaluation failures are thrown by `evaluate`. Errors reported by the parser or type checker include a source position
and an excerpt. Catch errors around both construction and evaluation:

```js
import { Affinirum, Type } from "affinirum";

try {
    const expression = new Affinirum("quantity + 1", {
        strict: true,
        variables: { quantity: Type.Integer },
    });
    expression.evaluate({ quantity: "three" }); // Throws: an integer was expected.
} catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
}
```

### Affinirum Notation

Affinirum Notation (AN) uses the language's literal syntax to represent values, including integers, timestamps,
buffers, arrays, and objects. `Affinirum.parse()` reads a single notation value; it does not execute a script.
Empty or `undefined` input returns `undefined`, and invalid input throws. `Affinirum.format()` writes a notation string:

```js
import { Affinirum } from "affinirum";

const value = Affinirum.parse('["answer":42,"enabled":true]');
const notation = Affinirum.format(value); // '["answer":42,"enabled":true]'

Affinirum.format(undefined); // "null"
Affinirum.format(null); // "null"
Affinirum.format([1n, undefined]); // "[1,null]"
Affinirum.format({ missing: undefined }); // '["missing":null]'
```

Both `Affinirum.format(value, whitespace?)` and the script function `AN.Format(value, whitespace?)` accept optional
indentation text. They write JavaScript `null` and `undefined` as the AN literal `null` at every nesting level.
Parsing that literal produces JavaScript `undefined`, preserving array lengths and object properties containing `undefined`.

## Standard library

Global functions use namespaces such as `Integer.Sum(...)`. Method functions use `value.Method(...)`.
In the signatures below, `T?` means `T` or `void`, `...` marks variadic arguments, and `??` means any type.
Parameters whose type includes `void` can be omitted. Parameter names are explanatory; arguments are positional.

### Global functions

Native conversions use the following `null` handling:

- General `Format` conversions return an empty string for `null`.
- `JSON.Format` serializes JavaScript `null` and `undefined` as JSON `null`, including array elements and object properties.
- `AN.Format` and `Affinirum.format` serialize JavaScript `null` and `undefined` as the literal `null`, including array elements and object properties.
- `Encode` returns a zero-length buffer for `null`.
- `Decode` and `Parse` return `null` when their input value is `null`.

Empty strings and zero-length buffers remain ordinary values; they are not serialized null markers.
Invalid inputs other than `null` may raise an evaluation error, depending on the function.

#### Boolean

- **Boolean.Or(values: ...(boolean | [boolean])):boolean** — Boolean disjunction of booleans and arrays of booleans
- **Boolean.And(values: ...(boolean | [boolean])):boolean** — Boolean conjunction of booleans and arrays of booleans
- **Boolean.Not(value: boolean):boolean** — Boolean negation
- **Boolean.Decode(value: buffer?, offset: integer?):boolean?** — Decode a byte at the optional offset; missing or out-of-range input returns `null`
- **Boolean.Parse(value: string?):boolean?** — Parse case-insensitive `true` or `false`; other values return `null`

#### Timestamp

- **Timestamp.Now():timestamp** — Current date and time
- **Timestamp.Epoch(value: float | integer, epoch: timestamp?):timestamp** — Create timestamp from milliseconds
- **Timestamp.Decode(value: buffer?, encoding: string?, offset: integer?):timestamp?** — Decode a timestamp using `i32` or `i32le` minutes, or `i64` (default) or `i64le` milliseconds since the Unix epoch
- **Timestamp.Parse(value: string?):timestamp?** — Parse a string as a timestamp

#### Float

- **Float.NAN** — Not-a-number
- **Float.PositiveInfinity** — Positive infinity
- **Float.NegativeInfinity** — Negative infinity
- **Float.Epsilon** — Difference between `1` and the next larger representable float (`2.220446049250313e-16`)
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

- **String.Alphanumeric(value: string):string** — Keep only ASCII letters and digits
- **String.Random(length: integer):string** — Random alphanumeric string
- **String.Decode(value: buffer?, encoding: string?, offset: integer?, length: integer?):string?** — Decode using `utf8` (default), `sbcs`, `ucs2`, or `ucs2le`

#### Buffer

- **Buffer.Random(length: integer):buffer** — Buffer of given length filled with random bytes
- **Buffer.Parse(value: string?):buffer?** — Parse a hexadecimal string as a buffer

#### Array

- **Array.Join(values: ...array):array** — Concatenate arrays in argument order into a new array, preserving nested arrays
- **Array.Range(a: integer, b: integer):array** — Integers from the lower endpoint (inclusive) to the higher endpoint (exclusive)
- **Array.Unique(value: array):array** — Array of unique values
- **Array.Intersection(a1: array, a2: array):array** — Common values from two arrays
- **Array.Difference(a1: array, a2: array):array** — Symmetric difference between arrays

`Array.Join(a,b,c)` has the same shallow concatenation behavior as `a+b+c`. Inputs are preserved, and nested arrays
and objects are shared by reference. Use `array.Flatten(depth)` to flatten nested array elements.

```text
Array.Join([1,2],[3],[4,5]);  // [1,2,3,4,5]
Array.Join([[1,2]],[3])      // [[1,2],3]
```

#### Object

- **Object.Merge(values: ...(object | [object])):object** — Shallow merge into a new object; later arguments take precedence

#### AN

- **AN.Format(value: ??, whitespace: string?):string** — Format a value as AN notation, including `null` values in arrays and objects

#### JSON

- **JSON.Format(value: (void | boolean | timestamp | float | integer | string | array | object), whitespace: string?):string** — Format a value as JSON
- **JSON.Parse(value: string?):(void | boolean | timestamp | float | integer | string | array | object)** — Parse a JSON-formatted string; standard JSON values are not revived as timestamps or integers

`JSON.Format` uses JavaScript `JSON.stringify`, with integers converted to decimal strings and JavaScript `null` or
`undefined` values serialized as JSON `null` at every nesting level. Object keys and array positions are preserved.
The optional `whitespace` controls indentation.

```text
JSON.Format(null);                          // "null"
JSON.Format(JSON.Parse("null"));            // "null"
JSON.Format([null, 1]);                     // '[null,"1"]'
JSON.Format(["missing": null, "count": 1])  // '{"missing":null,"count":"1"}'
```

#### IP

- **IP.Match(values: [string], search: ...(string | [string])):boolean** — Check whether any searched IPv4 or IPv6 address belongs to the supplied addresses or CIDR ranges
- **IP.Encode(value: string?):buffer** — Encode an IPv4, IPv6, or CIDR string as a network-byte-order buffer; malformed or `null` input returns a zero-length buffer
- **IP.Decode(value: buffer?):string?** — Decode a 4-, 5-, 16-, or 17-byte buffer as canonical IPv4, IPv6, or CIDR notation; malformed or `null` input returns `null`

### Method functions

#### General Functions

- **??.Coalesce(otherwise: ??):??** — Null coalescence
- **??.Equals(value: ??):boolean** — Tests whether the values are equal
- **??.NotEquals(value: ??):boolean** — Tests whether the values differ
- **(boolean | buffer | function).Encode():buffer** — Encode value to buffer
- **(void | timestamp | float | integer | string | array | object).Encode(encoding: string?):buffer** — Encode a value; timestamps support `i32` and `i32le` minutes or `i64` and `i64le` milliseconds, while defaults are `i64` for timestamps and integers, `f64` for floats, and `utf8` for strings
- **(boolean | string | function).Format():string** — Format value to string
- **(void | timestamp | float | integer | buffer | array | object).Format(formatting: string?):string** — Format a value; buffers use `hex` by default and also support `base64`

#### Aggregable Functions

- **float.Add(value: float):float** — Add a float
- **float.Add(value: integer):float** — Add an integer
- **integer.Add(value: float):float** — Add a float
- **integer.Add(value: integer):integer** — Add an integer
- **buffer.Add(value: buffer):buffer** — Concatenate buffers
- **string.Add(value: string):string** — Concatenate strings
- **array.Add(value: array):array** — Concatenate arrays

#### Array Functions

- **array.First(condition: ~(??, integer, array):boolean):??** — First item satisfying condition
- **array.Last(condition: ~(??, integer, array):boolean):??** — Last item satisfying condition
- **array.FirstIndex(condition: ~(??, integer, array):boolean):integer?** — First index satisfying condition, or `null` if none does
- **array.LastIndex(condition: ~(??, integer, array):boolean):integer?** — Last index satisfying condition, or `null` if none does
- **array.Every(condition: ~(??, integer, array):boolean):boolean** — All items satisfy condition
- **array.Any(condition: ~(??, integer, array):boolean):boolean** — Any item satisfies condition
- **array.Reverse():array** — Reversed array
- **array.Flatten(depth: integer = 1):array** — Flatten array
- **array.Derive(transformation: ~(??, integer, array):??):array** — Derived array
- **array.Filter(condition: ~(??, integer, array):boolean):array** — Filtered array
- **array.Reduce(reducer: ~(??, ??, integer, array):??, initial: ?? = null):??** — Reduced value
- **array.Compose(generator: ~(object, string, integer, array):??):object** — Compose object from array

`Compose` builds a new object. Each callback receives an immutable snapshot of the properties produced by earlier callbacks.
Retaining that snapshot preserves its contents as subsequent properties are added to the result.

#### Buffer Functions

- **buffer.Byte(pos: integer):buffer?** — Byte at position, or `null` when unavailable

#### Enumerable Functions

- **buffer.Slice(start: integer?, end: integer?):buffer** — Slice section
- **string.Slice(start: integer?, end: integer?):string** — Slice section
- **array.Slice(start: integer?, end: integer?):array** — Slice section
- **buffer.Splice(start: integer, remove: integer, inject: ...buffer):buffer** — Splice section
- **string.Splice(start: integer, remove: integer, inject: ...string):string** — Splice section
- **array.Splice(start: integer, remove: integer, inject: ...array):array** — Splice section
- **buffer.Inject(start: integer, inject: ...buffer):buffer** — Inject section
- **string.Inject(start: integer, inject: ...string):string** — Inject section
- **array.Inject(start: integer, inject: ...array):array** — Inject section

#### Iterable Functions

- **(buffer | string | array | object | void).Length():integer** — Get length, or zero for `null`
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
- **float.Subtract(subtrahend: float | integer):float** — Subtract a number
- **integer.Subtract(subtrahend: float):float** — Subtract a float
- **integer.Subtract(subtrahend: integer):integer** — Subtract an integer
- **float.Negate():float** — Negate number
- **integer.Negate():integer** — Negate number
- **float.Multiply(value: float | integer):float** — Multiply by a number
- **integer.Multiply(value: float):float** — Multiply by a float
- **integer.Multiply(value: integer):integer** — Multiply by an integer
- **float.Divide(divisor: float | integer):float** — Divide by a number
- **integer.Divide(divisor: float):float** — Divide by a float
- **integer.Divide(divisor: integer):integer** — Divide by an integer
- **float.Remainder(divisor: float | integer):float** — Remainder after division by a number
- **integer.Remainder(divisor: float):float** — Remainder after division by a float
- **integer.Remainder(divisor: integer):integer** — Remainder after division by an integer
- **float.Modulo(divisor: float | integer):float** — Modulo by a number
- **integer.Modulo(divisor: float):float** — Modulo by a float
- **integer.Modulo(divisor: integer):integer** — Modulo by an integer
- **float.Power(exponent: float | integer):float** — Raise to a numeric power
- **integer.Power(exponent: float):float** — Raise to a float power
- **integer.Power(exponent: integer):integer** — Raise to an integer power
- **float.Root(index: float | integer):float?** — Take a root with the specified index
- **integer.Root(index: float):float?** — Take a float root
- **integer.Root(index: integer):integer?** — Take an integer root
- **(boolean | timestamp | integer).Float():float** — Convert to a float; timestamps use milliseconds since the Unix epoch
- **(boolean | timestamp | float).Integer():integer** — Convert to an integer; timestamps use milliseconds since the Unix epoch
- **(timestamp | float | integer).Boolean():boolean** — Convert to a boolean by testing whether the numeric or epoch value is non-zero

`Root` returns `null` for a nonpositive index. With integer operands, even roots of negative values also return `null`.
Floating-point root calculations can return `NaN`, which is a float.

#### Object Functions

- **object.Entries():array** — Key-value pairs
- **object.Keys():[string]** — Object keys
- **object.Values():array** — Object values

#### String Functions

- **string.Like(value: string):boolean** — Alphanumeric equality
- **string.NotLike(value: string):boolean** — Alphanumeric inequality
- **string.StartsWith(search: string, startPos: integer?, ignoreCaseSpaceEtc: boolean?):boolean** — Prefix check
- **string.EndsWith(search: string, endPos: integer?, ignoreCaseSpaceEtc: boolean?):boolean** — Suffix check
- **string.Char(pos: integer):string?** — Character at position, or `null` when unavailable
- **string.CharCode(pos: integer):integer?** — Character code, or `null` when unavailable
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

## Detailed type rules

Affinirum uses intentionally permissive type checking. Type information helps reject clearly incompatible expressions,
select function overloads, and report compilation errors. It does not prove that every accepted expression is safe
for every possible runtime value.

- `??` is the unknown or variant type and is compatible with every type, including `void`.
- An optional type such as `integer?` is the union `void | integer`. Optional parameters, including `??`, accept
  `null` or JavaScript `undefined`. Only trailing optional parameters can be omitted.
- A call to an overloaded function must match one complete signature. A call through a union of functions must match
  one complete signature for each possible function. For typed calls, the full argument types must fit the signature
  at compile time. The first matching overload determines the result type for each callable. Implicit arguments can
  remain `??` when the overloads leave their types ambiguous. Evaluation uses the function directly.
- Object types are open structural constraints: required properties and their values are checked, while additional
  properties are allowed.
- Tuple types are prefix constraints: declared item types are checked in order, optional trailing items may be
  omitted, and additional items are allowed.
- A replacement function may require at most as many arguments as the declared signature requires.
- A callback may declare fewer parameters than the caller provides. Additional arguments are ignored at runtime,
  following JavaScript function-call behavior.
- Function parameter types are checked contravariantly where both signatures declare a parameter. The receiving
  function must accept the full expected parameter type, including `void` when present. Return types are checked covariantly. The returned type must fit
  the expected result type. `??` remains compatible with any parameter type.
- Function-type compatibility distinguishes fixed and variadic signatures. Two non-generic variadic signatures must
  declare their variadic parameter in the same position to be compatible.

For example, a callback declared as `~(value: float):boolean` is compatible with an expected callback type such as
`~(??, integer, array):boolean`. The array method supplies all three arguments, and the callback can ignore
the index and array. `??` keeps the item type flexible.

For a variadic host function, set the third entry of the signature to `true` and declare its last parameter as a uniform
array type. Use `Type.Array` to accept arguments of any type. Affinirum passes the arguments
individually. The JavaScript implementation collects the trailing arguments with a rest parameter.

```ts
import { Affinirum, Type } from "affinirum";

const expression = new Affinirum("sum(1, 2, 3)", {
    strict: true,
    variables: {
        sum: Type.functionType([[Type.Integer, [Type.arrayType(Type.Integer)], true]]),
    },
});

const result = expression.evaluate({
    sum: (...values: bigint[]) => values.reduce((total, value) => total + value, 0n),
}); // 6n
```

When JavaScript calls a variadic script function returned by `evaluate()`, pass the arguments individually as well.

Casts require compatible source and target types at compile time, and the evaluated value must satisfy the target
type at runtime. A cast checks the value; it does not perform a conversion.
