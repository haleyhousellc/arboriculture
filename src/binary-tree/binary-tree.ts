/**
 * Base binary tree node interface
 */
export interface IBinaryTreeNode<K, V = K> {
    key: K;
    value: V;
    left: IBinaryTreeNode<K, V> | any;
    right: IBinaryTreeNode<K, V> | any;

    toString(): string;
}

/**
 * Implementation of base binary tree node
 */
export const BinaryTreeNode = <K, V>(k: K, v?: V): IBinaryTreeNode<K, V> => {

    // internal members
    const key: K   = k;
    const value: V = v || (k as any) as V;  // ignore this trickery

    const left: IBinaryTreeNode<K, V>  = null;
    const right: IBinaryTreeNode<K, V> = null;

    // exposed object
    return {
        left,

        right,

        get key(): K { return key; },

        get value(): V { return value; },

        toString() { return `key: ${key}, value: ${value}`; },
    };
};

export const nodeIsLeaf = <K, V>(node: IBinaryTreeNode<K, V>): boolean => {
    if (!node) return false;

    return !node.left && !node.right;
};

export const nodeHasSingleChild = <K, V>(node: IBinaryTreeNode<K, V>): boolean => {
    if (!node || nodeIsLeaf(node)) return false;

    return !node.left || !node.right;
};

export const nodeHasTwoChildren = <K, V>(node: IBinaryTreeNode<K, V>): boolean => {
    if (!node) return false;

    return node.left && node.right;
};

/**
 * Interface for writing custom compare functions.
 */
export type IComparer<K> = (a: K, b: K) => number;

/**
 * The default comparison function performs simple comparison only.  On complex types, results are undefined.  It is up
 * to the user to correctly define a comparison function for custom types.
 */
export const defaultComparer = <K>(a: K, b: K): number => {
    if (a < b) return -1;
    else if (a === b) return 0;
    else return 1;
};

export enum TraversalOrder {
    PREORDER,
    INORDER,
    POSTORDER,
//    HEIGHTORDER,
}

export interface IBinaryTree<K, V> {
    root: IBinaryTreeNode<K, V>;

    size(): number;

    find(key: K): V | any;

    min(): V | any;

    max(): V | any;

    insert(key: K, value?: V): IBinaryTree<K, V> | any;

    remove(key: K): IBinaryTree<K, V> | any;

    clear(): void;

    traverse(order?: TraversalOrder): V[];

    toString(): string;
}

/**
 * Start supporting recursive tree functions
 */
export const traverseTree = <K, V>(root: IBinaryTreeNode<K, V>,
                                   order: TraversalOrder = TraversalOrder.INORDER): V[] => {
    switch (order) {
        case TraversalOrder.PREORDER:
            return traverseTreePreOrder(root);
        case TraversalOrder.POSTORDER:
            return traverseTreePostOrder(root);
        case TraversalOrder.INORDER:
        default:
            return traverseTreeInOrder(root);
    }
};

export const traverseTreeInOrder = <K, V>(root: IBinaryTreeNode<K, V>): V[] => {
    if (!root) return [];

    const left  = traverseTreeInOrder(root.left);
    const self  = root.value;
    const right = traverseTreeInOrder(root.right);

    return [].concat(left, self, right);
};

export const traverseTreePreOrder = <K, V>(root: IBinaryTreeNode<K, V>): V[] => {
    if (!root) return [];

    const left  = traverseTreePreOrder(root.left);
    const self  = root.value;
    const right = traverseTreePreOrder(root.right);

    return [].concat(self, left, right);
};

export const traverseTreePostOrder = <K, V>(root: IBinaryTreeNode<K, V>): V[] => {
    if (!root) return [];

    const left  = traverseTreePostOrder(root.left);
    const self  = root.value;
    const right = traverseTreePostOrder(root.right);

    return [].concat(left, right, self);
};

export const getTreeHeight = <K, V>(root: IBinaryTreeNode<K, V>): number => {
    if (!root) return 0;

    const leftHeight  = getTreeHeight(root.left);
    const rightHeight = getTreeHeight(root.right);

    return Math.max(leftHeight, rightHeight) + 1;
};

export const cloneNode = <K, V>(node: IBinaryTreeNode<K, V>): IBinaryTreeNode<K, V> => {
    return BinaryTreeNode(node.key, node.value);
};

export const cloneTree = <K, V>(root: IBinaryTreeNode<K, V>): IBinaryTreeNode<K, V> => {
    if (!root) return null;

    const node = cloneNode(root);

    node.left  = cloneTree(root.left);
    node.right = cloneTree(root.right);

    return node;
};
