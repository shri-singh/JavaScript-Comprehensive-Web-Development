/**
 * Chapter 6 — Example 02: Prototypes
 *
 * Run:  node examples-node/phase-01/ch-06-objects-prototypes/02-prototypes.js
 *
 * This file demonstrates the prototype chain, Object.create, constructor
 * functions, instanceof, and how property lookup traverses [[Prototype]].
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. The Prototype Chain
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 1. The Prototype Chain ===\n");

const base = { role: "base" };
const middle = Object.create(base);
middle.level = "middle";
const child = Object.create(middle);
child.name = "child";

// Property lookup walks: child -> middle -> base -> Object.prototype -> null
console.log(`  child.name  = "${child.name}"`);   // own property
console.log(`  child.level = "${child.level}"`);   // found on middle
console.log(`  child.role  = "${child.role}"`);    // found on base

// Tracing the chain manually
console.log("\n  Prototype chain of 'child':");
let current = child;
let depth = 0;
while (current !== null) {
  const ownKeys = Object.getOwnPropertyNames(current);
  console.log(`    [${depth}] own keys: [${ownKeys.join(", ")}]`);
  current = Object.getPrototypeOf(current);
  depth++;
}
console.log(`    [${depth}] null (end of chain)`);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Object.create
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 2. Object.create ===\n");

const animal = {
  type: "Animal",
  speak() {
    return `${this.name} makes a sound`;
  },
};

const dog = Object.create(animal);
dog.name = "Rex";
dog.breed = "Labrador";

console.log(`  dog.speak() = "${dog.speak()}"`);
console.log(`  dog.type    = "${dog.type}" (inherited)`);
console.log(`  dog.hasOwnProperty("name")  = ${dog.hasOwnProperty("name")}`);
console.log(`  dog.hasOwnProperty("type")  = ${dog.hasOwnProperty("type")}`);
console.log(`  dog.hasOwnProperty("speak") = ${dog.hasOwnProperty("speak")}`);

// Object.create(null) — no prototype at all (no toString, hasOwnProperty, etc.)
const bare = Object.create(null);
bare.key = "value";
console.log(`\n  bare = Object.create(null)`);
console.log(`  bare.key = "${bare.key}"`);
console.log(`  Object.getPrototypeOf(bare) = ${Object.getPrototypeOf(bare)}`); // null
// bare.toString(); // Would throw TypeError — no prototype methods

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Property Shadowing
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 3. Property Shadowing ===\n");

const parent = { greeting: "Hello from parent" };
const childObj = Object.create(parent);

console.log(`  Before shadowing: childObj.greeting = "${childObj.greeting}"`);

// Setting a property on childObj creates an OWN property that shadows the inherited one
childObj.greeting = "Hello from child";
console.log(`  After shadowing:  childObj.greeting = "${childObj.greeting}"`);
console.log(`  parent.greeting is unchanged: "${parent.greeting}"`);

// Deleting the own property reveals the inherited one again
delete childObj.greeting;
console.log(`  After delete:     childObj.greeting = "${childObj.greeting}"`);

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Constructor Functions (pre-ES6 pattern)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 4. Constructor Functions ===\n");

function Person(name, age) {
  // `this` is the newly created object when called with `new`
  this.name = name;
  this.age = age;
}

// Methods go on the prototype — shared by all instances
Person.prototype.greet = function () {
  return `Hi, I'm ${this.name}, age ${this.age}`;
};

Person.prototype.species = "Homo sapiens";

const alice = new Person("Alice", 30);
const bob = new Person("Bob", 25);

console.log(`  alice.greet() = "${alice.greet()}"`);
console.log(`  bob.greet()   = "${bob.greet()}"`);

// Both share the same prototype method
console.log(`\n  alice.greet === bob.greet: ${alice.greet === bob.greet}`);
console.log(`  alice.species: "${alice.species}"`);

// The constructor property
console.log(`  alice.constructor === Person: ${alice.constructor === Person}`);

// What `new` does behind the scenes:
console.log("\n  What `new Person('X', 1)` does:");
console.log("    1. Creates a new empty object {}");
console.log("    2. Sets its [[Prototype]] to Person.prototype");
console.log("    3. Runs Person() with `this` = new object");
console.log("    4. Returns the new object");

// ═══════════════════════════════════════════════════════════════════════════════
// 5. instanceof
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 5. instanceof ===\n");

console.log(`  alice instanceof Person: ${alice instanceof Person}`);
console.log(`  alice instanceof Object: ${alice instanceof Object}`);

// instanceof checks if Constructor.prototype exists anywhere in the prototype chain
const arr = [1, 2, 3];
console.log(`  [1,2,3] instanceof Array:  ${arr instanceof Array}`);
console.log(`  [1,2,3] instanceof Object: ${arr instanceof Object}`);

// Object.create does not use a constructor, but instanceof still works
// if the prototype matches
function Vehicle(type) {
  this.type = type;
}
const car = Object.create(Vehicle.prototype);
console.log(`\n  car = Object.create(Vehicle.prototype)`);
console.log(`  car instanceof Vehicle: ${car instanceof Vehicle}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Prototype Inheritance Chain (constructor pattern)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 6. Constructor-Based Inheritance ===\n");

function Animal2(name) {
  this.name = name;
}

Animal2.prototype.speak = function () {
  return `${this.name} makes a generic sound`;
};

function Dog2(name, breed) {
  Animal2.call(this, name); // call parent constructor
  this.breed = breed;
}

// Set up the prototype chain: Dog2 -> Animal2
Dog2.prototype = Object.create(Animal2.prototype);
Dog2.prototype.constructor = Dog2; // fix the constructor reference

// Override the inherited method
Dog2.prototype.speak = function () {
  return `${this.name} barks (breed: ${this.breed})`;
};

const rex = new Dog2("Rex", "Labrador");

console.log(`  rex.speak() = "${rex.speak()}"`);
console.log(`  rex instanceof Dog2:    ${rex instanceof Dog2}`);
console.log(`  rex instanceof Animal2: ${rex instanceof Animal2}`);
console.log(`  rex instanceof Object:  ${rex instanceof Object}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 7. for...in vs Object.keys (inherited property pitfall)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 7. for...in vs Object.keys ===\n");

const proto = { inherited: "from proto" };
const obj = Object.create(proto);
obj.own = "my own property";

console.log("  for...in iterates inherited properties too:");
for (const key in obj) {
  const source = obj.hasOwnProperty(key) ? "own" : "inherited";
  console.log(`    ${key} (${source})`);
}

console.log("\n  Object.keys only returns own enumerable properties:");
console.log(`    Object.keys(obj) = [${Object.keys(obj)}]`);

console.log("\n--- End of 02-prototypes.js ---\n");
