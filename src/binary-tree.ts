
import { UnionKeyToValue } from "./util";
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

export type IComparer<T> = (a: T, b: T) => number;
export const defaultComparer = <T>(a: T, b: T): number => {
    if (a < b) return -1;
    else if (a == b) return 0;
    else return 1;
};

export enum TraversalOrder {
    PREORDER,
    INORDER,
    POSTORDER,
    HIEGHTORDER
}

export interface IBinaryTree<T> {
    count: number;
    clear(): void;
    traverse(order: TraversalOrder): T[];
    toString(): string;
}

export abstract class BinaryTree<T> implements IBinaryTree<T> {
    protected _root: IBinaryTreeNode<T>;
    protected _comparer: IComparer<T>;
    protected _count: number;

    //<editor-fold

    constructor(data: T, comparer: IComparer<T>) {
        this._root     = data ? new BinaryTreeNode<T>(data) : null;
        this._count    = 0;
        this._comparer = comparer;
    }

    public get count(): number {
        return this._count;
    }

    public clear(): void {
        this._root = null;
    }

    public abstract traverse(order: TraversalOrder): T[];

    public abstract toString(): string;

}