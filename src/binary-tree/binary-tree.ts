
/**
 * Base binary tree node interface
 */
export interface IBinaryTreeNode<T> {
    data: T;
    left: IBinaryTreeNode<T>;
    right: IBinaryTreeNode<T>;
    toString(): string;
}

/**
 * Implementation of base binary tree node
 */
export class BinaryTreeNode<T> implements IBinaryTreeNode<T> {
    public _data: T;
    public _left: IBinaryTreeNode<T>;
    public _right: IBinaryTreeNode<T>;

    constructor(data: T) {
        this._data  = data;
        this._left  = null;
        this._right = null;
    }

    public get data(): T {
        return this._data;
    }

    public set data(newData: T) {
        this._data = newData;
    }

    public get left(): IBinaryTreeNode<T> {
        return this._left;
    }

    public set left(newLeft: IBinaryTreeNode<T>) {
        this._left = newLeft;
    }

    public get right(): IBinaryTreeNode<T> {
        return this._right;
    }

    public set right(newRight: IBinaryTreeNode<T>) {
        this._right = newRight;
    }

    public toString(): string {
        return `data: ${this._data}`;
    }
}

/**
 * Interface for writing custom compare functions.
 */
export type IComparer<T> = (a: T, b: T) => number;

/**
 * The default comparison function performs simple comparison only.  On complex types, results are undefined.  It is up
 * to the user to correctly define a comparison function for custom types.
 */
export const defaultComparer = <T>(a: T, b: T): number => {
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

export interface IBinaryTree<T> {
    count: number;
    find(data: T): IBinaryTreeNode<T>;
    min(): IBinaryTreeNode<T>;
    max(): IBinaryTreeNode<T>;
    insert(data: T): IBinaryTree<T>;
    remove(data: T): IBinaryTree<T>;
    clear(): void;
    traverse(order: TraversalOrder): T[];
    toString(): string;
}

/**
 * Abstract class providing base interface for binary trees.  Since operations like #find, #min, #max, #insert, #delete,
 * #traverse, etc. are not exactly defined for a simple "binary tree", these operations are marked abstract and must be
 * implemented by subclasses.
 *
 * #count and #clear are provided since these should be universal, but they may still be overridden if desired.
 */
export abstract class BinaryTree<T> implements IBinaryTree<T> {
    protected _root: IBinaryTreeNode<T>;
    protected _comparer: IComparer<T>;
    protected _count: number;

    constructor(data: T, comparer: IComparer<T>) {
        this._root     = data ? new BinaryTreeNode<T>(data) : null;
        this._count    = 0;
        this._comparer = comparer;
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
        this._root = null;
    }

    /**
     * This method takes a piece of data and returns the node that holds it if it is present in the tree.  Otherwise,
     * null is returned.
     */
    public abstract find(data: T): IBinaryTreeNode<T>;

    /**
     * This method simply returns the minimum value of the tree.
     */
    public abstract min(): IBinaryTreeNode<T>;

    /**
     * This method simply returns the maximum value of the tree.
     */
    public abstract max(): IBinaryTreeNode<T>;

    /**
     * This method takes a piece of data, creates a new node, and inserts it into the tree.  The tree itself is
     * returned, so this method is chainable.
     */
    public abstract insert(data: T): IBinaryTree<T>;

    /**
     * This method takes a piece of data and removes the node that holds it.  If the node is not present in the tree,
     * no change is made.  The tree itself is returned, so this method is chainable.
     */
    public abstract remove(data: T): IBinaryTree<T>;

    /**
     * This method returns an array of the data in the tree according to the requested TraversalOrder.
     */
    public abstract traverse(order: TraversalOrder): T[];

    /**
     * This provides a string representation of the tree.  No specification is provided, so it is up to the specific
     * tree on how to implement this.
     */
    public abstract toString(): string;

}
