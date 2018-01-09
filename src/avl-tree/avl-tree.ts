import {
    clearBst,
    findFromNode,
    insertAtNode,
    isValidBst,
    maxFromNode,
    minFromNode,
    removeAtNode,
    BinarySearchTreeNode,
    IBinarySearchTreeNode,
} from '../binary-search-tree/binary-search-tree';
import { defaultComparer, getTreeHeight, traverseTree, IComparer, TraversalOrder } from '../binary-tree/binary-tree';

export enum BalanceFactor {
    RIGHT_HEAVY   = -2,
    RIGHT_LEANING = -1,
    BALANCED      = 0,
    LEFT_LEANING  = 1,
    LEFT_HEAVY    = 2,
}

/**
 * An avl tree node redefines the types of members #left, #right, and #parent to return IAvlTreeNode<K, V> rather
 * than a IBinarySearchTreeNode<K, V>.  It also adds a new member #color used in determining how/when to rotate the
 * tree.
 */
export interface IAvlTreeNode<K, V = K> extends IBinarySearchTreeNode<K, V> {
    left: IAvlTreeNode<K, V>;
    right: IAvlTreeNode<K, V>;
    parent: IAvlTreeNode<K, V>;

    getBalanceFactor(): BalanceFactor;

    isOverweight(): boolean;
}

export const AvlTreeNode = <K, V>(key: K, value?: V): IAvlTreeNode<K, V> => {
    const node: IBinarySearchTreeNode<K, V> = BinarySearchTreeNode(key, value);

    return {
        ...node,

        get left(): IAvlTreeNode<K, V> { return node.left as IAvlTreeNode<K, V>; },

        get right(): IAvlTreeNode<K, V> { return node.right as IAvlTreeNode<K, V>; },

        get parent(): IAvlTreeNode<K, V> { return node.parent as IAvlTreeNode<K, V>; },

        getBalanceFactor(): BalanceFactor {
            const leftHeight  = this.left ? getTreeHeight(this.left) : 0;
            const rightHeight = this.right ? getTreeHeight(this.right) : 0;

            return leftHeight - rightHeight;
        },

        isOverweight(): boolean {
            const balanceFactor = this.getBalanceFactor();

            return balanceFactor === BalanceFactor.LEFT_HEAVY || balanceFactor === BalanceFactor.RIGHT_HEAVY;
        },

        toString(): string {
            const str = `value: ${this.value}, balance factor: ${this.getBalanceFactor()}`;
            if (this.left) str.concat(`, left.value: ${this.left.value}`);
            if (this.right) str.concat(`, right.value: ${this.right.value}`);
            if (this.parent) str.concat(`, parent.value: ${this.parent.value}`);

            return str;
        },
    };
};

export interface IAvlTree<K, V = K> {
    root: IAvlTreeNode<K, V>;

    size(): number;

    height(): number;

    clear(): void;

    find(key: K): V;

    min(): V;

    max(): V;

    insert(key: K, value?: V): IAvlTree<K, V>;

    remove(key: K): IAvlTree<K, V>;

    traverse(order?: TraversalOrder): V[];

    toString(): string;

    clone(): IAvlTree<K, V>;
}

export const AvlTree = <K, V>(comparer: IComparer<K> = defaultComparer): IAvlTree<K, V> => {
    const root: IAvlTreeNode<K, V> = null;

    return {
        root,

        size(): number { return this.traverse().length; },

        height(): number { return getTreeHeight(this.root); },

        clear(): void { return clearBst(this); },

        find(key: K): V {
            const node = findFromNode(this.root, key, comparer) as IAvlTreeNode<K, V>;

            return node ? node.value : null;
        },

        min(): V {
            const node = minFromNode(this.root) as IAvlTreeNode<K, V>;

            return node ? node.value : null;
        },

        max(): V {
            const node = maxFromNode(this.root) as IAvlTreeNode<K, V>;

            return node ? node.value : null;
        },

        insert(key: K, value?: V): IAvlTree<K, V> {
            const freshNode = AvlTreeNode(key, value);

            if (!this.root) {
                this.root = freshNode;
            } else {
                // Insert the node.
                const insertedNode = insertAtNode(this.root, freshNode, comparer) as IAvlTreeNode<K, V>;

                // Fix the insertion.
                fixInsertionIntoAvl(this, insertedNode);
            }

            return this;
        },

        remove(key: K): IAvlTree<K, V> {

            // Find the node first, and return if it isn't found.
            const candidate = findFromNode(this.root, key, comparer) as IAvlTreeNode<K, V>;

            if (candidate) {

                // Initial starting point.
                const fixStartNode = candidate;

                // Find the successor to the candidate up for delete.
                const possibleReplacement: IAvlTreeNode<K, V> = minFromNode(candidate.right) as IAvlTreeNode<K, V>;

                const targetToFix: IAvlTreeNode<K, V> = (possibleReplacement && possibleReplacement !== candidate.right)
                    ? possibleReplacement.parent
                    : fixStartNode;

                const replacement = removeAtNode(candidate) as IAvlTreeNode<K, V>;

                // Now, fix any imbalances that may have arisen.
                fixDeletionFromAvl(this, targetToFix);

                if (!candidate.parent) this.root = replacement;
            }

            return this;
        },

        traverse(order: TraversalOrder = TraversalOrder.INORDER): V[] { return traverseTree(this.root, order); },

        toString(order: TraversalOrder = TraversalOrder.INORDER): string {
            return this.traverse(order)
                       .join(' | ')
                       .trim();
        },

        clone(): IAvlTree<K, V> {
            const newTree: IAvlTree<K, V> = AvlTree();
            newTree.root                  = cloneAvlSubtree(this.root);

            return newTree;
        },
    };
};

//</editor-fold>

//<editor-fold desc="private">

/**
 * This function adjusts balance factors and performs any rotations needed after inserting a new node.
 */
const fixInsertionIntoAvl = <K, V>(tree: IAvlTree<K, V>, candidate: IAvlTreeNode<K, V>): void => {

    // Quick sanity check.
    if (!candidate || !candidate.parent) return;

    let current: IAvlTreeNode<K, V> = candidate.parent;

    // If the current node is overweight, simply rebalance it.  Reassign current to the new subtree root.
    if (current.isOverweight()) current = rebalanceAvlSubtree(tree, current);

    // If the current node is balanced after adjusting its balance factor (and possibly rebalancing), we can
    // safely exit.
    if (current.getBalanceFactor() === BalanceFactor.BALANCED) return;

    // Tail call
    fixInsertionIntoAvl(tree, current);
};

/**
 * This function adjusts balance factors and performs any rotations needed after deleting a node.
 *
 * Follow the path from the replacement to the candidate and update balance factors along the way.  When removing a
 * node from a BST, the successor will always be a descendant of the candidate or the candidate itself.  Therefore,
 * we don't have to consider cases when the successor is an ancestor.
 *
 * @param {IAvlTree<K, V>} tree
 * @param {IAvlTreeNode<K, V>} candidate
 */
const fixDeletionFromAvl = <K, V>(tree: IAvlTree<K, V>,
                                  candidate: IAvlTreeNode<K, V>): void => {

    if (!candidate) return;

    let current: IAvlTreeNode<K, V> = candidate;

    // If the current node is overweight, simply rebalance it.  Reassign current to the new subtree root.
    if (current.isOverweight()) current = rebalanceAvlSubtree(tree, current);

    // Tail call
    fixDeletionFromAvl(tree, current.parent);
};

const rebalanceAvlSubtree = <K, V>(tree: IAvlTree<K, V>, node: IAvlTreeNode<K, V>): IAvlTreeNode<K, V> => {

    if (node.getBalanceFactor() === BalanceFactor.LEFT_HEAVY) {
        return node.left.getBalanceFactor() === BalanceFactor.RIGHT_LEANING
            ? rotateAvlSubtreeLeftThenRight(tree, node)
            : rotateAvlSubtreeRight(tree, node);
    }
    else if (node.getBalanceFactor() === BalanceFactor.RIGHT_HEAVY) {
        return node.right.getBalanceFactor() === BalanceFactor.LEFT_LEANING
            ? rotateAvlSubtreeRightThenLeft(tree, node)
            : rotateAvlSubtreeLeft(tree, node);
    }
};

/**
 * Rotates a subtree rooted at 'candidate' to the left.
 */
const rotateAvlSubtreeLeft = <K, V>(tree: IAvlTree<K, V>, candidate: IAvlTreeNode<K, V>): IAvlTreeNode<K, V> => {

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

    return replacement;
};

/**
 * Rotates a subtree rooted at 'candidate' to the right.
 */
const rotateAvlSubtreeRight = <K, V>(tree: IAvlTree<K, V>,
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

    return replacement;
};

/**
 * Double rotation of a subtree rooted at 'candidate' to the left then right.
 */
const rotateAvlSubtreeLeftThenRight = <K, V>(tree: IAvlTree<K, V>,
                                             candidate: IAvlTreeNode<K, V>): IAvlTreeNode<K, V> => {
    rotateAvlSubtreeLeft(tree, candidate.left);

    return rotateAvlSubtreeRight(tree, candidate);
};

/**
 * Double rotation of a subtree rooted at 'candidate' to the right then left.
 */
const rotateAvlSubtreeRightThenLeft = <K, V>(tree: IAvlTree<K, V>,
                                             candidate: IAvlTreeNode<K, V>): IAvlTreeNode<K, V> => {
    rotateAvlSubtreeRight(tree, candidate.right);

    return rotateAvlSubtreeLeft(tree, candidate);
};

// utilities

export const isValidAvl = <K, V>(node: IAvlTreeNode<K, V>,
                                 comparer: IComparer<K> = defaultComparer): boolean => {
    if (!node) return true;

    if (node.left && comparer(node.key, node.left.key) < 0) return false;
    if (node.right && comparer(node.key, node.right.key) > 0) return false;

    const leftIsValid  = node.left ? isValidAvl(node.left) : true;
    const rightIsValid = node.right ? isValidAvl(node.right) : true;

    return leftIsValid && rightIsValid && !node.isOverweight();
};

export const findInvalidAvlNode = <K, V>(node: IAvlTreeNode<K, V>): IAvlTreeNode<K, V> => {
    if (!node) return null;

    if (!isValidAvl(node)) {

        if (!isValidAvl(node.left)) {
            return findInvalidAvlNode(node.left);
        }

        if (!isValidAvl(node.right)) {
            return findInvalidAvlNode(node.right);
        }

        return node;
    }

    return null;
};

export const cloneAvlNode = <K, V>(node: IAvlTreeNode<K, V>): IAvlTreeNode<K, V> => {
    return AvlTreeNode(node.key, node.value);
};

const cloneAvlSubtree = <K, V>(root: IAvlTreeNode<K, V>): IAvlTreeNode<K, V> => {
    if (!root) return null;

    const node = cloneAvlNode(root);

    node.left = cloneAvlSubtree(root.left);
    if (node.left) node.left.parent = node;

    node.right = cloneAvlSubtree(root.right);
    if (node.right) node.right.parent = node;

    return node;
};
