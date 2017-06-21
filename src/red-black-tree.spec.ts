import * as chai from 'chai';

import { IRedBlackTree, RedBlackTree } from './red-black-tree';
import { IBinaryTreeNode } from "./binary-tree";

const expect = chai.expect;
const assert = chai.assert;

describe('binary-search-tree', () => {

    let bst: IRedBlackTree<number>;

    before((done) => {
        bst = new RedBlackTree<number>();
        done();
    });

    beforeEach((done) => {
        bst.insert(2)
            .insert(3)
            .insert(7)
            .insert(1)
            .insert(9)
            .insert(0)
            .insert(8)
            .insert(6);
        done();
    });

    describe('binary-search-tree', () => {
        describe('#toString', () => {
            it(`should traverse its elements in order`, (done) => {
                const s = bst.toString();
                expect(s).to.equal(`0; 1; 2; 3; 6; 7; 8; 9;`);
                expect(bst.count).to.equal(8);
                done();
            });
        });

        describe('#insert', () => {
            it(`should not insert a duplicate`, (done) => {
                const s1 = bst.toString();
                bst.insert(6);
                const s2 = bst.toString();
                assert(s1 == s2, `the tree should remain unchanged`);
                expect(bst.count).to.equal(8);
                done();
            });
        });

        describe('#delete', () => {
            it(`should correctly remove a requested piece of data`, (done) => {
                bst.delete(6).delete(9);
                const s = bst.toString();
                expect(s).to.equal(`0; 1; 2; 3; 7; 8;`);
                expect(bst.count).to.equal(6);
                done();
            });

            it(`should leave the tree unchanged if deleting a nonexistent element`, (done) => {
                const s1 = bst.toString();
                bst.delete(60);
                const s2 = bst.toString();
                assert(s1 == s2, `the tree should remain unchanged`);
                expect(bst.count).to.equal(8);
                done();
            });
        });

        describe('#find', () => {
            it(`should find an element that is present in the tree`, (done) => {
                const node: IBinaryTreeNode<number> = bst.find(6);
                assert(node, `node should not be null`);
                expect(bst.count).to.equal(8);
                done();
            });

            it(`should not find an element that is not present in the tree`, (done) => {
                const node: IBinaryTreeNode<number> = bst.find(60);
                assert(!node, `node should be null`);
                expect(bst.count).to.equal(8);
                done();
            });
        });

        describe('arbitrary object types', () => {
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
                }
            };

            const t1: ITestType = {
                a: 'what',
                b: 'up',
                c: 4,
                toString(): string {
                    return `${this.a} ${this.b} ${this.c}`;
                }
            };

            const t2: ITestType = {
                a: 'how',
                b: 'goesit',
                c: 2,
                toString(): string {
                    return `${this.a} ${this.b} ${this.c}`;
                }
            };

            let bstAlt: IRedBlackTree<ITestType> = new RedBlackTree<ITestType>(null, testComparer);

            it(`should correctly insert an arbitrary type`, (done) => {
                bstAlt.insert(t0).insert(t2).insert(t1);
                const s = bstAlt.toString();
                expect(s).to.equal(`hi there 1; how goesit 2; what up 4;`);
                expect(bstAlt.count).to.equal(3);
                done();
            });

            it(`should correctly delete an arbitrary type`, (done) => {
                bstAlt.delete(t0);
                const s = bstAlt.toString();
                //expect(s.trim()).to.equal(`how goesit 2; what up 4;`);
                expect(bstAlt.count).to.equal(2);
                done();
            });

            it(`should correctly find an arbitrary type`, (done) => {
                const node = bstAlt.find(t1);
                const s = node.toString();
                //expect(s.trim()).to.equal(`how goesit 2; what up 4;`);
                expect(bstAlt.count).to.equal(2);
                done();
            });
        });
    });
});