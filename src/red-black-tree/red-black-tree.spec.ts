import { assert, expect } from 'chai';
import 'mocha';

import { IBinaryTreeNode } from '../binary-tree/binary-tree';
import { IRedBlackTree, RedBlackTree } from './red-black-tree';

/* tslint:disable */

describe('red-black-tree', () => {

    let rbt: IRedBlackTree<number>;

    before((done) => {
        rbt = RedBlackTree();
        done();
    });

    beforeEach((done) => {
        rbt.insert(2);
        rbt.insert(3);
        rbt.insert(7);
        rbt.insert(1);
        rbt.insert(9);
        rbt.insert(0);
        rbt.insert(8);
        rbt.insert(6);
        done();
    });

    afterEach((done) => {
        rbt.clear();
        done();
    });

    describe('#toString', () => {
        it(`should traverse its elements in order`, (done) => {
            const s = rbt.toString();
            expect(s).to.equal(`0 | 1 | 2 | 3 | 6 | 7 | 8 | 9`);
            expect(rbt.size()).to.equal(8);
            done();
        });
    });

    describe('#insert', () => {
        it(`should not insert a duplicate`, (done) => {
            const s1 = rbt.toString();
            rbt.insert(6);
            const s2 = rbt.toString();
            expect(s1).to.equal(s2);
            expect(rbt.size()).to.equal(8);
            done();
        });

        it(`should replace an existing node if inserting a duplicate into single-node tree`, done => {
            const rbtAlt: IRedBlackTree<number, string> = RedBlackTree();

            rbtAlt.insert(2, 'a string for key 2');
            const s1 = rbtAlt.toString();

            rbtAlt.insert(2, 'a new string for key 2');
            const s2 = rbtAlt.toString();

            assert(s1 !== s2, `key 2 should have replaced value`);
            expect(rbtAlt.size()).to.equal(1);

            done();
        });

        it(`should replace an existing node if inserting an existing key into a full tree`, done => {
            const rbtAlt: IRedBlackTree<number, string> = RedBlackTree();

            for (let i = 0; i < 10; i++) rbtAlt.insert(i, i.toFixed(5));
            const s3 = rbtAlt.toString();

            const replacementKey   = 5;
            const replacementValue = 100;
            rbtAlt.insert(replacementKey, replacementValue.toFixed(5));
            const s4 = rbtAlt.toString();

            const controlString = [0, 1, 2, 3, 4, replacementValue, 6, 7, 8, 9].map(n => n.toFixed(5)).join(' | ');

            assert(s3 !== s4, `before and after should not be equal`);
            assert(s4 === controlString, `strings should be equal`);
            expect(rbtAlt.size()).to.equal(10);

            done();
        });
    });

    describe('#remove', () => {
        it(`should correctly remove a requested piece of data`, (done) => {
            rbt.remove(6).remove(9);
            const s = rbt.toString();
            expect(s).to.equal(`0 | 1 | 2 | 3 | 7 | 8`);
            expect(rbt.size()).to.equal(6);
            done();
        });

        it(`should leave the tree unchanged if deleting a nonexistent element`, (done) => {
            const s1 = rbt.toString();
            rbt.remove(60);
            const s2 = rbt.toString();
            assert(s1 === s2, `the tree should remain unchanged`);
            expect(rbt.size()).to.equal(8);
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
            const value: number = rbt.find(6);
            assert(value, `value should not be null`);
            expect(rbt.size()).to.equal(8);
            done();
        });

        it(`should not find an element that is not present in the tree`, (done) => {
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

        const bstAlt = RedBlackTree<number, ITestType>();

        it(`should correctly insert an arbitrary type`, (done) => {
            bstAlt.clear();
            bstAlt.insert(0, t0).insert(2, t2).insert(1, t1);
            const s = bstAlt.toString();
            expect(s).to.equal(`hi there 1 | what up 2 | how goesit 3`);
            expect(bstAlt.size()).to.equal(3);
            done();
        });

        it(`should correctly delete an arbitrary type`, (done) => {
            bstAlt.clear();
            bstAlt.insert(0, t0).insert(2, t2).insert(1, t1);
            bstAlt.remove(0);
            const s = bstAlt.toString();
            expect(s.trim()).to.equal(`what up 2 | how goesit 3`);
            expect(bstAlt.size()).to.equal(2);
            done();
        });

        it(`should correctly find an arbitrary type`, (done) => {
            bstAlt.clear();
            bstAlt.insert(0, t0).insert(2, t2).insert(1, t1);
            const value = bstAlt.find(1);
            const s     = value.toString();
            expect(s.trim()).to.equal(`what up 2`);
            expect(bstAlt.size()).to.equal(3);
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

        const bstAlt = RedBlackTree<ITestType, ITestType>(testComparer);

        it(`should correctly insert an arbitrary type`, (done) => {
            bstAlt.insert(t0).insert(t2).insert(t1);
            const s = bstAlt.toString();
            expect(s).to.equal(`hi there 1 | how goesit 2 | what up 4`);
            expect(bstAlt.size()).to.equal(3);
            done();
        });

        it(`should correctly delete an arbitrary type`, (done) => {
            bstAlt.insert(t0).insert(t2).insert(t1);
            bstAlt.remove(t0);
            const s = bstAlt.toString();
            expect(s.trim()).to.equal(`how goesit 2 | what up 4`);
            expect(bstAlt.size()).to.equal(2);
            done();
        });

        it(`should correctly find an arbitrary type`, (done) => {
            const value = bstAlt.find(t1);
            const s     = value.toString();
            expect(s.trim()).to.equal(`what up 4`);
            expect(bstAlt.size()).to.equal(2);
            done();
        });
    });
});

