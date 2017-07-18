import { assert, expect } from 'chai';
import 'mocha';

import { IBinaryTreeNode } from '../binary-tree/binary-tree';
import { IRedBlackTree, RedBlackTree } from './red-black-tree';

/* tslint:disable:no-magic-numbers */

describe('red-black-tree.ts', () => {

    let rbt: IRedBlackTree<number>;

    before((done) => {
        rbt = new RedBlackTree<number>();
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

    describe('red-black-tree', () => {
        describe('#toString', () => {
            it(`should traverse its elements in order`, (done) => {
                const s = rbt.toString();
                expect(s).to.equal(`0 | 1 | 2 | 3 | 6 | 7 | 8 | 9`);
                expect(rbt.count).to.equal(8);
                done();
            });
        });

        describe('#insert', () => {
            it(`should not insert a duplicate`, (done) => {
                const s1 = rbt.toString();
                rbt.insert(6);
                const s2 = rbt.toString();
                expect(s1).to.equal(s2);
                expect(rbt.count).to.equal(8);
                done();
            });
        });

        describe('#remove', () => {
            it(`should correctly remove a requested piece of data`, (done) => {
                rbt.remove(6).remove(9);
                const s = rbt.toString();
                expect(s).to.equal(`0 | 1 | 2 | 3 | 7 | 8`);
                expect(rbt.count).to.equal(6);
                done();
            });

            it(`should leave the tree unchanged if deleting a nonexistent element`, (done) => {
                const s1 = rbt.toString();
                rbt.remove(60);
                const s2 = rbt.toString();
                assert(s1 === s2, `the tree should remain unchanged`);
                expect(rbt.count).to.equal(8);
                done();
            });
        });

        describe('#find', () => {
            it(`should find an element that is present in the tree`, (done) => {
                const node: IBinaryTreeNode<number> = rbt.find(6);
                assert(node, `node should not be null`);
                expect(rbt.count).to.equal(8);
                done();
            });

            it(`should not find an element that is not present in the tree`, (done) => {
                const node: IBinaryTreeNode<number> = rbt.find(60);
                assert(!node, `node should be null`);
                expect(rbt.count).to.equal(8);
                done();
            });
        });

        describe('arbitrary object types, suite 1', () => {
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

            const rbtAlt: IRedBlackTree<ITestType> = new RedBlackTree<ITestType>(testComparer);

            it(`should correctly insert an arbitrary type`, (done) => {
                rbtAlt.insert(t0).insert(t2).insert(t1);
                const s = rbtAlt.toString();
                expect(s).to.equal(`hi there 1 | how goesit 2 | what up 4`);
                expect(rbtAlt.count).to.equal(3);
                done();
            });

            it(`should correctly delete an arbitrary type`, (done) => {
                rbtAlt.remove(t0);
                const s = rbtAlt.toString();
                expect(s.trim()).to.equal(`how goesit 2 | what up 4`);
                expect(rbtAlt.count).to.equal(2);
                done();
            });

            it(`should correctly find an arbitrary type`, (done) => {
                const node = rbtAlt.find(t1);
                const s = node.toString();
                expect(s.trim()).to.equal(`data: what up 4`);
                expect(rbtAlt.count).to.equal(2);
                done();
            });
        });
    });
});
