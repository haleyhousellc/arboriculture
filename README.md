# Arboriculture

Arboriculture is a community-supported tree library providing a set of common tree data structures for TypeScript and
JavaScript projects.  Unleash your inner lumberjack.

>###### ISC License (ISC)
> 
>###### Copyright 2017 HaleyHouse LLC
>
>###### Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
>
>###### THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

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

Get a new tree:
```typescript
const bst: IBinarySearchTree<number> = new BinarySearchTree<number>();
```

Get a new tree with an initial value:
```typescript
const bst: IBinarySearchTree<number> = new BinarySearchTree<number>(5);
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

Finally, an example showing complex types:
```typescript
// Be sure you provide your own compare function when using a tree to store custom objects, otherwise insert, remove,
// and find results are undefined.
interface IMyObject {
    member1: string;
    member2: number;
}

const myObject0 = { member1: 'hello there', member2: 35 };
const myComparer = (a: IMyObject, b: IMyObject): number => {
    return a.member2 - b.member2;
};

const bst: IBinarySearchTree<IMyObject> = new BinarySearchTree<IMyObject>(myObject0, myComparer);
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

* The [tslint.json](https://github.com/haleyhousellc/arboriculture/blob/master/tslint.json) configuration shows the TypeScript
coding guidelines.
* Unit tests for specific tree files should follow the standard shown in 
  [`src`](https://github.com/haleyhousellc/arboriculture/blob/master/src).  If your tree file is named mytree.ts, the
  the corresponding test file should reside in the same directory with the name mytree.spec.ts.  Should more general
  integration testing be needed in the future, a `test` directory may be added to hold these specs.
* Readable code is always preferred over concise code.
* Uncommented will not be accepted.
