# Arboriculture

[![npm version](https://badge.fury.io/js/arboriculture.svg)](https://badge.fury.io/js/arboriculture)
[![Build Status](https://travis-ci.org/haleyhousellc/arboriculture.svg?branch=master)](https://travis-ci.org/haleyhousellc/arboriculture)
<!--Uncomment these badges when Code Climate configuration kinks are worked out.-->
<!--[![Code Climate](https://codeclimate.com/github/haleyhousellc/arboriculture/badges/gpa.svg)](https://codeclimate.com/github/haleyhousellc/arboriculture)-->
<!--[![Test Coverage](https://codeclimate.com/github/haleyhousellc/arboriculture/badges/coverage.svg)](https://codeclimate.com/github/haleyhousellc/arboriculture/coverage)-->
<!--[![Issue Count](https://codeclimate.com/github/haleyhousellc/arboriculture/badges/issue_count.svg)](https://codeclimate.com/github/haleyhousellc/arboriculture)-->

Arboriculture is a small tree library providing a set of common tree data structures for TypeScript and
JavaScript projects.  Unleash your inner lumberjack.

>###### ISC License (ISC)
>
>###### Copyright 2017 HaleyHouse LLC
>
>Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted,
>provided that the above copyright notice and this permission notice appear in all copies.
>
>THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING
>ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
>INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
>ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE
>OF THIS SOFTWARE.

## Features

- Simple interface(s) to the data structures.
- Traditional implementations of each tree with readable and fully commented source code.
- Generic structures allow any data type to be stored in the trees - primative and complex.
- Available compilation to ES6-compatible JavaScript.
- Available transpilation to ES5-compatible JavaScript.
- Available generation of a concatenated/minified/uglified/mangled script for efficient deployment to a broswer-based
  project.
- Mocha/Chai testing suite is provided.
- Complete documentation and ample examples given.

## Installation

```bash
# from npm package
npm install arboriculture

# from github
npm install haleyhousellc/arboriculture
```

## Quick Start

A few basic usage examples are shown.  Most trees have similar operations, so a basic
[Binary Search Tree](https://github.com/haleyhousellc/arboriculture/blob/master/src/binary-search-tree/binary-search-tree.ts)
is shown for convenience.

---

Get a new tree that stores number and uses value as the key (only one type parameter):
```typescript
const bst: IBinarySearchTree<number> = BinarySearchTree();

// If providing type parameters to the factory call, you must include both.
const bst1 = BinarySearchTree<number, number>();

// Assuming bst1 is using the key as the value, bst1 is identical to bst2.
const bst2: IBinarySearchTree<number> = BinarySearchTree();

// If bst1 is NOT using the key as the value, but simply declaring the key and value each to be of type number, bst1 is 
// identical to bst3.
const bst3: IBinarySearchTree<number, number> = BinarySearchTree();
```

Insert values:
```typescript
bst.insert(2);
bst.insert(4);
```

Delete values:
```typescript
bst.remove(2);
```

Chaining operations is allowed:
```typescript
bst.remove(4).insert(6).insert(2).insert(3);
```

Inserting duplicates is not allowed, but is silent:
```typescript
bst.insert(10).insert(10); // only one node with value '10' will exist
```

Deleting nonexistent values is allowed, but is not destructive:
```typescript
bst.remove(10).remove(10); // the node with value '10' will be removed on the first call, no change on the second call
```

Find the maximum value in the tree:
```typescript
const maxValue = bst.max();
```

Find the minimum value in the tree:
```typescript
const minValue = bst.min();
```

Find a node with a given value:
```typescript
const node = bst.find(6);  // if the value does not exist, 'node' will be null
```

---

Next, an example using a complex stored type with a simple number key (two type parameters):
```typescript
interface IMyStoredObject {
    m1: string;
    m2: string;
    m3: string;
    m4: string;
}

const myStoredObject0 = {m1: 'm1', m2: 'm2', m3: 'm3', m4: 'm4'};
const myStoredObject1 = {m1: 'm5', m2: 'm6', m3: 'm7', m4: 'm8'};

const bst = BinarySearchTree<number, IMyStoredObject>();
bst.insert(0, myStoredObject0);
bst.insert(1, myStoredObject1);
```

---

Finally, an example showing complex types and a complex key (two type parameters):
```typescript
// Be sure you provide your own compare function when using a tree to store custom objects, otherwise insert, remove,
// and find results are undefined.
interface IMyKeyObject {
    member1: string;
    member2: number;
}

interface IMyStoredObject {
    m1: string;
    m2: string;
    m3: string;
    m4: string;
}

const myKeyObject0 = { member1: 'hello there', member2: 35 };
const myStoredObject0 = {m1: 'm1', m2: 'm2', m3: 'm3', m4: 'm4'};

const myComparer = (a: IMyKeyObject, b: IMyKeyObject): number => {
    return a.member2 - b.member2;
};

const bst0 = BinarySearchTree<IMyKeyObject, IMyStoredObject>(myComparer);
bst0.insert(myKeyObject0, myValueObject0);

// alternatively - bst0 and bst1 will behave identically
const bst1: IBinarySearchTree<number, IMyStoredObject> = BinaryTreeNode();
bst1.insert(myKeyObject0.member2, myStoredObject0);
```

## Package Scripts

The most common scripts are demonstrated here, for the full list see the
[package.json](https://github.com/haleyhousellc/arboriculture/blob/master/package.json) file or the
[full documentation](https://haleyhousellc.github.io/arboriculture).

Run the TypeScript linter:
```bash
npm run lint
```

Compile the Typescript source to ES6, transpile to ES5 and generate a micro browser product:
```bash
npm run build
```

Run the test suite:
```bash
npm run test
```

Generate source documentation from the TypeScript files in
[`src`](https://github.com/haleyhousellc/arboriculture/blob/master/src) (excluding *.spec.ts test files):
```bash
npm run doc
```

Full build.  This script runs the linter, compiles the source, transpiles the source, generates a micro product,
and performs an [nsp](https://github.com/nodesecurity/nsp) security check.
```bash
npm run thewholenine
```

## Develop

New additions to the forest are always welcome.  Feel free to fork, add your tree and initiate a pull request.  A few
things to keep in mind:

- The [tslint.json](https://github.com/haleyhousellc/arboriculture/blob/master/tslint.json) configuration shows the
  TypeScript coding guidelines.
- Unit tests for specific tree files should follow the standard shown in
  [`src`](https://github.com/haleyhousellc/arboriculture/blob/master/src).  If your tree file is named mytree.ts, the
  the corresponding test file should reside in the same directory with the name mytree.spec.ts.  Should more general
  integration testing be needed in the future, a `test` directory may be added to hold these specs.
- Readable code is always preferred over concise code.
- Uncommented code will not be accepted.
