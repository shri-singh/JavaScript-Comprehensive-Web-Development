/**
 * Chapter 6 — Example 01: Object Basics
 *
 * Run:  node examples-node/phase-01/ch-06-objects-prototypes/01-object-basics.js
 *
 * This file demonstrates object literals, shorthand properties, computed
 * property names, method shorthand, destructuring, and the Object.keys /
 * Object.values / Object.entries static methods.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Object Literal
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 1. Object Literal ===\n");

const user = {
  name: "Alice",
  age: 30,
  isActive: true,
};

console.log("  user:", user);
console.log(`  user.name  = "${user.name}"`);
console.log(`  user["age"] = ${user["age"]}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Shorthand Properties & Methods
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 2. Shorthand Properties & Methods ===\n");

const firstName = "Bob";
const lastName = "Smith";
const role = "admin";

// When variable name matches key, just use the variable
const admin = {
  firstName,
  lastName,
  role,
  // Method shorthand — no `function` keyword needed
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  },
};

console.log("  admin:", admin);
console.log(`  admin.getFullName() = "${admin.getFullName()}"`);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Computed Property Names
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 3. Computed Property Names ===\n");

const field = "email";

const contact = {
  [field]: "alice@example.com",             // key is "email"
  [`${field}Verified`]: true,               // key is "emailVerified"
  [`preferred${field[0].toUpperCase()}${field.slice(1)}`]: "work",
};

console.log("  contact:", contact);
// { email: 'alice@example.com', emailVerified: true, preferredEmail: 'work' }

// Dynamic key from a loop
const dynamicObj = {};
for (let i = 0; i < 3; i++) {
  dynamicObj[`prop_${i}`] = i * 10;
}
console.log("  dynamicObj:", dynamicObj);

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Object Destructuring
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 4. Object Destructuring ===\n");

const product = {
  id: 42,
  title: "Widget",
  price: 9.99,
  category: "tools",
  inStock: true,
};

// Basic destructuring
const { title, price } = product;
console.log(`  title = "${title}", price = ${price}`);

// Rename variables
const { title: productName, category: cat } = product;
console.log(`  productName = "${productName}", cat = "${cat}"`);

// Default values for missing properties
const { discount = 0, currency = "USD" } = product;
console.log(`  discount = ${discount} (default), currency = "${currency}" (default)`);

// Nested destructuring
const order = {
  orderId: "A100",
  customer: {
    name: "Charlie",
    address: {
      city: "Portland",
      state: "OR",
    },
  },
};

const {
  orderId,
  customer: {
    name: customerName,
    address: { city },
  },
} = order;

console.log(`  orderId = "${orderId}", customerName = "${customerName}", city = "${city}"`);

// Destructuring in function parameters
const describeProduct = ({ title: t, price: p, inStock }) => {
  const status = inStock ? "available" : "out of stock";
  return `${t} — $${p} (${status})`;
};

console.log(`\n  describeProduct(product) = "${describeProduct(product)}"`);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Object.keys / Object.values / Object.entries
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 5. Object.keys / Object.values / Object.entries ===\n");

const car = { make: "Toyota", model: "Corolla", year: 2024 };

console.log("  Object.keys(car):   ", Object.keys(car));
console.log("  Object.values(car): ", Object.values(car));
console.log("  Object.entries(car):", Object.entries(car));

// Iterating with entries + destructuring
console.log("\n  Iterating with for...of + destructuring:");
for (const [key, value] of Object.entries(car)) {
  console.log(`    ${key} => ${value}`);
}

// Building a new object from entries
const upperCar = Object.fromEntries(
  Object.entries(car).map(([k, v]) => [k, String(v).toUpperCase()])
);
console.log("\n  upperCar (from entries):", upperCar);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Property Descriptors
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 6. Property Descriptors ===\n");

const config = {};

// Properties created via literal have all flags true
config.host = "localhost";
console.log(
  "  host descriptor:",
  Object.getOwnPropertyDescriptor(config, "host")
);

// defineProperty — omitted flags default to false
Object.defineProperty(config, "port", {
  value: 3000,
  writable: false,
  enumerable: true,
  configurable: false,
});

console.log(
  "  port descriptor:",
  Object.getOwnPropertyDescriptor(config, "port")
);

// Attempting to write to a non-writable property throws in strict mode (ESM is always strict)
try {
  config.port = 9999;
} catch (e) {
  console.log(`  config.port = 9999 threw: ${e.constructor.name}`);
}
console.log(`  config.port is still: ${config.port} (unchanged)`);

// Non-enumerable property
Object.defineProperty(config, "secret", {
  value: "s3cr3t",
  enumerable: false,
});

console.log(`\n  Object.keys(config): [${Object.keys(config)}]`);
console.log(`  config.secret (direct access): "${config.secret}"`);
console.log("  (secret exists but is hidden from Object.keys)");

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Object.freeze vs Object.seal
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 7. Object.freeze vs Object.seal ===\n");

// Freeze — no changes at all (shallow)
// In strict mode (ESM), assignments to frozen objects throw TypeError
const frozen = Object.freeze({ x: 1, y: 2 });
try { frozen.x = 100; } catch (e) { console.log(`  frozen.x = 100: ${e.constructor.name} (cannot modify)`); }
try { frozen.z = 3; }   catch (e) { console.log(`  frozen.z = 3:   ${e.constructor.name} (cannot add)`); }
console.log("  frozen after attempts:", frozen); // { x: 1, y: 2 }

// Seal — can modify values, cannot add/remove properties
const sealed = Object.seal({ x: 1, y: 2 });
sealed.x = 100;         // works — existing property, still writable
try { sealed.z = 3; }       catch (e) { console.log(`  sealed.z = 3:      ${e.constructor.name} (cannot add)`); }
try { delete sealed.y; }    catch (e) { console.log(`  delete sealed.y:   ${e.constructor.name} (cannot delete)`); }
console.log("  sealed after mutations:", sealed); // { x: 100, y: 2 }

// Shallow freeze gotcha
const nested = Object.freeze({ data: { value: 42 } });
nested.data.value = 999; // This WORKS — freeze is shallow, nested object is not frozen
console.log(`\n  nested.data.value after mutation: ${nested.data.value}`);
console.log("  (Object.freeze is shallow — nested objects are still mutable!)");

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Spread and Object.assign
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 8. Spread and Object.assign ===\n");

const defaults = { theme: "light", lang: "en", debug: false };
const userPrefs = { theme: "dark", fontSize: 16 };

// Spread — later properties win
const merged = { ...defaults, ...userPrefs };
console.log("  merged (spread):", merged);

// Object.assign — same result, mutates the first argument
const target = {};
Object.assign(target, defaults, userPrefs);
console.log("  merged (assign):", target);

// Shallow copy
const original = { a: 1, nested: { b: 2 } };
const copy = { ...original };
copy.a = 999;
copy.nested.b = 999;

console.log(`\n  original.a = ${original.a} (primitive — independent copy)`);
console.log(`  original.nested.b = ${original.nested.b} (object — shared reference!)`);

console.log("\n--- End of 01-object-basics.js ---\n");
