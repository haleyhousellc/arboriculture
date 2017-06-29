import { IRedBlackTree, IRedBlackTreeNode, RedBlackTree } from '../src/red-black-tree/red-black-tree';

// create a new empty binary search tree holding numerical values
const rbt: IRedBlackTree<number> = new RedBlackTree<number>();
console.log(rbt.toString());  // ''


// #insert

// Insert values into an existing tree
rbt.insert(4);
console.log(rbt.toString());  // '4'

// ...or chain multiple insertion calls
rbt.insert(5).insert(2).insert(100);
console.log(rbt.toString());  // '2 | 4 | 5 | 100'

// Inserting an existing value will not throw an error, but the tree will remain unchanged.
rbt.insert(5).insert(4); // this is ok
console.log(rbt.toString());  // '2 | 4 | 5 | 100'


// #remove

// Remove an existing value.
rbt.remove(5);
console.log(rbt.toString());  // '2 | 4 | 100'

// Removing an item that isn't in the tree is not an error, but the tree will remain unchanged (chaining is allowed here
// too).
rbt.remove(5).remove(5);  // this is ok
console.log(rbt.toString());  // '2 | 4 | 100'


// #find

// Find an existing item.
let node: IRedBlackTreeNode<number> = rbt.find(4);
console.log(`find a node with value 4 => ${node}`);  // 'find a node with value 4 => traverse: 4'

// Find a node existing item.
node = rbt.find(400);
console.log(`find a node with value 400 => ${node}`);  // 'find a node with value 4 => null'


// Generic typing allows arbitrary objects to be stored as long as comparison is obvious (like with built-in types).  A
// custom compare function may be provided during construction.
const rbtString: IRedBlackTree<string> = new RedBlackTree<string>();

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

const rbtObject: IRedBlackTree<IMyObject> = new RedBlackTree<IMyObject>(myObject0, myComparer);
