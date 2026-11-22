# Affinirum

Affinirum is an embeddable scripting language for expressions, rules, and algorithmic logic in JavaScript applications.
It supports variables, conditionals, loops, first-class functions, and a standard library for numbers, timestamps,
buffers, strings, arrays, and objects. The host application supplies input values and functions.

Affinirum runs in browsers and Node.js with an ES2022 runtime. The package provides ESM, CommonJS, and TypeScript declarations.

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
  - [Match expressions](#match-expressions)
  - [Loops](#loops)
  - [Functions and returns](#functions-and-returns)
  - [Arrays and objects](#arrays-and-objects)
  - [Method calls and chaining](#method-calls-and-chaining)
  - [Types](#types)
    - [Array, object, and variadic types](#array-object-and-variadic-types)
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
value of its last expression. An empty block has type `null` and evaluates to JavaScript `undefined`.
Use parentheses to group expressions. Commas separate arguments and entries in arrays and objects.

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
| Null | `null` |
| Array | `[1, 2, 3]`, `[]` |
| Object | `["name": "Ada", "score": 10]`, `[:]` |

Integers are signed 64-bit values; overflow wraps to that range. Floats use IEEE 754 binary64.
Integer division truncates toward zero: `7 / 2` is `3`, while `7.0 / 2` is `3.5`.
Arithmetic involving a float produces a float.

Whitespace outside literals and comments is ignored. Names are case-sensitive. Line comments start with `//`;
block comments are enclosed in `/// ... ///` and do not nest. Strings decode `\n`, `\r`, and `\t`;
use `\\` for a backslash and `\'` or `\"` for quotes. Other escapes insert the following character without the
backslash, so Unicode and hexadecimal escape sequences are not decoded.

Buffer literals also allow whitespace and both comment forms between hexadecimal digits. Inside a buffer, a line
comment ends at a newline or the closing backtick. A final unpaired hexadecimal digit becomes a byte with a leading
zero: `` `abc` `` contains the bytes `ab 0c`.

### Variables and values

Use `var` for a reassignable binding and `val` for a fixed binding. Types can be inferred or declared after a colon:

```text
val step = 2;
var count: integer = 1;
count += step;
count // 3
```

Variables follow these rules.

- An explicit type annotation fixes the variable's type, including an explicit `any`.
- A non-optional type requires an initial value in the declaration. A variable declared with an optional type or `any`
  can omit its initializer and starts at `null`.
- A variable without an annotation takes its type from its initializer. Later assignments must be compatible with that type.
- A variable with neither an annotation nor an initializer, or a parameter without an annotation, has type `any`.
  Later reads and assignments leave that binding type unchanged.

A read or assignment expression can have a more specific type than the binding. That type applies only to the expression.

Bindings declared inside a block are local to that block. Names must start with an ASCII letter, `$`, or `_`,
followed by any combination of those characters and digits, such as `x`, `_a1$`, or `abc25`.
Language keywords, including `var`, `val`, `func`, `function`, `if`, `then`, `else`, `match`, `when`, `while`, `loop`, `until`, `next`, and `exit`, are reserved,
as are type names and their aliases.

Built-in methods that transform arrays or objects produce replacement values while preserving their inputs.
Concatenation follows the same rule.
Reassigning a `var` preserves the value held by other bindings:

```text
var items: [...integer] = [1];
val original = items;
items += [2];
[items, original] // [[1,2],[1]]
```

Array items and object properties support `=` and compound assignment. Indexed writes update the existing array or object,
so other bindings holding that value observe the change. Direct writes through `val` or external input bindings
are rejected. Array writes require an existing index; object writes can create own properties. Negative array indexes
count from the end. Compound assignment resolves the container and key and reads the current value once, before
evaluating the right-hand side.

Optional targets such as `entry?.name` and `items?[index]` also support `=` and compound assignment. When the receiver
is `null`, the assignment returns `null` and skips the key or index and the right-hand side at runtime. A successful
assignment returns the assigned value.

Array and object literals retain their compiled types as constraints on indexed writes. These constraints apply through
wider bindings and casts that reference the same array or object. After `var items: [] = [1]`, assigning `'two'` to
`items[0]` raises a runtime type error because the literal has type `[integer]`.

### Conditionals

`if condition then result else fallback` evaluates only the selected branch and returns its value. The condition must be boolean.
`then` is required. Either branch can be a single expression or a braced block containing several statements.
If `else` is omitted and the condition is false, the result is `null`. In nested conditionals, `else` belongs to the nearest
conditional that can accept it. Use braces to make the intended nesting explicit.

```text
val score = 82;
val category = if score >= 60 then "pass" else "fail";
category // "pass"
```

Use `match true` to test several conditions in order. The first true condition supplies the result.

```text
val score = 82;
match true
    when score >= 90 then "A"
    when score >= 80 then "B"
    else "C" // "B"
```

### Match expressions

Use `match value when key then result else fallback` to choose a result by value. Each `when` requires `then` after its key.
The result and fallback can be single expressions or braced blocks. The subject can also be an expression, as in `match status + 1 when 201 then "Created"`.
Parentheses around the subject are optional.

`match` evaluates its subject once and compares it with each key in order using `==`, including structural equality
for arrays and objects. It evaluates the result expression of the first matching arm. If every key misses,
the optional final `else` supplies the result.

```text
val status = 404;
val label = match status
    when 200 then "OK"
    when 404 then "Not found"
    else "Unknown";
label // "Not found"
```

The result type is the union of the reachable arm result types, including the fallback. If no key matches
and `else` is omitted, the result is `null`. In the example below, the two integer results and the
implicit `null` give the `match` expression type `integer?`.

```text
val retryDelay = func(status:integer):integer? {
    match status when 429 then 60 when 503 then 10
};
[retryDelay(503), retryDelay(404)] // [10, null]
```

Each `match` requires at least one `when` or `else` arm. With only `else`, the subject is still evaluated.
For example, `match value else {}` evaluates `value` and returns `null`.

### Loops

`while condition loop body` tests its boolean condition before each iteration. The required `loop` introduces
a single expression, as in `while i < 10 loop i += 1`, or a braced block.
Use `next` to skip the rest of the current iteration, or `exit` to leave the innermost loop.
Both apply only to loops in the current function or script.

```text
var i = 0;
var total = 0;
while i < 10 loop {
    i += 1;
    if i == 3 then next;
    if i == 6 then exit;
    total += i
};
total // 12
```

An optional `until` tests a boolean stop condition after the body. The standalone form `loop i += 1 until i == 3`
runs the body at least once.

```text
var i = 0;
loop {
    i += 1;
    i * 10
} until i == 3 // 30
```

In `while i < 10 loop i += 1 until i == 3`, a false `while` condition skips both the body and `until`.
A true `until` condition ends the loop. `next` still checks `until` before starting another iteration, while `exit` skips it.
Omitting both conditions gives `loop { ... }`, which repeats until an explicit jump stops it.

Declare variables needed by `until` outside the body block. Use braces around a body containing a nested loop
to make clear which loop a trailing `until` belongs to.

A loop returns its last completed iteration's value, or `null` if no iteration completes.
For example, `(while false loop 1) ?: 2` returns `2`. An iteration interrupted by `next` or `exit` preserves the previous result.
The inferred result type includes `null` even when the loop has no precondition.

### Functions and returns

Define a function with `func(name: type, ...): return-type { ... }`. The keyword `function` is a synonym for `func`.
Braces around the body are required.
Omit the colon and return type to use `any`, as in `func(value) { value }`.
Braces containing a parenthesized expression, such as `{(value)}`, are ordinary code blocks.
The last expression supplies the function's result. Use `-> value` to return early from the current function,
or `=> value` to finish the entire script.

```text
val absolute = func(value: integer): integer {
    if value < 0 then -> -value;
    value
};
absolute(-5) // 5
```

A return annotation can be a union, as in `func(value: integer): integer | string { value }`.

Functions are values and can be passed as callbacks. A final variadic parameter collects the remaining arguments into
an array. Use `...integer` for integer arguments and `...any` for arguments of any type.
In a function literal, `values: ...` is shorthand for `values: ...any`; function types require the explicit `...any`.

```text
val sum = func(values: ...integer): integer {
    values.Reduce(func(total: integer, item: integer): integer { total + item}, 0)
};
sum(1, 2, 3) // 6
```

Built-in variadic functions accept individual arguments of their declared type. For example, use
`Integer.Sum(1, 2, 3)`; `Integer.Sum([1, 2, 3])` is invalid. Use `Reduce` to aggregate an existing array, as above.

Use the global return operator `=>value` to finish the entire script evaluation, including from inside a function or callback:

```text
val stop = func(): integer { =>42 };
stop();
0 // The script returns 42 before reaching this expression.
```

### Arrays and objects

Arrays hold ordered values of any type and use zero-based indexes. Access an item with brackets or a dot followed by
an integer. Use `.?` to check whether an index exists. Write an empty array as `[]`.

```text
val items = [10, 20, 30];
[items[0], items.1, items.?2, items.?3] // [10,20,true,false]
```

Prefer brackets for consecutive numeric indexes: `matrix.0.1` reads `0.1` as one decimal token.

Use `+` to concatenate arrays. Wrap an individual item in an array when adding it:

```text
[1, 2] + [3, 4]; // [1,2,3,4]
[0] + [1, 2];    // [0,1,2]
[1] + [[2, 3]]  // [1,[2,3]]
```

Objects hold named values. Define them with string keys and colons inside brackets. Write an empty object as `[:]`.
Object literals reject duplicate keys that are known at compile time.
Access properties with `entry.key`, `entry."key"`, or `entry["key"]`. Use `entry.?key` to check for a literal key,
or `entry.Has(keyVariable)` for a computed key. Quote keys that are reserved words, as in `entry."until"`.

```text
val original = ["name": "Ada", "score": 10];
val updated = Object.Merge(original, ["score": 20, "active": true]);
[original.score, updated.score, updated.active] // [10,20,true]
```

`Object.Merge` creates a new object; later arguments take precedence for duplicate keys. Array concatenation and
object merging are shallow: nested values are shared by reference, with their contents preserved at the script level.

Missing indexes and properties read as `null`. A typed indexed read includes `null` in its result type, even for a
declared tuple item or record property. Use optional access for subsequent steps, as in `matrix[0]?[1]`.

Use `?.` for optional dot access, as in `entry?.name` or `items?.0`, and `?[...]` for optional access with a
computed key or index. Both return `null` when the receiver is `null` or the entry is missing. For a null
receiver, `?[...]` skips evaluating the key or index at runtime.

Use `?.?` for optional presence checks, as in `entry?.?name` or `items?.?0`. The result is `null` for a null
receiver, `true` for an existing key or an in-range index, and `false` otherwise.

```text
val entry: [:]? = null;
[entry?.name, entry?["name"], entry?.?name, [:]?.?name] // [null,null,null,false]
```

### Method calls and chaining

Built-in methods use `value.Method(arguments)`. Parentheses can be omitted when no explicit arguments are needed:
`items.Length` and `items.Length()` are equivalent. Method results can be chained:

```text
" hello ".Trim.UpperCase // "HELLO"
```

Callbacks can transform arrays in successive steps:

```text
val values = [1, 2, 3];
values.Derive(func(item: integer): integer { item * 2 })
      .Filter(func(item: integer): boolean { item > 3 }) // [4,6]
```

After a dot, a built-in method name takes precedence over an object property with the same name.
Use brackets or a quoted key to read such a property, for example `entry["Length"]` or `entry."Length"`.

Use `receiver?.Method(arguments)` for an optional built-in method call. If the receiver is `null`, the call
returns `null` and skips its arguments during evaluation. A call without explicit arguments can use `receiver?.Method`.
Each `?.` applies to one step, so use it at each step that can receive `null`, as in `text?.Trim?.UpperCase`.

### Types

| Type | Meaning |
| --- | --- |
| `null` | The type whose only script value is `null` |
| `never` | A type with no values, used for expressions that cannot complete normally |
| `boolean` / `bool` | `true` or `false` |
| `timestamp` / `time` | Date and time |
| `float` / `f64` | 64-bit floating-point number |
| `integer` / `i64` | Signed 64-bit integer |
| `buffer` | Sequence of bytes |
| `string` | Text |
| `[]` | A sequence whose items can have any type |
| `[:]` | Named properties whose values can have any type |
| `{:}` | Function with an unspecified signature |
| `any` | A type that accepts any value |
| `{(integer): string}` | Function taking an integer and returning a string |
| `integer?` | An integer or `null` |
| `integer \| string` | Union of types |

Append `?` to a named, array, object, function, or parenthesized type to include `null`. For example, `[]?`, `[:]?`,
`{:}?`, and `(integer | string)?` are optional types. The suffix is invalid on `null` and `never`, including when
parenthesized. `{(): integer}?` is a nullable function, and `{(): integer?}` is a function with a nullable result.

Parentheses group types, as in `(integer | string)`. Write a function type as `{(parameter-types): return-type}`.
The return type is required. For example, `{():any}` describes a zero-argument function that may return any value.
The generic type `{:}` accepts functions of any signature.

The closing `}` marks the end of a function type. `{(integer): string | null}` describes a function that can
return `null`, while `{(integer): string} | null` describes a function or `null`. In `{(): [...string | null]}`,
the brackets enclose the union of array item types.

Combine function types with `&` to declare overloads, as in `{(integer):string}&{(string):integer}`.
A call must match one of the signatures. In type expressions, `?` binds more tightly than `&`, and `&` binds
more tightly than `|`. Group an overloaded type before `?` to make the whole function nullable, as in
`({(integer):string}&{(string):integer})?`. Overload operands must be function types.

Type checking is intentionally permissive. See [Detailed type rules](#detailed-type-rules) for structural types,
callback compatibility, and variadic signatures.

A cast, `(expression:type)`, checks an expected type without converting the value:

```text
val parsed = JSON.Parse('{"answer":42}');
(parsed:[:]).answer // 42.0
```

Standard JSON numbers are floats. Use conversion methods such as `.Integer()` or `.Float()` to convert numeric types.
An incompatible cast raises an error. A cast result can be accessed, indexed, or called. Casts can also be nested.

The parentheses are required and enclose the entire expression being checked: `(a + b:integer)` checks the sum.
Write `(value:integer | string)` to cast to a union, and `(value:boolean) | other` for Boolean OR after a cast.
Inside a call, a cast needs its own parentheses, as in `f((value:integer))`.

Casts reject operands of type `never`, which cannot produce a value. Write `->(value:integer)` to check a value before
returning it; `(->value:integer)` is invalid.

#### Array, object, and variadic types

Uniform types apply one allowed type to every item or property value. Tuple and record types describe individual
positions and named properties in ordinary arrays and objects.

| Type | Meaning |
| --- | --- |
| `[...float]` | Uniform array. Every item is a float. |
| `[float]` | Tuple with a float at index 0. Extra items may have any type. |
| `[float, string]` | Tuple with a float at index 0 and a string at index 1. Extra items may have any type. |
| `[float, string?]` | Tuple with a required float and an optional trailing string. |
| `[...:float]` | Uniform object. Every property value is a float. |
| `["a": float]` | Record with a float property named `a`. Extra properties may have any type. |
| `["a": float, "b": string]` | Record with a float property named `a` and a string property named `b`. Extra properties may have any type. |
| `["a": float?]` | Record with an optional float property named `a`. Extra properties may have any type. |

The ellipsis marks a uniform array or object type. For example, `[...integer | string]` is an array whose items may be
integers or strings. Add a colon after the ellipsis for objects, as in `[...:string]` for string-valued properties.
Both uniform types allow zero or more entries. As types, `[]` and `[...any]` are aliases for uniform `any` arrays;
`[:]` and `[...:any]` are aliases for uniform `any` objects. Formatted types use `[]` and `[:]`.

Tuples and records specify a minimum shape and allow additional entries. An entry whose type excludes `null` is required;
optional trailing tuple items and optional record properties may be absent. Since `any` includes `null`, an entry of
type `any` does not enforce presence. A uniform type does not guarantee any positions or keys, so it cannot implicitly
satisfy a tuple or record with required entries. A cast can check the actual value against the required shape.

Without an ellipsis, nonempty array literals infer tuples, and object literals with known keys infer records.
Uniform array or object literals require the ellipsis before the first entry, as in `[...1,2]` and `[..."a":1,"b":2]`.
Their item or value type is inferred from all entries. The marker does not spread or flatten an array or object value.

In expressions, `[]` and `[:]` create empty arrays and objects with generic types.
The literals `[...never]` and `[...:never]` have the same types and empty values as `([]:[...never])` and
`([:]:[...:never])`, respectively. An exact-empty literal may share its value across function calls and evaluations.
Writes through broader array or object aliases still enforce the literal's empty type.

Argument lists, fixed parameter lists, array or object entry lists, and tuple or record type lists allow a trailing comma.
A variadic parameter must be last, without a trailing comma. Uniform array and object types close immediately after
their item or value type; tuple or record prefixes with uniform tails are not supported.

A final variadic parameter collects zero or more arguments into an array. `{(...integer):null}` is the function
type, and `func(a: ...integer):null {}` is a function value of that type. Each collected argument must be an integer,
and `a` has type `[...integer]` inside the function.

### Operators and precedence

Expression operators are listed from highest precedence to lowest. Parentheses override grouping.
The bodies of `if`, `match`, and loops are full expressions. In `if true then { 1 } else { 2 } + 3`, the addition
belongs to the `else` branch, so the result is `1`. Group the whole expression to operate on its result,
as in `(if true then 1 else 2) + 3` or `(match code when 200 then 1) ?: 0`.

| Precedence | Operators | Meaning |
| --- | --- | --- |
| Highest | `.`, `[]`, `.?`, `?.`, `?[]`, `?.?`, `()`, `(value:type)` | Access, presence checks, calls, and casts |
| | `**` | Exponentiation |
| | Unary `+`, `-` | Arithmetic sign |
| | `*`, `/`, `%` | Multiplication, division, remainder |
| | `+`, `-` | Addition or concatenation; subtraction |
| | `..` | Inclusive ascending integer range |
| | `>`, `<`, `>=`, `<=`, `==`, `!=` | Comparison and equality |
| | `!`, `not` | Boolean negation |
| | `&`, `and` | Boolean AND |
| | `\|`, `or` | Boolean OR |
| Lowest | `?:` | Null coalescing |

Binary operators other than `..` at the same precedence group left to right, including exponentiation:
`2 ** 3 ** 2` means `(2 ** 3) ** 2` and produces `64`. Exponentiation binds before arithmetic sign, so `-2 ** 2` is `-4`.
Boolean negation binds after comparisons: `!a == b` means `!(a == b)`.

`a..b` is equivalent to `Array.Range(a,b)` and produces an array of type `[...integer]`. Both bounds must be integers
and are included. Values are always ascending, even when the bounds are reversed. Arithmetic binds more tightly
than `..`, so `1..2+2` means `1..(2+2)`. Ranges cannot be chained: `1..2..3` is invalid.

```text
1..3;         // [1,2,3]
3..1;         // [1,2,3]
3..3;         // [3]
1..2+2;       // [1,2,3,4]
(1..3).Length // 3
```

A range is already an array, so `[1..3]` contains one nested array: `[[1,2,3]]`.

`+` adds numbers or concatenates strings, buffers, and arrays. `&` and `and` skip the right operand when the left
operand is `false`; `|` and `or` skip it when the left operand is `true`.

`value ?: fallback` evaluates `value` first and evaluates `fallback` only when `value` is `null`.
`value.Coalesce(fallback)` follows the same rule.

Constant folding can evaluate subexpressions during compilation, including within code that would be skipped at runtime.
For example, `false and (1 / 0 == 0)` fails during compilation even though the right operand would be skipped at runtime.

Assign with `=` or combine assignment with an operation: `+=`, `-=`, `*=`, `/=`, `%=`, `&=`, and `|=`.
`&=` skips the right-hand side and the write when the current value is `false`; `|=` skips them when it is `true`.
The short-circuited expression returns the current Boolean value. Otherwise, the right-hand side is evaluated once
and the Boolean result is assigned.
Assigning to an external input variable with any of these operators causes a compilation error.
Assignments and returns consume the expression that follows them; separate them into statements for clarity.
Assignment can also appear inside another expression: `a + b = 3` means `a + (b = 3)`, and
`1..b = 3` means `1..(b = 3)`. Use parentheses to make such assignments explicit.

## Embedding API

`new Affinirum(script, config?)` parses and compiles the script. `evaluate(inputs?, timeout?)` executes it with the current inputs.
An input variable is a name that resolves to neither a scope variable nor a built-in. The host supplies its value, and the
script can only read the binding.

Set `config.timeout` to a positive number of milliseconds to give each evaluation a default deadline. The default is `0`,
which disables the deadline. A positive `timeout` passed to `evaluate` overrides the configured value for that call.
Omitting the override or passing zero or a negative value uses the configured default. The evaluator checks the deadline
before each loop condition and when entering a script function.

- A type supplied in `config.variables` stays fixed in either mode.
- Strict mode requires a configured type for every referenced input.
- Non-strict mode allows implicit inputs. An implicit input starts at `any` and accumulates the union of the types expected
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
- A referenced input declared as `Type.Never` causes a compilation error.
- `strict: true` rejects undeclared input names during compilation. It does not change the language's type compatibility rules.
- `type` specifies the expected result type to be checked during compilation.

Every referenced input must be supplied as an own property of the object passed to `evaluate`, even if its value is `undefined`.
Before checking input values against their inferred or declared types, `evaluate()` wraps input `bigint` values to the signed
64-bit range. Shared references are preserved within the copy.

| Instance member | Result |
| --- | --- |
| `script` | Original script text |
| `type` | Inferred result `Type`; use `.toString()` for its readable form |
| `variables()` | Record of referenced input names and their inferred or declared types |
| `toString()` | Compiled tree representation |
| `evaluate(inputs?, timeout?)` | Script result as a JavaScript value |

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
range, including integers inside arrays and objects. Supply ordinary arrays with data elements and records created with
`Object.create(null)` and enumerable string data fields. The same requirements apply to arguments when JavaScript calls a
script function directly. `evaluate()` passes the final result through unchanged, with a top-level `null` returned as
`undefined`.

List multiple signatures in one `Type.functionType` call when the implementation supports overloads:

```ts
const identityType = Type.functionType([
    [Type.Integer, [Type.Integer]],
    [Type.String, [Type.String]],
]);
```

The equivalent script type is `{(integer):integer}&{(string):string}`.

Pass `true` as the second argument to `Type.functionType` for a volatile function, whose calls are excluded from
constant folding.

### JavaScript value mapping

| Affinirum type | JavaScript value |
| --- | --- |
| `null` | Returns `undefined` and accepts `null` or `undefined` as input |
| `boolean` | `boolean` |
| `float` | `number` |
| `integer` | `bigint` |
| `timestamp` | `Date` |
| `buffer` | `ArrayBuffer` |
| `string` | `string` |
| `[]` | Array of supported values |
| `[:]` | Object containing supported values |
| `{:}` | Synchronous JavaScript function |

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

Affinirum Notation (AN) represents data using the language's literals, including integers, timestamps, buffers,
arrays, and objects. `Affinirum.parse(value)` reads a single notation value without executing a script;
`Affinirum.format(value)` writes a notation string. Their script equivalents are `AN.Parse` and `AN.Format`.
Empty or `undefined` input returns `undefined`, and invalid input throws:

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

AN stores values without type annotations or uniformity markers, so formatting and parsing do not preserve uniform,
tuple, record, or exact-empty type constraints. `AN.Parse` declares a union of all supported types, with generic array
and object members, even for a constant string. Use a cast to validate a desired shape after parsing:

```text
val notation = AN.Format([..."answer":42]);
(AN.Parse(notation):["answer":integer]).answer // 42
```

## Standard library

Global functions use namespaces such as `Integer.Sum(...)`. Method functions use `value.Method(...)`.
In the signatures below, `T?` means `T` or `null`, `...` marks variadic arguments, and `any` accepts any value.
Trailing parameters whose type includes `null` can be omitted. Parameter names are explanatory; arguments are positional.

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

- **Boolean.Or(values: ...boolean):boolean** — Boolean disjunction; stop evaluating arguments at the first `true`
- **Boolean.And(values: ...boolean):boolean** — Boolean conjunction; stop evaluating arguments at the first `false`
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
- **Float.Sum(values: ...(float | integer)):float** — Numeric sum
- **Float.Min(values: ...(float | integer)):float** — Numeric minimum; requires at least one argument
- **Float.Max(values: ...(float | integer)):float** — Numeric maximum; requires at least one argument
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

- **Integer.Sum(values: ...integer):integer** — Numeric sum
- **Integer.Min(values: ...integer):integer** — Numeric minimum; requires at least one argument
- **Integer.Max(values: ...integer):integer** — Numeric maximum; requires at least one argument
- **Integer.Random(exclusiveTo: integer):integer** — Random integer up to value
- **Integer.Decode(value: buffer?, encoding: string?, offset: integer?):integer?** — Decode using signed `i8`, `i16`, `i16le`, `i32`, `i32le`, `i64` (default), or `i64le`, or unsigned `n8`, `n16`, `n16le`, `n32`, `n32le`
- **Integer.Parse(value: string?):integer?** — Parse a string as an integer

#### String

- **String.Alphanumeric(value: string):string** — Keep ASCII letters and digits, converting letters to lowercase. An empty input returns `""`.
- **String.Random(length: integer):string** — Random alphanumeric string
- **String.Decode(value: buffer?, encoding: string?, offset: integer?, length: integer?):string?** — Decode using `utf8` (default), `sbcs`, `ucs2`, or `ucs2le`

#### Buffer

- **Buffer.Random(length: integer):buffer** — Buffer of given length filled with random bytes
- **Buffer.Parse(value: string?):buffer?** — Parse a hexadecimal string as a buffer

#### Array

- **Array.Join(values: ...[]):[]** — Concatenate arrays in argument order into a new array, preserving nested arrays
- **Array.Range(a: integer, b: integer):[...integer]** — Ascending integers including both endpoints, regardless of argument order; equivalent to `a..b`
- **Array.Unique(value: []):[]** — Array of unique values
- **Array.Intersection(a1: [], a2: []):[]** — Common values from two arrays
- **Array.Difference(a1: [], a2: []):[]** — Symmetric difference between arrays

`Array.Join(a,b,c)` has the same shallow concatenation behavior as `a+b+c`. Inputs are preserved, and nested arrays
and objects are shared by reference. Use `array.Flatten(depth)` to flatten nested array elements.

```text
Array.Join([1,2],[3],[4,5]);  // [1,2,3,4,5]
Array.Join([[1,2]],[3])      // [[1,2],3]
```

#### Object

- **Object.Merge(values: ...[:]):[:]** — Shallow merge into a new object; later arguments take precedence

#### AN

- **AN.Format(value: any, whitespace: string?):string** — Format a value as AN notation, including `null` values in arrays and objects
- **AN.Parse(value: string?):(null | boolean | timestamp | float | integer | buffer | string | [] | [:])** — Parse an AN-formatted string; empty or `null` input returns `null`

#### JSON

- **JSON.Format(value: (null | boolean | timestamp | float | integer | string | [] | [:]), whitespace: string?):string** — Format a value as JSON
- **JSON.Parse(value: string?):(null | boolean | timestamp | float | integer | string | [] | [:])** — Parse a JSON-formatted string; standard JSON values are not revived as timestamps or integers

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

- **IP.Match(values: [...string], search: ...string):boolean** — Check whether any searched IPv4 or IPv6 address belongs to the supplied addresses or CIDR ranges
- **IP.Encode(value: string?):buffer** — Encode an IPv4, IPv6, or CIDR string as a network-byte-order buffer; malformed or `null` input returns a zero-length buffer
- **IP.Decode(value: buffer?):string?** — Decode a 4-, 5-, 16-, or 17-byte buffer as canonical IPv4, IPv6, or CIDR notation; malformed or `null` input returns `null`

### Method functions

#### General Functions

- **any.Coalesce(otherwise: any):any** — Return the receiver, or evaluate and return `otherwise` when the receiver is `null`
- **any.Equals(value: any):boolean** — Test whether the values are equal
- **any.NotEquals(value: any):boolean** — Test whether the values differ
- **(boolean | buffer | {:}).Encode():buffer** — Encode value to buffer
- **(null | timestamp | float | integer | string | [] | [:]).Encode(encoding: string?):buffer** — Encode a value; timestamps support `i32` and `i32le` minutes or `i64` and `i64le` milliseconds, while defaults are `i64` for timestamps and integers, `f64` for floats, and `utf8` for strings
- **(boolean | string | {:}).Format():string** — Format value to string
- **(null | timestamp | float | integer | buffer | [] | [:]).Format(formatting: string?):string** — Format a value; buffers use `hex` by default and also support `base64`

#### Aggregable Functions

- **float.Add(value: float):float** — Add a float
- **float.Add(value: integer):float** — Add an integer
- **integer.Add(value: float):float** — Add a float
- **integer.Add(value: integer):integer** — Add an integer
- **buffer.Add(value: buffer):buffer** — Concatenate buffers
- **string.Add(value: string):string** — Concatenate strings
- **[].Add(value: []):[]** — Concatenate arrays

#### Array Functions

- **[].First(condition: {(any, integer, []):boolean}):any** — First item satisfying condition, or `null` if none does
- **[].Last(condition: {(any, integer, []):boolean}):any** — Last item satisfying condition, or `null` if none does
- **[].FirstIndex(condition: {(any, integer, []):boolean}):integer?** — First index satisfying condition, or `null` if none does
- **[].LastIndex(condition: {(any, integer, []):boolean}):integer?** — Last index satisfying condition, or `null` if none does
- **[].Every(condition: {(any, integer, []):boolean}):boolean** — All items satisfy condition
- **[].Any(condition: {(any, integer, []):boolean}):boolean** — Any item satisfies condition
- **[].Reverse():[]** — Reversed array
- **[].Flatten(depth: integer = 1):[]** — Flatten array
- **[].Derive(transformation: {(any, integer, []):any}):[]** — Derived array
- **[].Filter(condition: {(any, integer, []):boolean}):[]** — Filtered array
- **[].Reduce(reducer: {(any, any, integer, []):any}, initial: any = null):any** — Reduced value
- **[...string].Compose(generator: {([:], string, integer, []):any}):[:]** - Compose an object from an array of string keys

`Reduce` uses `initial` as the accumulator when it is non-null. If `initial` is omitted or `null`, it starts with the
first item and raises an error for an empty array.

`Compose` builds a new object. Each callback receives a writable snapshot of the properties produced by earlier callbacks.
After the callback, the snapshot's properties and the generated property are shallow-copied into a new object.

#### Buffer Functions

- **buffer.ByteAt(pos: integer):buffer?** — One-byte slice at position; an empty slice returns a zero-length buffer

#### Enumerable Functions

- **buffer.Slice(start: integer?, end: integer?):buffer** — Slice section
- **string.Slice(start: integer?, end: integer?):string** — Slice section
- **[].Slice(start: integer?, end: integer?):[]** — Slice section
- **buffer.Splice(start: integer, remove: integer, inject: ...buffer):buffer** — Splice section
- **string.Splice(start: integer, remove: integer, inject: ...string):string** — Splice section
- **[].Splice(start: integer, remove: integer, inject: ...[]):[]** — Splice section
- **buffer.Inject(start: integer, inject: ...buffer):buffer** — Inject section
- **string.Inject(start: integer, inject: ...string):string** — Inject section
- **[].Inject(start: integer, inject: ...[]):[]** — Inject section

`Slice` includes `start` and excludes `end`; omitted bounds mean zero and the length, respectively. Negative bounds
count from the end. `Splice` removes `remove` entries at `start` and inserts the variadic arguments there;
`Inject` inserts without removing. Both return new values.

#### Iterable Functions

- **(buffer | string | [] | [:] | null).Length():integer** — Get length, or zero for `null`
- **buffer.Contains(search: buffer, startPos: integer?):boolean** — Check if buffer contains another buffer
- **string.Contains(search: string, startPos: integer?, ignoreCaseSpaceEtc: boolean?):boolean** — Check if string contains another string
- **[].Contains(search: any, startPos: integer?):boolean** — Check if array contains value
- **[:].Contains(search: any):boolean** — Check if object contains value
- **[].At(index: integer):any** — Access item in array by index
- **[:].At(index: string):any** — Access item in object by key
- **([] | null).OptionalAt(index: integer):any** — Access item by index; a `null` receiver or missing index returns `null`
- **([:] | null).OptionalAt(index: string):any** — Access item by key; a `null` receiver or missing key returns `null`
- **[].Has(index: integer):boolean** — Identify if array has index
- **[:].Has(index: string):boolean** — Identify if object has key
- **([] | null).OptionalHas(index: integer):boolean?** — Check whether an index exists; a `null` receiver returns `null`
- **([:] | null).OptionalHas(index: string):boolean?** — Check whether a key exists; a `null` receiver returns `null`

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
- **boolean.Float():float** — Convert to a float
- **timestamp.Float():float** — Convert to milliseconds since the Unix epoch
- **integer.Float():float** — Convert to a float
- **boolean.Integer():integer** — Convert to an integer
- **timestamp.Integer():integer** — Convert to milliseconds since the Unix epoch
- **float.Integer():integer** — Convert to an integer
- **timestamp.Boolean():boolean** — Test whether the epoch value is non-zero
- **float.Boolean():boolean** — Test whether the numeric value is non-zero
- **integer.Boolean():boolean** — Test whether the numeric value is non-zero

`Root` returns `null` for a nonpositive index. With integer operands, even roots of negative values also return `null`.
Floating-point root calculations can return `NaN`, which is a float.

#### Object Functions

- **[:].Entries():[]** — Key-value pairs
- **[:].Keys():[...string]** — Object keys
- **[:].Values():[]** — Object values

#### String Functions

- **string.Like(value: string):boolean** — Alphanumeric equality
- **string.NotLike(value: string):boolean** — Alphanumeric inequality
- **string.StartsWith(search: string, startPos: integer?, ignoreCaseSpaceEtc: boolean?):boolean** — Prefix check
- **string.EndsWith(search: string, endPos: integer?, ignoreCaseSpaceEtc: boolean?):boolean** — Suffix check
- **string.CharAt(pos: integer):string?** — Character at position, or `""` when out of range
- **string.CharCodeAt(pos: integer):integer?** — Character code, or `null` when unavailable
- **string.Trim():string** — Trim whitespace
- **string.TrimStart():string** — Trim leading whitespace
- **string.TrimEnd():string** — Trim trailing whitespace
- **string.LowerCase():string** — To lowercase
- **string.UpperCase():string** — To uppercase
- **string.Split(separator: string = ' '):[...string]** — Split into an array of strings
- **string.ReplaceWith(replacement: string, search: ...string):string** — Replace all instances of the searched strings

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

- `any` accepts every type, including `null`. An expression of type `any` fits every expected type except `never`.
- An expression of type `never` cannot complete with a value. The compiler rejects `never`-typed cast operands, call
  arguments, and index expressions, including in optional calls and accesses. For example, `Integer.Sum({=>7}, 1)` and
  `[10][(=>0)]` both cause compilation errors.
- An optional type such as `integer?` is the union `null | integer`. Write `null` for a type that only accepts `null`.
  Optional parameters, including `any`, accept `null` or JavaScript `undefined`. Only trailing optional parameters can be omitted.
- A call to an overloaded function must match one complete signature. A call through a union of functions must match
  one complete signature for each possible function. For typed calls, the full argument types must fit the signature
  at compile time. The first matching overload determines the result type for each callable. Implicit arguments can
  remain `any` when the overloads leave their types ambiguous. Evaluation uses the function directly.
- Record types are open structural constraints: required properties and their values are checked, while additional
  properties are allowed.
- Tuple types are prefix constraints: declared item types are checked in order, optional trailing items may be
  omitted, and additional items are allowed.
- A replacement function may require at most as many arguments as the declared signature requires.
- A callback may declare fewer parameters than the caller provides. Additional arguments are ignored at runtime,
  following JavaScript function-call behavior.
- Function parameter types are checked contravariantly where both signatures declare a parameter. The receiving
  function must accept the full expected parameter type, including `null` when present. Return types are checked
  covariantly: the returned type must fit the expected result type. `any` remains compatible with any parameter type.
- Function-type compatibility distinguishes fixed and variadic signatures. Two non-generic variadic signatures must
  declare their variadic parameter in the same position to be compatible.

For example, a callback `func(value: float):boolean { value > 0}` is compatible with an expected callback type such as
`{(any, integer, []):boolean}`. The array method supplies all three arguments, and the callback can ignore
the index and array. `any` keeps the item type flexible.

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

Casts require source and target types to overlap at compile time. At runtime, the evaluated value must satisfy the
target type.
