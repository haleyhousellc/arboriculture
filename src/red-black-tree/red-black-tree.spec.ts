import { assert, expect } from 'chai';
import 'mocha';

import { IBinaryTreeNode } from '../binary-tree/binary-tree';
import { IRedBlackTree, RedBlackTree } from './red-black-tree';

/* tslint:disable */

describe('red-black-tree', () => {

    describe('#toString', () => {
        it(`should traverse its elements in order`, (done) => {
            const rbt: IRedBlackTree<number, number> = RedBlackTree();
            rbt.insert(2)
               .insert(3)
               .insert(7)
               .insert(1)
               .insert(9)
               .insert(0)
               .insert(8)
               .insert(6);

            const s = rbt.toString();
            expect(s).to.equal(`0 | 1 | 2 | 3 | 6 | 7 | 8 | 9`);
            expect(rbt.size()).to.equal(8);

            done();
        });
    });

    describe('#insert', () => {
        it(`should not insert a duplicate`, (done) => {
            const rbt: IRedBlackTree<number, number> = RedBlackTree();
            rbt.insert(2)
               .insert(3)
               .insert(7)
               .insert(1)
               .insert(9)
               .insert(0)
               .insert(8)
               .insert(6);

            const s1 = rbt.toString();
            rbt.insert(6);
            const s2 = rbt.toString();
            expect(s1).to.equal(s2);
            expect(rbt.size()).to.equal(8);
            done();
        });

        it(`should replace an existing node if inserting a duplicate into single-node tree`, done => {
            const rbt: IRedBlackTree<number, string> = RedBlackTree();

            rbt.insert(2, 'a string for key 2');
            const s1 = rbt.toString();

            rbt.insert(2, 'a new string for key 2');
            const s2 = rbt.toString();

            assert(s1 !== s2, `key 2 should have replaced value`);
            expect(rbt.size()).to.equal(1);

            done();
        });

        it(`should replace an existing node if inserting an existing key into a full tree`, done => {
            const rbt: IRedBlackTree<number, string> = RedBlackTree();

            for (let i = 0; i < 10; i++) rbt.insert(i, i.toFixed(5));
            const s3 = rbt.toString();

            const replacementKey   = 5;
            const replacementValue = 100;
            rbt.insert(replacementKey, replacementValue.toFixed(5));
            const s4 = rbt.toString();

            const controlString = [0, 1, 2, 3, 4, replacementValue, 6, 7, 8, 9].map(n => n.toFixed(5)).join(' | ');

            assert(s3 !== s4, `before and after should not be equal`);
            assert(s4 === controlString, `strings should be equal`);
            expect(rbt.size()).to.equal(10);

            done();
        });
    });

    describe('#remove', () => {
        it(`should correctly remove a leaf node`, done => {
            const rbt: IRedBlackTree<number> = RedBlackTree();
            rbt.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = rbt.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(rbt.size()).to.equal(9);

            rbt.remove(8);
            const s2 = rbt.toString();
            expect(s2).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 9`);
            expect(rbt.size()).to.equal(8);

            done();
        });

        it(`should correctly remove a node with only a left subtree`, done => {
            const rbt: IRedBlackTree<number> = RedBlackTree();
            rbt.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = rbt.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(rbt.size()).to.equal(9);

            rbt.remove(9);
            const s2 = rbt.toString();
            expect(s2).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8`);
            expect(rbt.size()).to.equal(8);

            done();
        });

        it(`should correctly remove a node with only a right subtree`, done => {
            const rbt: IRedBlackTree<number> = RedBlackTree();
            rbt.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = rbt.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(rbt.size()).to.equal(9);

            rbt.remove(7);
            const s2 = rbt.toString();
            expect(s2).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 8 | 9`);
            expect(rbt.size()).to.equal(8);

            done();
        });

        it(`should correctly remove an inner node (two subtrees)`, done => {
            const rbt: IRedBlackTree<number> = RedBlackTree();
            rbt.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = rbt.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(rbt.size()).to.equal(9);

            rbt.remove(3);
            const s2 = rbt.toString();
            expect(s2).to.equal(`0 | 1 | 2 | 4 | 5 | 7 | 8 | 9`);
            expect(rbt.size()).to.equal(8);

            done();
        });

        it(`should correctly remove the root (with two subtrees)`, done => {
            const rbt: IRedBlackTree<number> = RedBlackTree();
            rbt.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = rbt.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(rbt.size()).to.equal(9);

            rbt.remove(5);
            const s2 = rbt.toString();
            expect(s2).to.equal(`0 | 1 | 2 | 3 | 4 | 7 | 8 | 9`);
            expect(rbt.size()).to.equal(8);

            done();
        });

        it(`should correctly remove the root (with two saturated subtrees)`, done => {
            const rbt: IRedBlackTree<number> = RedBlackTree();
            rbt.insert(5).insert(3).insert(7).insert(6).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = rbt.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9`);
            expect(rbt.size()).to.equal(10);

            rbt.remove(5);
            const s2 = rbt.toString();
            expect(s2).to.equal(`0 | 1 | 2 | 3 | 4 | 6 | 7 | 8 | 9`);
            expect(rbt.size()).to.equal(9);

            done();
        });


        it(`should leave the tree unchanged if deleting a nonexistent element`, done => {
            const rbt: IRedBlackTree<number> = RedBlackTree();
            rbt.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = rbt.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(rbt.size()).to.equal(9);

            rbt.remove(60);
            const s2 = rbt.toString();
            assert(s1 === s2, `the tree should remain unchanged`);
            expect(rbt.size()).to.equal(9);

            done();
        });

        it(`should properly insert keys after others are deleted`, done => {
            const rbt: IRedBlackTree<number> = RedBlackTree();
            rbt.insert(5).insert(3).insert(7).insert(1).insert(4).insert(9).insert(0).insert(2).insert(8);
            const s1 = rbt.toString();
            expect(s1).to.equal(`0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9`);
            expect(rbt.size()).to.equal(9);

            rbt.remove(3);
            const s2 = rbt.toString();
            assert(s1 !== s2, `the tree should change`);
            expect(s2).to.equal(`0 | 1 | 2 | 4 | 5 | 7 | 8 | 9`);
            expect(rbt.size()).to.equal(8);

            rbt.insert(11);
            const s3 = rbt.toString();
            assert(s2 !== s3, `the tree should change`);
            expect(s3).to.equal(`0 | 1 | 2 | 4 | 5 | 7 | 8 | 9 | 11`);
            expect(rbt.size()).to.equal(9);

            rbt.remove(0);
            const s4 = rbt.toString();
            assert(s4 !== s3, `the tree should change`);
            expect(s4).to.equal(`1 | 2 | 4 | 5 | 7 | 8 | 9 | 11`);
            expect(rbt.size()).to.equal(8);

            done();
        });

        it(`should delete key 0`, done => {
            const rbt: IRedBlackTree<number> = RedBlackTree();
            rbt.insert(2).insert(3).insert(7).insert(1).insert(9).insert(0).insert(8).insert(6);
            const s1 = rbt.toString();

            rbt.remove(0);
            const s2 = rbt.toString();

            assert(s1 !== s2, `the tree should change`);
            expect(rbt.size()).to.equal(7);
            done();
        });
    });

    describe('#find', () => {
        it(`should return null if tree is empty`, done => {
            const rbtLocal: IRedBlackTree<number, number> = RedBlackTree();
            const value                                   = rbtLocal.find(0);
            assert(value === null, `value should be null since tree is empty`);
            expect(rbtLocal.size()).to.equal(0);
            done();
        });

        it(`should find an element that is present in the tree`, (done) => {
            const rbt: IRedBlackTree<number, number> = RedBlackTree();
            rbt.insert(2)
               .insert(3)
               .insert(7)
               .insert(1)
               .insert(9)
               .insert(0)
               .insert(8)
               .insert(6);

            const value: number = rbt.find(6);
            assert(value, `value should not be null`);
            expect(rbt.size()).to.equal(8);
            done();
        });

        it(`should not find an element that is not present in the tree`, (done) => {
            const rbt: IRedBlackTree<number, number> = RedBlackTree();
            rbt.insert(2)
               .insert(3)
               .insert(7)
               .insert(1)
               .insert(9)
               .insert(0)
               .insert(8)
               .insert(6);

            const value: number = rbt.find(60);
            assert(!value, `value should be null (found node should be the sentinel)`);
            expect(rbt.size()).to.equal(8);
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
            const rbt = RedBlackTree<number, ITestType>();
            rbt.insert(0, t0).insert(2, t2).insert(1, t1);

            const s = rbt.toString();
            expect(s).to.equal(`hi there 1 | what up 2 | how goesit 3`);
            expect(rbt.size()).to.equal(3);
            done();
        });

        it(`should correctly delete an arbitrary type`, (done) => {
            const rbt = RedBlackTree<number, ITestType>();
            rbt.insert(0, t0).insert(2, t2).insert(1, t1).remove(0);

            const s = rbt.toString();
            expect(s.trim()).to.equal(`what up 2 | how goesit 3`);
            expect(rbt.size()).to.equal(2);
            done();
        });

        it(`should correctly find an arbitrary type`, (done) => {
            const rbt = RedBlackTree<number, ITestType>();
            rbt.insert(0, t0).insert(2, t2).insert(1, t1);

            const value = rbt.find(1);
            const s     = value.toString();
            expect(s.trim()).to.equal(`what up 2`);
            expect(rbt.size()).to.equal(3);
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
            const rbt: IRedBlackTree<ITestType, ITestType> = RedBlackTree(testComparer);
            rbt.insert(t0).insert(t2).insert(t1);

            const s = rbt.toString();
            expect(s).to.equal(`hi there 1 | how goesit 2 | what up 4`);
            expect(rbt.size()).to.equal(3);
            done();
        });

        it(`should correctly delete an arbitrary type`, (done) => {
            const rbt: IRedBlackTree<ITestType, ITestType> = RedBlackTree(testComparer);
            rbt.insert(t0).insert(t2).insert(t1).remove(t0);

            const s = rbt.toString();
            expect(s.trim()).to.equal(`how goesit 2 | what up 4`);
            expect(rbt.size()).to.equal(2);
            done();
        });

        it(`should correctly find an arbitrary type`, (done) => {
            const rbt: IRedBlackTree<ITestType, ITestType> = RedBlackTree(testComparer);
            rbt.insert(t2).insert(t1);
            const value = rbt.find(t1);
            const s     = value.toString();
            expect(s.trim()).to.equal(`what up 4`);
            expect(rbt.size()).to.equal(2);
            done();
        });
    });
});

