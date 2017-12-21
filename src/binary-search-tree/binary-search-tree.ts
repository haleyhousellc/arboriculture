import {
    defaultComparer,
    BinaryTree,
    BinaryTreeNode,
    IBinaryTree,
    IBinaryTreeNode,
    IComparer,
    TraversalOrder,
} from '../binary-tree/binary-tree';

/**
 * A binary search tree node redefines the types of members #left and #right to return IBinarySearchTreeNode<K, V>
 * rather than a base IBinaryTreeNode<K, V>.  It also adds a pointer to its parent for much simpler manipulation in the
 * tree.
 */
export interface IBinarySearchTreeNode<K, V> extends IBinaryTreeNode<K, V> {
    left: IBinarySearchTreeNode<K, V>;
    right: IBinarySearchTreeNode<K, V>;
    parent: IBinarySearchTreeNode<K, V>;
}

export class BinarySearchTreeNode<K, V> extends BinaryTreeNode<K, V> implements IBinarySearchTreeNode<K, V> {

    protected _parent: IBinarySearchTreeNode<K, V>;

    constructor(key: K, value: V) {
        super(key, value);

        this._parent = null;
    }

    public get left(): IBinarySearchTreeNode<K, V> {
        return this._left as IBinarySearchTreeNode<K, V>;
    }

    public set left(newLeft: IBinarySearchTreeNode<K, V>) {
        this._left = newLeft;
    }

    public get right(): IBinarySearchTreeNode<K, V> {
        return this._right as IBinarySearchTreeNode<K, V>;
    }

    public set right(newRight: IBinarySearchTreeNode<K, V>) {
        this._right = newRight;
    }

    public get parent(): IBinarySearchTreeNode<K, V> {
        return this._parent;
    }

    public set parent(newParent: IBinarySearchTreeNode<K, V>) {
        this._parent = newParent;
    }
}

export interface IBinarySearchTree<K, V = any> extends IBinaryTree<K, V> {
    find(key: K): IBinarySearchTreeNode<K, V>;

    min(): IBinarySearchTreeNode<K, V>;

    max(): IBinarySearchTreeNode<K, V>;

    insert(key: K, value?: V): IBinarySearchTree<K, V>;

    remove(key: K): IBinarySearchTree<K, V>;
}

/**
 * Simple binary search tree supporting find, insert, and remove operations.
 */
export class BinarySearchTree<K, V = any> extends BinaryTree<K, V> implements IBinarySearchTree<K, V> {

    constructor(comparer: IComparer<K> = defaultComparer) {
        super(comparer);
    }

    public get count(): number {
        return this._count;
    }

    public find(key: K): IBinarySearchTreeNode<K, V> {
        return this._find(key);
    }

    public min(): IBinarySearchTreeNode<K, V> {
        return this._min();
    }

    public max(): IBinarySearchTreeNode<K, V> {
        return this._max();
    }

    public insert(key: K, value?: V): IBinarySearchTree<K, V> {
        this._insert(new BinarySearchTreeNode<K, V>(key, value));

        return this;
    }

    public remove(key: K): IBinarySearchTree<K, V> {
        this._remove(key);

        return this;
    }

    public traverse(order: TraversalOrder = TraversalOrder.INORDER): V[] {
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

    // <editor-fold desc="protected implementations"

    /**
     * Insert the given key into the tree - iteratively.  No duplicates are allowed.  If the new node is a
     * duplicate, no change occurs.  A recursive solution is prettier and cooler, but it has the potential for
     * memory-related performance problems as the tree grows (i.e. hitting stack limits).
     */
    protected _insert(newNode: IBinarySearchTreeNode<K, V>): IBinaryTreeNode<K, V> {

        let parent: IBinarySearchTreeNode<K, V>  = null;
        let current: IBinarySearchTreeNode<K, V> = this._root as IBinarySearchTreeNode<K, V>;

        // Iterate over the tree to find the new node's parent.
        while (current) {
            parent = current;

            // Don't allow duplicates, so simply return if the key is already present in the tree.
            if (this._comparer(newNode.key, current.key) === 0) return null;

            // Otherwise traverse the appropriate child.
            else if (this._comparer(newNode.key, current.key) < 0) current = current.left;
            else current = current.right;
        }

        // Assign the appropriate parent to the new node.
        newNode.parent = parent;

        // If the parent is null, the tree was empty and the new node becomes the new root.
        if (!parent) this._root = newNode;

        // Otherwise, determine whether the new node is the left or right child of it's parent and link it.
        else if (this._comparer(newNode.key, parent.key) < 0) parent.left = newNode;
        else parent.right = newNode;

        // Finally, increment the node count.
        this._count++;

        // Return the newly inserted node.
        return newNode;
    }

    /**
     * Delete the given key from the tree - iteratively.  A recursive solution is prettier and cooler, but it has the
     * potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).
     */
    protected _remove(key: K): IBinaryTreeNode<K, V> {

        // Find the node first, and return if it isn't found.
        const candidate = this._find(key);
        if (!candidate) return null;

        // Declare a replacement for the deleted node.  This begins as it's successor, but is spliced out of it's
        // original location and is substituted back into the tree at the location of the deleted node.
        let replacement: IBinarySearchTreeNode<K, V> = null;

        // If the node to be deleted has less than 2 children (i.e. 0 or 1), designate it as it's own replacement
        if (!candidate.left || !candidate.right) replacement = candidate;

        // Otherwise set the replacement as the candidate's immediate successor.
        else replacement = this._findSuccessor(candidate);

        // Declare a new successor.  This is either the replacement's only child, or null.  After the replacement takes
        // over in the old position of the deleted node, this node represents the replacement's immediate successor.
        let newSuccessor: IBinarySearchTreeNode<K, V> = null;

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
        if (replacement !== candidate) candidate.value = replacement.value;

        // Finally, decrement the node count.
        this._count--;

        // Return all parties involved in node removal: the candidate (deleted node), the candidate's replacement in the
        // tree, and the new successor (successor to the replacement).
        return replacement;
    }

    /**
     * Search the tree for a given piece of key - iteratively.  A recursive solution is prettier and cooler, but it has
     * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
     * node if the value exists in the tree.  If the value is not found, returns null.
     */
    protected _find(targetKey: K,
                    startingNode: IBinaryTreeNode<K, V> =
                        this._root as IBinaryTreeNode<K, V>): IBinarySearchTreeNode<K, V>
    {

        // Just make sure the target is legitimate.
        if (targetKey == null) return null;

        // Get a local variable.
        let currentNode = startingNode;

        // Loop until the current node is null (i.e. target key is not found), or the target key is found (comparer
        // returns zero).
        while (currentNode && this._comparer(targetKey, currentNode.key) !== 0) {

            // If comparer returns less than zero, target key is less than current node key - traverse left;
            if (this._comparer(targetKey, currentNode.key) < 0) currentNode = currentNode.left;

            // If comparer returns greater than zero, target key is greater than current node key - traverse right.
            else currentNode = currentNode.right;
        }

        // Return the current node (an actual node if the target is found, null if not).
        return currentNode as IBinarySearchTreeNode<K, V>;
    }

    /**
     * Search the tree for it's maximum value - iteratively.  A recursive solution is prettier and cooler, but it has
     * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
     * node if the value exists in the tree.  If the value is not found, returns null.
     */
    protected _max(root: IBinaryTreeNode<K, V> = this._root as IBinaryTreeNode<K, V>): IBinarySearchTreeNode<K, V> {

        // Get a local variable.
        let currentNode = root;

        // Iterate right until a leaf is reached.
        while (currentNode.right) {
            currentNode = currentNode.right;
        }

        return currentNode as IBinarySearchTreeNode<K, V>;
    }

    /**
     * Search the tree for it's minimum value - iteratively.  A recursive solution is prettier and cooler, but it has
     * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
     * node if the value exists in the tree.  If the value is not found, returns null.
     */
    protected _min(root: IBinaryTreeNode<K, V> = this._root as IBinaryTreeNode<K, V>): IBinarySearchTreeNode<K, V> {

        // Get a local variable.
        let currentNode = root;

        // Iterate left until a leaf is reached.
        while (currentNode.left) {
            currentNode = currentNode.left;
        }

        return currentNode as IBinarySearchTreeNode<K, V>;
    }

    protected _traverseInOrder(): V[] {
        if (!this._root) return [];

        const orderedData: V[] = [];

        // Stacks make sense for what essentially amounts to a depth-first search.
        const stack: IBinaryTreeNode<K, V>[] = [];
        let current                          = this._root;

        // Build initial stack by traversing left
        while (current) {
            stack.push(current);
            current = current.left;
        }

        // Now traverse the tree from the minimum value.
        while (stack.length > 0) {
            current = stack.pop();
            orderedData.push(current.value);

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

    protected _findSuccessor(node: IBinarySearchTreeNode<K, V>): IBinarySearchTreeNode<K, V> {

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
