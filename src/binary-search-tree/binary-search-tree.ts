import {
    defaultComparer,
    getTreeHeight,
    nodeHasSingleChild,
    nodeHasTwoChildren,
    nodeIsLeaf,
    traverseTree,
    BinaryTreeNode,
    IBinaryTreeNode,
    IComparer, TraversalOrder,
} from '../binary-tree/binary-tree';

/**
 * A binary search tree node redefines the types of members #left and #right to return IBinarySearchTreeNode<K, V>
 * rather than a base IBinaryTreeNode<K, V>.  It also adds a pointer to its parent for much simpler manipulation in the
 * tree.
 */
export interface IBinarySearchTreeNode<K, V = K> extends IBinaryTreeNode<K, V> {
    left: IBinarySearchTreeNode<K, V>;
    right: IBinarySearchTreeNode<K, V>;
    parent: IBinarySearchTreeNode<K, V>;
}

export const BinarySearchTreeNode = <K, V>(key: K, value?: V): IBinarySearchTreeNode<K, V> => {
    const node                                = BinaryTreeNode(key, value);
    const parent: IBinarySearchTreeNode<K, V> = null;

    return {
        ...node,

        get left(): IBinarySearchTreeNode<K, V> { return node.left as IBinarySearchTreeNode<K, V>; },

        get right(): IBinarySearchTreeNode<K, V> { return node.right as IBinarySearchTreeNode<K, V>; },

        parent,
    };
};

export interface IBinarySearchTree<K, V = K> {
    root: IBinarySearchTreeNode<K, V>;

    size(): number;

    height(): number;

    clear(): void;

    find(key: K): V;

    min(): V;

    max(): V;

    insert(key: K, value?: V): IBinarySearchTree<K, V>;

    remove(key: K): IBinarySearchTree<K, V>;

    traverse(order?: TraversalOrder): V[];

    toString(): string;

    clone(): IBinarySearchTree<K, V>;
}

/**
 * Simple binary search tree supporting find, insert, and remove operations.
 */
export const BinarySearchTree = <K, V>(comparer: IComparer<K> = defaultComparer): IBinarySearchTree<K, V> => {
    const root: IBinarySearchTreeNode<K, V> = null;

    return {
        root,

        size(): number { return this.traverse().length; },

        height(): number { return getTreeHeight(this.root); },

        clear(): void { return clearBst(this); },

        find(key: K): V {
            const node: IBinarySearchTreeNode<K, V> = findFromNode(this.root, key, comparer);

            return node ? node.value : null;
        },

        min(): V {
            const node: IBinarySearchTreeNode<K, V> = minFromNode(this.root);

            return node ? node.value : null;
        },

        max(): V {
            const node: IBinarySearchTreeNode<K, V> = maxFromNode(this.root);

            return node ? node.value : null;
        },

        insert(key: K, value?: V): IBinarySearchTree<K, V> {
            const freshNode = BinarySearchTreeNode(key, value);

            (!this.root)
                ? this.root = freshNode
                : insertAtNode(this.root, freshNode, comparer);

            return this;
        },

        remove(key: K): IBinarySearchTree<K, V> {

            // Find the node first, and return if it isn't found.
            const candidate = findFromNode(this.root, key, comparer);

            if (candidate) {
                const replacement = removeAtNode(candidate);

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

        clone(): IBinarySearchTree<K, V> {
            const newTree: IBinarySearchTree<K, V> = BinarySearchTree();
            newTree.root                           = cloneBstSubtree(this.root);

            return newTree;
        },
    };
};

export const clearBst = <K, V>(tree: IBinarySearchTree<K, V>): void => tree.root = null;

export const findFromNode = <K, V>(root: IBinarySearchTreeNode<K, V>,
                                   key: K,
                                   comparer: IComparer<K> = defaultComparer): IBinarySearchTreeNode<K, V> => {
    if (!root) return null;

    if (comparer(root.key, key) === 0) return root;

    // Tail call
    return comparer(root.key, key) < 0
        ? findFromNode(root.right, key, comparer)
        : findFromNode(root.left, key, comparer);
};

export const minFromNode = <K, V>(root: IBinarySearchTreeNode<K, V>): IBinarySearchTreeNode<K, V> => {
    if (!root || !root.left) return root;

    // Tail call
    return minFromNode(root.left);
};

export const maxFromNode = <K, V>(root: IBinarySearchTreeNode<K, V>): IBinarySearchTreeNode<K, V> => {
    if (!root || !root.right) return root;

    // Tail call
    return maxFromNode(root.right);
};

export const insertAtNode = <K, V>(current: IBinarySearchTreeNode<K, V>,
                                   freshNode: IBinarySearchTreeNode<K, V>,
                                   comparer: IComparer<K> = defaultComparer): IBinarySearchTreeNode<K, V> => {

    // Insert
    if (!current) return freshNode;

    // Update and return
    if (comparer(current.key, freshNode.key) === 0) {
        current.value = freshNode.value;

        return current;
    }

    // Otherwise insert into the correct subtree.
    if (comparer(current.key, freshNode.key) < 0) {
        if (!current.right) {
            current.right    = freshNode;
            freshNode.parent = current;

            return freshNode;
        }

        // Tail call
        return insertAtNode(current.right, freshNode, comparer);
    } else {
        if (!current.left) {
            current.left     = freshNode;
            freshNode.parent = current;

            return freshNode;
        }

        // Tail call
        return insertAtNode(current.left, freshNode, comparer);
    }
};

export const removeAtNode = <K, V>(candidate: IBinarySearchTreeNode<K, V>): IBinarySearchTreeNode<K, V> => {

    if (!candidate) return null;

    let replacement: IBinarySearchTreeNode<K, V> = null;

    if (nodeIsLeaf(candidate)) replacement = handleLeafNode(candidate);
    else if (!candidate.right) replacement = handleNodeWithLeftChildOnly(candidate);
    else if (!candidate.left) replacement = handleNodeWithRightChildOnly(candidate);
    else if (nodeHasTwoChildren(candidate)) replacement = handleSaturatedNode(candidate);

    return replacement;
};

const handleLeafNode = <K, V>(candidate: IBinarySearchTreeNode<K, V>): IBinarySearchTreeNode<K, V> => {
    const replacement: IBinarySearchTreeNode<K, V> = null;

    if (candidate.parent) {
        candidate.parent.left === candidate
            ? candidate.parent.left = null
            : candidate.parent.right = null;
    }

    return replacement;
};

const handleNodeWithRightChildOnly = <K, V>(candidate: IBinarySearchTreeNode<K, V>): IBinarySearchTreeNode<K, V> => {
    const replacement: IBinarySearchTreeNode<K, V> = candidate.right;

    replacement.parent = candidate.parent;

    if (candidate.parent) {
        candidate.parent.left === candidate
            ? candidate.parent.left = replacement
            : candidate.parent.right = replacement;
    }

    return replacement;
};

const handleNodeWithLeftChildOnly = <K, V>(candidate: IBinarySearchTreeNode<K, V>): IBinarySearchTreeNode<K, V> => {
    const replacement: IBinarySearchTreeNode<K, V> = candidate.left;

    replacement.parent = candidate.parent;

    if (candidate.parent) {
        candidate.parent.left === candidate
            ? candidate.parent.left = replacement
            : candidate.parent.right = replacement;
    }

    return replacement;
};

const handleSaturatedNode = <K, V>(candidate: IBinarySearchTreeNode<K, V>): IBinarySearchTreeNode<K, V> => {
    const replacement: IBinarySearchTreeNode<K, V> = minFromNode(candidate.right);

    // Replace the candidate key/value with the replacement and delete the original replacement.
    candidate.key   = replacement.key;
    candidate.value = replacement.value;

    if (nodeIsLeaf(replacement)) {
        handleLeafNode(replacement);
    }
    else { // the only other option for a min node is to have a right child
        handleNodeWithRightChildOnly(replacement);
    }

    return candidate;
};

// helper functions

export const isValidBst = <K, V>(node: IBinarySearchTreeNode<K, V>,
                                 comparer: IComparer<K> = defaultComparer): boolean => {
    if (!node) return true;

    if (node.left && comparer(node.key, node.left.key) < 0) return false;
    if (node.right && comparer(node.key, node.right.key) > 0) return false;

    const leftIsValid  = node.left ? isValidBst(node.left) : true;
    const rightIsValid = node.right ? isValidBst(node.right) : true;

    return leftIsValid && rightIsValid;
};

export const findInvalidBstNode = <K, V>(node: IBinarySearchTreeNode<K, V>): IBinarySearchTreeNode<K, V> => {
    if (!node) return null;

    if (!isValidBst(node)) {

        if (!isValidBst(node.left)) {
            return findInvalidBstNode(node.left);
        }

        if (!isValidBst(node.right)) {
            return findInvalidBstNode(node.right);
        }

        return node;
    }

    return null;
};

export const cloneBstNode = <K, V>(node: IBinarySearchTreeNode<K, V>): IBinarySearchTreeNode<K, V> => {
    return BinarySearchTreeNode(node.key, node.value);
};

const cloneBstSubtree = <K, V>(root: IBinarySearchTreeNode<K, V>): IBinarySearchTreeNode<K, V> => {
    if (!root) return null;

    const node = cloneBstNode(root);

    node.left = cloneBstSubtree(root.left);
    if (node.left) node.left.parent = node;

    node.right = cloneBstSubtree(root.right);
    if (node.right) node.right.parent = node;

    return node;
};
