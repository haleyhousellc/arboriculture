import * as assert from 'assert';
import { isValidAvl, AvlTree, IAvlTree, IAvlTreeNode, findInvalidAvlNode } from '../src/avl-tree/avl-tree';
import {
    isValidBst, BinarySearchTree, IBinarySearchTree,
    findFromNode,
} from '../src/binary-search-tree/binary-search-tree';
import { IRedBlackTree, RedBlackTree } from '../src/red-black-tree/red-black-tree';

//tslint:disable

describe('stress tests', () => {

    describe(`avl`, function () {

        const debugAvlTree = <K, V>(tree: IAvlTree<K, V>,
                                    clone: IAvlTree<K, V>,
                                    missing: V[],
                                    action: string,
                                    key: K,
                                    value?: V): void => {

            const inValidTreeNode = !isValidAvl(tree.root) ? findInvalidAvlNode(tree.root) : null;
            const invalidCloneNode = !isValidAvl(clone.root) ? findInvalidAvlNode(clone.root) : null;

            const verifyMissing = action === `insert`
                ? findTreeInsertDifferences(tree.traverse(), clone.traverse())
                : findTreeRemoveDifferences(tree.traverse(), clone.traverse());

            const problemChild = findFromNode(clone.root, key);

            const missingNodes: IAvlTreeNode<number, V>[] = [];
            missing.forEach(m => missingNodes.push(findFromNode(clone.root, (m as any).d) as IAvlTreeNode<number, V>));

            const treeSize  = tree.size();
            const cloneSize = clone.size();
            const diff      = cloneSize - treeSize;

            const checkInvalid = findInvalidAvlNode(inValidTreeNode);

            action === 'insert'
                ? clone.insert(key, value)
                : clone.remove(key);

            const diminishedSize = clone.size();
            const diff2          = diminishedSize - treeSize;

            const x = '';

            if (!isValidAvl(clone.root)) {
                isValidAvl(clone.root);
            }
        };

        this.timeout(100000);

        it(`should work`, done => {
            let fail = false;

            const tree1: IAvlTree<number, IMyObject> = AvlTree();
            const tree2: IAvlTree<number, IMyObject> = AvlTree();

            const insertRounds = 1000;

            for (let i = 0; i < insertRounds; i++) {
                const value = makeValue();

                tree1.insert(value.d, value);

                if (!isValidAvl(tree1.root)) {
                    fail = true;
                    break;
                }
            }

            for (let i = 0; i < insertRounds; i++) {
                const value = makeValue();

                tree2.insert(value.d, value);

                if (!isValidAvl(tree2.root)) {
                    fail = true;
                    break;
                }
            }

            const activityRounds = 1000;
            for (let i = 0; i < activityRounds; i++) {

                const randomInsertion1   = makeValue();
                const clone1BeforeInsert = tree1.clone();

                const insert1IsUpdate = tree1.find(randomInsertion1.d) !== null;
                tree1.insert(randomInsertion1.d, randomInsertion1);

                const missing1 = findTreeInsertDifferences(tree1.traverse(), clone1BeforeInsert.traverse());
                if (!isValidAvl(tree1.root)
                    || (!insert1IsUpdate && (!missing1
                                             || missing1.length !== 1
                                             || missing1[0].d !== randomInsertion1.d)))
                {
                    debugAvlTree(tree1, clone1BeforeInsert, missing1, 'insert', randomInsertion1.d, randomInsertion1);
                    fail = true;
                    break;
                }

                const randomKeyToRemove1 = Math.ceil(Math.random() * 1000);
                const clone1BeforeRemove = tree1.clone();

                const remove1IsNotPresent = !tree1.find(randomKeyToRemove1);
                tree1.remove(randomKeyToRemove1);

                const missing2 = findTreeRemoveDifferences(tree1.traverse(), clone1BeforeRemove.traverse());
                if (!isValidAvl(tree1.root)
                    || (!remove1IsNotPresent && (!missing2
                                                 || missing2.length !== 1
                                                 || missing2[0].d !== randomKeyToRemove1)))
                {
                    debugAvlTree(tree1, clone1BeforeRemove, missing2, 'remove', randomKeyToRemove1);
                    fail = true;
                    break;
                }

                const randomInsertion2   = makeValue();
                const clone2BeforeInsert = tree2.clone();

                const insert2IsUpdate = tree2.find(randomInsertion2.d) !== null;
                tree2.insert(randomInsertion2.d, randomInsertion2);

                const missing3 = findTreeInsertDifferences(tree2.traverse(), clone2BeforeInsert.traverse());
                if (!isValidAvl(tree2.root)
                    || (!insert2IsUpdate && (!missing3
                                             || missing3.length !== 1
                                             || missing3[0].d !== randomInsertion2.d)))
                {
                    debugAvlTree(tree2, clone2BeforeInsert, missing3, 'insert', randomInsertion2.d, randomInsertion2);
                    fail = true;
                    break;
                }

                const randomKeyToRemove2 = Math.ceil(Math.random() * 1000);
                const clone2BeforeRemove = tree2.clone();

                const remove2IsNotPresent = !tree2.find(randomKeyToRemove2);
                tree2.remove(randomKeyToRemove2);

                const missing4 = findTreeRemoveDifferences(tree2.traverse(), clone2BeforeRemove.traverse());
                if (!isValidAvl(tree2.root)
                    || (!remove2IsNotPresent && (!missing4
                                                 || missing4.length !== 1
                                                 || missing4[0].d !== randomKeyToRemove2)))
                {
                    debugAvlTree(tree2, clone2BeforeRemove, missing4, 'remove', randomKeyToRemove2);
                    fail = true;
                    break;
                }
            }

            assert(!fail, `test should pass`);
            done();
        });
    });

    describe(`bst`, function () {

        this.timeout(100000);

        it(`should work`, done => {
            let fail = false;

            const tree1: IBinarySearchTree<number, IMyObject> = BinarySearchTree();
            const tree2: IBinarySearchTree<number, IMyObject> = BinarySearchTree();

            const insertRounds = 1000;

            for (let i = 0; i < insertRounds; i++) {
                const value = makeValue();

                tree1.insert(value.d, value);

                if (!isValidBst(tree1.root)) {
                    fail = true;
                    break;
                }
            }

            for (let i = 0; i < insertRounds; i++) {
                const value = makeValue();

                tree2.insert(value.d, value);

                if (!isValidBst(tree2.root)) {
                    fail = true;
                    break;
                }
            }

            const activityRounds = 1000;
            for (let i = 0; i < activityRounds; i++) {

                const randomInsertion1   = makeValue();
                const clone1BeforeInsert = tree1.clone();

                const insert1IsUpdate = tree1.find(randomInsertion1.d) !== null;
                tree1.insert(randomInsertion1.d, randomInsertion1);

                const missing1 = findTreeInsertDifferences(tree1.traverse(), clone1BeforeInsert.traverse());
                if (!isValidBst(tree1.root)
                    || (!insert1IsUpdate && (!missing1
                                             || missing1.length !== 1
                                             || missing1[0].d !== randomInsertion1.d)))
                {
                    fail = true;
                    break;
                }

                const randomKeyToRemove1 = Math.ceil(Math.random() * 1000);
                const clone1BeforeRemove = tree1.clone();

                const remove1IsNotPresent = !tree1.find(randomKeyToRemove1);
                tree1.remove(randomKeyToRemove1);

                const missing2 = findTreeRemoveDifferences(tree1.traverse(), clone1BeforeRemove.traverse());
                if (!isValidBst(tree1.root)
                    || (!remove1IsNotPresent && (!missing2
                                                 || missing2.length !== 1
                                                 || missing2[0].d !== randomKeyToRemove1)))
                {
                    fail = true;
                    break;
                }

                const randomInsertion2   = makeValue();
                const clone2BeforeInsert = tree2.clone();

                const insert2IsUpdate = tree2.find(randomInsertion2.d) !== null;
                tree2.insert(randomInsertion2.d, randomInsertion2);

                const missing3 = findTreeInsertDifferences(tree2.traverse(), clone2BeforeInsert.traverse());
                if (!isValidBst(tree2.root)
                    || (!insert2IsUpdate && (!missing3
                                             || missing3.length !== 1
                                             || missing3[0].d !== randomInsertion2.d)))
                {
                    fail = true;
                    break;
                }

                const randomKeyToRemove2 = Math.ceil(Math.random() * 1000);
                const clone2BeforeRemove = tree2.clone();

                const remove2IsNotPresent = !tree2.find(randomKeyToRemove2);
                tree2.remove(randomKeyToRemove2);

                const missing4 = findTreeRemoveDifferences(tree2.traverse(), clone2BeforeRemove.traverse());
                if (!isValidBst(tree2.root)
                    || (!remove2IsNotPresent && (!missing4
                                                 || missing4.length !== 1
                                                 || missing4[0].d !== randomKeyToRemove2)))
                {
                    fail = true;
                    break;
                }
            }

            assert(!fail, `test should pass`);
            done();
        });
    });

    describe.skip(`red-black`, function () {

        this.timeout(100000);

        it(`should work`, done => {
            let fail = false;

            const tree1: IRedBlackTree<number, IMyObject> = RedBlackTree();
            const tree2: IRedBlackTree<number, IMyObject> = RedBlackTree();

            const insertRounds = 1000;

            for (let i = 0; i < insertRounds; i++) {
                const value = makeValue();

                tree1.insert(value.d, value);

//                if (!isValidAvl(tree1.root)) {
//                    fail = true;
//                    break;
//                }
            }

            for (let i = 0; i < insertRounds; i++) {
                const value = makeValue();

                tree2.insert(value.d, value);

//                if (!isValidAvl(tree2.root)) {
//                    fail = true;
//                    break;
//                }
            }

            const activityRounds = 1000;
            for (let i = 0; i < activityRounds; i++) {

                const randomInsertion1   = makeValue();
                const clone1BeforeInsert = tree1.clone();

                const insert1IsUpdate = tree1.find(randomInsertion1.d) !== null;
                tree1.insert(randomInsertion1.d, randomInsertion1);

                const missing1 = findTreeInsertDifferences(tree1.traverse(), clone1BeforeInsert.traverse());
//                if (!isValidAvl(tree1.root)
//                    || (!insert1IsUpdate && (!missing1
//                                             || missing1.length !== 1
//                                             || missing1[0].d !== randomInsertion1.d)))
//                {
//                    fail = true;
//                }

                const randomKeyToRemove1 = Math.ceil(Math.random() * 1000);
                const clone1BeforeRemove = tree1.clone();

                const remove1IsNotPresent = !tree1.find(randomKeyToRemove1);
                tree1.remove(randomKeyToRemove1);

                const missing2 = findTreeRemoveDifferences(tree1.traverse(), clone1BeforeRemove.traverse());
//                if (!isValidAvl(tree1.root)
//                    || (!remove1IsNotPresent && (!missing2
//                                                 || missing2.length !== 1
//                                                 || missing2[0].d !== randomKeyToRemove1)))
//                {
//                    fail = true;
//                }

                const randomInsertion2   = makeValue();
                const clone2BeforeInsert = tree2.clone();

                const insert2IsUpdate = tree2.find(randomInsertion2.d) !== null;
                tree2.insert(randomInsertion2.d, randomInsertion2);

                const missing3 = findTreeInsertDifferences(tree2.traverse(), clone2BeforeInsert.traverse());
//                if (!isValidAvl(tree2.root)
//                    || (!insert2IsUpdate && (!missing3
//                                             || missing3.length !== 1
//                                             || missing3[0].d !== randomInsertion2.d)))
//                {
//                    fail = true;
//                }

                const randomKeyToRemove2 = Math.ceil(Math.random() * 1000);
                const clone2BeforeRemove = tree2.clone();

                const remove2IsNotPresent = !tree2.find(randomKeyToRemove2);
                tree2.remove(randomKeyToRemove2);

                const missing4 = findTreeRemoveDifferences(tree2.traverse(), clone2BeforeRemove.traverse());
//                if (!isValidAvl(tree2.root)
//                    || (!remove2IsNotPresent && (!missing4
//                                                 || missing4.length !== 1
//                                                 || missing4[0].d !== randomKeyToRemove2)))
//                {
//                    fail = true;
//                }
            }

            assert(!fail, `test should pass`);
            done();
        });
    });
});


function makeId() {
    let text     = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    const cap = Math.floor(Math.random() * 10);

    for (let i = 0; i < cap; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

const makeValue = (): IMyObject => ({
    a: makeId(),
    b: makeId(),
    c: makeId(),
    d: Math.ceil(Math.random() * 1000),
});

interface IMyObject {
    a: string;
    b: string;
    c: string;
    d: number;
}

const findTreeInsertDifferences = <K, V>(treeTraversal: V[], cloneTraversal: V[]): V[] => {

    const missing: V[] = [];

    let cloneIndex = 0;
    let treeIndex  = 0;
    while (cloneTraversal[cloneIndex] && treeTraversal[treeIndex]) {
        if ((cloneTraversal[cloneIndex] as any).d === (treeTraversal[treeIndex] as any).d) {
            cloneIndex++;
            treeIndex++;
        } else {
            missing.push(treeTraversal[treeIndex]);
            treeIndex++;
        }
    }

    while (treeTraversal[treeIndex]) {
        missing.push(treeTraversal[treeIndex]);
        treeIndex++;
    }
    return missing;
};

const findTreeRemoveDifferences = <K, V>(treeTraversal: V[], cloneTraversal: V[]): V[] => {

    const missing: V[] = [];

    let cloneIndex = 0;
    let treeIndex  = 0;
    while (cloneTraversal[cloneIndex] && treeTraversal[treeIndex]) {
        if ((cloneTraversal[cloneIndex] as any).d === (treeTraversal[treeIndex] as any).d) {
            cloneIndex++;
            treeIndex++;
        } else {
            missing.push(cloneTraversal[cloneIndex]);
            cloneIndex++;
        }
    }

    while (cloneTraversal[cloneIndex]) {
        missing.push(cloneTraversal[cloneIndex]);
        cloneIndex++;
    }

    return missing;
};
