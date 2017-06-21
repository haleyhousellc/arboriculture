import { IBinaryTreeNode, BinaryTreeNode } from './binary-tree';
import { BinarySearchTree } from "./binary-search-tree";

export interface IRedBlackTreeNode<T> extends IBinaryTreeNode<T> {

}

export class RedBlackTreeNode<T> extends BinaryTreeNode<T> implements IRedBlackTreeNode<T> {

}

export interface IRedBlackTree<T> {
    count: number;
    find(data: T): IRedBlackTreeNode<T>;
    insert(data: T): IRedBlackTree<T>;
    delete(data: T): IRedBlackTree<T>;
    data(): T[];
    toString(): string;
}

export type IComparer<T> = (a: T, b: T) => number;
export const defaultComparator = <T>(a: T, b: T): number => {
    if (a < b) return -1;
    else if (a == b) return 0;
    else return 1;
};

/**
 * Simple binary search tree supporting find, insert, and delete operations.
 */
export class RedBlackTree<T> extends BinarySearchTree<T> implements IRedBlackTree<T> {

    constructor(data: T = null, comparer: IComparer<T> = defaultComparator) {
        super(data, comparer);
    }

    public get count(): number {
        return this._count;
    }

    public find(data: T): IBinaryTreeNode<T> {
        return this._find(data, this._root);
    }

    public insert(data: T): IRedBlackTree<T> {
        this._insert(data, this._root);
        return this;
    }

    public delete(data: T): IRedBlackTree<T> {
        this._delete(data, this._root);
        return this;
    }

    public data(): T[] {
        return this._traverse(this._root);
    }

    public toString(): string {
        let s = '';
        this._traverse(this._root).forEach((datum) => {
            s += `${datum.toString()}; `;
        });
        return s.trim();
    }

    /**
     * Search the tree for a given piece of data
     */
    protected _find(data: T, node: IRedBlackTreeNode<T>): IBinaryTreeNode<T> {

        // if the node is null, or the data is found, good on us
        if (!node || this._comparer(data, node.data) === 0) return node;

        // if the requested data is greater than the data in the current node, traverse the right child
        if (this._comparer(data, node.data) > 0) return this._find(data, node.right);

        // if the requested data is less than the data in the current node, traverse the left child
        return this._find(data, node.left);
    }

    /**
     * Insert the given data into the tree.  No duplicates are allowed.  If the new data is a duplicate, no change
     * occurs.
     */
    protected _insert(data: T, node: IRedBlackTreeNode<T>): IRedBlackTreeNode<T> {

        // If the node is null, return a new node with the data.
        // The node will only be null when the tree is empty (i.e. root is null) or if the node is a leaf.
        if (!node) {

            // Create a new node to hold the inserted data.
            const newNode: IRedBlackTreeNode<T> = new RedBlackTreeNode<T>(data);

            // This is a shortcut to assign the root of a previously empty tree.
            if (!this._root) this._root = newNode;

            // Increment the node count.
            this._count++;

            return newNode;
        }

        // If the requested data is less than the data in the node, _insert into the left subtree.
        if (this._comparer(data, node.data) < 0) node.left = this._insert(data, node.left);

        // If the requested data is greater than the data in the node, _insert into the right subtree.
        else if (this._comparer(data, node.data) > 0) node.right = this._insert(data, node.right);

        // Return the current node.
        // If the new data is already present in the tree, the current node is unchanged.  Otherwise, the current node's
        // descendants will have been updated with the insertion.
        return node;
    }

    /**
     * Delete the given data from the tree.  The 'root' argument is the root of the current subtree, no necessarily the
     * top-level root of the full tree.  The return value is the new root of the tree (if unchanged, the original root
     * is returned).
     */
    protected _delete(data: T, root: IRedBlackTreeNode<T>): IRedBlackTreeNode<T> {

        // If the root is null, return null - nothing to _delete.
        if (!root) return root;

        // If the data to be deleted is less than the root's data, look in the left subtree.
        if (this._comparer(data, root.data) < 0) root.left = this._delete(data, root.left);

        // If the data to be deleted is greater than the root's data, look in the right subtree.
        else if (this._comparer(data, root.data) > 0) root.right = this._delete(data, root.right);

        // If the data is the target, then _delete the current root.
        else {

            // Decrement the node count.
            this._count--;

            // If the root has at most one child (and it is a right child), return the right child.
            if (!root.left) return root.right;

            // If the root has at most one child (and it is a left child), return the left child.
            else if (!root.right) return root.left;

            // If the root has two children, find the immediate, in-order successor.  Use the right child since the left
            // child points to a subtree with lesser values.
            const successor = this._findSuccessor(root.right);

            // Now simply copy the successor into the root - effectively deleting the root - then _delete the original
            // successor node.
            root.data  = successor.data;
            root.right = this._delete(successor.data, root.right);
        }

        // Return the root of the tree.  This may be unchanged.
        return root;
    }

    /**
     * Private helper function to find the immediate successor to a given node.
     */
    protected _findSuccessor(node: IRedBlackTreeNode<T>): IRedBlackTreeNode<T> {

        // Initialize current to the argument 'node'
        let current: IRedBlackTreeNode<T> = node;

        // Traverse down to the left-most node to find the lowest value greater than the argument 'node'
        while (current.left) {
            current = current.left;
        }

        // Return the successor.
        return current;
    }

    protected _traverse(root: IRedBlackTreeNode<T>, data: T[] = []): T[] {
        if (root) {
            this._traverse(root.left, data);
            data.push(root.data);
            this._traverse(root.right, data);
        }

        return data;
    }
}