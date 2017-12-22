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

    let left: IBinaryTreeNode<K, V>  = null;
    let right: IBinaryTreeNode<K, V> = null;

    // exposed object
    return {
        get key(): K { return key; },

        get value(): V { return value; },

        get left(): IBinaryTreeNode<K, V> { return left; },

        set left(newLeft: IBinaryTreeNode<K, V>) { left = newLeft; },

        get right(): IBinaryTreeNode<K, V> { return right; },

        set right(newRight: IBinaryTreeNode<K, V>) { right = newRight; },

        toString() { return `key: ${key}, value: ${value}`; },
    };
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
    HIEGHTORDER,
}

export interface IBinaryTree<K, V> {
    root: IBinaryTreeNode<K, V>;

    count: number;

    find(key: K): IBinaryTreeNode<K, V> | any;

    min(): IBinaryTreeNode<K, V> | any;

    max(): IBinaryTreeNode<K, V> | any;

    insert(key: K, value?: V): IBinaryTree<K, V> | any;

    remove(key: K): IBinaryTree<K, V> | any;

    clear(): void;

    traverse(order: TraversalOrder): V[];

    toString(): string;
}
