import { IBinaryTreeNode, BinaryTreeNode } from './binary-tree';

export interface IBinarySearchTree<T> {
    find(data: T): IBinaryTreeNode<T>;
    insert(data: T): IBinarySearchTree<T>;
    delete(data: T): IBinarySearchTree<T>;
    data(): T[];
    stringify(): string;
}

/**
 * Simple binary search tree supporting find, insert, and delete operations.
 */
export class BinarySearchTree<T> implements IBinarySearchTree<T> {
    private root: IBinaryTreeNode<T>;

    constructor(data: T = null) {
        this.root = null;
        if (data) this._insert(data, this.root);
    }

    public find(data: T): IBinaryTreeNode<T> {
        return this._find(data, this.root);
    }

    public insert(data: T): IBinarySearchTree<T> {
        this._insert(data, this.root);
        return this;
    }

    public delete(data: T): IBinarySearchTree<T> {
        this._delete(data, this.root);
        return this;
    }

    public data(): T[] {
        return this._traverse(this.root);
    }

    public stringify(): string {
        let s = '';
        this._traverse(this.root).forEach((datum) => {
            s += `${datum.toString()}; `;
        });
        return s.trim();
    }

    /**
     * Search the tree for a given piece of data
     */
    private _find(data: T, node: IBinaryTreeNode<T>): IBinaryTreeNode<T> {

        // if the node is null, or the data is found, good on us
        if (!node || node.data == data) return node;

        // if the requested data is greater than the data in the current node, traverse the right child
        if (data > node.data) return this._find(data, node.right);

        // if the requested data is less than the data in the current node, traverse the left child
        return this._find(data, node.left);
    }

    /**
     * Insert the given data into the tree.  No duplicates are allowed.  If the new data is a duplicate, no change
     * occurs.
     */
    private _insert(data: T, node: IBinaryTreeNode<T>): IBinaryTreeNode<T> {

        // If the node is null, return a new node with the data.
        // The node will only be null when the tree is empty (i.e. root is null) or if the node is a leaf.
        if (!node) {

            // Create a new node to hold the inserted data.
            const newNode: IBinaryTreeNode<T> = new BinaryTreeNode<T>(data);

            // This is a shortcut to assign the root of a previously empty tree.
            if (!this.root) this.root = newNode;

            return newNode;
        }

        // If the requested data is less than the data in the node, _insert into the left subtree.
        if (data < node.data) node.left = this._insert(data, node.left);

        // If the requested data is greater than the data in the node, _insert into the right subtree.
        else if (data > node.data) node.right = this._insert(data, node.right);

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
    private _delete(data: T, root: IBinaryTreeNode<T>): IBinaryTreeNode<T> {

        // If the root is null, return null - nothing to _delete.
        if (!root) return root;

        // If the data to be deleted is less than the root's data, look in the left subtree.
        if (data < root.data) root.left = this._delete(data, root.left);

        // If the data to be deleted is less than the root's data, look in the right subtree.
        else if (data > root.data) root.right = this._delete(data, root.right);

        // If the data is the target, then _delete the current root.
        else {

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
    private _findSuccessor(node: IBinaryTreeNode<T>): IBinaryTreeNode<T> {

        // Initialize current to the argument 'node'
        let current: IBinaryTreeNode<T> = node;

        // Traverse down to the left-most node to find the lowest value greater than the argument 'node'
        while (current.left) {
            current = current.left;
        }

        // Return the successor.
        return current;
    }

    private _traverse(root: IBinaryTreeNode<T>, data: T[] = []): T[] {
        if (root) {
            this._traverse(root.left, data);
            data.push(root.data);
            this._traverse(root.right, data);
        }

        return data;
    }
}