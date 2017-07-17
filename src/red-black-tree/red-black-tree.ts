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
 * A red-black tree node redefines the types of members #left, #right, and #parent to return IRedBlackTreeNode<T> rather
 * than a IBinarySearchTreeNode<T>.  It also adds a new member #color used in determining how/when to rotate the tree.
 */
export interface IRedBlackTreeNode<T> extends IBinarySearchTreeNode<T> {
    color: RedBlackTreeNodeColor;
    left: IRedBlackTreeNode<T>;
    right: IRedBlackTreeNode<T>;
    parent: IRedBlackTreeNode<T>;
    isSentinel: boolean;
}

export class RedBlackTreeNode<T> extends BinarySearchTreeNode<T> implements IRedBlackTreeNode<T> {
    protected _color: RedBlackTreeNodeColor = null;

    private _isSentinel: boolean = null;

    constructor(data: T) {
        super(data);

        this._isSentinel = !data;
    }

    public get color(): RedBlackTreeNodeColor {
        return this._color;
    }

    public set color(newColor: RedBlackTreeNodeColor) {
        this._color = newColor;
    }

    public get left(): IRedBlackTreeNode<T> {
        return this._left as IRedBlackTreeNode<T>;
    }

    public set left(newLeft: IRedBlackTreeNode<T>) {
        this._left = newLeft;
    }

    public get right(): IRedBlackTreeNode<T> {
        return this._right as IRedBlackTreeNode<T>;
    }

    public set right(newRight: IRedBlackTreeNode<T>) {
        this._right = newRight;
    }

    public get parent(): IRedBlackTreeNode<T> {
        return this._parent as IRedBlackTreeNode<T>;
    }

    public set parent(newParent: IRedBlackTreeNode<T>) {
        this._parent = newParent;
    }

    public get isSentinel(): boolean {
        return this._isSentinel;
    }
}

/**
 * This interface simply redefines some return types inherited from the standard IBinarySearchTree<T>.
 */
export interface IRedBlackTree<T> extends IBinarySearchTree<T> {
    find(data: T): IRedBlackTreeNode<T>;
    min(): IRedBlackTreeNode<T>;
    max(): IRedBlackTreeNode<T>;
    insert(data: T): IRedBlackTree<T>;
    remove(data: T): IRedBlackTree<T>;
}

/**
 * Red-Black tree supporting all basic binary search tree operations.
 */
export class RedBlackTree<T> extends BinarySearchTree<T> implements IRedBlackTree<T> {

    private _sentinel: RedBlackTreeNode<T> = null;

    constructor(comparer: IComparer<T> = defaultComparer) {
        super(comparer);

        this._sentinel       = new RedBlackTreeNode<T>(null);
        this._sentinel.color = RedBlackTreeNodeColor.BLACK;
        this._root           = this._sentinel;
    }

    public get count(): number {
        return this._count;
    }

    public find(data: T): IRedBlackTreeNode<T> {
        const node = this._find(data);

        return node === this._sentinel ? null : node;
    }

    public min(): IRedBlackTreeNode<T> {
        return this._min();
    }

    public max(): IRedBlackTreeNode<T> {
        return this._max();
    }

    public insert(data: T): IRedBlackTree<T> {
        this._insert(data);

        return this;
    }

    public remove(data: T): IRedBlackTree<T> {
        this._remove(data);

        return this;
    }

    public clear(): void {
        return this._clear();
    }

    public traverse(): T[] {
        return this._traverseInOrder();
    }

    public toString(order: TraversalOrder = TraversalOrder.INORDER): string {
        return this._traverseInOrder().join(' | ').trim();
    }

    // <editor-fold desc="protected implementations"

    /**
     * The insert procedure differs slightly from the base insert.
     */
    protected _insert(data: T): IRedBlackTreeNode<T> {
        const newNode: IRedBlackTreeNode<T> = new RedBlackTreeNode<T>(data);

        let currentParent: IRedBlackTreeNode<T> = this._sentinel;
        let current: IRedBlackTreeNode<T>       = this._root as IRedBlackTreeNode<T>;

        // Iterate over the tree to find the new node's parent.
        while (current !== this._sentinel) {
            currentParent = current;

            // Don't allow duplicates, so simply return if the data is already present in the tree.
            if (this._comparer(newNode.data, current.data) === 0) return null;

            // Otherwise traverse the appropriate child.
            if (this._comparer(newNode.data, current.data) < 0) current = current.left;
            else current = current.right;
        }

        // Assign the appropriate parent to the new node.
        newNode.parent = currentParent;

        // If the parent is still the sentinel, the tree was empty and the new node becomes the new root.
        if (currentParent === this._sentinel) this._root = newNode;

        // Otherwise, determine whether the new node should be the left or right child of its parent and link it.
        else if (this._comparer(newNode.data, currentParent.data) < 0) currentParent.left = newNode;
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
    protected _remove(data: T): IRedBlackTreeNode<T> {

        const candidate: IRedBlackTreeNode<T> = this._find(data);

        // If the candidate is null, it was not present in the tree.
        if (candidate === this._sentinel) return null;

        // Declare a replacement for the deleted node.  This begins as it's successor, but is spliced out of it's
        // original location and is substituted back into the tree at the location of the deleted node.
        let replacement: IRedBlackTreeNode<T> = null;

        // If the node to be deleted has less than 2 children (i.e. 0 or 1), designate it as it's own replacement
        if (candidate.left === this._sentinel || candidate.right === this._sentinel) replacement = candidate;

        // Otherwise set the replacement as the candidate's immediate successor.
        else replacement = this._findSuccessor(candidate) as IRedBlackTreeNode<T>;

        // Declare a new successor.  This is either the replacement's only child, or null.  After the replacement takes
        // over in the old position of the deleted node, this node represents the replacement's immediate successor.
        let newSuccessor: IRedBlackTreeNode<T> = null;

        if (replacement.left !== this._sentinel) newSuccessor = replacement.left;
        else newSuccessor = replacement.right;

        // This is a change from the standard delete procedure.
        newSuccessor.parent = replacement.parent;

        if (replacement.parent === this._sentinel) this._root = newSuccessor;
        else if (replacement === replacement.parent.left) replacement.parent.left = newSuccessor;
        else replacement.parent.right = newSuccessor;

        if (replacement !== candidate) candidate.data = replacement.data;

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
    protected _fixInsertion(newNode: IRedBlackTreeNode<T>): void {
        let current: IRedBlackTreeNode<T> = newNode;
        let uncle: IRedBlackTreeNode<T>   = null;

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
        (this._root as IRedBlackTreeNode<T>).color = RedBlackTreeNodeColor.BLACK;
    }

    /**
     * This function adjusts node colors and performs any rotations needed after deleting a node.
     */
    protected _fixDeletion(candidate: IRedBlackTreeNode<T>): void {

        while (candidate !== this._root && candidate.color === RedBlackTreeNodeColor.BLACK) {
            let sibling: IRedBlackTreeNode<T> = null;

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
                    candidate = this._root as IRedBlackTreeNode<T>;
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
                    candidate = this._root as IRedBlackTreeNode<T>;
                }
            }
        }
    }

    /**
     * Rotates a subtree rooted at 'candidate' to the left.
     */
    protected _rotateLeft(candidate: IRedBlackTreeNode<T>): void {

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
    protected _rotateRight(candidate: IRedBlackTreeNode<T>): void {

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

    protected _traverseInOrder(): T[] {
        if (this._root === this._sentinel) return [];

        const orderedData: T[] = [];

        // Stacks make sense for what essentially amounts to a depth-first search.
        const stack: IRedBlackTreeNode<T>[] = [];
        let current: IRedBlackTreeNode<T>   = this._root as IRedBlackTreeNode<T>;

        // Build initial stack by traversing left
        while (current !== this._sentinel) {
            stack.push(current);
            current = current.left;
        }

        // Now traverse the tree from the minimum value.
        while (stack.length > 0) {
            current = stack.pop();
            orderedData.push(current.data);

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
     * Search the tree for a given piece of data - iteratively.  A recursive solution is prettier and cooler, but it has
     * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
     * node if the value exists in the tree.  If the value is not found, returns null.
     */
    protected _find(targetData: T,
                    startingNode: IRedBlackTreeNode<T> = this._root as IRedBlackTreeNode<T>): IRedBlackTreeNode<T>
    {

        // Just make sure the target is legitimate.
        if (targetData == null) return null;

        // Get a local variable.
        let currentNode = startingNode;

        // Loop until the current node is null (i.e. target data is not found), or the target data is found (comparer
        // returns zero).
        while (currentNode !== this._sentinel && this._comparer(targetData, currentNode.data) !== 0) {

            // If comparer returns less than zero, target data is less than current node data - traverse left;
            if (this._comparer(targetData, currentNode.data) < 0) currentNode = currentNode.left;

            // If comparer returns greater than zero, target data is greater than current node data - traverse right.
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
    protected _max(root: IRedBlackTreeNode<T> = this._root as IRedBlackTreeNode<T>): IRedBlackTreeNode<T> {

        // Get a local variable.
        let currentNode: IRedBlackTreeNode<T> = root;

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
    protected _min(root: IRedBlackTreeNode<T> = this._root as IRedBlackTreeNode<T>): IRedBlackTreeNode<T> {

        // Get a local variable.
        let currentNode: IRedBlackTreeNode<T> = root;

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

    // </editor-fold>
}
