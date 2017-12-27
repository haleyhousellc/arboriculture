/* tslint:disable:no-magic-numbers */
import { assert, expect } from 'chai';
import 'mocha';

import { IBinaryTreeNode } from '../binary-tree/binary-tree';
import { AvlTree, IAvlTree, IAvlTreeNode } from './avl-tree';

describe('avl-tree', () => {

    let avlt: IAvlTree<number>;

    before((done) => {
        avlt = AvlTree();
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

    describe('end-to-end testing with intermediate checks on each insertion and deletion', () => {
        it(`should pass this test`, (done) => {
            avlt.clear();
            expect(avlt.toString()).to.equal(``);
            avlt.insert(5);
            const temp = avlt.find(5);
            expect(temp === 5, '5 should equal 5');
            done();
        });
    });

    describe('#toString', () => {
        it(`should traverse its elements in order`, (done) => {
            const s = avlt.toString();
            expect(s).to.equal(`0 | 1 | 2 | 3 | 6 | 7 | 8 | 9`);
            expect(avlt.size()).to.equal(8);
            done();
        });
    });

    describe('#insert', () => {
        it(`should not insert a duplicate`, (done) => {
            const s1 = avlt.toString();
            avlt.insert(6);
            const s2 = avlt.toString();
            expect(s1).to.equal(s2);
            expect(avlt.size()).to.equal(8);
            done();
        });

        it(`should replace an existing node if inserting an existing key`, done => {
            const bstAlt: IAvlTree<number, string> = AvlTree();

            bstAlt.insert(2, 'a string for key 2');
            const s1 = bstAlt.toString();

            bstAlt.insert(2, 'a new string for key 2');
            const s2 = bstAlt.toString();

            assert(s1 !== s2, `key 2 should have replaced value`);
            expect(bstAlt.size()).to.equal(1);

            done();
        });
    });

    describe('#remove', () => {
        it(`should correctly remove a requested piece of data`, (done) => {
            avlt.remove(6).remove(9);
            const s = avlt.toString();
            expect(s).to.equal(`0 | 1 | 2 | 3 | 7 | 8`);
            expect(avlt.size()).to.equal(6);
            done();
        });

        it(`should leave the tree unchanged if deleting a nonexistent element`, (done) => {
            const s1 = avlt.toString();
            avlt.remove(60);
            const s2 = avlt.toString();
            assert(s1 === s2, `the tree should remain unchanged`);
            expect(avlt.size()).to.equal(8);
            done();
        });
    });

    describe('#find', () => {
        it(`should find an element that is present in the tree`, (done) => {
            const value: number = avlt.find(6);
            assert(value, `value should not be null`);
            expect(avlt.size()).to.equal(8);
            done();
        });

        it(`should not find an element that is not present in the tree`, (done) => {
            const value: number = avlt.find(60);
            assert(!value, `value should be null`);
            expect(avlt.size()).to.equal(8);
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

        const avlAlt = AvlTree<number, ITestType>();

        it(`should correctly insert an arbitrary type`, (done) => {
            avlAlt.insert(0, t0).insert(2, t2).insert(1, t1);
            const s = avlAlt.toString();
            expect(s).to.equal(`hi there 1 | what up 2 | how goesit 3`);
            expect(avlAlt.size()).to.equal(3);
            done();
        });

        it(`should correctly delete an arbitrary type`, (done) => {
            avlAlt.insert(0, t0).insert(2, t2).insert(1, t1);
            avlAlt.remove(0);
            const s = avlAlt.toString();
            expect(s.trim()).to.equal(`what up 2 | how goesit 3`);
            expect(avlAlt.size()).to.equal(2);
            done();
        });

        it(`should correctly find an arbitrary type`, (done) => {
            const value = avlAlt.find(1);
            const s     = value.toString();
            expect(s.trim()).to.equal(`what up 2`);
            expect(avlAlt.size()).to.equal(2);
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

        const bstAlt = AvlTree<ITestType, ITestType>(testComparer);

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
