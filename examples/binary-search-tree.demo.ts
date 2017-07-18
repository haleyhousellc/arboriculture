import { BinarySearchTree, IBinarySearchTree } from '../src/binary-search-tree/binary-search-tree';
import { IBinaryTreeNode } from '../src/binary-tree/binary-tree';

/* tslint:disable:no-magic-numbers */

// create a new empty binary search tree holding numerical values
const bst: IBinarySearchTree<number> = new BinarySearchTree<number>();
console.log(bst.toString());  // ''


// #insert

// Insert values into an existing tree
bst.insert(4);
console.log(bst.toString());  // '4'

// ...or chain multiple insertion calls
bst.insert(5).insert(2).insert(100);
console.log(bst.toString());  // '2 | 4 | 5 | 100'

// Inserting an existing value will not throw an error, but the tree will remain unchanged.
bst.insert(5).insert(4); // this is ok
console.log(bst.toString());  // '2 | 4 | 5 | 100'


// #remove

// Remove an existing value.
bst.remove(5);
console.log(bst.toString());  // '2 | 4 | 100'

// Removing an item that isn't in the tree is not an error, but the tree will remain unchanged (chaining is allowed here
// too).
bst.remove(5).remove(5);  // this is ok
console.log(bst.toString());  // '2 | 4 | 100'


// #find

// Find an existing item.
let node: IBinaryTreeNode<number> = bst.find(4);
console.log(`find a node with value 4 => ${node}`);  // 'find a node with value 4 => traverse: 4'

// Find a node existing item.
node = bst.find(400);
console.log(`find a node with value 400 => ${node}`);  // 'find a node with value 4 => null'


// Generic typing allows arbitrary objects to be stored as long as comparison is obvious (like with built-in types).  A
// custom compare function may be provided during construction.
const bstString: IBinarySearchTree<string> = new BinarySearchTree<string>();

// Be sure you provide your own compare function when using a tree to store custom objects, otherwise insert, remove,
// and find results are undefined.
interface IMyObject {
    member1: string;
    member2: number;
}

const myObject0 = { member1: 'hello there', member2: 35 };
const myComparer = (a: IMyObject, b: IMyObject): number => a.member2 - b.member2;

const bstObject: IBinarySearchTree<IMyObject> = new BinarySearchTree<IMyObject>(myComparer);
bstObject.insert(myObject0);
