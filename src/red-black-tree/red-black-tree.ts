import { BinarySearchTreeNode, IBinarySearchTreeNode, } from '../binary-search-tree/binary-search-tree';
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

export interface IRedBlackTree<K, V = K> {
    root: IRedBlackTreeNode<K, V>;

    sentinel: IRedBlackTreeNode<K, V>;

    size(): number;

    height(): number;

    clear(): void;

    find(key: K): V;

    min(): V;

    max(): V;

    insert(key: K, value?: V): IRedBlackTree<K, V>;

    remove(key: K): IRedBlackTree<K, V>;

    traverse(order?: TraversalOrder): V[];

    toString(): string;

    clone(): IRedBlackTree<K, V>;
}

/**
 * Red-Black tree supporting all basic binary search tree operations.
 */
export const RedBlackTree = <K, V>(comparer: IComparer<K> = defaultComparer): IRedBlackTree<K, V> => {
    const sentinel: IRedBlackTreeNode<K, V> = makeSentinel();
    const root: IRedBlackTreeNode<K, V>     = sentinel;

    return {
        root,

        sentinel,

        size(): number { return this.traverse().length; },

        height(): number { return getRbtHeight(this.root, this.sentinel); },

        clear(): void { return clearRbt(this); },

        find(key: K): V {
            const node: IRedBlackTreeNode<K, V> = findFromRbtNode(this.root, key, this.sentinel, comparer);

            return (node && node !== this.sentinel) ? node.value : null;
        },

        min(): V {
            const node: IRedBlackTreeNode<K, V> = minFromRbtNode(this.root, this.sentinel);

            return node ? node.value : null;
        },

        max(): V {
            const node: IRedBlackTreeNode<K, V> = maxFromRbtNode(this.root, this.sentinel);

            return node ? node.value : null;
        },

        insert(key: K, value?: V): IRedBlackTree<K, V> {
            const freshNode = RedBlackTreeNode(key, value);
            initializeNodeRelationships(freshNode, this.sentinel);

            if (this.root === this.sentinel) {
                this.root = freshNode;
            } else {
                // Insert the node.
                const insertedNode = insertAtRbtNode(this.root,
                                                     freshNode,
                                                     this.sentinel,
                                                     comparer) as IRedBlackTreeNode<K, V>;

                // Fix the insertion.
                fixInsertionIntoRbt(this, insertedNode);
            }

            return this;
        },

        remove(key: K): IRedBlackTree<K, V> {

            // Find the node first, and return if it isn't found.
            const candidate: IRedBlackTreeNode<K, V> = findFromRbtNode(this.root, key, this.sentinel, comparer);

            if (candidate !== sentinel) {

                // Find the successor to the candidate up for delete.
                const successor: IRedBlackTreeNode<K, V> = minFromRbtNode(candidate.right, this.sentinel);
                const hasSuccessor                       = successor !== this.sentinel && successor !== candidate.right;

                const replacement = removeAtRbtNode(candidate, this.sentinel) as IRedBlackTreeNode<K, V>;

                // Get the starting point at which to begin the fix.
                const targetToFix: IRedBlackTreeNode<K, V> = hasSuccessor ? successor.parent : replacement;

                // Now, fix any imbalances that may have arisen.
                fixDeletionFromRbt(this, targetToFix);

                if (candidate.parent === sentinel) this.root = replacement;
            }

            return this;
        },

        traverse(order: TraversalOrder = TraversalOrder.INORDER): V[] {
            return traverseRbt(this.root, order, this.sentinel);
        },

        toString(order: TraversalOrder = TraversalOrder.INORDER): string {
            return this.traverse(order)
                       .join(' | ')
                       .trim();
        },

        clone(): IRedBlackTree<K, V> {
            const newTree: IRedBlackTree<K, V> = RedBlackTree();
            newTree.root                       = cloneRbtSubtree(this.root, this.sentinel);

            return newTree;
        },
    };
};

/**
 * This method clears the tree.
 */
const clearRbt = <K, V>(tree: IRedBlackTree<K, V>): void => { tree.root = tree.sentinel; };

const findFromRbtNode = <K, V>(root: IRedBlackTreeNode<K, V>,
                               key: K,
                               sentinel: IRedBlackTreeNode<K, V>,
                               comparer: IComparer<K> = defaultComparer): IRedBlackTreeNode<K, V> => {
    if (root === sentinel) return sentinel;

    if (comparer(root.key, key) === 0) return root;

    // Tail call
    return comparer(root.key, key) < 0
        ? findFromRbtNode(root.right, key, sentinel, comparer)
        : findFromRbtNode(root.left, key, sentinel, comparer);
};

const maxFromRbtNode = <K, V>(root: IRedBlackTreeNode<K, V>,
                              sentinel: IRedBlackTreeNode<K, V>): IRedBlackTreeNode<K, V> => {
    if (root === sentinel || root.right === sentinel) return root;

    // Tail call
    return maxFromRbtNode(root.right, sentinel);
};

const minFromRbtNode = <K, V>(root: IRedBlackTreeNode<K, V>,
                              sentinel: IRedBlackTreeNode<K, V>): IRedBlackTreeNode<K, V> => {
    if (root === sentinel || root.left === sentinel) return root;

    // Tail call
    return minFromRbtNode(root.left, sentinel);
};

const insertAtRbtNode = <K, V>(current: IRedBlackTreeNode<K, V>,
                               freshNode: IRedBlackTreeNode<K, V>,
                               sentinel: IRedBlackTreeNode<K, V>,
                               comparer: IComparer<K> = defaultComparer): IRedBlackTreeNode<K, V> => {

    // Insert
    if (current === sentinel) return freshNode;

    // Update and return
    if (comparer(current.key, freshNode.key) === 0) {
        current.value = freshNode.value;

        return current;
    }

    // Otherwise insert into the correct subtree.
    if (comparer(current.key, freshNode.key) < 0) {
        if (current.right === sentinel) {
            current.right    = freshNode;
            freshNode.parent = current;

            return freshNode;
        }

        // Tail call
        return insertAtRbtNode(current.right, freshNode, sentinel, comparer);
    } else {
        if (current.left === sentinel) {
            current.left     = freshNode;
            freshNode.parent = current;

            return freshNode;
        }

        // Tail call
        return insertAtRbtNode(current.left, freshNode, sentinel, comparer);
    }
};

export const removeAtRbtNode = <K, V>(candidate: IRedBlackTreeNode<K, V>,
                                      sentinel: IRedBlackTreeNode<K, V>): IRedBlackTreeNode<K, V> => {
    if (candidate === sentinel) return sentinel;

    let replacement: IRedBlackTreeNode<K, V> = sentinel;

    if (nodeIsLeaf(candidate, sentinel)) replacement = handleLeafNode(candidate, sentinel);
    else if (candidate.right === sentinel) replacement = handleNodeWithLeftChildOnly(candidate, sentinel);
    else if (candidate.left === sentinel) replacement = handleNodeWithRightChildOnly(candidate, sentinel);
    else if (nodeHasTwoChildren(candidate, sentinel)) replacement = handleSaturatedNode(candidate, sentinel);

    return replacement;
};

const handleLeafNode = <K, V>(candidate: IRedBlackTreeNode<K, V>,
                              sentinel: IRedBlackTreeNode<K, V>): IRedBlackTreeNode<K, V> => {
    const replacement: IRedBlackTreeNode<K, V> = sentinel;

    if (candidate.parent !== sentinel) {
        candidate.parent.left === candidate
            ? candidate.parent.left = sentinel
            : candidate.parent.right = sentinel;
    }

    return replacement;
};

const handleNodeWithRightChildOnly = <K, V>(candidate: IRedBlackTreeNode<K, V>,
                                            sentinel: IRedBlackTreeNode<K, V>): IRedBlackTreeNode<K, V> => {
    const replacement: IRedBlackTreeNode<K, V> = candidate.right;

    replacement.parent = candidate.parent;

    if (candidate.parent !== sentinel) {
        candidate.parent.left === candidate
            ? candidate.parent.left = replacement
            : candidate.parent.right = replacement;
    }

    return replacement;
};

const handleNodeWithLeftChildOnly = <K, V>(candidate: IRedBlackTreeNode<K, V>,
                                           sentinel: IRedBlackTreeNode<K, V>): IRedBlackTreeNode<K, V> => {
    const replacement: IRedBlackTreeNode<K, V> = candidate.left;

    replacement.parent = candidate.parent;

    if (candidate.parent !== sentinel) {
        candidate.parent.left === candidate
            ? candidate.parent.left = replacement
            : candidate.parent.right = replacement;
    }

    return replacement;
};

const handleSaturatedNode = <K, V>(candidate: IRedBlackTreeNode<K, V>,
                                   sentinel: IRedBlackTreeNode<K, V>): IRedBlackTreeNode<K, V> => {
    const replacement: IRedBlackTreeNode<K, V> = minFromRbtNode(candidate.right, sentinel);

    // Replace the candidate key/value with the replacement and delete the original replacement.
    candidate.key   = replacement.key;
    candidate.value = replacement.value;

    if (nodeIsLeaf(replacement, sentinel)) {
        handleLeafNode(replacement, sentinel);
    }
    else { // the only other option for a min node is to have a right child
        handleNodeWithRightChildOnly(replacement, sentinel);
    }

    return candidate;
};

/**
 * This function adjusts node colors and performs any rotations needed after inserting a new node.
 */
const fixInsertionIntoRbt = <K, V>(tree: IRedBlackTree<K, V>, newNode: IRedBlackTreeNode<K, V>): void => {
    let current: IRedBlackTreeNode<K, V> = newNode;
    let uncle: IRedBlackTreeNode<K, V>   = tree.sentinel;

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
const fixDeletionFromRbt = <K, V>(tree: IRedBlackTree<K, V>, candidate: IRedBlackTreeNode<K, V>): void => {

    while (candidate !== tree.root && candidate.color === RedBlackTreeNodeColor.BLACK) {
        let sibling: IRedBlackTreeNode<K, V> = tree.sentinel;

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

export const makeSentinel = <K, V>(): IRedBlackTreeNode<K, V> => {
    const sentinel: IRedBlackTreeNode<K, V> = RedBlackTreeNode();
    initializeNodeRelationships(sentinel, sentinel);
    sentinel.color = RedBlackTreeNodeColor.BLACK;

    return sentinel;
};

export const initializeNodeRelationships = <K, V>(node: IRedBlackTreeNode<K, V>,
                                                  sentinel: IRedBlackTreeNode<K, V>): void => {
    node.parent = sentinel;
    node.left   = sentinel;
    node.right  = sentinel;
};

/**
 * Start supporting recursive tree functions
 */
export const traverseRbt = <K, V>(root: IRedBlackTreeNode<K, V>,
                                  order: TraversalOrder = TraversalOrder.INORDER,
                                  sentinel: IRedBlackTreeNode<K, V>): V[] => {
    switch (order) {
        case TraversalOrder.PREORDER:
            return traverseTreePreOrder(root, sentinel);
        case TraversalOrder.POSTORDER:
            return traverseTreePostOrder(root, sentinel);
        case TraversalOrder.INORDER:
        default:
            return traverseTreeInOrder(root, sentinel);
    }
};

export const traverseTreeInOrder = <K, V>(root: IRedBlackTreeNode<K, V>, sentinel: IRedBlackTreeNode<K, V>): V[] => {
    if (root === sentinel) return [];

    const left  = traverseTreeInOrder(root.left, sentinel);
    const self  = root.value;
    const right = traverseTreeInOrder(root.right, sentinel);

    return [].concat(left, self, right);
};

export const traverseTreePreOrder = <K, V>(root: IRedBlackTreeNode<K, V>, sentinel: IRedBlackTreeNode<K, V>): V[] => {
    if (root === sentinel) return [];

    const left  = traverseTreePreOrder(root.left, sentinel);
    const self  = root.value;
    const right = traverseTreePreOrder(root.right, sentinel);

    return [].concat(self, left, right);
};

export const traverseTreePostOrder = <K, V>(root: IRedBlackTreeNode<K, V>, sentinel: IRedBlackTreeNode<K, V>): V[] => {
    if (root === sentinel) return [];

    const left  = traverseTreePostOrder(root.left, sentinel);
    const self  = root.value;
    const right = traverseTreePostOrder(root.right, sentinel);

    return [].concat(left, right, self);
};

export const nodeIsLeaf = <K, V>(node: IRedBlackTreeNode<K, V>, sentinel: IRedBlackTreeNode<K, V>): boolean => {
    if (node === sentinel) return false;

    return node.left === sentinel && node.right === sentinel;
};

export const nodeHasSingleChild = <K, V>(node: IRedBlackTreeNode<K, V>, sentinel: IRedBlackTreeNode<K, V>): boolean => {
    if (node === sentinel || nodeIsLeaf(node, sentinel)) return false;

    return node.left === sentinel || node.right === sentinel;
};

export const nodeHasTwoChildren = <K, V>(node: IRedBlackTreeNode<K, V>, sentinel: IRedBlackTreeNode<K, V>): boolean => {
    if (node === sentinel) return false;

    return node.left !== sentinel && node.right !== sentinel;
};

export const getRbtHeight = <K, V>(root: IRedBlackTreeNode<K, V>, sentinel: IRedBlackTreeNode<K, V>): number => {
    if (root === sentinel) return 0;

    const leftHeight  = getRbtHeight(root.left, sentinel);
    const rightHeight = getRbtHeight(root.right, sentinel);

    return Math.max(leftHeight, rightHeight) + 1;
};

export const cloneRbtNode = <K, V>(node: IRedBlackTreeNode<K, V>): IRedBlackTreeNode<K, V> => {
    return RedBlackTreeNode(node.key, node.value);
};

const cloneRbtSubtree = <K, V>(root: IRedBlackTreeNode<K, V>,
                               sentinel: IRedBlackTreeNode<K, V>): IRedBlackTreeNode<K, V> => {
    if (root === sentinel) return sentinel;

    const node = cloneRbtNode(root);
    node.color = root.color;

    node.left = cloneRbtSubtree(root.left, sentinel);
    if (node.left) node.left.parent = node;

    node.right = cloneRbtSubtree(root.right, sentinel);
    if (node.right) node.right.parent = node;

    return node;
};

//const isValidRbt = <K, V>(node: IRedBlackTreeNode<K, V>,
//                              sentinel: IRedBlackTreeNode<K, V>,
//                              comparer: IComparer<K> = defaultComparer): boolean => {
//    if (node === sentinel) return true;
//
//    if (node.left !== sentinel && comparer(node.key, node.left.key) < 0) return false;
//    if (node.right !== sentinel && comparer(node.key, node.right.key) > 0) return false;
//
//    const leftIsValid  = node.left ? isValidRbt(node.left, sentinel, comparer) : true;
//    const rightIsValid = node.right ? isValidRbt(node.right, sentinel, comparer) : true;
//
//    return leftIsValid && rightIsValid;
//};
