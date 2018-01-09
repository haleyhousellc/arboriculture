import { assert, expect } from 'chai';
import 'mocha';

import { isValidBst, BinarySearchTree, IBinarySearchTree } from './binary-search-tree';

/* tslint:disable:no-magic-numbers */

describe('binary-search-tree', () => {

    describe('#toString', () => {
        it(`should traverse its elements in order`, (done) => {
            const bst: IBinarySearchTree<number> = BinarySearchTree();
            bst.insert(2);
            bst.insert(3);
            bst.insert(7);
            bst.insert(1);
            bst.insert(9);
            bst.insert(0);
            bst.insert(8);
            bst.insert(6);

            const s = bst.toString();
            expect(s).to.equal(`0 | 1 | 2 | 3 | 6 | 7 | 8 | 9`);
            expect(bst.size()).to.equal(8);
            done();
        });
    });

    describe('#insert', () => {
        it(`should not insert a duplicate`, (done) => {
            const bst: IBinarySearchTree<number, number> =
                      BinarySearchTree<number, number>().insert(2)
                                                        .insert(3)
                                                        .insert(7)
                                                        .insert(1)
                                                        .insert(9)
                                                        .insert(0)
                                                        .insert(8)
                                                        .insert(6);
            const s1                                     = bst.toString();
            bst.insert(6);
            const s2 = bst.toString();
            assert(s1 === s2, `the tree should remain unchanged`);
            expect(bst.size()).to.equal(8);
            done();
        });

        it(`should replace an existing node if inserting a duplicate into single-node tree`, done => {
            const bst: IBinarySearchTree<number, string> = BinarySearchTree();

            bst.insert(2, 'a string for key 2');
            const s1 = bst.toString();

            bst.insert(2, 'a new string for key 2');
            const s2 = bst.toString();

            assert(s1 !== s2, `key 2 should have replaced value`);
            expect(bst.size()).to.equal(1);

            done();
        });

        it(`should replace an existing node if inserting an existing key into a full tree`, done => {
            const bst: IBinarySearchTree<number, string> = BinarySearchTree();

            for (let i = 0; i < 10; i++) bst.insert(i, i.toFixed(5));
            const s3 = bst.toString();

            const replacementKey   = 5;
            const replacementValue = 100;
            bst.insert(replacementKey, replacementValue.toFixed(5));
            const s4 = bst.toString();

            const controlString = [0, 1, 2, 3, 4, replacementValue, 6, 7, 8, 9].map(n => n.toFixed(5)).join(' | ');

            assert(s3 !== s4, `before and after should not be equal`);
            assert(s4 === controlString, `strings should be equal`);
            expect(bst.size()).to.equal(10);

            done();
        });
    });

    describe('#remove', () => {
        it(`should correctly remove a leaf node`, done => {
            const bst: IBinarySearchTree<number> = BinarySearchTree();
            bst.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = bst.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(bst.size()).to.equal(9);

            bst.remove(8);
            const s2 = bst.toString();
            expect(s2).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 9`);
            expect(bst.size()).to.equal(8);

            done();
        });

        it(`should correctly remove a node with only a left subtree`, done => {
            const bst: IBinarySearchTree<number> = BinarySearchTree();
            bst.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = bst.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(bst.size()).to.equal(9);

            bst.remove(9);
            const s2 = bst.toString();
            expect(s2).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8`);
            expect(bst.size()).to.equal(8);

            done();
        });

        it(`should correctly remove a node with only a right subtree`, done => {
            const bst: IBinarySearchTree<number> = BinarySearchTree();
            bst.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = bst.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(bst.size()).to.equal(9);

            bst.remove(7);
            const s2 = bst.toString();
            expect(s2).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 8 | 9`);
            expect(bst.size()).to.equal(8);

            done();
        });

        it(`should correctly remove an inner node (two subtrees)`, done => {
            const bst: IBinarySearchTree<number> = BinarySearchTree();
            bst.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = bst.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(bst.size()).to.equal(9);

            bst.remove(3);
            const s2 = bst.toString();
            expect(s2).to.equal(`0 | 1 | 2 | 4 | 5 | 7 | 8 | 9`);
            expect(bst.size()).to.equal(8);

            done();
        });

        it(`should correctly remove the root (with two subtrees)`, done => {
            const bst: IBinarySearchTree<number> = BinarySearchTree();
            bst.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = bst.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(bst.size()).to.equal(9);

            bst.remove(5);
            const s2 = bst.toString();
            expect(s2).to.equal(`0 | 1 | 2 | 3 | 4 | 7 | 8 | 9`);
            expect(bst.size()).to.equal(8);

            done();
        });

        it(`should correctly remove the root (with two saturated subtrees)`, done => {
            const bst: IBinarySearchTree<number> = BinarySearchTree();
            bst.insert(5).insert(3).insert(7).insert(6).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = bst.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9`);
            expect(bst.size()).to.equal(10);

            bst.remove(5);
            const s2 = bst.toString();
            expect(s2).to.equal(`0 | 1 | 2 | 3 | 4 | 6 | 7 | 8 | 9`);
            expect(bst.size()).to.equal(9);

            done();
        });


        it(`should leave the tree unchanged if deleting a nonexistent element`, done => {
            const bst: IBinarySearchTree<number> = BinarySearchTree();
            bst.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = bst.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(bst.size()).to.equal(9);

            bst.remove(60);
            const s2 = bst.toString();
            assert(s1 === s2, `the tree should remain unchanged`);
            expect(bst.size()).to.equal(9);

            done();
        });

        it(`should properly insert keys after others are deleted`, done => {
            const bst: IBinarySearchTree<number> = BinarySearchTree();
            bst.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = bst.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(bst.size()).to.equal(9);

            bst.remove(3);
            const s2 = bst.toString();
            assert(s1 !== s2, `the tree should change`);
            expect(s2).to.equal(`0 | 1 | 2 | 4 | 5 | 7 | 8 | 9`);
            expect(bst.size()).to.equal(8);

            bst.insert(11);
            const s3 = bst.toString();
            assert(s2 !== s3, `the tree should change`);
            expect(s3).to.equal(`0 | 1 | 2 | 4 | 5 | 7 | 8 | 9 | 11`);
            expect(bst.size()).to.equal(9);

            bst.remove(0);
            const s4 = bst.toString();
            assert(s4 !== s3, `the tree should change`);
            expect(s4).to.equal(`1 | 2 | 4 | 5 | 7 | 8 | 9 | 11`);
            expect(bst.size()).to.equal(8);

            done();
        });

        it(`should delete key 0`, done => {
            const bst: IBinarySearchTree<number> = BinarySearchTree();
            bst.insert(2).insert(3).insert(7).insert(1).insert(9).insert(0).insert(8).insert(6);
            const s1 = bst.toString();

            bst.remove(0);
            const s2 = bst.toString();

            assert(s1 !== s2, `the tree should change`);
            expect(bst.size()).to.equal(7);
            done();
        });

        it(`should delete root-only tree`, done => {
            const tree: IBinarySearchTree<number> = BinarySearchTree();
            tree.insert(3);
            assert(tree.size() === 1, `tree should have 1 node`);
            assert(isValidBst(tree.root), `tree should still be valid`);

            tree.remove(3);
            assert(tree.size() === 0, `tree should have 0 nodes`);
            assert(isValidBst(tree.root), `tree should still be valid`);

            done();
        });

        it(`should delete root with two leaves`, done => {
            const tree: IBinarySearchTree<number> = BinarySearchTree();
            tree.insert(3).insert(1).insert(5);
            assert(tree.size() === 3, `tree should have 3 nodes`);
            assert(isValidBst(tree.root), `tree should still be valid`);

            tree.remove(3);
            assert(tree.size() === 2, `tree should have 2 nodes`);
            assert(isValidBst(tree.root), `tree should still be valid`);

            done();
        });

        it(`should delete root with a left leaf and right subtree`, done => {
            const tree: IBinarySearchTree<number> = BinarySearchTree();
            tree.insert(3).insert(1).insert(5).insert(4).insert(6);
            assert(tree.size() === 5, `tree should have 5 nodes`);
            assert(isValidBst(tree.root), `tree should still be valid`);

            tree.remove(3);
            assert(tree.size() === 4, `tree should have 4 nodes`);
            assert(isValidBst(tree.root), `tree should still be valid`);

            done();
        });

        it(`should delete root with a right leaf and left subtree`, done => {
            const tree: IBinarySearchTree<number> = BinarySearchTree();
            tree.insert(3).insert(1).insert(5).insert(0).insert(2);
            assert(tree.size() === 5, `tree should have 5 nodes`);
            assert(isValidBst(tree.root), `tree should still be valid`);

            tree.remove(3);
            assert(tree.size() === 4, `tree should have 4 nodes`);
            assert(isValidBst(tree.root), `tree should still be valid`);

            done();
        });

        it(`should delete root with two subtrees`, done => {
            const tree: IBinarySearchTree<number> = BinarySearchTree();
            tree.insert(3).insert(1).insert(5).insert(0).insert(2).insert(4).insert(6);
            assert(tree.size() === 7, `tree should have 7 nodes`);
            assert(isValidBst(tree.root), `tree should still be valid`);

            tree.remove(3);
            assert(tree.size() === 6, `tree should have 4 nodes`);
            assert(isValidBst(tree.root), `tree should still be valid`);

            assert(tree.root.key === 4, `new root should be key 4`);

            done();
        });
    });

    describe('#find', () => {
        it(`should return null if tree is empty`, done => {
            const bst: IBinarySearchTree<number, number> = BinarySearchTree();

            const value = bst.find(0);
            assert(value === null, `value should be null since tree is empty`);
            expect(bst.size()).to.equal(0);
            done();
        });

        it(`should find an element that is present in the tree`, (done) => {
            const bst: IBinarySearchTree<number, number> =
                      BinarySearchTree<number, number>().insert(2)
                                                        .insert(3)
                                                        .insert(7)
                                                        .insert(1)
                                                        .insert(9)
                                                        .insert(0)
                                                        .insert(8)
                                                        .insert(6);

            const value: number = bst.find(6);
            assert(value, `value should not be null`);
            expect(bst.size()).to.equal(8);
            done();
        });

        it(`should not find an element that is not present in the tree`, (done) => {
            const bst: IBinarySearchTree<number, number> =
                      BinarySearchTree<number, number>().insert(2)
                                                        .insert(3)
                                                        .insert(7)
                                                        .insert(1)
                                                        .insert(9)
                                                        .insert(0)
                                                        .insert(8)
                                                        .insert(6);

            const value: number = bst.find(60);
            assert(!value, `value should be null`);
            expect(bst.size()).to.equal(8);
            done();
        });
    });

    describe(`arbitrary value type, number key`, () => {
        interface ITestType {
            a: string;
            b: string;
            c: number;

            toString(): string;
        }

        const t0: ITestType = {
            a: 'hi',
            b: 'there',
            c: 1,
            toString(): string {
                return `${this.a} ${this.b} ${this.c}`;
            },
        };

        const t1: ITestType = {
            a: 'what',
            b: 'up',
            c: 2,
            toString(): string {
                return `${this.a} ${this.b} ${this.c}`;
            },
        };

        const t2: ITestType = {
            a: 'how',
            b: 'goesit',
            c: 3,
            toString(): string {
                return `${this.a} ${this.b} ${this.c}`;
            },
        };

        it(`should correctly insert an arbitrary type`, (done) => {
            const bst: IBinarySearchTree<number, ITestType> = BinarySearchTree();
            bst.insert(0, t0).insert(2, t2).insert(1, t1);

            const s = bst.toString();
            expect(s).to.equal(`hi there 1 | what up 2 | how goesit 3`);
            expect(bst.size()).to.equal(3);
            done();
        });

        it(`should correctly delete an arbitrary type`, (done) => {
            const bst: IBinarySearchTree<number, ITestType> = BinarySearchTree();
            bst.insert(0, t0).insert(2, t2).insert(1, t1).remove(0);

            const s = bst.toString();
            expect(s.trim()).to.equal(`what up 2 | how goesit 3`);
            expect(bst.size()).to.equal(2);
            done();
        });

        it(`should correctly find an arbitrary type`, (done) => {
            const bst: IBinarySearchTree<number, ITestType> = BinarySearchTree();
            bst.insert(1, t1).insert(2, t2);

            const value = bst.find(1);
            const s     = value.toString();
            expect(s.trim()).to.equal(`what up 2`);
            expect(bst.size()).to.equal(2);
            done();
        });
    });

    describe('arbitrary object types, arbitrary key', () => {
        interface ITestType {
            a: string;
            b: string;
            c: number;

            toString(): string;
        }

        function testComparer(a: ITestType, b: ITestType): number {
            return a.c - b.c;
        }

        const t0: ITestType = {
            a: 'hi',
            b: 'there',
            c: 1,
            toString(): string {
                return `${this.a} ${this.b} ${this.c}`;
            },
        };

        const t1: ITestType = {
            a: 'what',
            b: 'up',
            c: 4,
            toString(): string {
                return `${this.a} ${this.b} ${this.c}`;
            },
        };

        const t2: ITestType = {
            a: 'how',
            b: 'goesit',
            c: 2,
            toString(): string {
                return `${this.a} ${this.b} ${this.c}`;
            },
        };

        it(`should correctly insert an arbitrary type`, (done) => {
            const bst: IBinarySearchTree<ITestType, ITestType> = BinarySearchTree(testComparer);
            bst.insert(t0).insert(t2).insert(t1);

            const s = bst.toString();
            expect(s).to.equal(`hi there 1 | how goesit 2 | what up 4`);
            expect(bst.size()).to.equal(3);
            done();
        });

        it(`should correctly delete an arbitrary type`, (done) => {
            const bst: IBinarySearchTree<ITestType, ITestType> = BinarySearchTree(testComparer);
            bst.insert(t0).insert(t2).insert(t1).remove(t0);

            const s = bst.toString();
            expect(s.trim()).to.equal(`how goesit 2 | what up 4`);
            expect(bst.size()).to.equal(2);
            done();
        });

        it(`should correctly find an arbitrary type`, (done) => {
            const bst: IBinarySearchTree<ITestType, ITestType> = BinarySearchTree(testComparer);
            bst.insert(t0).insert(t1);

            const value = bst.find(t1);
            const s     = value.toString();
            expect(s.trim()).to.equal(`what up 4`);
            expect(bst.size()).to.equal(2);
            done();
        });
    });
});
