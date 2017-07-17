import {
    BinaryTree,
    BinaryTreeNode,
    defaultComparer,
    IBinaryTree,
    IBinaryTreeNode,
    IComparer,
    TraversalOrder,
} from '../binary-tree/binary-tree';

/**
 * A binary search tree node redefines the types of members #left and #right to return IBinarySearchTreeNode<T> rather
 * than a base IBinaryTreeNode<T>.  It also adds a pointer to its parent for much simpler manipulation in the tree.
 */
export interface IBinarySearchTreeNode<T> extends IBinaryTreeNode<T> {
    left: IBinarySearchTreeNode<T>;
    right: IBinarySearchTreeNode<T>;
    parent: IBinarySearchTreeNode<T>;
}

export class BinarySearchTreeNode<T> extends BinaryTreeNode<T> implements IBinarySearchTreeNode<T> {

    protected _parent: IBinarySearchTreeNode<T>;

    constructor(data: T) {
        super(data);
        this._parent = null;
    }

    public get left(): IBinarySearchTreeNode<T> {
        return super.left as IBinarySearchTreeNode<T>;
    }

    public set left(newLeft: IBinarySearchTreeNode<T>) {
        super.left = newLeft;
    }

    public get right(): IBinarySearchTreeNode<T> {
        return super.right as IBinarySearchTreeNode<T>;
    }

    public set right(newRight: IBinarySearchTreeNode<T>) {
        super.right = newRight;
    }

    public get parent(): IBinarySearchTreeNode<T> {
        return this._parent;
    }

    public set parent(newParent: IBinarySearchTreeNode<T>) {
        this._parent = newParent;
    }
}

export interface IBinarySearchTree<T> extends IBinaryTree<T> {
    find(data: T): IBinarySearchTreeNode<T>;
    min(): IBinarySearchTreeNode<T>;
    max(): IBinarySearchTreeNode<T>;
    insert(data: T): IBinarySearchTree<T>;
    remove(data: T): IBinarySearchTree<T>;
}

/**
 * Simple binary search tree supporting find, insert, and remove operations.
 */
export class BinarySearchTree<T> extends BinaryTree<T> implements IBinarySearchTree<T> {

    constructor(comparer: IComparer<T> = defaultComparer) {
        super(comparer);
    }

    public get count(): number {
        return this._count;
    }

    public find(data: T): IBinarySearchTreeNode<T> {
        return this._find(data);
    }

    public min(): IBinarySearchTreeNode<T> {
        return this._min();
    }

    public max(): IBinarySearchTreeNode<T> {
        return this._max();
    }

    public insert(data: T): IBinarySearchTree<T> {
        this._insert(data);

        return this;
    }

    public remove(data: T): IBinarySearchTree<T> {
        this._remove(data);

        return this;
    }

    public traverse(order: TraversalOrder = TraversalOrder.INORDER): T[] {
        switch (order) {
            case TraversalOrder.INORDER:
                return this._traverseInOrder();
            default:
                break;
        }
    }

    public toString(order: TraversalOrder = TraversalOrder.INORDER): string {
        return this._traverseInOrder().join(' | ').trim();
    }

    public clear(): void {
        return super.clear();
    }

    // <editor-fold desc="protected implementations"

    /**
     * Insert the given data into the tree - iteratively.  No duplicates are allowed.  If the new traverse is a
     * duplicate, no change occurs.  A recursive solution is prettier and cooler, but it has the potential for
     * memory-related performance problems as the tree grows (i.e. hitting stack limits).
     */
    protected _insert(data: T): IBinarySearchTreeNode<T> {
        let parent: IBinarySearchTreeNode<T>  = null;
        let current: IBinarySearchTreeNode<T> = this._root as IBinarySearchTreeNode<T>;
        const newNode                         = new BinarySearchTreeNode<T>(data);

        // Iterate over the tree to find the new node's parent.
        while (current) {
            parent = current;

            // Don't allow duplicates, so simply return if the data is already present in the tree.
            if (this._comparer(data, current.data) === 0) return null;

            // Otherwise traverse the appropriate child.
            else if (this._comparer(data, current.data) < 0) current = current.left;
            else current = current.right;
        }

        // Assign the appropriate parent to the new node.
        newNode.parent = parent;

        // If the parent is null, the tree was empty and the new node becomes the new root.
        if (!parent) this._root = newNode;

        // Otherwise, determine whether the new node is the left or right child of it's parent and link it.
        else if (this._comparer(data, parent.data) < 0) parent.left = newNode;
        else parent.right = newNode;

        // Finally, increment the node count.
        this._count++;

        // Return the newly inserted node.
        return newNode;
    }

    /**
     * Delete the given data from the tree - iteratively.  A recursive solution is prettier and cooler, but it has the
     * potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).
     */
    protected _remove(data: T): IBinaryTreeNode<T> {

        // Find the node first, and return if it isn't found.
        const candidate = this._find(data);
        if (!candidate) return null;

        // Declare a replacement for the deleted node.  This begins as it's successor, but is spliced out of it's
        // original location and is substituted back into the tree at the location of the deleted node.
        let replacement: IBinarySearchTreeNode<T> = null;

        // If the node to be deleted has less than 2 children (i.e. 0 or 1), designate it as it's own replacement
        if (!candidate.left || !candidate.right) replacement = candidate;

        // Otherwise set the replacement as the candidate's immediate successor.
        else replacement = this._findSuccessor(candidate);

        // Declare a new successor.  This is either the replacement's only child, or null.  After the replacement takes
        // over in the old position of the deleted node, this node represents the replacement's immediate successor.
        let newSuccessor: IBinarySearchTreeNode<T> = null;

        // Set the next successor as either the replacement's left or right child
        if (replacement.left) newSuccessor = replacement.left;
        else newSuccessor = replacement.right;

        // The new successor could still potentially be null.  If not, set it's parent to it's grandparent.
        if (newSuccessor) newSuccessor.parent = replacement.parent;

        // If replacement's parent is null (and, from above, the new successor's parent is null), set the new successor
        // as the root of the tree.
        if (!replacement.parent) this._root = newSuccessor;

        // If not setting a new root, determine which direction will splice out the replacement.
        else if (replacement === replacement.parent.left) replacement.parent.left = newSuccessor;
        else replacement.parent.right = newSuccessor;

        // Replace the candidate with the replacement (essentially deleting the candidate).
        if (replacement !== candidate) candidate.data = replacement.data;

        // Finally, decrement the node count.
        this._count--;

        // Return all parties involved in node removal: the candidate (deleted node), the candidate's replacement in the
        // tree, and the new successor (successor to the replacement).
        return replacement;
    }

    /**
     * Search the tree for a given piece of data - iteratively.  A recursive solution is prettier and cooler, but it has
     * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
     * node if the value exists in the tree.  If the value is not found, returns null.
     */
    protected _find(targetData: T,
                    startingNode: IBinaryTreeNode<T> = this._root as IBinaryTreeNode<T>): IBinarySearchTreeNode<T>
    {

        // Just make sure the target is legitimate.
        if (targetData == null) return null;

        // Get a local variable.
        let currentNode = startingNode;

        // Loop until the current node is null (i.e. target data is not found), or the target data is found (comparer
        // returns zero).
        while (currentNode && this._comparer(targetData, currentNode.data) !== 0) {

            // If comparer returns less than zero, target data is less than current node data - traverse left;
            if (this._comparer(targetData, currentNode.data) < 0) currentNode = currentNode.left;

            // If comparer returns greater than zero, target data is greater than current node data - traverse right.
            else currentNode = currentNode.right;
        }

        // Return the current node (an actual node if the target is found, null if not).
        return currentNode as IBinarySearchTreeNode<T>;
    }

    /**
     * Search the tree for it's maximum value - iteratively.  A recursive solution is prettier and cooler, but it has
     * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
     * node if the value exists in the tree.  If the value is not found, returns null.
     */
    protected _max(root: IBinaryTreeNode<T> = this._root as IBinaryTreeNode<T>): IBinarySearchTreeNode<T> {

        // Get a local variable.
        let currentNode = root;

        // Iterate right until a leaf is reached.
        while (currentNode.right) {
            currentNode = currentNode.right;
        }

        return currentNode as IBinarySearchTreeNode<T>;
    }

    /**
     * Search the tree for it's minimum value - iteratively.  A recursive solution is prettier and cooler, but it has
     * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
     * node if the value exists in the tree.  If the value is not found, returns null.
     */
    protected _min(root: IBinaryTreeNode<T> = this._root as IBinaryTreeNode<T>): IBinarySearchTreeNode<T> {

        // Get a local variable.
        let currentNode = root;

        // Iterate left until a leaf is reached.
        while (currentNode.left) {
            currentNode = currentNode.left;
        }

        return currentNode as IBinarySearchTreeNode<T>;
    }

    protected _traverseInOrder(): T[] {
        if (!this._root) return [];

        const orderedData: T[] = [];

        // Stacks make sense for what essentially amounts to a depth-first search.
        const stack: IBinaryTreeNode<T>[] = [];
        let current                       = this._root;

        // Build initial stack by traversing left
        while (current) {
            stack.push(current);
            current = current.left;
        }

        // Now traverse the tree from the minimum value.
        while (stack.length > 0) {
            current = stack.pop();
            orderedData.push(current.data);

            // If the current node has a right child, traverse that subtree before backing out.
            if (current.right) {
                current = current.right;

                // Like above, push until a leaf is reached.
                while (current) {
                    stack.push(current);
                    current = current.left;
                }
            }
        }

        return orderedData;
    }

    protected _findSuccessor(node: IBinarySearchTreeNode<T>): IBinarySearchTreeNode<T> {

        // If the node has a right subtree, simply return the minimum value of the subtree.
        if (node.right) return this._min(node);

        // Define local variables to track current and previous nodes.
        let previous = node;
        let current  = previous.parent;

        while (current && previous === current.right) {
            previous = current;
            current  = current.parent;
        }

        return current;
    }

// </editor-fold>
}
