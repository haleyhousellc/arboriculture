import {
    BinarySearchTree,
    BinarySearchTreeNode,
    IBinarySearchTree,
    IBinarySearchTreeNode,
    IBinarySearchTreeNodeRemovalResult,
} from '../binary-search-tree/binary-search-tree';
import { defaultComparer, IComparer } from '../binary-tree/binary-tree';

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
}

export class RedBlackTreeNode<T> extends BinarySearchTreeNode<T> implements IRedBlackTreeNode<T> {
    protected _color: RedBlackTreeNodeColor;

    constructor(data: T) {
        super(data);

        // red-black nodes are always red initially
        this._color = RedBlackTreeNodeColor.RED;
    }

    public get color(): RedBlackTreeNodeColor {
        return this._color;
    }

    public set color(newColor: RedBlackTreeNodeColor) {
        this._color = newColor;
    }

    public get left(): IRedBlackTreeNode<T> {
        return super.left as IRedBlackTreeNode<T>;
    }

    public set left(newLeft: IRedBlackTreeNode<T>) {
        super.left = newLeft;
    }

    public get right(): IRedBlackTreeNode<T> {
        return super.right as IRedBlackTreeNode<T>;
    }

    public set right(newRight: IRedBlackTreeNode<T>) {
        super.right = newRight;
    }

    public get parent(): IRedBlackTreeNode<T> {
        return super.parent as IRedBlackTreeNode<T>;
    }

    public set parent(newParent: IRedBlackTreeNode<T>) {
        super.parent = newParent;
    }
}

/**
 * A complex return type for the internally (protected) member function #_remove.  This object provides the caller with
 * all important nodes involved in the removal of a candidate.  The candidate's replacement and the replacement's
 * successor are included in addition to the node that was actually removed.
 */
export interface IRedBlackTreeNodeRemovalResult<T> extends IBinarySearchTreeNodeRemovalResult<T> {
    candidate: IRedBlackTreeNode<T>;
    replacement: IRedBlackTreeNode<T>;
    newSuccessor: IRedBlackTreeNode<T>;
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

    constructor(data: T = null, comparer: IComparer<T> = defaultComparer) {
        super(data, comparer);
    }

    public get count(): number {
        return this._count;
    }

    public find(data: T): IRedBlackTreeNode<T> {
        return super.find(data) as IRedBlackTreeNode<T>;
    }

    public min(): IRedBlackTreeNode<T> {
        return super.min() as IRedBlackTreeNode<T>;
    }

    public max(): IRedBlackTreeNode<T> {
        return super.max() as IRedBlackTreeNode<T>;
    }

    public insert(data: T): IRedBlackTree<T> {
        this._insert(data);

        return this;
    }

    public remove(data: T): IRedBlackTree<T> {
        this._remove(data);

        return this;
    }

    public traverse(): T[] {
        return this._traverseInOrder();
    }

    // <editor-fold desc="protected implementations"

    protected _insert(data: T): IRedBlackTreeNode<T> {

        // Begin by inserting like normal, leveraging the inherited #_insert method.
        const newNode: IRedBlackTreeNode<T> = super._insert(data) as IRedBlackTreeNode<T>;

        // If the new node is null, it is a duplicate.
        if (!newNode) return newNode;

        // Next, color the node red.
        newNode.color = RedBlackTreeNodeColor.RED;

        // Fix any violation.
        this._fixInsertion(newNode);

        return newNode;
    }

    protected _remove(data: T): IRedBlackTreeNodeRemovalResult<T> {

        // Begin by inserting like normal, leveraging the inherited #_insert method.
        const { candidate, replacement, newSuccessor } = super._remove(data);

        // If the candidate is null, it was not present in the tree.
        if (!candidate) return { candidate: null, replacement: null, newSuccessor: null };

        // If the node that replaced the deleted node in the tree is black, fix any violations that exist.
        if ((replacement as IRedBlackTreeNode<T>).color === RedBlackTreeNodeColor.BLACK) {
            this._fixDeletion(newSuccessor as IRedBlackTreeNode<T>);
        }

        // Return all parties involved in node removal: the candidate (deleted node), the candidate's replacement in the
        // tree, and the new successor (successor to the replacement).
        return {
            candidate:    candidate as IRedBlackTreeNode<T>,
            newSuccessor: newSuccessor as IRedBlackTreeNode<T>,
            replacement:  replacement as IRedBlackTreeNode<T>,
        };
    }

    /**
     * This function adjusts node colors and performs any rotations needed after inserting a new node.
     */
    protected _fixInsertion(newNode: IRedBlackTreeNode<T>): void {

        let current = newNode;

        // The candidate begins life red. If the candidate's parent isn't red, no violation should have occurred.
        while (current.parent && current.parent.color === RedBlackTreeNodeColor.RED) {

            // Define some local convenience members.
            let parent      = current.parent;
            let grandparent = parent.parent;

            // The parent is the left child of the grandparent...
            if (parent === grandparent.left) {

                // Another genealogically-derived convenience member.
                const uncle = grandparent.right;

                // Case 1:
                // Basically, is the uncle the same color as the candidate?  If so, adjust color of uncle (to match
                // parent).
                if (uncle && uncle.color === RedBlackTreeNodeColor.RED) {

                    // Adjust colors of relatives.
                    parent.color      = RedBlackTreeNodeColor.BLACK;
                    uncle.color       = RedBlackTreeNodeColor.BLACK;
                    grandparent.color = RedBlackTreeNodeColor.RED;

                    // Set current to grandparent so the next iteration walks up the tree.  The next iteration begins
                    // after this line, so there is no need to reset parent and grandparent yet.
                    current = grandparent;
                }

                // Otherwise, assess rotation needs.
                else {

                    // Case 2:
                    // Is the candidate a right child?
                    if (current === parent.right) {

                        // Walk up the tree one step...
                        current     = parent;
                        parent      = current.parent;
                        grandparent = parent.parent;

                        // ...then rotate left.
                        this._rotateLeft(current);
                    }

                    // Case 3 (case 2 falls through to case 3)
                    // Adjust colors of parent and grandparent.
                    parent.color      = RedBlackTreeNodeColor.BLACK;
                    grandparent.color = RedBlackTreeNodeColor.RED;

                    // Finally, rotate right.
                    this._rotateRight(grandparent);
                }
            }

            // ...or the parent is the right child of the grandparent.  A mirror of the above.
            else {

                // Another genealogically-derived convenience member.
                const uncle = grandparent.left;

                // Case 1:
                // Basically, is the uncle the same color as the candidate?  If so, adjust color of uncle (to match
                // parent).
                if (uncle && uncle.color === RedBlackTreeNodeColor.RED) {

                    // Adjust colors of relatives.
                    parent.color      = RedBlackTreeNodeColor.BLACK;
                    uncle.color       = RedBlackTreeNodeColor.BLACK;
                    grandparent.color = RedBlackTreeNodeColor.RED;

                    // Set current to grandparent so the next iteration walks up the tree.  The next iteration begins
                    // after this line, so there is no need to reset parent and grandparent yet.
                    current = grandparent;
                }

                // Otherwise, assess rotation needs.
                else {

                    // Case 2:
                    // Is the candidate a left child?
                    if (current === parent.left) {

                        // Walk up the tree one step...
                        current     = parent;
                        parent      = current.parent;
                        grandparent = parent.parent;

                        // ...then rotate right.
                        this._rotateRight(current);
                    }

                    // Case 3 (case 2 falls through to case 3)
                    // Adjust colors of parent and grandparent.
                    parent.color      = RedBlackTreeNodeColor.BLACK;
                    grandparent.color = RedBlackTreeNodeColor.RED;

                    // Finally, rotate left.
                    this._rotateLeft(grandparent);
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
            const parent = candidate.parent;

            // The deleted node is a left child...
            if (candidate === parent.left) {
                let sibling = parent.right;

                // Case 1: candidate's sibling is red.
                if (sibling.color === RedBlackTreeNodeColor.RED) {
                    sibling.color = RedBlackTreeNodeColor.BLACK;
                    parent.color  = RedBlackTreeNodeColor.RED;
                    this._rotateLeft(parent);
                    sibling = parent.right;
                }

                // Case 2: candidate's sibling is black, and both of sibling's children are black.
                if (sibling.left.color === RedBlackTreeNodeColor.BLACK
                    && sibling.right.color === RedBlackTreeNodeColor.BLACK)
                {
                    sibling.color = RedBlackTreeNodeColor.RED;
                    candidate   = parent;
                } else {

                    // Case 3: candidate's sibling is black, sibling's left child is red and sibling's right child is
                    // black.
                    if (sibling.right.color === RedBlackTreeNodeColor.BLACK) {
                        sibling.left.color = RedBlackTreeNodeColor.BLACK;
                        this._rotateRight(sibling);
                        sibling = parent.right;
                    }

                    // Case 4 (case 3 falls through):  candidate's sibling is black, and sibling's right child is red.
                    sibling.color       = parent.color;
                    parent.color        = RedBlackTreeNodeColor.BLACK;
                    sibling.right.color = RedBlackTreeNodeColor.BLACK;
                    this._rotateLeft(parent);
                    candidate = this._root as IRedBlackTreeNode<T>;
                }
            }

            // ...or it is a right child.
            else {
                let sibling = parent.left;

                // Case 1: candidate's sibling is red.
                if (sibling.color === RedBlackTreeNodeColor.RED) {
                    sibling.color = RedBlackTreeNodeColor.BLACK;
                    parent.color  = RedBlackTreeNodeColor.RED;
                    this._rotateRight(parent);
                    sibling = parent.left;
                }

                // Case 2: candidate's sibling is black, and both of sibling's children are black.
                if (sibling.right.color === RedBlackTreeNodeColor.BLACK
                    && sibling.left.color === RedBlackTreeNodeColor.BLACK)
                {
                    sibling.color = RedBlackTreeNodeColor.RED;
                    candidate   = parent;
                } else {

                    // Case 3: candidate's sibling is black, sibling's right child is red and sibling's left child is
                    // black.
                    if (sibling.left.color === RedBlackTreeNodeColor.BLACK) {
                        sibling.right.color = RedBlackTreeNodeColor.BLACK;
                        this._rotateLeft(sibling);
                        sibling = parent.left;
                    }

                    // Case 4 (case 3 falls through):  candidate's sibling is black, and sibling's left child is red.
                    sibling.color      = parent.color;
                    parent.color       = RedBlackTreeNodeColor.BLACK;
                    sibling.left.color = RedBlackTreeNodeColor.BLACK;
                    this._rotateRight(parent);
                    candidate = this._root as IRedBlackTreeNode<T>;
                }
            }
        }

        // Finally, set it's color to black.
        candidate.color = RedBlackTreeNodeColor.BLACK;
    }

    /**
     * Rotates a subtree rooted at 'candidate' to the left.
     */
    protected _rotateLeft(candidate: IRedBlackTreeNode<T>): void {

        // Left rotation only works if the candidate has a right child.
        if (!candidate.right) return;

        // Define the candidate's replacement.
        const replacement = candidate.right;

        // Candidate's right child still points to the replacement.  Redirect it to the replacement's left child.
        candidate.right = replacement.left;

        // If the left child exists, reset its parent to the candidate.
        if (replacement.left) replacement.left.parent = candidate;

        // Ensure the replacement now references its new parent (currently, the candidate's parent).
        replacement.parent = candidate.parent;

        // If the candidate didn't have a parent, the replacement won't either.  The replacement is becoming the new
        // root.
        if (!candidate.parent) this._root = replacement;

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
        if (!candidate.left) return;

        // Define the candidate's replacement.
        const replacement = candidate.left;

        // Candidate's left child still points to the replacement.  Redirect it to the replacement's right child.
        candidate.left = replacement.right;

        // If the right child exists, reset its parent to the candidate.
        if (replacement.right) replacement.right.parent = candidate;

        // Ensure the replacement now references its new parent (currently, the candidate's parent).
        replacement.parent = candidate.parent;

        // If the candidate didn't have a parent, the replacement won't either.  The replacement is becoming the new
        // root.
        if (!candidate.parent) this._root = replacement;

        // Otherwise, determine which subtree of the candidate should now be parented by the replacement.
        else if (candidate === candidate.parent.right) candidate.parent.right = replacement;
        else candidate.parent.left = replacement;

        // Mark the candidate as the replacement's right child (the final portion of the right rotation).
        replacement.right = candidate;

        // Finally, give the candidate a new parent.
        candidate.parent = replacement;
    }

    // </editor-fold>
}
