import { BinarySearchTreeNode, clearBst, IBinarySearchTreeNode, } from '../binary-search-tree/binary-search-tree';
import { defaultComparer, IComparer, TraversalOrder } from '../binary-tree/binary-tree';

export enum RedBlackTreeNodeColor {
    RED,
    BLACK,
}

/**
 * A red-black tree node redefines the types of members #left, #right, and #parent to return IRedBlackTreeNode<K, V>
 * rather than a IBinarySearchTreeNode<K, V>.  It also adds a new member #color used in determining how/when to
 * rotate the tree.
 */
export interface IRedBlackTreeNode<K, V = K> extends IBinarySearchTreeNode<K, V> {
    color: RedBlackTreeNodeColor;
    left: IRedBlackTreeNode<K, V>;
    right: IRedBlackTreeNode<K, V>;
    parent: IRedBlackTreeNode<K, V>;
    isSentinel: boolean;
}

export const RedBlackTreeNode = <K, V>(key?: K, value?: V): IRedBlackTreeNode<K, V> => {
    const node: IBinarySearchTreeNode<K, V> = BinarySearchTreeNode(key, value);
    const color: RedBlackTreeNodeColor      = RedBlackTreeNodeColor.RED;
    const isSentinel: boolean               = !key && !value;

    return {
        ...node,

        color,

        get left(): IRedBlackTreeNode<K, V> { return node.left as IRedBlackTreeNode<K, V>; },

        get right(): IRedBlackTreeNode<K, V> { return node.right as IRedBlackTreeNode<K, V>; },

        get parent(): IRedBlackTreeNode<K, V> { return node.parent as IRedBlackTreeNode<K, V>; },

        get isSentinel(): boolean { return isSentinel; },
    };
};

/**
 * This interface simply redefines some return types inherited from the standard IBinarySearchTree<K, V>.
 */
export interface IRedBlackTree<K, V = K> {
    root: IRedBlackTreeNode<K, V>;

    count: number;

    sentinel: IRedBlackTreeNode<K, V>;

    clear(): void;

    find(key: K): IRedBlackTreeNode<K, V>;

    min(): IRedBlackTreeNode<K, V>;

    max(): IRedBlackTreeNode<K, V>;

    insert(key: K, value?: V): IRedBlackTree<K, V>;

    remove(key: K): IRedBlackTree<K, V>;

    traverse(order: TraversalOrder): V[];

    toString(): string;
}

/**
 * Red-Black tree supporting all basic binary search tree operations.
 */
export const RedBlackTree = <K, V>(comparer: IComparer<K> = defaultComparer): IRedBlackTree<K, V> => {
    const sentinel: IRedBlackTreeNode<K, V> = makeSentinel();
    const root: IRedBlackTreeNode<K, V>     = sentinel;
    const count: number                     = 0;

    return {
        count,

        root,

        sentinel,

        clear(): void { return clearRbt(this); },

        find(key: K): IRedBlackTreeNode<K, V> { return findNodeInRbt(this, key, comparer); },

        min(): IRedBlackTreeNode<K, V> { return getMinNodeInRbt(this); },

        max(): IRedBlackTreeNode<K, V> { return getMaxNodeInRbt(this); },

        insert(key: K, value?: V): IRedBlackTree<K, V> {
            const newNode = RedBlackTreeNode(key, value);
            insertNodeIntoRbt(this, newNode, comparer);

            return this;
        },

        remove(key: K): IRedBlackTree<K, V> {
            removeNodeFromRbt(this, key, comparer);

            return this;
        },

        traverse(order: TraversalOrder = TraversalOrder.INORDER): V[] { return traverseRbt(this, order); },

        toString(order: TraversalOrder = TraversalOrder.INORDER): string {
            return this.traverse(order)
                       .join(' | ')
                       .trim();
        },
    };
};

/**
 * This method clears the tree.
 */
export const clearRbt = <K, V>(tree: IRedBlackTree<K, V>): void => {
    clearBst(tree);
    tree.root = tree.sentinel;
};

/**
 * The insert procedure differs slightly from the base insert.
 */
export const insertNodeIntoRbt = <K, V>(tree: IRedBlackTree<K, V>,
                                        newNode: IRedBlackTreeNode<K, V>,
                                        comparer: IComparer<K> = defaultComparer): IRedBlackTreeNode<K, V> => {

    let currentParent: IRedBlackTreeNode<K, V> = tree.sentinel;
    let current: IRedBlackTreeNode<K, V>       = tree.root;

    // Iterate over the tree to find the new node's parent.
    while (current !== tree.sentinel) {
        currentParent = current;

        // Don't allow duplicates, so simply return if the key is already present in the tree.
        if (comparer(newNode.key, current.key) === 0) return null;

        // Otherwise traverse the appropriate child.
        if (comparer(newNode.key, current.key) < 0) current = current.left;
        else current = current.right;
    }

    // Assign the appropriate parent to the new node.
    newNode.parent = currentParent;

    // If the parent is still the sentinel, the tree was empty and the new node becomes the new root.
    if (currentParent === tree.sentinel) tree.root = newNode;

    // Otherwise, determine whether the new node should be the left or right child of its parent and link it.
    else if (comparer(newNode.key, currentParent.key) < 0) currentParent.left = newNode;
    else currentParent.right = newNode;

    newNode.left  = tree.sentinel;
    newNode.right = tree.sentinel;
    newNode.color = RedBlackTreeNodeColor.RED;

    // Fix any issues that may have arisen with the addition of another red node.
    fixInsertionIntoRbt(tree, newNode);

    // Finally, admit that a node has been added ;).
    tree.count++;

    // Return the newly inserted node.
    return newNode;
};

/**
 * This is essentially a copy of the base delete procedure.  However, the assignment of newSuccessor.parent to
 * replacement.parent is unconditional.  Also new is the comparison to the sentinel node, rather than a null-check.
 */
export const removeNodeFromRbt = <K, V>(tree: IRedBlackTree<K, V>,
                                        key: K,
                                        comparer: IComparer<K> = defaultComparer): IRedBlackTreeNode<K, V> => {

    const candidate: IRedBlackTreeNode<K, V> = findNodeInRbt(tree, key, comparer);

    // If the candidate is null, it was not present in the tree.
    if (candidate === tree.sentinel) return null;

    // Declare a replacement for the deleted node.  This begins as it's successor, but is spliced out of it's
    // original location and is substituted back into the tree at the location of the deleted node.
    let replacement: IRedBlackTreeNode<K, V> = null;

    // If the node to be deleted has less than 2 children (i.e. 0 or 1), designate it as it's own replacement
    if (candidate.left === tree.sentinel || candidate.right === tree.sentinel) replacement = candidate;

    // Otherwise set the replacement as the candidate's immediate successor.
    else replacement = findNodeSuccessorInRbt(tree, candidate);

    // Declare a new successor.  This is either the replacement's only child, or null.  After the replacement takes
    // over in the old position of the deleted node, this node represents the replacement's immediate successor.
    let newSuccessor: IRedBlackTreeNode<K, V> = null;

    if (replacement.left !== tree.sentinel) newSuccessor = replacement.left;
    else newSuccessor = replacement.right;

    // This is a change from the standard delete procedure.
    newSuccessor.parent = replacement.parent;

    if (replacement.parent === tree.sentinel) tree.root = newSuccessor;
    else if (replacement === replacement.parent.left) replacement.parent.left = newSuccessor;
    else replacement.parent.right = newSuccessor;

    if (replacement !== candidate) candidate.value = replacement.value;

    // If the node that replaced the deleted node in the tree is black, fix any violations that exist.
    if (replacement.color === RedBlackTreeNodeColor.BLACK) fixDeletionFromSubtree(tree, newSuccessor);

    // Finally, admit that a node has been removed ;).
    tree.count--;

    // Return all parties involved in node removal: the candidate (deleted node), the candidate's replacement in the
    // tree, and the new successor (successor to the replacement).
    return newSuccessor;
};

/**
 * This function adjusts node colors and performs any rotations needed after inserting a new node.
 */
const fixInsertionIntoRbt = <K, V>(tree: IRedBlackTree<K, V>, newNode: IRedBlackTreeNode<K, V>): void => {
    let current: IRedBlackTreeNode<K, V> = newNode;
    let uncle: IRedBlackTreeNode<K, V>   = null;

// The candidate begins life red. If the candidate's parent isn't red, no violation should have occurred.
    while (current.parent.color === RedBlackTreeNodeColor.RED) {

        // The parent is the left child of the grandparent...
        if (current.parent === current.parent.parent.left) {

            // Another genealogically-derived convenience member.
            uncle = current.parent.parent.right;

            // Case 1:
            // Basically, is the uncle the same color as the candidate?  If so, adjust color of uncle (to match
            // parent).
            if (uncle.color === RedBlackTreeNodeColor.RED) {

                // Adjust colors of relatives.
                current.parent.color        = RedBlackTreeNodeColor.BLACK;
                uncle.color                 = RedBlackTreeNodeColor.BLACK;
                current.parent.parent.color = RedBlackTreeNodeColor.RED;

                // Set current to grandparent so the next iteration walks up the tree.  The next iteration begins
                // after this line, so there is no need to reset parent and grandparent yet.
                current = current.parent.parent;
            }

            // Otherwise, assess rotation needs.
            else {

                // Case 2:
                // Is the candidate a right child?
                if (current === current.parent.right) {

                    // Walk up the tree one step...
                    current = current.parent;

                    // Walk up the tree one step...
                    rotateRbtSubtreeLeft(tree, current);
                }

                // Case 3 (case 2 falls through to case 3)
                // Adjust colors of parent and grandparent.
                current.parent.color        = RedBlackTreeNodeColor.BLACK;
                current.parent.parent.color = RedBlackTreeNodeColor.RED;

                // Finally, rotate right.
                rotateRbtSubtreeRight(tree, current.parent.parent);
            }
        }

        // ...or the parent is the right child of the grandparent.  A mirror of the above.
        else {

            // Another genealogically-derived convenience member.
            uncle = current.parent.parent.left;

            // Case 1:
            // Basically, is the uncle the same color as the candidate?  If so, adjust color of uncle (to match
            // parent).
            if (uncle.color === RedBlackTreeNodeColor.RED) {

                // Adjust colors of relatives.
                current.parent.color        = RedBlackTreeNodeColor.BLACK;
                uncle.color                 = RedBlackTreeNodeColor.BLACK;
                current.parent.parent.color = RedBlackTreeNodeColor.RED;

                // Set current to grandparent so the next iteration walks up the tree.  The next iteration begins
                // after this line, so there is no need to reset parent and grandparent yet.
                current = current.parent.parent;
            } else {

                // Case 2:
                // Is the candidate a left child?
                if (current === current.parent.left) {
                    current = current.parent;

                    // ...then rotate right.
                    rotateRbtSubtreeRight(tree, current);
                }

                // Case 3 (case 2 falls through to case 3)
                // Adjust colors of parent and grandparent.
                current.parent.color        = RedBlackTreeNodeColor.BLACK;
                current.parent.parent.color = RedBlackTreeNodeColor.RED;

                // Finally, rotate left.
                rotateRbtSubtreeLeft(tree, current.parent.parent);
            }
        }
    }

// Finally, ensure the root is still black.  This will not re-violate any conditions.
    tree.root.color = RedBlackTreeNodeColor.BLACK;
};

/**
 * This function adjusts node colors and performs any rotations needed after deleting a node.
 */
const fixDeletionFromSubtree = <K, V>(tree: IRedBlackTree<K, V>, candidate: IRedBlackTreeNode<K, V>): void => {

    while (candidate !== tree.root && candidate.color === RedBlackTreeNodeColor.BLACK) {
        let sibling: IRedBlackTreeNode<K, V> = null;

        // The deleted node is a left child...
        if (candidate === candidate.parent.left) {
            sibling = candidate.parent.right;

            // Case 1: candidate's sibling is red.
            if (sibling.color === RedBlackTreeNodeColor.RED) {
                sibling.color          = RedBlackTreeNodeColor.BLACK;
                candidate.parent.color = RedBlackTreeNodeColor.RED;
                rotateRbtSubtreeLeft(tree, candidate.parent);
                sibling = candidate.parent.right;
            }

            // Case 2: candidate's sibling is black, and both of sibling's children are black.
            if (sibling.left.color === RedBlackTreeNodeColor.BLACK
                && sibling.right.color === RedBlackTreeNodeColor.BLACK)
            {
                sibling.color = RedBlackTreeNodeColor.RED;
                candidate     = candidate.parent;
            }
            else {

                // Case 3: candidate's sibling is black, sibling's left child is red and sibling's right child is
                // black.
                if (sibling.right.color === RedBlackTreeNodeColor.BLACK) {
                    sibling.left.color = RedBlackTreeNodeColor.BLACK;
                    sibling.color      = RedBlackTreeNodeColor.RED;
                    rotateRbtSubtreeRight(tree, sibling);
                    sibling = candidate.parent.right;
                }

                // Case 4 (case 3 falls through):  candidate's sibling is black, and sibling's right child is red.
                sibling.color          = candidate.parent.color;
                candidate.parent.color = RedBlackTreeNodeColor.BLACK;
                sibling.right.color    = RedBlackTreeNodeColor.BLACK;
                rotateRbtSubtreeLeft(tree, candidate.parent);
                candidate = tree.root;
            }
        }

        // ...or it is a right child.
        else {
            sibling = candidate.parent.left;

            // Case 1: candidate's sibling is red.
            if (sibling.color === RedBlackTreeNodeColor.RED) {
                sibling.color          = RedBlackTreeNodeColor.BLACK;
                candidate.parent.color = RedBlackTreeNodeColor.RED;
                rotateRbtSubtreeRight(tree, candidate.parent);
                sibling = candidate.parent.left;
            }

            // Case 2: candidate's sibling is black, and both of sibling's children are black.
            if (sibling.right.color === RedBlackTreeNodeColor.BLACK
                && sibling.left.color === RedBlackTreeNodeColor.BLACK)
            {
                sibling.color = RedBlackTreeNodeColor.RED;
                candidate     = candidate.parent;
            }
            else {

                // Case 3: candidate's sibling is black, sibling's left child is red and sibling's right child is
                // black.
                if (sibling.left.color === RedBlackTreeNodeColor.BLACK) {
                    sibling.right.color = RedBlackTreeNodeColor.BLACK;
                    sibling.color       = RedBlackTreeNodeColor.RED;
                    rotateRbtSubtreeLeft(tree, sibling);
                    sibling = candidate.parent.left;
                }

                // Case 4 (case 3 falls through):  candidate's sibling is black, and sibling's right child is red.
                sibling.color          = candidate.parent.color;
                candidate.parent.color = RedBlackTreeNodeColor.BLACK;
                sibling.left.color     = RedBlackTreeNodeColor.BLACK;
                rotateRbtSubtreeRight(tree, candidate.parent);
                candidate = tree.root;
            }
        }
    }
};

/**
 * Rotates a subtree rooted at 'candidate' to the left.
 */
const rotateRbtSubtreeLeft = <K, V>(tree: IRedBlackTree<K, V>, candidate: IRedBlackTreeNode<K, V>): void => {

    // Left rotation only works if the candidate has a right child.
    if (candidate.right === tree.sentinel) return;

    // Define the candidate's replacement.
    const replacement = candidate.right;

    // Candidate's right child still points to the replacement.  Redirect it to the replacement's left child.
    candidate.right = replacement.left;

    // If the left child exists, reset its parent to the candidate.
    if (replacement.left !== tree.sentinel) replacement.left.parent = candidate;

    // Ensure the replacement now references its new parent (currently, the candidate's parent).
    replacement.parent = candidate.parent;

    // If the candidate didn't have a parent, the replacement won't either.  The replacement is becoming the new
    // root.
    if (candidate.parent === tree.sentinel) tree.root = replacement;

    // Otherwise, determine which subtree of the candidate should now be parented by the replacement.
    else if (candidate === candidate.parent.left) candidate.parent.left = replacement;
    else candidate.parent.right = replacement;

    // Mark the candidate as the replacement's left child (the final portion of the left rotation).
    replacement.left = candidate;

    // Finally, give the candidate a new parent.
    candidate.parent = replacement;
};

/**
 * Rotates a subtree rooted at 'candidate' to the right.
 */
const rotateRbtSubtreeRight = <K, V>(tree: IRedBlackTree<K, V>, candidate: IRedBlackTreeNode<K, V>): void => {

    // Right rotation only works if the candidate has a left child.
    if (candidate.left === tree.sentinel) return;

    // Define the candidate's replacement.
    const replacement = candidate.left;

    // Candidate's left child still points to the replacement.  Redirect it to the replacement's right child.
    candidate.left = replacement.right;

    // If the right child exists, reset its parent to the candidate.
    if (replacement.right !== tree.sentinel) replacement.right.parent = candidate;

    // Ensure the replacement now references its new parent (currently, the candidate's parent).
    replacement.parent = candidate.parent;

    // If the candidate didn't have a parent, the replacement won't either.  The replacement is becoming the new
    // root.
    if (candidate.parent === tree.sentinel) tree.root = replacement;

    // Otherwise, determine which subtree of the candidate should now be parented by the replacement.
    else if (candidate === candidate.parent.right) candidate.parent.right = replacement;
    else candidate.parent.left = replacement;

    // Mark the candidate as the replacement's right child (the final portion of the right rotation).
    replacement.right = candidate;

    // Finally, give the candidate a new parent.
    candidate.parent = replacement;
};

export const traverseRbt = <K, V>(tree: IRedBlackTree<K, V>,
                                  order: TraversalOrder = TraversalOrder.INORDER): V[] => {
    if (tree.root === tree.sentinel) return [];

    const orderedData: V[] = [];

    // Stacks make sense for what essentially amounts to a depth-first search.
    const stack: IRedBlackTreeNode<K, V>[] = [];
    let current: IRedBlackTreeNode<K, V>   = tree.root;

    // Build initial stack by traversing left
    while (current !== tree.sentinel) {
        stack.push(current);
        current = current.left;
    }

    // Now traverse the tree from the minimum value.
    while (stack.length > 0) {
        current = stack.pop();
        orderedData.push(current.value);

        // If the current node has a right child, traverse that subtree before backing out.
        if (current.right !== tree.sentinel) {
            current = current.right;

            // Like above, push until a leaf is reached.
            while (current !== tree.sentinel) {
                stack.push(current);
                current = current.left;
            }
        }
    }

    return orderedData;
};

/**
 * Search the tree for a given key - iteratively.  A recursive solution is prettier and cooler, but it has
 * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
 * node if the value exists in the tree.  If the value is not found, returns null.
 */
export const findNodeInRbt = <K, V>(tree: IRedBlackTree<K, V>,
                                    targetKey: K,
                                    comparer: IComparer<K> = defaultComparer): IRedBlackTreeNode<K, V> => {

    // Just make sure the target is legitimate.
    if (targetKey == null) return null;

    // Get a local variable.
    let currentNode = tree.root;

    // Loop until the current node is null (i.e. target key is not found), or the target key is found (comparer
    // returns zero).
    while (currentNode !== tree.sentinel && comparer(targetKey, currentNode.key) !== 0) {

        // If comparer returns less than zero, target key is less than current node key - traverse left;
        if (comparer(targetKey, currentNode.key) < 0) currentNode = currentNode.left;

        // If comparer returns greater than zero, target key is greater than current node key - traverse right.
        else currentNode = currentNode.right;
    }

    // Return the current node (an actual node if the target is found, null if not).
    return currentNode;
};

/**
 * Search the tree for it's maximum value - iteratively.  A recursive solution is prettier and cooler, but it has
 * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
 * node if the value exists in the tree.  If the value is not found, returns null.
 */
export const getMaxNodeInRbt = <K, V>(tree: IRedBlackTree<K, V>): IRedBlackTreeNode<K, V> => {

    // Get a local variable.
    let currentNode: IRedBlackTreeNode<K, V> = tree.root;

    // Iterate right until a leaf is reached.
    while (currentNode.right !== tree.sentinel) {
        currentNode = currentNode.right;
    }

    return currentNode;
};

/**
 * Search the tree for it's minimum value - iteratively.  A recursive solution is prettier and cooler, but it has
 * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
 * node if the value exists in the tree.  If the value is not found, returns null.
 */
export const getMinNodeInRbt = <K, V>(tree: IRedBlackTree<K, V>): IRedBlackTreeNode<K, V> => {

    // Get a local variable.
    let currentNode: IRedBlackTreeNode<K, V> = tree.root;

    // Iterate left until a leaf is reached.
    while (currentNode.left !== tree.sentinel) {
        currentNode = currentNode.left;
    }

    return currentNode;
};

export const findNodeSuccessorInRbt = <K, V>(tree: IRedBlackTree<K, V>,
                                             node: IRedBlackTreeNode<K, V>): IRedBlackTreeNode<K, V> => {

    // If the node has a right subtree, simply return the minimum value of the subtree.
    if (node.right) return getMinNodeInRbt(tree);

    // Define local variables to track current and previous nodes.
    let previous = node;
    let current  = previous.parent;

    while (current && previous === current.right) {
        previous = current;
        current  = current.parent;
    }

    return current;
};


export const makeSentinel = <K, V>(): IRedBlackTreeNode<K, V> => {
    const sentinel: IRedBlackTreeNode<K, V> = RedBlackTreeNode();
    sentinel.parent                         = sentinel;
    sentinel.left                           = sentinel;
    sentinel.right                          = sentinel;
    sentinel.color                          = RedBlackTreeNodeColor.BLACK;

    return sentinel;
};
