/* tslint:disable */
import { assert, expect } from 'chai';
import 'mocha';

import { getTreeHeight } from '../binary-tree/binary-tree';
import { AvlTree, IAvlTree, } from './avl-tree';

describe('avl-tree', () => {

    describe(`clone`, () => {
        it(`should successfully clone a simple tree`, done => {
            const tree1: IAvlTree<number> = AvlTree();
            tree1.insert(0);

            const tree2: IAvlTree<number> = tree1.clone();
            assert(tree1.toString() === tree2.toString(), `tree strings should be equivalent`);

            tree2.remove(0);
            assert(tree1.toString() !== tree2.toString(), `tree strings should not be equivalent`);
            assert(tree1.toString() === `0`, `tree1 should have 1 element`);
            assert(tree2.toString() === ``, `tree2 should have 0 elements`);

            done();
        });

        it(`should successfully clone a large tree`, function (done) {
            this.timeout(5000);

            const tree1: IAvlTree<number> = AvlTree();
            for (let i = 0; i < 1000; i++) tree1.insert(i);

            const tree2: IAvlTree<number> = tree1.clone();
            assert(tree1.toString() === tree2.toString(), `tree strings should be equivalent`);
            assert(tree1.size() === tree2.size(), `trees should be of the same size`);
            assert(getTreeHeight(tree1.root) === getTreeHeight(tree2.root), `tree should have the same height`);

            tree2.remove(tree2.min());
            assert(tree1.toString() !== tree2.toString(), `tree strings should be equivalent`);
            assert(tree1.size() === tree2.size() + 1, `tree2 should have one fewer nodes`);
            assert(getTreeHeight(tree1.root) === getTreeHeight(tree2.root), `tree should have the same height`);

            done();
        });
    });

    describe('#toString', () => {
        it(`should traverse its elements in order`, done => {
            const avl: IAvlTree<number, number> = AvlTree<number, number>().insert(2)
                                                                           .insert(3)
                                                                           .insert(7)
                                                                           .insert(1)
                                                                           .insert(9)
                                                                           .insert(0)
                                                                           .insert(8)
                                                                           .insert(6);

            const s = avl.toString();
            expect(s).to.equal(`0 | 1 | 2 | 3 | 6 | 7 | 8 | 9`);
            expect(avl.size()).to.equal(8);
            done();
        });
    });

    describe('#insert', () => {
        it(`should not insert a duplicate`, done => {
            const avl: IAvlTree<number, number> = AvlTree<number, number>().insert(2)
                                                                           .insert(3)
                                                                           .insert(7)
                                                                           .insert(1)
                                                                           .insert(9)
                                                                           .insert(0)
                                                                           .insert(8)
                                                                           .insert(6);

            const s1 = avl.toString();
            avl.insert(6);
            const s2 = avl.toString();
            expect(s1).to.equal(s2);
            expect(avl.size()).to.equal(8);
            done();
        });

        it(`should replace an existing node if inserting a duplicate into single-node tree`, done => {
            const avl: IAvlTree<number, string> = AvlTree();

            avl.insert(2, 'a string for key 2');
            const s1 = avl.toString();

            avl.insert(2, 'a new string for key 2');
            const s2 = avl.toString();

            assert(s1 !== s2, `key 2 should have replaced value`);
            expect(avl.size()).to.equal(1);

            done();
        });

        it(`should replace an existing node if inserting an existing key into a full tree`, done => {
            const avl: IAvlTree<number, string> = AvlTree();

            for (let i = 0; i < 10; i++) avl.insert(i, i.toFixed(5));
            const s3 = avl.toString();

            const replacementKey   = 5;
            const replacementValue = 100;
            avl.insert(replacementKey, replacementValue.toFixed(5));
            const s4 = avl.toString();

            const controlString = [0, 1, 2, 3, 4, replacementValue, 6, 7, 8, 9].map(n => n.toFixed(5)).join(' | ');

            assert(s3 !== s4, `before and after should not be equal`);
            assert(s4 === controlString, `strings should be equal`);
            expect(avl.size()).to.equal(10);

            done();
        });

        it(`should correctly rotate right`, done => {
            const tree: IAvlTree<number> = AvlTree();

            tree.insert(5);
            assert(getTreeHeight(tree.root) === 1, `height should be one`);

            tree.insert(3);
            assert(getTreeHeight(tree.root) === 2, `height should be two`);

            tree.insert(1);
            assert(getTreeHeight(tree.root) === 2, `height should still be two after rotation`);

            done();
        });

        it(`should correctly rotate left`, done => {
            const tree: IAvlTree<number> = AvlTree();

            tree.insert(1);
            assert(getTreeHeight(tree.root) === 1, `height should be one`);

            tree.insert(3);
            assert(getTreeHeight(tree.root) === 2, `height should be two`);

            tree.insert(5);
            assert(getTreeHeight(tree.root) === 2, `height should still be two after rotation`);

            done();
        });

        it(`should correctly rotate right then left`, done => {
            const tree: IAvlTree<number> = AvlTree();

            tree.insert(5);
            assert(getTreeHeight(tree.root) === 1, `height should be one`);

            tree.insert(1);
            assert(getTreeHeight(tree.root) === 2, `height should be two`);

            tree.insert(3);
            assert(getTreeHeight(tree.root) === 2, `height should still be two after rotation`);

            assert(tree.root.key === 3, `new root should be key 3`);

            done();
        });

        it(`should correctly rotate left then right`, done => {
            const tree: IAvlTree<number> = AvlTree();

            tree.insert(1);
            assert(getTreeHeight(tree.root) === 1, `height should be one`);

            tree.insert(5);
            assert(getTreeHeight(tree.root) === 2, `height should be two`);

            tree.insert(3);
            assert(getTreeHeight(tree.root) === 2, `height should still be two after rotation`);

            done();
        });
    });

    describe('#remove', () => {
        it(`should correctly remove a leaf node`, done => {
            const avl: IAvlTree<number> = AvlTree();
            avl.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = avl.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(avl.size()).to.equal(9);

            avl.remove(8);
            const s2 = avl.toString();
            expect(s2).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 9`);
            expect(avl.size()).to.equal(8);

            done();
        });

        it(`should correctly remove a node with only a left subtree`, done => {
            const avl: IAvlTree<number> = AvlTree();
            avl.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = avl.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(avl.size()).to.equal(9);

            avl.remove(9);
            const s2 = avl.toString();
            expect(s2).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8`);
            expect(avl.size()).to.equal(8);

            done();
        });

        it(`should correctly remove a node with only a right subtree`, done => {
            const avl: IAvlTree<number> = AvlTree();
            avl.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = avl.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(avl.size()).to.equal(9);

            avl.remove(7);
            const s2 = avl.toString();
            expect(s2).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 8 | 9`);
            expect(avl.size()).to.equal(8);

            done();
        });

        it(`should correctly remove an inner node (two subtrees)`, done => {
            const avl: IAvlTree<number> = AvlTree();
            avl.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = avl.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(avl.size()).to.equal(9);

            avl.remove(3);
            const s2 = avl.toString();
            expect(s2).to.equal(`0 | 1 | 2 | 4 | 5 | 7 | 8 | 9`);
            expect(avl.size()).to.equal(8);

            done();
        });

        it(`should correctly remove the root (with two subtrees)`, done => {
            const avl: IAvlTree<number> = AvlTree();
            avl.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = avl.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(avl.size()).to.equal(9);

            avl.remove(5);
            const s2 = avl.toString();
            expect(s2).to.equal(`0 | 1 | 2 | 3 | 4 | 7 | 8 | 9`);
            expect(avl.size()).to.equal(8);

            done();
        });

        it(`should correctly remove the root (with two saturated subtrees)`, done => {
            const avl: IAvlTree<number> = AvlTree();
            avl.insert(5).insert(3).insert(7).insert(6).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = avl.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9`);
            expect(avl.size()).to.equal(10);

            avl.remove(5);
            const s2 = avl.toString();
            expect(s2).to.equal(`0 | 1 | 2 | 3 | 4 | 6 | 7 | 8 | 9`);
            expect(avl.size()).to.equal(9);

            done();
        });


        it(`should leave the tree unchanged if deleting a nonexistent element`, done => {
            const avl: IAvlTree<number> = AvlTree();
            avl.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = avl.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(avl.size()).to.equal(9);

            avl.remove(60);
            const s2 = avl.toString();
            assert(s1 === s2, `the tree should remain unchanged`);
            expect(avl.size()).to.equal(9);

            done();
        });

        it(`should properly insert keys after others are deleted`, done => {
            const avl: IAvlTree<number> = AvlTree();
            avl.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(-1).insert(2).insert(8);
            const s1 = avl.toString();
            expect(s1).to.equal(`-1 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(avl.size()).to.equal(9);

            avl.remove(3);
            const s2 = avl.toString();
            assert(s1 !== s2, `the tree should change`);
            expect(s2).to.equal(`-1 | 1 | 2 | 4 | 5 | 7 | 8 | 9`);
            expect(avl.size()).to.equal(8);

            avl.insert(11);
            const s3 = avl.toString();
            assert(s2 !== s3, `the tree should change`);
            expect(s3).to.equal(`-1 | 1 | 2 | 4 | 5 | 7 | 8 | 9 | 11`);
            expect(avl.size()).to.equal(9);

            avl.remove(-1);
            const s4 = avl.toString();
            assert(s4 !== s3, `the tree should change`);
            expect(s4).to.equal(`1 | 2 | 4 | 5 | 7 | 8 | 9 | 11`);
            expect(avl.size()).to.equal(8);

            done();
        });

        it(`should delete key 0`, done => {
            const avl: IAvlTree<number> = AvlTree();
            avl.insert(2).insert(3).insert(7).insert(1).insert(9).insert(0).insert(8).insert(6);
            const s1 = avl.toString();

            avl.remove(0);
            const s2 = avl.toString();

            assert(s1 !== s2, `the tree should change`);
            expect(avl.size()).to.equal(7);
            done();
        });

        it(`should delete root-only tree`, done => {
            const tree: IAvlTree<number> = AvlTree();
            tree.insert(3);
            assert(tree.size() === 1, `tree should have 1 node`);
            assert(getTreeHeight(tree.root) === 1, `tree should have height 1`);
            assert(getTreeHeight(tree.root.left) === 0, `left tree should have height 0`);
            assert(getTreeHeight(tree.root.right) === 0, `right tree should have height 0`);

            tree.remove(3);
            assert(tree.size() === 0, `tree should have 0 nodes`);
            assert(getTreeHeight(tree.root) === 0, `tree should have height 2`);

            done();
        });

        it(`should delete root with two leaves`, done => {
            const tree: IAvlTree<number> = AvlTree();
            tree.insert(3).insert(1).insert(5);
            assert(tree.size() === 3, `tree should have 3 nodes`);
            assert(getTreeHeight(tree.root) === 2, `tree should have height 2`);
            assert(getTreeHeight(tree.root.left) === 1, `left tree should have height 1`);
            assert(getTreeHeight(tree.root.right) === 1, `right tree should have height 1`);

            tree.remove(3);
            assert(tree.size() === 2, `tree should have 2 nodes`);
            assert(getTreeHeight(tree.root) === 2, `tree should have height 2`);
            assert(getTreeHeight(tree.root.left) === 1, `left tree should have height 1`);
            assert(getTreeHeight(tree.root.right) === 0, `right tree should have height 0`);

            done();
        });

        it(`should delete root with a left leaf and right subtree`, done => {
            const tree: IAvlTree<number> = AvlTree();
            tree.insert(3).insert(1).insert(5).insert(4).insert(6);
            assert(tree.size() === 5, `tree should have 5 nodes`);
            assert(getTreeHeight(tree.root) === 3, `tree should have height 3`);
            assert(getTreeHeight(tree.root.left) === 1, `left tree should have height 1`);
            assert(getTreeHeight(tree.root.right) === 2, `right tree should have height 2`);

            tree.remove(3);
            assert(tree.size() === 4, `tree should have 4 nodes`);
            assert(getTreeHeight(tree.root) === 3, `tree should have height 3`);
            assert(getTreeHeight(tree.root.left) === 1, `left tree should have height 1`);
            assert(getTreeHeight(tree.root.right) === 2, `right tree should have height 2`);

            done();
        });

        it(`should delete root with a right leaf and left subtree`, done => {
            const tree: IAvlTree<number> = AvlTree();
            tree.insert(3).insert(1).insert(5).insert(0).insert(2);
            assert(tree.size() === 5, `tree should have 5 nodes`);
            assert(getTreeHeight(tree.root) === 3, `tree should have height 3`);
            assert(getTreeHeight(tree.root.left) === 2, `left tree should have height 2`);
            assert(getTreeHeight(tree.root.right) === 1, `right tree should have height 1`);

            tree.remove(3);
            assert(tree.size() === 4, `tree should have 4 nodes`);
            assert(getTreeHeight(tree.root) === 3, `tree should have height 3 after delete rotation`);
            assert(getTreeHeight(tree.root.left) === 1, `left tree should have height 1 after delete rotation`);
            assert(getTreeHeight(tree.root.right) === 2, `right tree should have height 2 after delete rotation`);

            done();
        });

        it(`should delete root with two subtrees`, done => {
            const tree: IAvlTree<number> = AvlTree();
            tree.insert(3).insert(1).insert(5).insert(0).insert(2).insert(4).insert(6);
            assert(tree.size() === 7, `tree should have 7 nodes`);
            assert(getTreeHeight(tree.root) === 3, `tree should have height 3`);
            assert(getTreeHeight(tree.root.left) === 2, `left tree should have height 2`);
            assert(getTreeHeight(tree.root.right) === 2, `right tree should have height 2`);

            tree.remove(3);
            assert(tree.size() === 6, `tree should have 4 nodes`);
            assert(getTreeHeight(tree.root) === 3, `tree should have height 2 after delete rotation`);
            assert(getTreeHeight(tree.root.left) === 2, `left tree should have height 2 after delete rotation`);
            assert(getTreeHeight(tree.root.right) === 2, `right tree should have height 2 after delete rotation`);

            assert(tree.root.key === 4, `new root should be key 4`);

            done();
        });

    });

    describe('#find', () => {
        it(`should return null if tree is empty`, done => {
            const avl: IAvlTree<number> = AvlTree();
            const value                 = avl.find(0);
            assert(value === null, `value should be null since tree is empty`);
            expect(avl.size()).to.equal(0);

            done();
        });

        it(`should find an element that is present in the tree`, done => {
            const avl: IAvlTree<number> = AvlTree();
            avl.insert(2).insert(3).insert(7).insert(1).insert(9).insert(0).insert(8).insert(6);

            const value: number = avl.find(6);
            assert(value, `value should not be null`);
            expect(avl.size()).to.equal(8);
            done();
        });

        it(`should not find an element that is not present in the tree`, done => {
            const avl: IAvlTree<number> = AvlTree();
            avl.insert(2).insert(3).insert(7).insert(1).insert(9).insert(0).insert(8).insert(6);

            const value: number = avl.find(60);
            assert(!value, `value should be null`);
            expect(avl.size()).to.equal(8);
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

        it(`should correctly insert an arbitrary type`, done => {
            const avl = AvlTree<number, ITestType>();
            avl.insert(0, t0).insert(2, t2).insert(1, t1);

            const s = avl.toString();
            expect(s).to.equal(`hi there 1 | what up 2 | how goesit 3`);
            expect(avl.size()).to.equal(3);
            done();
        });

        it(`should correctly delete an arbitrary type`, done => {
            const avl = AvlTree<number, ITestType>();
            avl.insert(0, t0).insert(2, t2).insert(1, t1).remove(0);

            const s = avl.toString();
            expect(s.trim()).to.equal(`what up 2 | how goesit 3`);
            expect(avl.size()).to.equal(2);
            done();
        });

        it(`should correctly find an arbitrary type`, done => {
            const avl = AvlTree<number, ITestType>();
            avl.insert(2, t2).insert(1, t1);

            const value = avl.find(1);
            const s     = value.toString();
            expect(s.trim()).to.equal(`what up 2`);
            expect(avl.size()).to.equal(2);
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

        it(`should correctly insert an arbitrary type`, done => {
            const avl = AvlTree<ITestType, ITestType>(testComparer);
            avl.insert(t0).insert(t2).insert(t1);

            const s = avl.toString();
            expect(s).to.equal(`hi there 1 | how goesit 2 | what up 4`);
            expect(avl.size()).to.equal(3);
            done();
        });

        it(`should correctly delete an arbitrary type`, done => {
            const avl = AvlTree<ITestType, ITestType>(testComparer);
            avl.insert(t0).insert(t2).insert(t1).remove(t0);

            const s = avl.toString();
            expect(s.trim()).to.equal(`how goesit 2 | what up 4`);
            expect(avl.size()).to.equal(2);
            done();
        });

        it(`should correctly find an arbitrary type`, done => {
            const avl = AvlTree<ITestType, ITestType>(testComparer);
            avl.insert(t0).insert(t1);

            const value = avl.find(t1);
            const s     = value.toString();
            expect(s.trim()).to.equal(`what up 4`);
            expect(avl.size()).to.equal(2);
            done();
        });
    });
});
