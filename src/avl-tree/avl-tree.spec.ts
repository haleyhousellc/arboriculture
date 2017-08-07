/* tslint:disable:no-magic-numbers */
import { assert, expect } from 'chai';
import 'mocha';

import { IBinaryTreeNode } from '../binary-tree/binary-tree';
import { AvlTree, IAvlTree, IAvlTreeNode } from './avl-tree';

describe('avl-tree.ts', () => {

    let avlt: IAvlTree<number>;

    before((done) => {
        avlt = new AvlTree<number>();
        done();
    });

    beforeEach((done) => {
        avlt.insert(2);
        avlt.insert(3);
        avlt.insert(7);
        avlt.insert(1);
        avlt.insert(9);
        avlt.insert(0);
        avlt.insert(8);
        avlt.insert(6);
        done();
    });

    afterEach((done) => {
        avlt.clear();
        done();
    });

    describe('avl-tree', () => {

        describe('end-to-end testing with intermediate checks on each insertion and deletion', () => {
            it(`should pass this test`, (done) => {
                avlt.clear();
                expect(avlt.toString()).to.equal(``);
                avlt.insert(5);
                const temp = avlt.find(5) as IAvlTreeNode<number>;
                done();
            });
        });

        describe('#toString', () => {
            it(`should traverse its elements in order`, (done) => {
                const s = avlt.toString();
                expect(s).to.equal(`0 | 1 | 2 | 3 | 6 | 7 | 8 | 9`);
                expect(avlt.count).to.equal(8);
                done();
            });
        });

        describe('#insert', () => {
            it(`should not insert a duplicate`, (done) => {
                const s1 = avlt.toString();
                avlt.insert(6);
                const s2 = avlt.toString();
                expect(s1).to.equal(s2);
                expect(avlt.count).to.equal(8);
                done();
            });
        });

        describe('#remove', () => {
            it(`should correctly remove a requested piece of data`, (done) => {
                avlt.remove(6).remove(9);
                const s = avlt.toString();
                expect(s).to.equal(`0 | 1 | 2 | 3 | 7 | 8`);
                expect(avlt.count).to.equal(6);
                done();
            });

            it(`should leave the tree unchanged if deleting a nonexistent element`, (done) => {
                const s1 = avlt.toString();
                avlt.remove(60);
                const s2 = avlt.toString();
                assert(s1 === s2, `the tree should remain unchanged`);
                expect(avlt.count).to.equal(8);
                done();
            });
        });

        describe('#find', () => {
            it(`should find an element that is present in the tree`, (done) => {
                const node: IBinaryTreeNode<number> = avlt.find(6);
                assert(node, `node should not be null`);
                expect(avlt.count).to.equal(8);
                done();
            });

            it(`should not find an element that is not present in the tree`, (done) => {
                const node: IBinaryTreeNode<number> = avlt.find(60);
                assert(!node, `node should be null`);
                expect(avlt.count).to.equal(8);
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

            const avltAlt: IAvlTree<ITestType> = new AvlTree<ITestType>(testComparer);

            it(`should correctly insert an arbitrary type`, (done) => {
                avltAlt.insert(t0).insert(t2).insert(t1);
                const s = avltAlt.toString();
                expect(s).to.equal(`hi there 1 | how goesit 2 | what up 4`);
                expect(avltAlt.count).to.equal(3);
                done();
            });

            it(`should correctly delete an arbitrary type`, (done) => {
                avltAlt.remove(t0);
                const s = avltAlt.toString();
                expect(s.trim()).to.equal(`how goesit 2 | what up 4`);
                expect(avltAlt.count).to.equal(2);
                done();
            });

            it(`should correctly find an arbitrary type`, (done) => {
                const node = avltAlt.find(t1);
                const s    = node.toString();
                expect(s.trim()).to.equal(`node => data: what up 4, balance factor: 0`);
                expect(avltAlt.count).to.equal(2);
                done();
            });
        });
    });
});
