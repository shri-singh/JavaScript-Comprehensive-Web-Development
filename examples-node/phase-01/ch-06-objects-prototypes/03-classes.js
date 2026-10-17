/**
 * Chapter 6 — Example 03: Classes
 *
 * Run:  node examples-node/phase-01/ch-06-objects-prototypes/03-classes.js
 *
 * This file demonstrates ES6 class syntax including constructors, instance
 * methods, static methods, inheritance with extends/super, private fields,
 * getters/setters, and the composition pattern as an alternative to deep
 * inheritance.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Basic Class Syntax
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 1. Basic Class Syntax ===\n");

class Animal {
  // Constructor — called when you use `new Animal(...)`
  constructor(name, sound) {
    this.name = name;
    this.sound = sound;
  }

  // Instance method — lives on Animal.prototype
  speak() {
    return `${this.name} says ${this.sound}`;
  }

  // Static method — lives on the class itself, not on instances
  static kingdom() {
    return "Animalia";
  }

  // toString override
  toString() {
    return `[Animal: ${this.name}]`;
  }
}

const cat = new Animal("Whiskers", "meow");
console.log(`  cat.speak() = "${cat.speak()}"`);
console.log(`  Animal.kingdom() = "${Animal.kingdom()}"`);
console.log(`  String(cat) = "${String(cat)}"`);
console.log(`  typeof Animal = "${typeof Animal}" (classes are functions)`);

// Classes enforce `new` — calling without it throws TypeError
try {
  Animal("Oops", "error"); // eslint-disable-line new-cap
} catch (e) {
  console.log(`  Animal() without new: ${e.constructor.name} — ${e.message}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Inheritance with extends & super
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 2. Inheritance with extends & super ===\n");

class Dog extends Animal {
  constructor(name, breed) {
    // super() MUST be called before `this` in a derived class
    super(name, "woof");
    this.breed = breed;
  }

  // Override parent method
  speak() {
    return `${this.name} barks: ${this.sound}! (${this.breed})`;
  }

  // Call parent method via super
  parentSpeak() {
    return super.speak();
  }

  fetch(item) {
    return `${this.name} fetches the ${item}`;
  }
}

const rex = new Dog("Rex", "Labrador");
console.log(`  rex.speak()       = "${rex.speak()}"`);
console.log(`  rex.parentSpeak() = "${rex.parentSpeak()}"`);
console.log(`  rex.fetch("ball") = "${rex.fetch("ball")}"`);

// instanceof checks the whole chain
console.log(`\n  rex instanceof Dog:    ${rex instanceof Dog}`);
console.log(`  rex instanceof Animal: ${rex instanceof Animal}`);
console.log(`  rex instanceof Object: ${rex instanceof Object}`);

// Static methods are inherited too
console.log(`  Dog.kingdom() = "${Dog.kingdom()}" (inherited static)`);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Getters and Setters
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 3. Getters and Setters ===\n");

class Temperature {
  constructor(celsius) {
    this._celsius = celsius;
  }

  // Getter — accessed like a property, not a method call
  get fahrenheit() {
    return this._celsius * 9 / 5 + 32;
  }

  // Setter — assigned like a property
  set fahrenheit(f) {
    this._celsius = (f - 32) * 5 / 9;
  }

  get celsius() {
    return this._celsius;
  }

  set celsius(c) {
    if (c < -273.15) throw new RangeError("Below absolute zero");
    this._celsius = c;
  }
}

const temp = new Temperature(100);
console.log(`  100 C = ${temp.fahrenheit} F`);

temp.fahrenheit = 32;
console.log(`  32 F  = ${temp.celsius} C`);

try {
  temp.celsius = -300;
} catch (e) {
  console.log(`  Setting -300 C: ${e.constructor.name} — ${e.message}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Private Fields (ES2022+)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 4. Private Fields ===\n");

class BankAccount {
  // Private fields — prefixed with #
  #balance;
  #owner;

  constructor(owner, initialBalance = 0) {
    this.#owner = owner;
    this.#balance = initialBalance;
  }

  deposit(amount) {
    if (amount <= 0) throw new RangeError("Deposit must be positive");
    this.#balance += amount;
    return this;
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new RangeError("Insufficient funds");
    this.#balance -= amount;
    return this;
  }

  get balance() {
    return this.#balance;
  }

  get owner() {
    return this.#owner;
  }

  toString() {
    return `[Account: ${this.#owner}, balance: $${this.#balance.toFixed(2)}]`;
  }
}

const account = new BankAccount("Alice", 100);
account.deposit(50).withdraw(30); // method chaining

console.log(`  ${account}`);
console.log(`  account.balance = ${account.balance} (via getter)`);

// Private fields are truly inaccessible from outside
try {
  // This would be a SyntaxError if written literally: account.#balance
  // We can demonstrate the concept instead:
  console.log(`  account.balance (public getter): ${account.balance}`);
  console.log("  account.#balance would cause SyntaxError if written outside the class");
} catch (e) {
  console.log(`  Error: ${e.message}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Static Methods and Properties
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 5. Static Methods and Properties ===\n");

class MathUtils {
  // Static property
  static PI = 3.14159265358979;

  // Static methods — utility functions that do not need an instance
  static circleArea(radius) {
    return MathUtils.PI * radius ** 2;
  }

  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  static lerp(a, b, t) {
    return a + (b - a) * t;
  }
}

console.log(`  MathUtils.PI = ${MathUtils.PI}`);
console.log(`  MathUtils.circleArea(5) = ${MathUtils.circleArea(5).toFixed(2)}`);
console.log(`  MathUtils.clamp(15, 0, 10) = ${MathUtils.clamp(15, 0, 10)}`);
console.log(`  MathUtils.lerp(0, 100, 0.75) = ${MathUtils.lerp(0, 100, 0.75)}`);

// Static methods cannot be called on instances
const mu = new MathUtils();
console.log(`\n  typeof mu.circleArea = "${typeof mu.circleArea}" (not available on instances)`);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Classes Are Still Prototypes Under the Hood
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 6. Classes = Prototypes Under the Hood ===\n");

console.log(`  typeof Animal = "${typeof Animal}"`);
console.log(`  Animal.prototype.speak === cat.speak: ${Animal.prototype.speak === cat.speak}`);
console.log(`  Object.getPrototypeOf(rex) === Dog.prototype: ${Object.getPrototypeOf(rex) === Dog.prototype}`);
console.log(`  Object.getPrototypeOf(Dog.prototype) === Animal.prototype: ${Object.getPrototypeOf(Dog.prototype) === Animal.prototype}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Composition vs Inheritance
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 7. Composition vs Inheritance ===\n");

// Problem: What if you need a FlyingFish? Fish extends Animal, Bird extends Animal,
// but JS only supports single inheritance. Composition solves this.

// Behaviour factories — each adds a capability
const canSwim = (state) => ({
  swim() {
    return `${state.name} is swimming`;
  },
});

const canFly = (state) => ({
  fly() {
    return `${state.name} is flying at ${state.altitude ?? "low"} altitude`;
  },
});

const canWalk = (state) => ({
  walk() {
    return `${state.name} is walking`;
  },
});

// Factory function that composes behaviours
const createDuck = (name) => {
  const state = { name, altitude: "low" };
  return {
    name,
    ...canSwim(state),
    ...canFly(state),
    ...canWalk(state),
    quack() {
      return `${name} says quack!`;
    },
  };
};

const createFlyingFish = (name) => {
  const state = { name, altitude: "very low" };
  return {
    name,
    ...canSwim(state),
    ...canFly(state),
  };
};

const donald = createDuck("Donald");
console.log(`  ${donald.swim()}`);
console.log(`  ${donald.fly()}`);
console.log(`  ${donald.walk()}`);
console.log(`  ${donald.quack()}`);

const nemo = createFlyingFish("Nemo");
console.log(`\n  ${nemo.swim()}`);
console.log(`  ${nemo.fly()}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Mixin Pattern (class-based composition)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 8. Mixin Pattern ===\n");

// A mixin is a function that takes a base class and returns a new class
const Serializable = (Base) =>
  class extends Base {
    toJSON() {
      // Collect all own enumerable properties
      return { ...this };
    }

    static fromJSON(json) {
      const data = typeof json === "string" ? JSON.parse(json) : json;
      return Object.assign(new this(), data);
    }
  };

const Timestamped = (Base) =>
  class extends Base {
    constructor(...args) {
      super(...args);
      this.createdAt = new Date().toISOString();
    }
  };

// Apply mixins to a base class
class BaseUser {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

class User extends Timestamped(Serializable(BaseUser)) {}

const userInstance = new User("Alice", "alice@example.com");
console.log("  user:", userInstance);
console.log("  user.toJSON():", userInstance.toJSON());

const jsonStr = JSON.stringify(userInstance);
console.log(`  JSON.stringify: ${jsonStr}`);

console.log("\n--- End of 03-classes.js ---\n");
