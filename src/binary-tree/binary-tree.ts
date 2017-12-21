/**
 * Base binary tree node interface
 */
export interface IBinaryTreeNode<K, V = any> {
    key: K;
    value: V;
    left: IBinaryTreeNode<K, V>;
    right: IBinaryTreeNode<K, V>;

    toString(): string;
}

/**
 * Implementation of base binary tree node
 */
export class BinaryTreeNode<K, V = any> implements IBinaryTreeNode<K, V> {
    protected _key: K;
    protected _value: V;
    protected _left: IBinaryTreeNode<K, V>;
    protected _right: IBinaryTreeNode<K, V>;

    constructor(key: K, value?: V) {
        this._key = key;
        if (value) {
            this._value = value;
        } else {
            // ignore this trickery
            const temp: any = key;
            this._value = temp as V;
        }
        this._left  = null;
        this._right = null;
    }

    public get key(): K {
        return this._key;
    }

    public get value(): V {
        return this._value;
    }

    public set value(newData: V) {
        this._value = newData;
    }

    public get left(): IBinaryTreeNode<K, V> {
        return this._left;
    }

    public set left(newLeft: IBinaryTreeNode<K, V>) {
        this._left = newLeft;
    }

    public get right(): IBinaryTreeNode<K, V> {
        return this._right;
    }

    public set right(newRight: IBinaryTreeNode<K, V>) {
        this._right = newRight;
    }

    public toString(): string {
        return `key: ${this._key}, value: ${this._value}`;
    }
}

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
    count: number;

    find(key: K): IBinaryTreeNode<K, V>;

    min(): IBinaryTreeNode<K, V>;

    max(): IBinaryTreeNode<K, V>;

    insert(key: K, value?: V): IBinaryTree<K, V>;

    remove(key: K): IBinaryTree<K, V>;

    clear(): void;

    traverse(order: TraversalOrder): V[];

    toString(): string;
}

/**
 * Abstract class providing base interface for binary trees.  Since operations like #find, #min, #max, #insert, #delete,
 * #traverse, etc. are not exactly defined for a simple "binary tree", these operations are marked abstract and must be
 * implemented by subclasses.
 *
 * #count and #clear are provided since these should be universal, but they may still be overridden if desired.
 */
export abstract class BinaryTree<K, V> implements IBinaryTree<K, V> {
    protected _root: IBinaryTreeNode<K, V>;
    protected _comparer: IComparer<K>;
    protected _count: number;

    constructor(comparer: IComparer<K>) {
        this._root     = null;
        this._comparer = comparer;
        this._count    = 0;
    }

    /**
     * This method simply returns the number of nodes in the tree.
     */
    public get count(): number {
        return this._count;
    }

    /**
     * This method clears the tree.  By setting the root to null, the reset of the tree should be garbage collected.
     */
    public clear(): void {
        this._root  = null;
        this._count = 0;
    }

    /**
     * This method takes a piece of data and returns the node that holds it if it is present in the tree.  Otherwise,
     * null is returned.
     */
    public abstract find(key: K): IBinaryTreeNode<K, V>;

    /**
     * This method simply returns the minimum value of the tree.
     */
    public abstract min(): IBinaryTreeNode<K, V>;

    /**
     * This method simply returns the maximum value of the tree.
     */
    public abstract max(): IBinaryTreeNode<K, V>;

    /**
     * This method takes a piece of data, creates a new node, and inserts it into the tree.  The tree itself is
     * returned, so this method is chainable.
     */
    public abstract insert(key: K, value?: V): IBinaryTree<K, V>;

    /**
     * This method takes a piece of data and removes the node that holds it.  If the node is not present in the tree,
     * no change is made.  The tree itself is returned, so this method is chainable.
     */
    public abstract remove(key: K): IBinaryTree<K, V>;

    /**
     * This method returns an array of the data in the tree according to the requested TraversalOrder.
     */
    public abstract traverse(order: TraversalOrder): V[];

    /**
     * This provides a string representation of the tree.  No specification is provided, so it is up to the specific
     * tree on how to implement this.
     */
    public abstract toString(): string;

}
