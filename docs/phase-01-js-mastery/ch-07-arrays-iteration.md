# Chapter 7 — Arrays and Iteration

## Learning Objectives

By the end of this chapter you will be able to:

- Create arrays with literals, `Array.from`, `Array.of`, and the spread operator.
- Transform arrays with `map`, `filter`, and `reduce` and explain when each is appropriate.
- Search arrays with `find`, `findIndex`, `includes`, `some`, and `every`.
- Flatten nested arrays with `flat` and `flatMap`.
- Explain the pitfalls of the default `sort` comparator and write correct numeric and locale-aware sorts.
- Iterate with `for...of` and explain the iterable / iterator protocol.
- Write basic generator functions and use them for lazy evaluation.

---

## 7.1 Creating Arrays

### Literals and Spread

```js
const nums = [1, 2, 3];
const copy = [...nums];           // shallow copy
const merged = [...nums, 4, 5];   // [1, 2, 3, 4, 5]
```

### Array.from

Converts any iterable or array-like object into a real array. An optional mapping function can transform elements in the same pass:

```js
Array.from("hello");                // ["h", "e", "l", "l", "o"]
Array.from({ length: 5 }, (_, i) => i * 2);  // [0, 2, 4, 6, 8]
Array.from(document.querySelectorAll("li"));  // NodeList -> Array
```

### Array.of

Creates an array from its arguments (avoids the `new Array(n)` ambiguity):

```js
Array.of(5);      // [5]   — NOT an empty array of length 5
Array.of(1, 2, 3); // [1, 2, 3]
```

---

## 7.2 Transformation Methods

These methods return **new arrays** — they do not mutate the original.

### map

Transforms every element:

```js
const names = ["alice", "bob", "charlie"];
const upper = names.map(n => n.toUpperCase()); // ["ALICE", "BOB", "CHARLIE"]
```

### filter

Keeps elements that pass a test:

```js
const nums = [1, 2, 3, 4, 5, 6];
const evens = nums.filter(n => n % 2 === 0); // [2, 4, 6]
```

### reduce

Collapses an array into a single value by accumulating from left to right:

```js
const total = [10, 20, 30].reduce((sum, n) => sum + n, 0); // 60
```

Always provide an initial value (the second argument) to avoid surprises with empty arrays.

### Chaining

Because `map` and `filter` return arrays, you can chain them:

```js
const result = [1, 2, 3, 4, 5]
  .filter(n => n % 2 !== 0)
  .map(n => n ** 2);          // [1, 9, 25]
```

---

## 7.3 Searching

| Method | Returns | Short-circuits? |
|---|---|---|
| `find(fn)` | First matching element or `undefined` | Yes |
| `findIndex(fn)` | Index of first match or `-1` | Yes |
| `includes(value)` | `true` / `false` | Yes |
| `some(fn)` | `true` if **any** element passes | Yes |
| `every(fn)` | `true` if **all** elements pass | Yes |

```js
const users = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
  { name: "Charlie", age: 35 },
];

users.find(u => u.age > 28);       // { name: "Alice", age: 30 }
users.findIndex(u => u.age > 28);  // 0
users.some(u => u.age < 20);       // false
users.every(u => u.age >= 25);     // true
```

---

## 7.4 flat and flatMap

### flat

Flattens nested arrays by a specified depth (default 1):

```js
[1, [2, [3, [4]]]].flat();          // [1, 2, [3, [4]]]
[1, [2, [3, [4]]]].flat(Infinity);  // [1, 2, 3, 4]
```

### flatMap

Equivalent to `map` followed by `flat(1)`. Useful when each element maps to zero or more output elements:

```js
const sentences = ["Hello world", "Good morning"];
const words = sentences.flatMap(s => s.split(" "));
// ["Hello", "world", "Good", "morning"]
```

---

## 7.5 Sort Gotchas

The default `sort()` converts elements to strings and compares them lexicographically. This produces surprising results with numbers:

```js
[10, 9, 80, 1].sort();              // [1, 10, 80, 9] — string sort!
[10, 9, 80, 1].sort((a, b) => a - b); // [1, 9, 10, 80] — numeric sort
```

### Locale-Aware Sorting

Use `String.prototype.localeCompare` for correct alphabetical sorting with accented characters:

```js
["banana", "apple", "cherry"].sort((a, b) => a.localeCompare(b));
```

### Sort Stability

As of ES2019, `Array.prototype.sort` is guaranteed to be **stable** — elements that compare equal retain their original relative order.

> **Important:** `sort()` mutates the original array. Create a copy first if you need to preserve the original: `[...arr].sort(...)`.

---

## 7.6 for...of and the Iterable Protocol

### for...of

`for...of` iterates over any **iterable** object — arrays, strings, Maps, Sets, generators, and any object implementing the iterable protocol:

```js
for (const char of "hello") {
  console.log(char); // h, e, l, l, o
}
```

### The Iterable Protocol

An object is iterable if it has a `[Symbol.iterator]()` method that returns an **iterator**. An iterator is an object with a `next()` method that returns `{ value, done }`:

```js
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        return current <= last
          ? { value: current++, done: false }
          : { done: true };
      },
    };
  },
};

for (const n of range) console.log(n); // 1, 2, 3, 4, 5
```

---

## 7.7 Generators

A **generator function** (declared with `function*`) returns a generator object that conforms to both the iterable and iterator protocols. `yield` pauses execution and returns a value:

```js
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();
fib.next(); // { value: 0, done: false }
fib.next(); // { value: 1, done: false }
fib.next(); // { value: 1, done: false }
fib.next(); // { value: 2, done: false }
```

Generators are **lazy** — they produce values on demand, making them ideal for infinite sequences or expensive computations.

---

## Tricky Things & Gotchas

1. **`sort()` mutates the original** — unlike `map`, `filter`, and `reduce`, `sort()` changes the array in place. Always spread first if you need immutability: `[...arr].sort(...)`.
2. **Default sort is lexicographic** — `[10, 9, 80].sort()` gives `[10, 80, 9]`. Always supply a comparator for numbers.
3. **`reduce` with no initial value** — if the array is empty and you omit the initial value, `reduce` throws a `TypeError`. Always provide an initial value.
4. **`indexOf` vs `includes` for NaN** — `[NaN].indexOf(NaN)` returns `-1`, but `[NaN].includes(NaN)` returns `true`. Prefer `includes` for presence checks.
5. **Sparse arrays** — `new Array(3)` creates `[<3 empty items>]`, not `[undefined, undefined, undefined]`. `map` skips empty slots; `Array.from` fills them with `undefined`.
6. **`flatMap` only flattens one level** — if your mapping function returns deeply nested arrays, you need an explicit `flat(depth)`.

---

## Best Practices

- Prefer `const` for arrays. `const` prevents reassignment but allows mutation — if immutability matters, use spread copies or libraries.
- Use `map`/`filter`/`reduce` instead of `for` loops for data transformations — they communicate intent more clearly.
- Always pass a comparator to `sort()` — never rely on the default string comparison.
- Prefer `for...of` over `for...in` for arrays — `for...in` iterates keys (including inherited properties) as strings, not numeric indices.
- Use `includes` instead of `indexOf !== -1` — it is clearer and handles `NaN` correctly.
- Combine `flatMap` with filtering by returning empty arrays: `arr.flatMap(x => x > 0 ? [x] : [])`.

---

## Exercises

1. **Array creation drill.** Use `Array.from` to create: (a) an array of integers 1 to 20, (b) an array of 10 random numbers, (c) a copy of a string split into characters.

2. **Chain challenge.** Given an array of product objects `{ name, price, inStock }`, write a single chain that filters to in-stock items, maps to `"name: $price"` strings, and sorts alphabetically.

3. **Reduce to object.** Use `reduce` to convert `[["a", 1], ["b", 2], ["c", 3]]` into `{ a: 1, b: 2, c: 3 }`.

4. **Group by.** Implement `groupBy(arr, keyFn)` using `reduce` that groups array elements by the result of `keyFn`. Example: `groupBy([1,2,3,4,5], n => n % 2 === 0 ? "even" : "odd")` returns `{ odd: [1,3,5], even: [2,4] }`.

5. **Sort investigation.** Create an array of 5 strings with accented characters (e.g., French or Spanish names). Sort them with the default `sort()`, then with `localeCompare`. Show the difference.

6. **Custom iterable.** Create a `Range` class that is iterable and yields integers from `start` to `end`. Verify it works with `for...of`, spread, and `Array.from`.

7. **Lazy generator.** Write a generator `function* take(n, iterable)` that yields the first `n` items from any iterable. Use it with an infinite Fibonacci generator to get the first 15 Fibonacci numbers.

8. **flatMap filtering.** Given a list of sentences, use `flatMap` to extract all words longer than 4 characters in a single expression (no intermediate variables).

---

## Mini-Lab

Run the example files in [`../../examples-node/phase-01/ch-07-arrays-iteration/`](../../examples-node/phase-01/ch-07-arrays-iteration/) to see every concept from this chapter in action:

- `01-array-methods.js` — map, filter, reduce, find, some, every, flat
- `02-sort-gotchas.js` — numeric sort, locale sort, sort stability
- `03-iterators-generators.js` — custom iterable, generator function, lazy evaluation

```bash
node examples-node/phase-01/ch-07-arrays-iteration/01-array-methods.js
node examples-node/phase-01/ch-07-arrays-iteration/02-sort-gotchas.js
node examples-node/phase-01/ch-07-arrays-iteration/03-iterators-generators.js
```

---

## What's Next

In [Chapter 8](./ch-08-modern-syntax.md) you will learn the modern syntax features that make everyday JavaScript more concise and expressive — destructuring, spread/rest, optional chaining, nullish coalescing, and more.
