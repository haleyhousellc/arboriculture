import {
    BinarySearchTree,
    BinarySearchTreeNode,
    IBinarySearchTree,
    IBinarySearchTreeNode,
} from '../binary-search-tree/binary-search-tree';
import { defaultComparer, IComparer, TraversalOrder } from '../binary-tree/binary-tree';

export enum RedBlackTreeNodeColor {
    RED,
    BLACK,
}

/**
 * A red-black tree node redefines the types of members #left, #right, and #parent to return IRedBlackTreeNode<K, V>
 * rather than a IBinarySearchTreeNode<K, V>.  It also adds a new member #color used in determining how/when to
 * rotate the tree.
 */
export interface IRedBlackTreeNode<K, V> extends IBinarySearchTreeNode<K, V> {
    color: RedBlackTreeNodeColor;
    left: IRedBlackTreeNode<K, V>;
    right: IRedBlackTreeNode<K, V>;
    parent: IRedBlackTreeNode<K, V>;
    isSentinel: boolean;
}

export class RedBlackTreeNode<K, V> extends BinarySearchTreeNode<K, V> implements IRedBlackTreeNode<K, V> {
    protected _color: RedBlackTreeNodeColor = null;

    private _isSentinel: boolean = null;

    constructor(key: K = null, value: V = null) {
        super(key, value);

        this._isSentinel = !value;
    }

    public get color(): RedBlackTreeNodeColor {
        return this._color;
    }

    public set color(newColor: RedBlackTreeNodeColor) {
        this._color = newColor;
    }

    public get left(): IRedBlackTreeNode<K, V> {
        return this._left as IRedBlackTreeNode<K, V>;
    }

    public set left(newLeft: IRedBlackTreeNode<K, V>) {
        this._left = newLeft;
    }

    public get right(): IRedBlackTreeNode<K, V> {
        return this._right as IRedBlackTreeNode<K, V>;
    }

    public set right(newRight: IRedBlackTreeNode<K, V>) {
        this._right = newRight;
    }

    public get parent(): IRedBlackTreeNode<K, V> {
        return this._parent as IRedBlackTreeNode<K, V>;
    }

    public set parent(newParent: IRedBlackTreeNode<K, V>) {
        this._parent = newParent;
    }

    public get isSentinel(): boolean {
        return this._isSentinel;
    }
}

/**
 * This interface simply redefines some return types inherited from the standard IBinarySearchTree<K, V>.
 */
export interface IRedBlackTree<K, V> extends IBinarySearchTree<K, V> {
    find(key: K): IRedBlackTreeNode<K, V>;

    min(): IRedBlackTreeNode<K, V>;

    max(): IRedBlackTreeNode<K, V>;

    insert(key: K, value?: V): IRedBlackTree<K, V>;

    remove(key: K): IRedBlackTree<K, V>;
}

/**
 * Red-Black tree supporting all basic binary search tree operations.
 */
export class RedBlackTree<K, V> extends BinarySearchTree<K, V> implements IRedBlackTree<K, V> {

    private _sentinel: IRedBlackTreeNode<K, V> = null;

    constructor(comparer: IComparer<K> = defaultComparer) {
        super(comparer);

        this._sentinel = this.makeSentinel();
        this._root     = this._sentinel;
    }

    public get count(): number {
        return this._count;
    }

    public find(key: K): IRedBlackTreeNode<K, V> {
        const node = this._find(key);

        return node === this._sentinel ? null : node;
    }

    public min(): IRedBlackTreeNode<K, V> {
        return this._min();
    }

    public max(): IRedBlackTreeNode<K, V> {
        return this._max();
    }

    public insert(key: K, value?: V): IRedBlackTree<K, V> {
        this._insert(new RedBlackTreeNode<K, V>(key, value));

        return this;
    }

    public remove(key: K): IRedBlackTree<K, V> {
        this._remove(key);

        return this;
    }

    public clear(): void {
        return this._clear();
    }

    public traverse(): V[] {
        return this._traverseInOrder();
    }

    public toString(order: TraversalOrder = TraversalOrder.INORDER): string {
        return this._traverseInOrder().join(' | ').trim();
    }

    // <editor-fold desc="protected implementations"

    /**
     * The insert procedure differs slightly from the base insert.
     */
    protected _insert(newNode: IRedBlackTreeNode<K, V>): IRedBlackTreeNode<K, V> {

        let currentParent: IRedBlackTreeNode<K, V> = this._sentinel;
        let current: IRedBlackTreeNode<K, V>       = this._root as IRedBlackTreeNode<K, V>;

        // Iterate over the tree to find the new node's parent.
        while (current !== this._sentinel) {
            currentParent = current;

            // Don't allow duplicates, so simply return if the key is already present in the tree.
            if (this._comparer(newNode.key, current.key) === 0) return null;

            // Otherwise traverse the appropriate child.
            if (this._comparer(newNode.key, current.key) < 0) current = current.left;
            else current = current.right;
        }

        // Assign the appropriate parent to the new node.
        newNode.parent = currentParent;

        // If the parent is still the sentinel, the tree was empty and the new node becomes the new root.
        if (currentParent === this._sentinel) this._root = newNode;

        // Otherwise, determine whether the new node should be the left or right child of its parent and link it.
        else if (this._comparer(newNode.key, currentParent.key) < 0) currentParent.left = newNode;
        else currentParent.right = newNode;

        newNode.left  = this._sentinel;
        newNode.right = this._sentinel;
        newNode.color = RedBlackTreeNodeColor.RED;

        // Fix any issues that may have arisen with the addition of another red node.
        this._fixInsertion(newNode);

        // Finally, admit that a node has been added ;).
        this._count++;

        // Return the newly inserted node.
        return newNode;
    }

    /**
     * This is essentially a copy of the base delete procedure.  However, the assignment of newSuccessor.parent to
     * replacement.parent is unconditional.  Also new is the comparison to the sentinel node, rather than a null-check.
     */
    protected _remove(key: K): IRedBlackTreeNode<K, V> {

        const candidate: IRedBlackTreeNode<K, V> = this._find(key);

        // If the candidate is null, it was not present in the tree.
        if (candidate === this._sentinel) return null;

        // Declare a replacement for the deleted node.  This begins as it's successor, but is spliced out of it's
        // original location and is substituted back into the tree at the location of the deleted node.
        let replacement: IRedBlackTreeNode<K, V> = null;

        // If the node to be deleted has less than 2 children (i.e. 0 or 1), designate it as it's own replacement
        if (candidate.left === this._sentinel || candidate.right === this._sentinel) replacement = candidate;

        // Otherwise set the replacement as the candidate's immediate successor.
        else replacement = this._findSuccessor(candidate) as IRedBlackTreeNode<K, V>;

        // Declare a new successor.  This is either the replacement's only child, or null.  After the replacement takes
        // over in the old position of the deleted node, this node represents the replacement's immediate successor.
        let newSuccessor: IRedBlackTreeNode<K, V> = null;

        if (replacement.left !== this._sentinel) newSuccessor = replacement.left;
        else newSuccessor = replacement.right;

        // This is a change from the standard delete procedure.
        newSuccessor.parent = replacement.parent;

        if (replacement.parent === this._sentinel) this._root = newSuccessor;
        else if (replacement === replacement.parent.left) replacement.parent.left = newSuccessor;
        else replacement.parent.right = newSuccessor;

        if (replacement !== candidate) candidate.value = replacement.value;

        // If the node that replaced the deleted node in the tree is black, fix any violations that exist.
        if (replacement.color === RedBlackTreeNodeColor.BLACK) this._fixDeletion(newSuccessor);

        // Finally, admit that a node has been removed ;).
        this._count--;

        // Return all parties involved in node removal: the candidate (deleted node), the candidate's replacement in the
        // tree, and the new successor (successor to the replacement).
        return newSuccessor;
    }

    /**
     * This function adjusts node colors and performs any rotations needed after inserting a new node.
     */
    protected _fixInsertion(newNode: IRedBlackTreeNode<K, V>): void {
        let current: IRedBlackTreeNode<K, V> = newNode;
        let uncle: IRedBlackTreeNode<K, V>   = null;

        // The candidate begins life red. If the candidate's parent isn't red, no violation should have occurred.
        while (current.parent.color === RedBlackTreeNodeColor.RED) {

            // The parent is the left child of the grandparent...
            if (current.parent === current.parent.parent.left) {

                // Another genealogically-derived convenience member.
                uncle = current.parent.parent.right;

                // Case 1:
                // Basically, is the uncle the same color as the candidate?  If so, adjust color of uncle (to match
                // parent).
                if (uncle.color === RedBlackTreeNodeColor.RED) {

                    // Adjust colors of relatives.
                    current.parent.color        = RedBlackTreeNodeColor.BLACK;
                    uncle.color                 = RedBlackTreeNodeColor.BLACK;
                    current.parent.parent.color = RedBlackTreeNodeColor.RED;

                    // Set current to grandparent so the next iteration walks up the tree.  The next iteration begins
                    // after this line, so there is no need to reset parent and grandparent yet.
                    current = current.parent.parent;
                }

                // Otherwise, assess rotation needs.
                else {

                    // Case 2:
                    // Is the candidate a right child?
                    if (current === current.parent.right) {

                        // Walk up the tree one step...
                        current = current.parent;

                        // Walk up the tree one step...
                        this._rotateLeft(current);
                    }

                    // Case 3 (case 2 falls through to case 3)
                    // Adjust colors of parent and grandparent.
                    current.parent.color        = RedBlackTreeNodeColor.BLACK;
                    current.parent.parent.color = RedBlackTreeNodeColor.RED;

                    // Finally, rotate right.
                    this._rotateRight(current.parent.parent);
                }
            }

            // ...or the parent is the right child of the grandparent.  A mirror of the above.
            else {

                // Another genealogically-derived convenience member.
                uncle = current.parent.parent.left;

                // Case 1:
                // Basically, is the uncle the same color as the candidate?  If so, adjust color of uncle (to match
                // parent).
                if (uncle.color === RedBlackTreeNodeColor.RED) {

                    // Adjust colors of relatives.
                    current.parent.color        = RedBlackTreeNodeColor.BLACK;
                    uncle.color                 = RedBlackTreeNodeColor.BLACK;
                    current.parent.parent.color = RedBlackTreeNodeColor.RED;

                    // Set current to grandparent so the next iteration walks up the tree.  The next iteration begins
                    // after this line, so there is no need to reset parent and grandparent yet.
                    current = current.parent.parent;
                } else {

                    // Case 2:
                    // Is the candidate a left child?
                    if (current === current.parent.left) {
                        current = current.parent;

                        // ...then rotate right.
                        this._rotateRight(current);
                    }

                    // Case 3 (case 2 falls through to case 3)
                    // Adjust colors of parent and grandparent.
                    current.parent.color        = RedBlackTreeNodeColor.BLACK;
                    current.parent.parent.color = RedBlackTreeNodeColor.RED;

                    // Finally, rotate left.
                    this._rotateLeft(current.parent.parent);
                }
            }
        }

        // Finally, ensure the root is still black.  This will not re-violate any conditions.
        (this._root as IRedBlackTreeNode<K, V>).color = RedBlackTreeNodeColor.BLACK;
    }

    /**
     * This function adjusts node colors and performs any rotations needed after deleting a node.
     */
    protected _fixDeletion(candidate: IRedBlackTreeNode<K, V>): void {

        while (candidate !== this._root && candidate.color === RedBlackTreeNodeColor.BLACK) {
            let sibling: IRedBlackTreeNode<K, V> = null;

            // The deleted node is a left child...
            if (candidate === candidate.parent.left) {
                sibling = candidate.parent.right;

                // Case 1: candidate's sibling is red.
                if (sibling.color === RedBlackTreeNodeColor.RED) {
                    sibling.color          = RedBlackTreeNodeColor.BLACK;
                    candidate.parent.color = RedBlackTreeNodeColor.RED;
                    this._rotateLeft(candidate.parent);
                    sibling = candidate.parent.right;
                }

                // Case 2: candidate's sibling is black, and both of sibling's children are black.
                if (sibling.left.color === RedBlackTreeNodeColor.BLACK
                    && sibling.right.color === RedBlackTreeNodeColor.BLACK)
                {
                    sibling.color = RedBlackTreeNodeColor.RED;
                    candidate     = candidate.parent;
                }
                else {

                    // Case 3: candidate's sibling is black, sibling's left child is red and sibling's right child is
                    // black.
                    if (sibling.right.color === RedBlackTreeNodeColor.BLACK) {
                        sibling.left.color = RedBlackTreeNodeColor.BLACK;
                        sibling.color      = RedBlackTreeNodeColor.RED;
                        this._rotateRight(sibling);
                        sibling = candidate.parent.right;
                    }

                    // Case 4 (case 3 falls through):  candidate's sibling is black, and sibling's right child is red.
                    sibling.color          = candidate.parent.color;
                    candidate.parent.color = RedBlackTreeNodeColor.BLACK;
                    sibling.right.color    = RedBlackTreeNodeColor.BLACK;
                    this._rotateLeft(candidate.parent);
                    candidate = this._root as IRedBlackTreeNode<K, V>;
                }
            }

            // ...or it is a right child.
            else {
                sibling = candidate.parent.left;

                // Case 1: candidate's sibling is red.
                if (sibling.color === RedBlackTreeNodeColor.RED) {
                    sibling.color          = RedBlackTreeNodeColor.BLACK;
                    candidate.parent.color = RedBlackTreeNodeColor.RED;
                    this._rotateRight(candidate.parent);
                    sibling = candidate.parent.left;
                }

                // Case 2: candidate's sibling is black, and both of sibling's children are black.
                if (sibling.right.color === RedBlackTreeNodeColor.BLACK
                    && sibling.left.color === RedBlackTreeNodeColor.BLACK)
                {
                    sibling.color = RedBlackTreeNodeColor.RED;
                    candidate     = candidate.parent;
                }
                else {

                    // Case 3: candidate's sibling is black, sibling's left child is red and sibling's right child is
                    // black.
                    if (sibling.left.color === RedBlackTreeNodeColor.BLACK) {
                        sibling.right.color = RedBlackTreeNodeColor.BLACK;
                        sibling.color       = RedBlackTreeNodeColor.RED;
                        this._rotateLeft(sibling);
                        sibling = candidate.parent.left;
                    }

                    // Case 4 (case 3 falls through):  candidate's sibling is black, and sibling's right child is red.
                    sibling.color          = candidate.parent.color;
                    candidate.parent.color = RedBlackTreeNodeColor.BLACK;
                    sibling.left.color     = RedBlackTreeNodeColor.BLACK;
                    this._rotateRight(candidate.parent);
                    candidate = this._root as IRedBlackTreeNode<K, V>;
                }
            }
        }
    }

    /**
     * Rotates a subtree rooted at 'candidate' to the left.
     */
    protected _rotateLeft(candidate: IRedBlackTreeNode<K, V>): void {

        // Left rotation only works if the candidate has a right child.
        if (candidate.right === this._sentinel) return;

        // Define the candidate's replacement.
        const replacement = candidate.right;

        // Candidate's right child still points to the replacement.  Redirect it to the replacement's left child.
        candidate.right = replacement.left;

        // If the left child exists, reset its parent to the candidate.
        if (replacement.left !== this._sentinel) replacement.left.parent = candidate;

        // Ensure the replacement now references its new parent (currently, the candidate's parent).
        replacement.parent = candidate.parent;

        // If the candidate didn't have a parent, the replacement won't either.  The replacement is becoming the new
        // root.
        if (candidate.parent === this._sentinel) this._root = replacement;

        // Otherwise, determine which subtree of the candidate should now be parented by the replacement.
        else if (candidate === candidate.parent.left) candidate.parent.left = replacement;
        else candidate.parent.right = replacement;

        // Mark the candidate as the replacement's left child (the final portion of the left rotation).
        replacement.left = candidate;

        // Finally, give the candidate a new parent.
        candidate.parent = replacement;
    }

    /**
     * Rotates a subtree rooted at 'candidate' to the right.
     */
    protected _rotateRight(candidate: IRedBlackTreeNode<K, V>): void {

        // Right rotation only works if the candidate has a left child.
        if (candidate.left === this._sentinel) return;

        // Define the candidate's replacement.
        const replacement = candidate.left;

        // Candidate's left child still points to the replacement.  Redirect it to the replacement's right child.
        candidate.left = replacement.right;

        // If the right child exists, reset its parent to the candidate.
        if (replacement.right !== this._sentinel) replacement.right.parent = candidate;

        // Ensure the replacement now references its new parent (currently, the candidate's parent).
        replacement.parent = candidate.parent;

        // If the candidate didn't have a parent, the replacement won't either.  The replacement is becoming the new
        // root.
        if (candidate.parent === this._sentinel) this._root = replacement;

        // Otherwise, determine which subtree of the candidate should now be parented by the replacement.
        else if (candidate === candidate.parent.right) candidate.parent.right = replacement;
        else candidate.parent.left = replacement;

        // Mark the candidate as the replacement's right child (the final portion of the right rotation).
        replacement.right = candidate;

        // Finally, give the candidate a new parent.
        candidate.parent = replacement;
    }

    protected _traverseInOrder(): V[] {
        if (this._root === this._sentinel) return [];

        const orderedData: V[] = [];

        // Stacks make sense for what essentially amounts to a depth-first search.
        const stack: IRedBlackTreeNode<K, V>[] = [];
        let current: IRedBlackTreeNode<K, V>   = this._root as IRedBlackTreeNode<K, V>;

        // Build initial stack by traversing left
        while (current !== this._sentinel) {
            stack.push(current);
            current = current.left;
        }

        // Now traverse the tree from the minimum value.
        while (stack.length > 0) {
            current = stack.pop();
            orderedData.push(current.value);

            // If the current node has a right child, traverse that subtree before backing out.
            if (current.right !== this._sentinel) {
                current = current.right;

                // Like above, push until a leaf is reached.
                while (current !== this._sentinel) {
                    stack.push(current);
                    current = current.left;
                }
            }
        }

        return orderedData;
    }

    /**
     * Search the tree for a given key - iteratively.  A recursive solution is prettier and cooler, but it has
     * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
     * node if the value exists in the tree.  If the value is not found, returns null.
     */
    protected _find(targetKey: K,
                    startingNode: IRedBlackTreeNode<K, V> =
                        this._root as IRedBlackTreeNode<K, V>): IRedBlackTreeNode<K, V>
    {

        // Just make sure the target is legitimate.
        if (targetKey == null) return null;

        // Get a local variable.
        let currentNode = startingNode;

        // Loop until the current node is null (i.e. target key is not found), or the target key is found (comparer
        // returns zero).
        while (currentNode !== this._sentinel && this._comparer(targetKey, currentNode.key) !== 0) {

            // If comparer returns less than zero, target key is less than current node key - traverse left;
            if (this._comparer(targetKey, currentNode.key) < 0) currentNode = currentNode.left;

            // If comparer returns greater than zero, target key is greater than current node key - traverse right.
            else currentNode = currentNode.right;
        }

        // Return the current node (an actual node if the target is found, null if not).
        return currentNode;
    }

    /**
     * Search the tree for it's maximum value - iteratively.  A recursive solution is prettier and cooler, but it has
     * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
     * node if the value exists in the tree.  If the value is not found, returns null.
     */
    protected _max(root: IRedBlackTreeNode<K, V> = this._root as IRedBlackTreeNode<K, V>): IRedBlackTreeNode<K, V> {

        // Get a local variable.
        let currentNode: IRedBlackTreeNode<K, V> = root;

        // Iterate right until a leaf is reached.
        while (currentNode.right !== this._sentinel) {
            currentNode = currentNode.right;
        }

        return currentNode;
    }

    /**
     * Search the tree for it's minimum value - iteratively.  A recursive solution is prettier and cooler, but it has
     * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
     * node if the value exists in the tree.  If the value is not found, returns null.
     */
    protected _min(root: IRedBlackTreeNode<K, V> = this._root as IRedBlackTreeNode<K, V>): IRedBlackTreeNode<K, V> {

        // Get a local variable.
        let currentNode: IRedBlackTreeNode<K, V> = root;

        // Iterate left until a leaf is reached.
        while (currentNode.left !== this._sentinel) {
            currentNode = currentNode.left;
        }

        return currentNode;
    }

    /**
     * This method clears the tree.
     */
    protected _clear(): void {
        super.clear();
        this._root = this._sentinel;
    }

    private makeSentinel(): IRedBlackTreeNode<K, V> {
        const sentinel: IRedBlackTreeNode<K, V> = new RedBlackTreeNode();
        sentinel.parent                         = sentinel;
        sentinel.left                           = sentinel;
        sentinel.right                          = sentinel;
        sentinel.color                          = RedBlackTreeNodeColor.BLACK;

        return sentinel;
    }

    // </editor-fold>
}
