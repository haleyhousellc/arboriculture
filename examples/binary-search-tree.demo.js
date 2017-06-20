"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var binary_search_tree_1 = require("../src/binary-search-tree");
// create a new empty binary search tree holding numerical values
var bst = new binary_search_tree_1.BinarySearchTree();
//bst.toString();  // ''
console.log(bst.toString());
// #insert
// Insert values into an existing tree
bst.insert(4);
console.log(bst.toString()); // '4;'
// ...or chain multiple insertion calls
bst.insert(5).insert(2).insert(100);
console.log(bst.toString()); // '2; 4; 5; 100;'
// Inserting an existing value will not throw an error, but the tree will remain unchanged.
bst.insert(5).insert(4); // this is ok
console.log(bst.toString()); // '2; 4; 5; 100;'
// #delete
// Remove an existing value.
bst.delete(5);
console.log(bst.toString()); // '2; 4; 100;'
// Removing an item that isn't in the tree is not an error, but the tree will remain unchanged (chaining is allowed here
// too).
bst.delete(5).delete(5); // this is ok
console.log(bst.toString()); // '2; 4; 100;'
// #find
// Find an existing item.
var node = bst.find(4);
console.log("find a node with value 4 => " + node); // 'find a node with value 4 => data: 4'
// fFind a node existing item.
node = bst.find(400);
console.log("find a node with value 400 => " + node); // 'find a node with value 4 => null'
// Generic typing allows arbitrary objects to be stored as long as comparison is obvious (like with built-in types).  A
// custom compare function may be provided during construction.
var bstString = new binary_search_tree_1.BinarySearchTree();
var myObject0 = { member1: 'hello there', member2: 35 };
var myComparer = function (a, b) {
    return a.member2 - b.member2;
};
var bstObject = new binary_search_tree_1.BinarySearchTree(myObject0, myComparer);
