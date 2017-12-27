import {
    defaultComparer,
    traverseTree,
    BinaryTreeNode,
    IBinaryTreeNode,
    IComparer,
    TraversalOrder,
} from '../binary-tree/binary-tree';

/**
 * A binary search tree node redefines the types of members #left and #right to return IBinarySearchTreeNode<K, V>
 * rather than a base IBinaryTreeNode<K, V>.  It also adds a pointer to its parent for much simpler manipulation in the
 * tree.
 */
export interface IBinarySearchTreeNode<K, V = K> extends IBinaryTreeNode<K, V> {
    left: IBinarySearchTreeNode<K, V>;
    right: IBinarySearchTreeNode<K, V>;
    parent: IBinarySearchTreeNode<K, V>;
}

export const BinarySearchTreeNode = <K, V>(key: K, value?: V): IBinarySearchTreeNode<K, V> => {
    const node                                = BinaryTreeNode(key, value);
    const parent: IBinarySearchTreeNode<K, V> = null;

    return {
        ...node,

        get left(): IBinarySearchTreeNode<K, V> { return node.left as IBinarySearchTreeNode<K, V>; },

        get right(): IBinarySearchTreeNode<K, V> { return node.right as IBinarySearchTreeNode<K, V>; },

        parent,
    };
};

export interface IBinarySearchTree<K, V = K> {
    root: IBinarySearchTreeNode<K, V>;

    size(): number;

    clear(): void;

    find(key: K): V;

    min(): V;

    max(): V;

    insert(key: K, value?: V): IBinarySearchTree<K, V>;

    remove(key: K): IBinarySearchTree<K, V>;

    traverse(order: TraversalOrder): V[];

    toString(): string;
}

/**
 * Simple binary search tree supporting find, insert, and remove operations.
 */
export const BinarySearchTree = <K, V>(comparer: IComparer<K> = defaultComparer): IBinarySearchTree<K, V> => {
    const root: IBinarySearchTreeNode<K, V> = null;

    return {
        root,

        size(): number { return this.traverse().length; },

        clear(): void { return clearBst(this); },

        find(key: K): V {
            const node: IBinarySearchTreeNode<K, V> = findNodeInBst(this, key, comparer);

            return node ? node.value : null;
        },

        min(): V {
            const node: IBinarySearchTreeNode<K, V> = getMinNodeInBst(this);

            return node ? node.value : null;
        },

        max(): V {
            const node: IBinarySearchTreeNode<K, V> = getMaxNodeInBst(this);

            return node ? node.value : null;
        },

        insert(key: K, value?: V): IBinarySearchTree<K, V> {
            const newNode = BinarySearchTreeNode(key, value);
            insertNodeIntoBst(this, newNode, comparer);

            return this;
        },

        remove(key: K): IBinarySearchTree<K, V> {
            removeNodeFromBst(this, key, comparer);

            return this;
        },

        traverse(order: TraversalOrder = TraversalOrder.INORDER): V[] { return traverseTree(this.root, order); },

        toString(order: TraversalOrder = TraversalOrder.INORDER): string {
            return this.traverse(order)
                       .join(' | ')
                       .trim();
        },
    };
};

export const clearBst = <K, V>(tree: IBinarySearchTree<K, V>): void => tree.root = null;

/**
 * Insert the given key into the tree - iteratively.  No duplicates are allowed.  If the new node is a
 * duplicate, no change occurs.  A recursive solution is prettier and cooler, but it has the potential for
 * memory-related performance problems as the tree grows (i.e. hitting stack limits).
 */
export const insertNodeIntoBst = <K, V>(tree: IBinarySearchTree<K, V>,
                                        newNode: IBinarySearchTreeNode<K, V>,
                                        comparer: IComparer<K> = defaultComparer): IBinarySearchTreeNode<K, V> => {

    let parent: IBinarySearchTreeNode<K, V>  = null;
    let current: IBinarySearchTreeNode<K, V> = tree.root;


    // Iterate over the tree to find the new node's parent.
    while (current) {
        parent = current;

        // Don't allow duplicates, so simply return if the key is already present in the tree.
        if (comparer(newNode.key, current.key) === 0) return null;

        // Otherwise traverse the appropriate child.
        else if (comparer(newNode.key, current.key) < 0) current = current.left;
        else current = current.right;
    }

    // Assign the appropriate parent to the new node.
    newNode.parent = parent;

    // If the parent is null, the tree was empty and the new node becomes the new root.
    if (!parent) tree.root = newNode;

    // Otherwise, determine whether the new node is the left or right child of it's parent and link it.
    else if (comparer(newNode.key, parent.key) < 0) parent.left = newNode;
    else parent.right = newNode;

    // Return the newly inserted node.
    return newNode;
};

/**
 * Delete the given key from the tree - iteratively.  A recursive solution is prettier and cooler, but it has the
 * potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).
 */
export const removeNodeFromBst = <K, V>(tree: IBinarySearchTree<K, V>,
                                        key: K,
                                        comparer: IComparer<K> = defaultComparer): IBinarySearchTreeNode<K, V> => {

    // Find the node first, and return if it isn't found.
    const candidate = findNodeInBst(tree, key, comparer);
    if (!candidate) return null;

    // Declare a replacement for the deleted node.  This begins as it's successor, but is spliced out of it's
    // original location and is substituted back into the tree at the location of the deleted node.
    let replacement: IBinarySearchTreeNode<K, V> = null;

    // If the node to be deleted has less than 2 children (i.e. 0 or 1), designate it as it's own replacement
    if (!candidate.left || !candidate.right) replacement = candidate;

    // Otherwise set the replacement as the candidate's immediate successor.
    else replacement = findNodeSuccessorInBst(tree, candidate);

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
    if (!replacement.parent) tree.root = newSuccessor;

    // If not setting a new root, determine which direction will splice out the replacement.
    else if (replacement === replacement.parent.left) replacement.parent.left = newSuccessor;
    else replacement.parent.right = newSuccessor;

    // Replace the candidate with the replacement (essentially deleting the candidate).
    if (replacement !== candidate) candidate.value = replacement.value;

    // Return all parties involved in node removal: the candidate (deleted node), the candidate's replacement in the
    // tree, and the new successor (successor to the replacement).
    return replacement;
};

/**
 * Search the tree for a given key - iteratively.  A recursive solution is prettier and cooler, but it has
 * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
 * node if the value exists in the tree.  If the value is not found, returns null.
 */
export const findNodeInBst = <K, V>(tree: IBinarySearchTree<K, V>,
                                    targetKey: K,
                                    comparer: IComparer<K> = defaultComparer): IBinarySearchTreeNode<K, V> => {

    // Just make sure the target is legitimate.
    if (targetKey == null) return null;

    // Get a local variable.
    let currentNode = tree.root;

    // Loop until the current node is null (i.e. target key is not found), or the target key is found (comparer
    // returns zero).
    while (currentNode && comparer(targetKey, currentNode.key) !== 0) {

        // If comparer returns less than zero, target key is less than current node key - traverse left;
        if (comparer(targetKey, currentNode.key) < 0) currentNode = currentNode.left;

        // If comparer returns greater than zero, target key is greater than current node key - traverse right.
        else currentNode = currentNode.right;
    }

    // Return the current node (an actual node if the target is found, null if not).
    return currentNode;
};

/**
 * Search the tree for it's maximum value - iteratively.  A recursive solution is prettier and cooler, but it has
 * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
 * node if the value exists in the tree.  If the value is not found, returns null.
 */
export const getMaxNodeInBst = <K, V>(tree: IBinarySearchTree<K, V>): IBinarySearchTreeNode<K, V> => {

    // Get a local variable.
    let currentNode = tree.root;

    // Iterate right until a leaf is reached.
    while (currentNode.right) {
        currentNode = currentNode.right;
    }

    return currentNode;
};

/**
 * Search the tree for it's minimum value - iteratively.  A recursive solution is prettier and cooler, but it has
 * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
 * node if the value exists in the tree.  If the value is not found, returns null.
 */
export const getMinNodeInBst = <K, V>(tree: IBinarySearchTree<K, V>): IBinarySearchTreeNode<K, V> => {

    // Get a local variable.
    let currentNode = tree.root;

    // Iterate left until a leaf is reached.
    while (currentNode.left) {
        currentNode = currentNode.left;
    }

    return currentNode;
};

export const traverseBst = <K, V>(tree: IBinarySearchTree<K, V>,
                                  order: TraversalOrder = TraversalOrder.INORDER): V[] => {
    if (!tree.root) return [];

    const orderedData: V[] = [];

    // Stacks make sense for what essentially amounts to a depth-first search.
    const stack: IBinarySearchTreeNode<K, V>[] = [];
    let current                                = tree.root;

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
};

export const findNodeSuccessorInBst = <K, V>(tree: IBinarySearchTree<K, V>,
                                             node: IBinarySearchTreeNode<K, V>): IBinarySearchTreeNode<K, V> => {

    // If the node has a right subtree, simply return the minimum value of the subtree.
    if (node.right) return getMinNodeInBst(tree);

    // Define local variables to track current and previous nodes.
    let previous = node;
    let current  = previous.parent;

    while (current && previous === current.right) {
        previous = current;
        current  = current.parent;
    }

    return current;
};
