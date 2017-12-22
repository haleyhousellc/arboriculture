import {
    clearBst,
    findNodeInBst,
    findNodeSuccessorInBst,
    getMaxNodeInBst,
    getMinNodeInBst,
    insertNodeIntoBst,
    removeNodeFromBst,
    traverseBst,
    BinarySearchTreeNode,
    IBinarySearchTreeNode,
} from '../binary-search-tree/binary-search-tree';
import { defaultComparer, IComparer, TraversalOrder } from '../binary-tree/binary-tree';

export enum BalanceFactor {
    RIGHT_HEAVY   = -2,
    RIGHT_LEANING = -1,
    BALANCED      = 0,
    LEFT_LEANING  = 1,
    LEFT_HEAVY    = 2,
}

export enum InsertionMultiplier {
    LEFT  = 1,
    RIGHT = -1,
}

/**
 * An avl tree node redefines the types of members #left, #right, and #parent to return IAvlTreeNode<K, V> rather
 * than a IBinarySearchTreeNode<K, V>.  It also adds a new member #color used in determining how/when to rotate the
 * tree.
 */
export interface IAvlTreeNode<K, V = K> extends IBinarySearchTreeNode<K, V> {
    balanceFactor: BalanceFactor;
    isOverweight: boolean;
    isBalanced: boolean;
    left: IAvlTreeNode<K, V>;
    right: IAvlTreeNode<K, V>;
    parent: IAvlTreeNode<K, V>;
}

export const AvlTreeNode = <K, V>(key: K, value?: V): IAvlTreeNode<K, V> => {
    const node: IBinarySearchTreeNode<K, V> = BinarySearchTreeNode(key, value);
    const balanceFactor: BalanceFactor      = BalanceFactor.BALANCED;
    const isOverweight: boolean             = false;
    const isBalanced: boolean               = true;

    return {
        ...node,

        balanceFactor,

        isBalanced,

        isOverweight,

        get left(): IAvlTreeNode<K, V> { return node.left as IAvlTreeNode<K, V>; },

        get right(): IAvlTreeNode<K, V> { return node.right as IAvlTreeNode<K, V>; },

        get parent(): IAvlTreeNode<K, V> { return node.parent as IAvlTreeNode<K, V>; },

        toString(): string {
            const str = `value: ${node.value}, balance factor: ${balanceFactor}`;
            if (node.left) str.concat(`, left.value: ${node.left.value}`);
            if (node.right) str.concat(`, right.value: ${node.right.value}`);
            if (node.parent) str.concat(`, parent.value: ${node.parent.value}`);

            return str;
        },
    };
};

export interface IAvlTree<K, V = K> {
    root: IAvlTreeNode<K, V>;

    count: number;

    clear(): void;

    find(key: K): IAvlTreeNode<K, V>;

    min(): IAvlTreeNode<K, V>;

    max(): IAvlTreeNode<K, V>;

    insert(key: K, value?: V): IAvlTree<K, V>;

    remove(key: K): IAvlTree<K, V>;

    traverse(order: TraversalOrder): V[];

    toString(): string;
}

export const AvlTree = <K, V>(comparer: IComparer<K> = defaultComparer): IAvlTree<K, V> => {
    const root: IAvlTreeNode<K, V> = null;
    const count: number            = 0;

    return {
        count,

        root,

        clear(): void { return clearAvl(this); },

        find(key: K): IAvlTreeNode<K, V> { return findNodeInAvl(this, key, comparer); },

        min(): IAvlTreeNode<K, V> { return getMinNodeInAvl(this); },

        max(): IAvlTreeNode<K, V> { return getMaxNodeInAvl(this); },

        insert(key: K, value?: V): IAvlTree<K, V> {
            const newNode = AvlTreeNode(key, value);
            insertNodeIntoAvl(this, newNode, comparer);

            return this;
        },

        remove(key: K): IAvlTree<K, V> {
            removeNodeFromAvl(this, key, comparer);

            return this;
        },

        traverse(order: TraversalOrder = TraversalOrder.INORDER): V[] { return traverseAvl(this, order); },

        toString(order: TraversalOrder = TraversalOrder.INORDER): string {
            return this.traverse(order)
                       .join(' | ')
                       .trim();
        },
    };
};


export const findNodeInAvl = <K, V>(tree: IAvlTree<K, V>,
                                    targetKey: K,
                                    comparer: IComparer<K> = defaultComparer): IAvlTreeNode<K, V> => {
    return findNodeInBst(tree, targetKey, comparer) as IAvlTreeNode<K, V>;
};

/**
 * Insert the given key into the tree - iteratively.  No duplicates are allowed.  If the new node is a
 * duplicate, no change occurs.  A recursive solution is prettier and cooler, but it has the potential for
 * memory-related performance problems as the tree grows (i.e. hitting stack limits).
 */
export const insertNodeIntoAvl = <K, V>(tree: IAvlTree<K, V>,
                                        newNode: IAvlTreeNode<K, V>,
                                        comparer: IComparer<K> = defaultComparer): IAvlTreeNode<K, V> => {

    const insertedNode: IAvlTreeNode<K, V> = insertNodeIntoBst(tree, newNode, comparer) as IAvlTreeNode<K, V>;

    // Only move forward if the node wasn't a duplicate.
    if (!insertedNode) return null;

    // Fix the insertion, if it occurred.
    fixInsertionIntoAvl(tree, insertedNode);

    // Return the newly inserted node.
    return insertedNode;
};

/**
 * Delete the given key from the tree - iteratively.  A recursive solution is prettier and cooler, but it has the
 * potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).
 *
 * The logic below up to the call to #removeNodeFromBst is actually duplicated from that function.  For an AVL
 * tree we need to know the original parent of the replacement to make it easier to update balance factors along
 * the path to the candidate.  An alternative would be to traverse the entire subtree after removal to try to
 * determine where the replacement came from.  This seemed more straight forward...
 */
export const removeNodeFromAvl = <K, V>(tree: IAvlTree<K, V>,
                                        key: K,
                                        comparer: IComparer<K> = defaultComparer): IAvlTreeNode<K, V> => {

    // For more information on the following lines (up to the call to #removeNodeFromBst) see that method instead.
    // The logic is duplicated to make book-keeping easier after the removal.  Essentially, we call #findNodeInAvl and
    // #findNodeSuccessorInBst here, then again in the reused code from #removeNodeFromBst.  Both are quick O(log n)
    // operations, so running each twice is still O(log n) - essentially, a negligible performance hit.
    const candidate: IAvlTreeNode<K, V> = findNodeInAvl(tree, key, comparer);
    if (!candidate) return null;

    let successor: IAvlTreeNode<K, V> = null;

    if (!candidate.left || !candidate.right) successor = candidate;
    else successor = findNodeSuccessorInBst(tree, candidate) as IAvlTreeNode<K, V>;

    // There will be a bit of duplicated logic here, but overall the running time will remain the same - O (log n).
    const replacement: IAvlTreeNode<K, V> = removeNodeFromBst(tree, key, comparer) as IAvlTreeNode<K, V>;

    replacement.balanceFactor = candidate.balanceFactor;

    // Now, fix any imbalances that may have arisen.
    if (replacement) fixDeletionFromAvl(tree, successor.parent);

    return replacement;
};

/**
 * Search the tree for it's minimum value - iteratively.  A recursive solution is prettier and cooler, but it has
 * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
 * node if the value exists in the tree.  If the value is not found, returns null.
 */
export const getMinNodeInAvl = <K, V>(tree: IAvlTree<K, V>): IAvlTreeNode<K, V> => {
    return getMinNodeInBst(tree) as IAvlTreeNode<K, V>;
};

/**
 * Search the tree for it's maximum value - iteratively.  A recursive solution is prettier and cooler, but it has
 * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
 * node if the value exists in the tree.  If the value is not found, returns null.
 */
export const getMaxNodeInAvl = <K, V>(tree: IAvlTree<K, V>): IAvlTreeNode<K, V> => {
    return getMaxNodeInBst(tree) as IAvlTreeNode<K, V>;
};

export const clearAvl = <K, V>(tree: IAvlTree<K, V>) => clearBst(tree);

//</editor-fold>

//<editor-fold desc="private">

/**
 * This function adjusts balance factors and performs any rotations needed after inserting a new node.
 */
export const fixInsertionIntoAvl = <K, V>(tree: IAvlTree<K, V>, newNode: IAvlTreeNode<K, V>): void => {

    // Quick sanity check.
    if (!newNode) return;

    let previous: IAvlTreeNode<K, V> = newNode;
    let current: IAvlTreeNode<K, V>  = previous.parent;

    // New node was inserted into empty tree (at root).
    if (!current) return;

    // Find the offending node (this is the first node with a balance factor that is either left overweight or right
    // overweight).
    while (current) {

        // Update the balance factor based on the direction in which the insertion took place.
        current.balanceFactor += previous === current.left ? InsertionMultiplier.LEFT : InsertionMultiplier.RIGHT;

        // If the current node is overweight, simply rebalance it.  Reassign current to the new subtree root.
        if (current.isOverweight) current = rebalanceAvlSubtree(tree, current);

        // If the current node is balanced after adjusting its balance factor (and possibly rebalancing), we can
        // safely exit.
        if (current.isBalanced) break;

        previous = current;
        current  = current.parent;
    }

    return;
};

/**
 * This function adjusts balance factors and performs any rotations needed after deleting a node.
 */
export const fixDeletionFromAvl = <K, V>(tree: IAvlTree<K, V>,
                                         originalParentOfReplacement: IAvlTreeNode<K, V>): void => {

    // Quick sanity check.
    if (!originalParentOfReplacement) return;

    originalParentOfReplacement.balanceFactor = originalParentOfReplacement.left
        ? BalanceFactor.LEFT_LEANING
        : BalanceFactor.RIGHT_LEANING;

    let current: IAvlTreeNode<K, V> = originalParentOfReplacement;


    // Follow the path from the replacement to the candidate and update balance factors along the way.  When
    // removing a node from a BST, the successor will always be a descendant of the candidate or the candidate
    // itself.  Therefore, we don't have to consider cases when the successor is an ancestor.
    while (current) {

        // Update the balance factor based on the direction in which the removal took place.
        current.balanceFactor -= current === current.left ? InsertionMultiplier.LEFT : InsertionMultiplier.RIGHT;

        // If the current node is overweight, simply rebalance it.  Reassign current to the new subtree root.
        if (current.isOverweight) current = rebalanceAvlSubtree(tree, current);

        // If the current node is balanced after adjusting its balance factor (and possibly rebalancing), we can
        // safely exit.
        if (current.isBalanced) break;

        current = current.parent;
    }

    return;
};

export const rebalanceAvlSubtree = <K, V>(tree: IAvlTree<K, V>, node: IAvlTreeNode<K, V>): IAvlTreeNode<K, V> => {

    if (node.balanceFactor === BalanceFactor.LEFT_HEAVY) {

        if (node.left.balanceFactor === BalanceFactor.RIGHT_LEANING) return rotateAvlSubtreeLeftThenRight(tree, node);

        // If node.left is LEFT_LEANING, this is a standard right rotation due to insertion.  If node.left is
        // BALANCED, this is a right rotation due to a delete.
        else return rotateAvlSubtreeRight(tree, node);
    }
    else if (node.balanceFactor === BalanceFactor.RIGHT_HEAVY) {

        if (node.right.balanceFactor === BalanceFactor.LEFT_LEANING) return rotateAvlSubtreeRightThenLeft(tree, node);

        // If node.right is RIHT_LEANING, this is a standard left rotation due to insertion.  If node.right is
        // BALANCED, this is a left rotation due to a delete.
        else return rotateAvlSubtreeLeft(tree, node);
    }
};

/**
 * Rotates a subtree rooted at 'candidate' to the left.
 */
export const rotateAvlSubtreeLeft = <K, V>(tree: IAvlTree<K, V>, candidate: IAvlTreeNode<K, V>): IAvlTreeNode<K, V> => {

    // Left rotation only works if the candidate has a right child.
    if (!candidate.right) return null;

    // Define the candidate's replacement.
    const replacement = candidate.right;

    // Candidate's right child still points to the replacement.  Redirect it to the replacement's left child.
    candidate.right = replacement.left;

    // If the left child exists, reset its parent to the candidate.
    if (replacement.left) replacement.left.parent = candidate;

    // Ensure the replacement now references its new parent (currently, the candidate's parent).
    replacement.parent = candidate.parent;

    // If the candidate didn't have a parent, the replacement won't either.  The replacement is becoming the new
    // root.
    if (!candidate.parent) tree.root = replacement;

    // Otherwise, determine which subtree of the candidate should now be parented by the replacement.
    else if (candidate === candidate.parent.left) candidate.parent.left = replacement;
    else candidate.parent.right = replacement;

    // Mark the candidate as the replacement's left child (the final portion of the left rotation).
    replacement.left = candidate;

    // Next, give the candidate a new parent.
    candidate.parent = replacement;

    // Finally, update balance factors for participating nodes.
    replacement.balanceFactor++;
    candidate.balanceFactor = -replacement.balanceFactor;

    return replacement;
};

/**
 * Rotates a subtree rooted at 'candidate' to the right.
 */
export const rotateAvlSubtreeRight = <K, V>(tree: IAvlTree<K, V>,
                                            candidate: IAvlTreeNode<K, V>): IAvlTreeNode<K, V> => {

    // Right rotation only works if the candidate has a left child.
    if (!candidate.left) return null;

    // Define the candidate's replacement.
    const replacement = candidate.left;

    // Candidate's left child still points to the replacement.  Redirect it to the replacement's right child.
    candidate.left = replacement.right;

    // If the right child exists, reset its parent to the candidate.
    if (replacement.right) replacement.right.parent = candidate;

    // Ensure the replacement now references its new parent (currently, the candidate's parent).
    replacement.parent = candidate.parent;

    // If the candidate didn't have a parent, the replacement won't either.  The replacement is becoming the new
    // root.
    if (!candidate.parent) tree.root = replacement;

    // Otherwise, determine which subtree of the candidate should now be parented by the replacement.
    else if (candidate === candidate.parent.right) candidate.parent.right = replacement;
    else candidate.parent.left = replacement;

    // Mark the candidate as the replacement's right child (the final portion of the right rotation).
    replacement.right = candidate;

    // Next, give the candidate a new parent.
    candidate.parent = replacement;

    // Finally, update balance factors for participating nodes.
    replacement.balanceFactor--;
    candidate.balanceFactor = -replacement.balanceFactor;

    return replacement;
};

/**
 * Double rotation of a subtree rooted at 'candidate' to the left then right.
 */
export const rotateAvlSubtreeLeftThenRight = <K, V>(tree: IAvlTree<K, V>,
                                                    candidate: IAvlTreeNode<K, V>): IAvlTreeNode<K, V> => {
    rotateAvlSubtreeLeft(tree, candidate.left);

    return rotateAvlSubtreeRight(tree, candidate);
};

/**
 * Double rotation of a subtree rooted at 'candidate' to the right then left.
 */
export const rotateAvlSubtreeRightThenLeft = <K, V>(tree: IAvlTree<K, V>,
                                                    candidate: IAvlTreeNode<K, V>): IAvlTreeNode<K, V> => {
    rotateAvlSubtreeRight(tree, candidate.right);

    return rotateAvlSubtreeLeft(tree, candidate);
};

export const traverseAvl = <K, V>(tree: IAvlTree<K, V>, order: TraversalOrder = TraversalOrder.INORDER): V[] => {
    return traverseBst(tree, order);
};
