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
    data: T;
    left: IBinaryTreeNode<T>;
    right: IBinaryTreeNode<T>;

    constructor(data: T) {
        this.data  = data;
        this.left  = null;
        this.right = null;
    }

    public toString(): string {
        return `data: ${this.data}`;
    }
}

export type IComparer<T> = (a: T, b: T) => number;
export const defaultComparer = <T>(a: T, b: T): number => {
    if (a < b) return -1;
    else if (a == b) return 0;
    else return 1;
};

export interface IBinaryTree<T> {
    count: number;
    find(data: T): IBinaryTreeNode<T>;
    insert(data: T): IBinaryTree<T>;
    delete(data: T): IBinaryTree<T>;
    data(): T[];
    toString(): string;
}

export abstract class BinaryTree<T> implements IBinaryTree<T> {
    protected _root: IBinaryTreeNode<T>;
    protected _comparer: IComparer<T>;
    protected _count: number;

    constructor(data: T, comparer: IComparer<T>) {
        this._root  = null;
        this._count = 0;
        this._comparer = comparer;
        if (data) this.insert(data);
    }

    public get count(): number { return this._count; }

    public abstract find(data: T): IBinaryTreeNode<T>;

    public abstract insert(data: T): IBinaryTree<T>;

    public abstract delete(data: T): IBinaryTree<T>;

    public abstract data(): T[];

    public abstract toString(): string;

}