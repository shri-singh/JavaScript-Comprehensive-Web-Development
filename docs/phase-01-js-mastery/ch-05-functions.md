# Chapter 5 — Functions

## Learning Objectives

By the end of this chapter you will be able to:

- Distinguish between function declarations, function expressions, and arrow functions, and explain when each is appropriate.
- Describe how arrow functions inherit `this` lexically and why this matters for callbacks.
- Use default parameters and rest parameters to write flexible function signatures.
- Explain and demonstrate the IIFE (Immediately Invoked Function Expression) pattern.
- Use the callback pattern to compose asynchronous and event-driven logic.
- Control `this` binding explicitly with `call`, `apply`, and `bind`.

---

## 5.1 Function Declarations vs Expressions

### Function Declaration

A function declaration starts with the `function` keyword as the **first token** of a statement. It is hoisted entirely — you can call it before it appears in the source:

```js
greet("Alice"); // works — declarations are hoisted

function greet(name) {
  console.log(`Hello, ${name}!`);
}
```

### Function Expression

A function expression assigns a function to a variable. It follows the hoisting rules of whatever keyword you use (`var`, `let`, `const`):

```js
// sayHi(); // ReferenceError — const is in the TDZ
const sayHi = function (name) {
  console.log(`Hi, ${name}!`);
};
sayHi("Bob"); // works after the assignment
```

### Named Function Expressions

You can give a function expression a name. The name is only visible **inside** the function body (useful for recursion and stack traces):

```js
const factorial = function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1); // `fact` is available here
};
// fact(5); // ReferenceError — `fact` is not visible outside
factorial(5); // 120
```

### When to choose which

| Style | Hoisted? | Use when |
|---|---|---|
| Declaration | Yes | Top-level utility functions that should be callable anywhere in the scope |
| Expression (`const`) | No (TDZ) | You want to prevent calling before definition; assigning to a variable or passing inline |

---

## 5.2 Arrow Functions

Arrow functions provide a shorter syntax and — crucially — **lexical `this`** binding.

### Syntax variations

```js
// Full body
const add = (a, b) => {
  return a + b;
};

// Concise body (implicit return)
const multiply = (a, b) => a * b;

// Single parameter — parentheses optional
const double = n => n * 2;

// No parameters — parentheses required
const roll = () => Math.ceil(Math.random() * 6);

// Returning an object literal — wrap in parentheses
const makeUser = (name, age) => ({ name, age });
```

### Lexical `this`

Regular functions define their own `this` based on **how** they are called. Arrow functions do not — they capture `this` from the enclosing scope at the time they are defined:

```js
const team = {
  name: "Engineering",
  members: ["Alice", "Bob"],

  // Regular function — `this` refers to `team`
  printMembers() {
    // Arrow callback inherits `this` from printMembers
    this.members.forEach((member) => {
      console.log(`${member} is on ${this.name}`);
    });
  },
};
team.printMembers();
// Alice is on Engineering
// Bob is on Engineering
```

If you used a regular function instead of the arrow callback, `this` would be `undefined` (in strict mode) or the global object.

### Arrow functions cannot

- Be used as constructors (`new` throws a `TypeError`).
- Access `arguments` (use rest parameters instead).
- Be used as methods if you need dynamic `this` (e.g., in object literals where the object might be reassigned).

---

## 5.3 Default Parameters

Default parameters let you specify fallback values when an argument is `undefined` (or not provided):

```js
function greet(name = "World", greeting = "Hello") {
  console.log(`${greeting}, ${name}!`);
}

greet();                // Hello, World!
greet("Alice");         // Hello, Alice!
greet("Alice", "Hi");   // Hi, Alice!
greet(undefined, "Hey"); // Hey, World! — explicitly passing undefined triggers the default
```

Defaults are evaluated at call time, not at definition time. This means you can use expressions and even call other functions:

```js
function createId(prefix = "id", timestamp = Date.now()) {
  return `${prefix}_${timestamp}`;
}
```

---

## 5.4 Rest Parameters

The rest parameter syntax (`...name`) collects remaining arguments into a real array:

```js
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3);       // 6
sum(10, 20, 30, 40); // 100
```

Rest parameters must be the **last** parameter:

```js
function tag(first, ...rest) {
  console.log(`First: ${first}`);
  console.log(`Rest:  [${rest}]`);
}

tag("a", "b", "c"); // First: a  |  Rest: [b,c]
```

> **`arguments` vs rest:** The legacy `arguments` object is array-_like_ but not a real array. Rest parameters give you an actual `Array` with all its methods. Prefer rest parameters in modern code.

---

## 5.5 IIFE (Immediately Invoked Function Expression)

An IIFE is a function that runs the moment it is defined. It was the primary way to create a private scope before ES modules and block-scoped `let`/`const` existed:

```js
(function () {
  const secret = "hidden";
  console.log(secret); // "hidden"
})();
// secret is not accessible out here

// Arrow function IIFE
(() => {
  const another = "also hidden";
  console.log(another);
})();

// IIFE with a return value
const config = (() => {
  const env = process.env.NODE_ENV ?? "development";
  return { env, debug: env !== "production" };
})();
```

Modern use cases for IIFEs:

- Initialisation logic that should run once.
- Top-level `await` wrappers in CommonJS (before native top-level await).
- Creating isolated scopes in scripts that are not modules.

---

## 5.6 The Callback Pattern

A **callback** is a function passed as an argument to another function, to be called later:

```js
function fetchData(url, onSuccess, onError) {
  // Simulated async operation
  setTimeout(() => {
    if (url.startsWith("https")) {
      onSuccess({ data: "result from " + url });
    } else {
      onError(new Error("Only HTTPS allowed"));
    }
  }, 100);
}

fetchData(
  "https://api.example.com",
  (result) => console.log("Success:", result),
  (err) => console.error("Error:", err.message),
);
```

Callbacks are the foundation of asynchronous JavaScript. Later chapters will introduce Promises and `async`/`await`, which build on top of callbacks to solve issues like "callback hell."

### Higher-order functions

A function that takes a function as an argument or returns one is called a **higher-order function**. Array methods like `map`, `filter`, and `reduce` are everyday examples:

```js
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map((n) => n * 2);         // [2, 4, 6, 8, 10]
const evens = numbers.filter((n) => n % 2 === 0);  // [2, 4]
const total = numbers.reduce((sum, n) => sum + n, 0); // 15
```

---

## 5.7 `this` Binding — `call`, `apply`, `bind`

In JavaScript, `this` is determined by **how a function is called**, not where it is defined (except for arrow functions).

### The four `this` rules (in order of precedence)

1. **`new` binding** — `this` is the newly created object.
2. **Explicit binding** — `call`, `apply`, or `bind` set `this` to a specific object.
3. **Implicit binding** — the object before the dot: `obj.method()` → `this` is `obj`.
4. **Default binding** — in strict mode `this` is `undefined`; in sloppy mode it is the global object.

### `call` and `apply`

Both invoke a function immediately with a specified `this` value. The difference is how you pass arguments:

```js
function introduce(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const alice = { name: "Alice" };

introduce.call(alice, "Hello", "!");   // Hello, I'm Alice!
introduce.apply(alice, ["Hi", "."]);   // Hi, I'm Alice.
```

- **`call`** — arguments passed individually.
- **`apply`** — arguments passed as an array.

> **Mnemonic:** **C**all = **C**omma-separated. **A**pply = **A**rray.

### `bind`

`bind` returns a **new function** with `this` permanently set. It does not call the function:

```js
const aliceIntro = introduce.bind(alice, "Hey");
aliceIntro("!"); // Hey, I'm Alice!
aliceIntro("?"); // Hey, I'm Alice?
```

`bind` is especially useful when passing methods as callbacks:

```js
const timer = {
  seconds: 0,
  start() {
    // Without bind, `this` would be lost in the callback
    setInterval(function () {
      this.seconds++;
      console.log(this.seconds);
    }.bind(this), 1000);
  },
};
```

---

## Tricky Things & Gotchas

1. **Arrow functions and `this`** — arrow functions inherit `this` from the enclosing scope. If you define an arrow function at the top level of a module, `this` is `undefined` (in ES modules) or the module wrapper (in CommonJS).
2. **`arguments` in arrow functions** — arrow functions do not have their own `arguments` object. They inherit it from the closest non-arrow parent. Use rest parameters (`...args`) instead.
3. **Returning object literals from arrows** — `() => { name: "Alice" }` does not return an object — the braces are interpreted as a function body and `name:` is a label. Wrap in parentheses: `() => ({ name: "Alice" })`.
4. **Method shorthand loses `this` when extracted** — `const fn = obj.method; fn();` loses the implicit `this`. Use `bind` or call via the object.
5. **Default params and TDZ** — earlier parameters can be referenced by later defaults (`function f(a, b = a) {}`), but not the reverse.

---

## Best Practices

- Use `const` for function expressions to prevent accidental reassignment.
- Prefer arrow functions for short callbacks and when you need lexical `this`. Use regular functions for methods and constructors.
- Always use rest parameters (`...args`) instead of the `arguments` object.
- Provide default values for optional parameters rather than checking `undefined` manually inside the function.
- Name your functions — even function expressions benefit from a name for debugging: `const handler = function handleClick() { ... }`.
- Avoid deep callback nesting. Refactor into named functions or use Promises/async-await (covered in later chapters).

---

## Exercises

1. **Declaration vs expression.** Write the same `square(n)` function as (a) a declaration, (b) a `const` function expression, and (c) an arrow function. Call all three before their definition and explain what happens.

2. **Lexical `this`.** Create an object with a `names` array and a `printAll` method. Inside `printAll`, use `forEach` with both a regular function callback and an arrow function callback. Show that only the arrow version has the correct `this`.

3. **Default + rest combo.** Write a function `log(level = "INFO", ...messages)` that prints `[LEVEL] message1, message2, ...`. Call it with: no args, one arg, three args.

4. **IIFE config.** Use an IIFE to create a frozen configuration object with `env`, `debug`, and `version` properties. Verify the object cannot be modified after creation.

5. **Callback chain.** Write three functions: `readFile(path, callback)`, `parseJSON(text, callback)`, and `validate(data, callback)`. Chain them together to simulate reading, parsing, and validating a config file. Then observe how the nesting grows (this motivates Promises in a later chapter).

6. **`this` prediction.** Without running the code, predict what `this.name` evaluates to in each call:
   ```js
   const obj = {
     name: "Alice",
     greet() { console.log(this.name); },
     greetArrow: () => { console.log(this.name); },
   };
   obj.greet();
   obj.greetArrow();
   const fn = obj.greet;
   fn();
   fn.call({ name: "Bob" });
   ```

7. **Partial application with `bind`.** Write a generic `multiply(a, b)` function. Use `bind` to create `double` (multiply by 2) and `triple` (multiply by 3) without writing new functions.

8. **Method borrowing.** Given `const nums = { 0: "a", 1: "b", 2: "c", length: 3 }`, use `Array.prototype.join.call` to convert it to the string `"a-b-c"`.

---

## Mini-Lab

Run the example files in [`../../examples-node/phase-01/ch-05-functions/`](../../examples-node/phase-01/ch-05-functions/) to see every concept from this chapter in action:

- `01-declarations-vs-expressions.js` — declarations, expressions, named expressions, hoisting
- `02-arrow-functions.js` — syntax, lexical this, gotchas
- `03-this-binding.js` — call, apply, bind demos

```bash
node examples-node/phase-01/ch-05-functions/01-declarations-vs-expressions.js
node examples-node/phase-01/ch-05-functions/02-arrow-functions.js
node examples-node/phase-01/ch-05-functions/03-this-binding.js
```

---

## What's Next

In [Chapter 6](./ch-06-objects-prototypes.md) you will explore objects and prototypes — the backbone of JavaScript's object-oriented capabilities — including property descriptors, prototypal inheritance, and the `class` syntax.
