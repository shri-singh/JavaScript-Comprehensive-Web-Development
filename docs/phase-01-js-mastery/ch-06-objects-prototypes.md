# Chapter 6 — Objects, Prototypes, and Classes

## Learning Objectives

By the end of this chapter you will be able to:

- Create objects using literals with shorthand properties, computed property names, and method shorthand.
- Enumerate object contents with `Object.keys`, `Object.values`, and `Object.entries`.
- Explain property descriptors and use `Object.defineProperty` to control writability, enumerability, and configurability.
- Trace the prototype chain and explain how property lookup works via `[[Prototype]]`.
- Create objects with explicit prototypes using `Object.create` and constructor functions.
- Write ES6 classes with constructors, instance methods, static methods, and inheritance (`extends` / `super`).
- Compare composition and inheritance and articulate when each is preferable.

---

## 6.1 Object Literals

An object literal is the most common way to create an object in JavaScript. It is a comma-separated list of `key: value` pairs inside braces:

```js
const user = {
  name: "Alice",
  age: 30,
  isActive: true,
};
```

### Shorthand Properties

When a variable name matches the key, you can omit the colon:

```js
const name = "Bob";
const age = 25;
const user = { name, age }; // { name: "Bob", age: 25 }
```

### Computed Property Names

Wrap an expression in square brackets to compute the key at runtime:

```js
const field = "email";
const user = {
  [field]: "alice@example.com",        // key is "email"
  [`${field}Verified`]: true,          // key is "emailVerified"
};
```

### Method Shorthand

You can define methods without the `function` keyword:

```js
const calc = {
  add(a, b) { return a + b; },
  subtract(a, b) { return a - b; },
};
```

---

## 6.2 Enumerating Object Contents

Three static methods return arrays derived from an object's **own, enumerable, string-keyed** properties:

| Method | Returns |
|---|---|
| `Object.keys(obj)` | Array of key strings |
| `Object.values(obj)` | Array of values |
| `Object.entries(obj)` | Array of `[key, value]` pairs |

```js
const car = { make: "Toyota", model: "Corolla", year: 2024 };

Object.keys(car);    // ["make", "model", "year"]
Object.values(car);  // ["Toyota", "Corolla", 2024]
Object.entries(car); // [["make","Toyota"], ["model","Corolla"], ["year",2024]]
```

`Object.entries` is particularly useful with `for...of` and destructuring:

```js
for (const [key, value] of Object.entries(car)) {
  console.log(`${key}: ${value}`);
}
```

---

## 6.3 Property Descriptors

Every property has a **descriptor** that controls its behaviour beyond the value itself:

| Attribute | Default (literal) | Meaning |
|---|---|---|
| `value` | the assigned value | The property's value |
| `writable` | `true` | Can the value be changed? |
| `enumerable` | `true` | Does it show up in `for...in` / `Object.keys`? |
| `configurable` | `true` | Can the descriptor be changed / property deleted? |

```js
const obj = { x: 10 };
console.log(Object.getOwnPropertyDescriptor(obj, "x"));
// { value: 10, writable: true, enumerable: true, configurable: true }

Object.defineProperty(obj, "y", {
  value: 20,
  writable: false,      // read-only
  enumerable: false,     // hidden from Object.keys
  configurable: false,   // locked — cannot redefine or delete
});
```

Use `Object.freeze(obj)` as a shortcut to make all existing properties non-writable and non-configurable (shallow freeze only).

---

## 6.4 Prototypal Inheritance

Every JavaScript object has a hidden internal link called `[[Prototype]]` (accessible via `Object.getPrototypeOf(obj)` or the legacy `__proto__`). When you read a property that does not exist on the object itself, the engine walks up the **prototype chain** until it finds the property or reaches `null`.

```
myObj  -->  myObj.[[Prototype]]  -->  ...  -->  Object.prototype  -->  null
```

### `Object.create`

Creates a new object whose `[[Prototype]]` is the object you specify:

```js
const animal = {
  speak() { return `${this.name} makes a sound`; },
};

const dog = Object.create(animal);
dog.name = "Rex";
dog.speak(); // "Rex makes a sound" — found via prototype chain
```

### Constructor Functions (pre-ES6)

A constructor is a regular function called with `new`. By convention, constructors start with an uppercase letter:

```js
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.greet = function () {
  return `Hi, I'm ${this.name}`;
};

const alice = new Person("Alice", 30);
alice.greet();           // "Hi, I'm Alice"
alice instanceof Person; // true
```

When you call `new Person(...)`:

1. A new empty object is created.
2. Its `[[Prototype]]` is set to `Person.prototype`.
3. The constructor body runs with `this` bound to the new object.
4. The new object is returned (unless the constructor explicitly returns a different object).

---

## 6.5 ES6 Classes

The `class` keyword is syntactic sugar over the prototype system. It provides a cleaner, more familiar syntax but does not introduce a new inheritance model:

```js
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} makes a sound`;
  }

  static kingdom() {
    return "Animalia";
  }
}
```

### Instance Methods vs Static Methods

- **Instance methods** live on `Animal.prototype` and are shared by all instances.
- **Static methods** live on the class itself (`Animal.kingdom()`) and cannot be called on instances.

### Inheritance with `extends` and `super`

```js
class Dog extends Animal {
  constructor(name, breed) {
    super(name);       // MUST call super before using `this`
    this.breed = breed;
  }

  speak() {
    return `${this.name} barks`;
  }
}

const rex = new Dog("Rex", "Labrador");
rex.speak();                // "Rex barks"
rex instanceof Dog;         // true
rex instanceof Animal;      // true
Animal.kingdom();           // "Animalia"
```

### Private Fields (ES2022+)

Prefix a field name with `#` to make it truly private:

```js
class BankAccount {
  #balance = 0;

  deposit(amount) { this.#balance += amount; }
  get balance() { return this.#balance; }
}
```

---

## 6.6 Composition vs Inheritance

Inheritance creates an **is-a** relationship (`Dog` is an `Animal`). Composition creates a **has-a** relationship by combining small, focused objects or functions:

```js
// Composition — mix capabilities into any object
const canSwim = (obj) => ({
  ...obj,
  swim() { return `${obj.name} is swimming`; },
});

const canFly = (obj) => ({
  ...obj,
  fly() { return `${obj.name} is flying`; },
});

const duck = canSwim(canFly({ name: "Donald" }));
duck.swim(); // "Donald is swimming"
duck.fly();  // "Donald is flying"
```

**When to prefer composition:**

- You need to combine behaviours from multiple sources (JavaScript only supports single inheritance).
- The relationship is not a natural "is-a" hierarchy.
- You want to avoid deep inheritance trees that become brittle over time.

---

## Tricky Things & Gotchas

1. **`for...in` enumerates inherited properties** — always use `Object.keys` or `hasOwnProperty` when iterating if you only want own properties.
2. **`typeof null === "object"`** — this is a historical bug in JavaScript. Use strict equality (`=== null`) to check for null.
3. **Object spread is shallow** — `{ ...obj }` copies only one level deep. Nested objects still share references.
4. **Forgetting `new` with a constructor** — calling a constructor without `new` sets `this` to `undefined` (strict mode) or the global object. Classes enforce `new` automatically and throw a `TypeError` if you forget.
5. **`super()` must come before `this`** — in a derived class constructor, accessing `this` before calling `super()` throws a `ReferenceError`.
6. **Property descriptors default to `false`** — when using `Object.defineProperty`, omitted descriptor attributes default to `false`, not `true` as they would be in a literal.

---

## Best Practices

- Prefer object literals and shorthand syntax for simple data objects.
- Use `Object.freeze` for configuration objects that must not change.
- Prefer `class` over constructor functions for clarity, but remember it is still prototypes under the hood.
- Keep inheritance hierarchies shallow (one or two levels). Favour composition for complex behaviour mixing.
- Use `#private` fields over naming conventions (like `_name`) for true encapsulation.
- Use `Object.keys` / `Object.entries` instead of `for...in` to avoid inherited-property surprises.

---

## Exercises

1. **Computed properties.** Write a function `buildLookup(keys, values)` that takes two arrays and returns an object mapping each key to the corresponding value. Use computed property names inside a loop or `reduce`.

2. **Property descriptors.** Create an object with a `version` property that is readable but not writable and not enumerable. Demonstrate that it does not appear in `Object.keys` but can still be read directly.

3. **Prototype chain walk.** Given `const child = Object.create(Object.create({ a: 1 }))`, manually trace the prototype chain. At which level does `child.a` resolve? Verify with `Object.getPrototypeOf`.

4. **Class hierarchy.** Create a `Shape` base class with a `color` property and an `area()` method that throws "not implemented". Derive `Circle` and `Rectangle` classes that override `area()`. Include a static `Shape.describe()` method.

5. **Composition challenge.** Implement `withLogger`, `withValidator`, and `withTimestamp` factory functions that each add behaviour to a plain object. Compose them together to create an "enhanced" data object.

6. **Frozen vs sealed.** Create an object and apply `Object.seal` to it. Demonstrate which operations succeed and which fail. Then do the same with `Object.freeze`. Summarise the difference.

7. **Private fields.** Rewrite a `Counter` class using `#count` private field. Add `increment()`, `decrement()`, and a `value` getter. Show that accessing `#count` from outside throws.

8. **Mixin pattern.** Write a `Serializable` mixin (a function that takes a class and returns a new class) adding `toJSON()` and `static fromJSON()` methods. Apply it to a `User` class.

---

## Mini-Lab

Run the example files in [`../../examples-node/phase-01/ch-06-objects-prototypes/`](../../examples-node/phase-01/ch-06-objects-prototypes/) to see every concept from this chapter in action:

- `01-object-basics.js` — literals, computed props, destructuring, Object.keys/values/entries
- `02-prototypes.js` — prototype chain, Object.create, instanceof
- `03-classes.js` — class syntax, extends, super, static methods, composition example

```bash
node examples-node/phase-01/ch-06-objects-prototypes/01-object-basics.js
node examples-node/phase-01/ch-06-objects-prototypes/02-prototypes.js
node examples-node/phase-01/ch-06-objects-prototypes/03-classes.js
```

---

## What's Next

In [Chapter 7](./ch-07-arrays-iteration.md) you will master arrays and iteration — from everyday methods like `map`, `filter`, and `reduce` to the iterator protocol and generators.
