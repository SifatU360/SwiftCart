# JavaScript প্রশ্নোত্তর

## ১) `null` এবং `undefined` এর মধ্যে পার্থক্য কী?

**`undefined`**: 
- যখন কোনো ভেরিয়েবল ডিক্লেয়ার করা হয় কিন্তু তাতে কোনো মান assign করা হয় না, তখন এটি `undefined` হয়।
- এটি JavaScript নিজে থেকে automatic ভাবে set করে।
- ফাংশনে কোনো রিটার্ন স্টেটমেন্ট না থাকলে বা কোনো প্যারামিটার pass না করলেও `undefined` পাওয়া যায়।

```javascript
let name;
console.log(name); // undefined

function test() {}
console.log(test()); // undefined
```

**`null`**: 
- `null` হলো একটি intentional empty value যা developer নিজে set করে।
- এটি বোঝায় যে, ভেরিয়েবলে কোনো মান নেই ।
- `null` একটি object type (যদিও এটি একটি primitive value)।

```javascript
let user = null; // উদ্দেশ্যমূলকভাবে খালি
console.log(user); // null
```

**মূল পার্থক্য**:
- `undefined` মানে হলো মান এখনো set হয়নি
- `null` মানে হলো মান intentionally খালি রাখা হয়েছে

---

## ২) JavaScript এ `map()` ফাংশনের ব্যবহার কী? এটি `forEach()` থেকে কিভাবে আলাদা?

**`map()` ফাংশন**:
- `map()` একটি array এর প্রতিটি element এ একটি ফাংশন apply করে এবং একটি **নতুন array রিটার্ন করে**।
- Original array পরিবর্তন হয় না।
- প্রতিটি element কে transform করে নতুন একটি array তৈরি করতে ব্যবহৃত হয়।

```javascript
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]
console.log(numbers); // [1, 2, 3, 4, 5] - original array অপরিবর্তিত
```

**`forEach()` ফাংশন**:
- `forEach()` শুধুমাত্র array এর প্রতিটি element এ একটি ফাংশন execute করে।
- এটি কিছুই return করে না (`undefined` return করে)।
- Side effects তৈরি করতে বা কোনো কাজ করতে ব্যবহৃত হয় যেখানে নতুন array এর প্রয়োজন নেই।

```javascript
const numbers = [1, 2, 3, 4, 5];
const result = numbers.forEach(num => console.log(num * 2));
// Console এ: 2, 4, 6, 8, 10
console.log(result); // undefined
```

**মূল পার্থক্য**:
| বৈশিষ্ট্য | `map()` | `forEach()` |
|---------|---------|-------------|
| Return value | নতুন array রিটার্ন করে | `undefined` রিটার্ন করে |
| ব্যবহার | Data transform করতে | Side effects এর জন্য |
| Chainable | হ্যাঁ (method chaining করা যায়) | না |

---

## ৩) `==` এবং `===` এর মধ্যে পার্থক্য কী?

**`==` (Loose Equality / Abstract Equality)**:
- শুধুমাত্র value তুলনা করে, type তুলনা করে না।
- Type coercion করে (একটি type কে অন্য type এ convert করে তারপর তুলনা করে)।

```javascript
5 == "5"      // true (string কে number এ convert করে)
0 == false    // true (false কে 0 এ convert করে)
null == undefined  // true
"" == 0       // true
```

**`===` (Strict Equality)**:
- Value এবং type উভয়ই তুলনা করে।
- কোনো type coercion করে না।
- নিরাপদ এবং recommended।

```javascript
5 === "5"     // false (type আলাদা: number vs string)
0 === false   // false (type আলাদা: number vs boolean)
null === undefined  // false
"" === 0      // false
5 === 5       // true (value এবং type উভয়ই same)
```

সবসময় `===` ব্যবহার করা উচিত কারণ এটি আরো predictable এবং bugs কম হয়।

---

## ৪) API data fetch করার ক্ষেত্রে `async/await` এর গুরুত্ব কী?

**`async/await` এর সুবিধা**:

**১. Readability**:
- Code synchronous এর মতো দেখায়, যদিও এটি asynchronous।
- Promise chain এর `.then()` এর চেয়ে অনেক বেশি readable।

```javascript
// Promise chain (.then())
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));

// async/await 
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
```

**২. Error Handling**:
- `try...catch` block ব্যবহার করে সহজে error handle করা যায়।
- Synchronous এবং asynchronous error একসাথে handle করা যায়।

**৩. Sequential Operations**:
- একাধিক API call যেগুলো একে অপরের উপর নির্ভরশীল, সেগুলো সহজে handle করা যায়।

```javascript
async function getUserData() {
  try {
    const userResponse = await fetch('/api/user');
    const user = await userResponse.json();
    
    // প্রথম API call এর result ব্যবহার করে দ্বিতীয় call
    const postsResponse = await fetch(`/api/posts/${user.id}`);
    const posts = await postsResponse.json();
    
    return { user, posts };
  } catch (error) {
    console.error('Error:', error);
  }
}
```

**৪. Debugging সহজ**:
- Stack trace আরো clear হয়।
- Breakpoint set করে step-by-step debug করা সহজ।

**গুরুত্বপূর্ণ**:
- `await` শুধুমাত্র `async` function এর ভিতরে ব্যবহার করতে হয়।
- `async` function সবসময় একটি Promise return করে।

---

## ৫) JavaScript এ Scope এর ধারণা ব্যাখ্যা করুন (Global, Function, Block)

**Scope** মানে হলো কোনো variable কোথায় accessible হবে তার পরিসীমা।

### **১. Global Scope**:
- কোনো function বা block এর বাইরে declare করা variable গ্লোবাল scope এ থাকে।
- এই variable পুরো program এ যেকোনো জায়গা থেকে access করা যায়।

```javascript
const globalVar = "I am global";

function test() {
  console.log(globalVar); // access করা যাবে
}

test(); // "I am global"
console.log(globalVar); // "I am global"
```

**Problem**: 
- Global variable অনেক জায়গা থেকে modify হতে পারে, যা bugs তৈরি করতে পারে।
- Naming collision হতে পারে।

### **২. Function Scope**:
- Function এর ভিতরে declare করা variable শুধুমাত্র সেই function এর মধ্যে accessible।
- `var` keyword function scope তৈরি করে।

```javascript
function myFunction() {
  var functionVar = "I am in function";
  console.log(functionVar); // কাজ করবে
}

myFunction();
console.log(functionVar); // Error: functionVar is not defined
```

### **৩. Block Scope**:
- `{}` curly braces এর ভিতরে declare করা variable block scope এ থাকে।
- `let` এবং `const` keyword block scope তৈরি করে।
- `if`, `for`, `while` ইত্যাদির ভিতরে ব্যবহৃত হয়।

```javascript
if (true) {
  let blockVar = "I am in Block";
  const anotherBlockVar = "I am also";
  console.log(blockVar); // কাজ করবে
}

console.log(blockVar); // Error: blockVar is not defined
```

**`var` vs `let`/`const`**:

```javascript
// var - function scoped (block scope মানে না)
if (true) {
  var varVariable = "var ব্যবহার";
}
console.log(varVariable); // কাজ করবে (but সমস্যা!)

// let/const - block scoped
if (true) {
  let letVariable = "let ব্যবহার";
}
console.log(letVariable); // Error
```

**Nested Scope (নেস্টেড স্কোপ)**:
- Inner scope থেকে outer scope এর variable access করা যায়।
- কিন্তু outer scope থেকে inner scope এর variable access করা যায় না।

```javascript
const outer = "বাইরের";

function outerFunction() {
  const middle = "মাঝের";
  
  function innerFunction() {
    const inner = "ভিতরের";
    console.log(outer);  // access করা যাবে
    console.log(middle); // access করা যাবে
    console.log(inner);  // access করা যাবে
  }
  
  innerFunction();
  console.log(inner); // Error: inner is not defined
}

outerFunction();
```
