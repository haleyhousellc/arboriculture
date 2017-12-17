import {
    BinarySearchTree,
    BinarySearchTreeNode,
    IBinarySearchTree,
    IBinarySearchTreeNode,
} from '../binary-search-tree/binary-search-tree';
import { defaultComparer, IComparer, TraversalOrder } from '../binary-tree/binary-tree';

export enum BalanceFactor {
    RIGHT_HEAVY   = -2,
    RIGHT_LEANING = -1,
    BALANCED      = 0,
    LEFT_LEANING  = 1,
    LEFT_HEAVY    = 2,
}

export enum HeightStatus {
    SAME    = 0,
    CHANGED = 1,
}

export enum InsertionMultiplier {
    LEFT  = 1,
    RIGHT = -1,
}

/**
 * An avl tree node redefines the types of members #left, #right, and #parent to return IAvlTreeNode<K, V> rather
 * than a IBinarySearchTreeNode<K, V>.  It also adds a new member #color used in determining how/when to rotate the
 * tree.
 */
export interface IAvlTreeNode<K, V> extends IBinarySearchTreeNode<K, V> {
    balanceFactor: BalanceFactor;
    isOverweight: boolean;
    isBalanced: boolean;
    left: IAvlTreeNode<K, V>;
    right: IAvlTreeNode<K, V>;
    parent: IAvlTreeNode<K, V>;
}

export class AvlTreeNode<K, V> extends BinarySearchTreeNode<K, V> implements IAvlTreeNode<K, V> {

    private _balanceFactor: BalanceFactor = null;

    constructor(key: K, value: V) {
        super(key, value);

        this._balanceFactor = BalanceFactor.BALANCED;
    }

    public get balanceFactor(): BalanceFactor {
        return this._balanceFactor;
    }

    public set balanceFactor(newFactor: BalanceFactor) {
        this._balanceFactor = newFactor;
    }

    public get isOverweight(): boolean {
        return this._balanceFactor === BalanceFactor.LEFT_HEAVY || this._balanceFactor === BalanceFactor.RIGHT_HEAVY;
    }

    public get isBalanced(): boolean {
        return this._balanceFactor === BalanceFactor.BALANCED;
    }

    public get left(): IAvlTreeNode<K, V> {
        return this._left as IAvlTreeNode<K, V>;
    }

    public set left(newLeft: IAvlTreeNode<K, V>) {
        this._left = newLeft;
    }

    public get right(): IAvlTreeNode<K, V> {
        return this._right as IAvlTreeNode<K, V>;
    }

    public set right(newRight: IAvlTreeNode<K, V>) {
        this._right = newRight;
    }

    public get parent(): IAvlTreeNode<K, V> {
        return this._parent as IAvlTreeNode<K, V>;
    }

    public set parent(newParent: IAvlTreeNode<K, V>) {
        this._parent = newParent;
    }

    public toString(): string {
        const str = `value: ${this._value}, balance factor: ${this._balanceFactor}`;
        if (this._left) str.concat(`, left.value: ${this._left.value}`);
        if (this._right) str.concat(`, right.value: ${this._right.value}`);
        if (this._parent) str.concat(`, parent.value: ${this._parent.value}`);

        return str;
    }
}

/**
 * This interface simply redefines some return types inherited from the standard IBinarySearchTree<K, V>.
 */
export interface IAvlTree<K, V> extends IBinarySearchTree<K, V> {
    find(key: K): IAvlTreeNode<K, V>;

    min(): IAvlTreeNode<K, V>;

    max(): IAvlTreeNode<K, V>;

    insert(key: K, value?: V): IAvlTree<K, V>;

    remove(key: K): IAvlTree<K, V>;
}

/**
 * Red-Black tree supporting all basic binary search tree operations.
 * Credit goes to http://oopweb.com/Algorithms/Documents/AvlTrees/Volume/AvlTrees.htm
 */
export class AvlTree<K, V> extends BinarySearchTree<K, V> implements IAvlTree<K, V> {

    constructor(comparer: IComparer<K> = defaultComparer) {
        super(comparer);
    }

    public get count(): number {
        return this._count;
    }

    public find(key: K): IAvlTreeNode<K, V> {
        return this._find(key);
    }

    public min(): IAvlTreeNode<K, V> {
        return this._min();
    }

    public max(): IAvlTreeNode<K, V> {
        return this._max();
    }

    public insert(key: K, value?: V): IAvlTree<K, V> {
        this._insert(new AvlTreeNode<K, V>(key, value));

        return this;
    }

    public remove(key: K): IAvlTree<K, V> {
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

    // </editor-fold>

    //<editor-fold desc="protected">

    protected _find(targetKey: K,
                    startingNode: IAvlTreeNode<K, V> = this._root as IAvlTreeNode<K, V>): IAvlTreeNode<K, V> {
        return super._find(targetKey, startingNode) as IAvlTreeNode<K, V>;
    }

    /**
     * Insert the given key into the tree - iteratively.  No duplicates are allowed.  If the new node is a
     * duplicate, no change occurs.  A recursive solution is prettier and cooler, but it has the potential for
     * memory-related performance problems as the tree grows (i.e. hitting stack limits).
     */
    protected _insert(newNode: IAvlTreeNode<K, V>): IAvlTreeNode<K, V> {

        const insertedNode: IAvlTreeNode<K, V> = super._insert(newNode) as IAvlTreeNode<K, V>;

        // Only move forward if the node wasn't a duplicate.
        if (!insertedNode) return null;

        // Fix the insertion, if it occurred.
        this._fixInsertion(insertedNode);

        // Return the newly inserted node.
        return insertedNode;
    }

    /**
     * Delete the given key from the tree - iteratively.  A recursive solution is prettier and cooler, but it has the
     * potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).
     *
     * The logic below up to the call to super#_remove is actually duplicated from the #_remove method.  For an AVL
     * tree we need to know the original parent of the replacement to make it easier to update balance factors along
     * the path to the candidate.  An alternative would be to traverse the entire subtree after removal to try to
     * determine where the replacement came from.  This seemed more straight forward...
     */
    protected _remove(key: K): IAvlTreeNode<K, V> {

        // For more information on the following lines (up to the call to super#_remove) see that method instead.
        // The logic is duplicated to make book-keeping easier after the removal.  Essentially, we call #_find and
        // #_findSuccessor here, then again in the reused code from super#_remove.  Both are quick O(log n)
        // operations, so running each twice is still O(log n) - essentially, a negligible performance hit.
        const candidate: IAvlTreeNode<K, V> = this._find(key) as IAvlTreeNode<K, V>;
        if (!candidate) return null;

        let successor: IAvlTreeNode<K, V> = null;

        if (!candidate.left || !candidate.right) successor = candidate;
        else successor = this._findSuccessor(candidate) as IAvlTreeNode<K, V>;

        // There will be a bit of duplicated logic here, but overall the running time will remain the same - O (log n).
        const replacement: IAvlTreeNode<K, V> = super._remove(key) as IAvlTreeNode<K, V>;

        replacement.balanceFactor = candidate.balanceFactor;

        // Now, fix any imbalances that may have arisen.
        if (replacement) this._fixDeletion(successor.parent);

        return replacement;
    }

    /**
     * Search the tree for it's minimum value - iteratively.  A recursive solution is prettier and cooler, but it has
     * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
     * node if the value exists in the tree.  If the value is not found, returns null.
     */
    protected _min(root: IAvlTreeNode<K, V> = this._root as IAvlTreeNode<K, V>): IAvlTreeNode<K, V> {
        return super._min(root) as IAvlTreeNode<K, V>;
    }

    /**
     * Search the tree for it's maximum value - iteratively.  A recursive solution is prettier and cooler, but it has
     * the potential for memory-related performance problems as the tree grows (i.e. hitting stack limits).  Returns a
     * node if the value exists in the tree.  If the value is not found, returns null.
     */
    protected _max(root: IAvlTreeNode<K, V> = this._root as IAvlTreeNode<K, V>): IAvlTreeNode<K, V> {
        return super._max(root) as IAvlTreeNode<K, V>;
    }

    protected _clear() {
        super.clear();
    }

    //</editor-fold>

    //<editor-fold desc="private">

    /**
     * This function adjusts balance factors and performs any rotations needed after inserting a new node.
     */
    protected _fixInsertion(newNode: IAvlTreeNode<K, V>): void {

        // Quick sanity check.
        if (!newNode) return;

        let previous: IAvlTreeNode<K, V> = newNode;
        let current: IAvlTreeNode<K, V>  = previous.parent;

        // New node was inserted into empty tree (at root).
        if (!current) return;

        // Find the offending node (this is the first node with a balance factor that is either left overweight or right
        // overweight).
        while (current) {

            // Update the balance factor based on the direction in which the insertion took place.
            current.balanceFactor += previous === current.left ? InsertionMultiplier.LEFT : InsertionMultiplier.RIGHT;

            // If the current node is overweight, simply rebalance it.  Reassign current to the new subtree root.
            if (current.isOverweight) current = this._rebalance(current);

            // If the current node is balanced after adjusting its balance factor (and possibly rebalancing), we can
            // safely exit.
            if (current.isBalanced) break;

            previous = current;
            current  = current.parent;
        }

        return;
    }

    /**
     * This function adjusts balance factors and performs any rotations needed after deleting a node.
     */
    protected _fixDeletion(originalParentOfReplacement: IAvlTreeNode<K, V>): void {

        // Quick sanity check.
        if (!originalParentOfReplacement) return;

        originalParentOfReplacement.balanceFactor = originalParentOfReplacement.left
            ? BalanceFactor.LEFT_LEANING
            : BalanceFactor.RIGHT_LEANING;

        let current: IAvlTreeNode<K, V> = originalParentOfReplacement;


        // Follow the path from the replacement to the candidate and update balance factors along the way.  When
        // removing a node from a BST, the successor will always be a descendant of the candidate or the candidate
        // itself.  Therefore, we don't have to consider cases when the successor is an ancestor.
        while (current) {

            // Update the balance factor based on the direction in which the removal took place.
            current.balanceFactor -= current === current.left ? InsertionMultiplier.LEFT : InsertionMultiplier.RIGHT;

            // If the current node is overweight, simply rebalance it.  Reassign current to the new subtree root.
            if (current.isOverweight) current = this._rebalance(current);

            // If the current node is balanced after adjusting its balance factor (and possibly rebalancing), we can
            // safely exit.
            if (current.isBalanced) break;

            current = current.parent;
        }

        return;
    }

    protected _rebalance(node: IAvlTreeNode<K, V>): IAvlTreeNode<K, V> {

        if (node.balanceFactor === BalanceFactor.LEFT_HEAVY) {

            if (node.left.balanceFactor === BalanceFactor.RIGHT_LEANING) return this._rotateLeftRight(node);

            // If node.left is LEFT_LEANING, this is a standard right rotation due to insertion.  If node.left is
            // BALANCED, this is a right rotation due to a delete.
            else return this._rotateRight(node);
        }
        else if (node.balanceFactor === BalanceFactor.RIGHT_HEAVY) {

            if (node.right.balanceFactor === BalanceFactor.LEFT_LEANING) return this._rotateRightLeft(node);

            // If node.right is RIHT_LEANING, this is a standard left rotation due to insertion.  If node.right is
            // BALANCED, this is a left rotation due to a delete.
            else return this._rotateLeft(node);
        }
    }

    /**
     * Rotates a subtree rooted at 'candidate' to the left.
     */
    protected _rotateLeft(candidate: IAvlTreeNode<K, V>): IAvlTreeNode<K, V> {

        // Left rotation only works if the candidate has a right child.
        if (!candidate.right) return null;

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

        // Next, give the candidate a new parent.
        candidate.parent = replacement;

        // Finally, update balance factors for participating nodes.
        replacement.balanceFactor++;
        candidate.balanceFactor = -replacement.balanceFactor;

        return replacement;
    }

    /**
     * Rotates a subtree rooted at 'candidate' to the right.
     */
    protected _rotateRight(candidate: IAvlTreeNode<K, V>): IAvlTreeNode<K, V> {

        // Right rotation only works if the candidate has a left child.
        if (!candidate.left) return null;

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

        // Next, give the candidate a new parent.
        candidate.parent = replacement;

        // Finally, update balance factors for participating nodes.
        replacement.balanceFactor--;
        candidate.balanceFactor = -replacement.balanceFactor;

        return replacement;
    }

    /**
     * Double rotation of a subtree rooted at 'candidate' to the left then right.
     */
    protected _rotateLeftRight(candidate: IAvlTreeNode<K, V>): IAvlTreeNode<K, V> {
        this._rotateLeft(candidate.left);

        return this._rotateRight(candidate);
    }

    /**
     * Double rotation of a subtree rooted at 'candidate' to the right then left.
     */
    protected _rotateRightLeft(candidate: IAvlTreeNode<K, V>): IAvlTreeNode<K, V> {
        this._rotateRight(candidate.right);

        return this._rotateLeft(candidate);
    }

    //</editor-fold>
}
