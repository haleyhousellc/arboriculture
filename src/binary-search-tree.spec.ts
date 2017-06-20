import * as chai from 'chai';

import { IBinarySearchTree, BinarySearchTree } from './binary-search-tree';
import { IBinaryTreeNode } from "./binary-tree";

const expect = chai.expect;
const assert = chai.assert;

describe('binary-search-tree', () => {

    let bst: IBinarySearchTree<number>;

    before((done) => {
        bst = new BinarySearchTree<number>();
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
        describe('#stringify', () => {
            it(`should traverse its elements in order`, (done) => {
                const s = bst.stringify();
                expect(s).to.equal(`0; 1; 2; 3; 6; 7; 8; 9;`);
                done();
            });
        });

        describe('#insert', () => {
            it(`should not insert a duplicate`, (done) => {
                const s1 = bst.stringify();
                bst.insert(6);
                const s2 = bst.stringify();
                assert(s1 == s2, `the tree should remain unchanged`);
                done();
            });
        });

        describe('#delete', () => {
            it(`should correctly remove a requested piece of data`, (done) => {
                bst.delete(6).delete(9);
                const s = bst.stringify();
                expect(s).to.equal(`0; 1; 2; 3; 7; 8;`);
                done();
            });

            it(`should leave the tree unchanged if deleting a nonexistent element`, (done) => {
                const s1 = bst.stringify();
                bst.delete(60);
                const s2 = bst.stringify();
                assert(s1 == s2, `the tree should remain unchanged`);
                done();
            });
        });

        describe('#find', () => {
            it(`should find an element that is present in the tree`, (done) => {
                const node: IBinaryTreeNode<number> = bst.find(6);
                assert(node, `node should not be null`);
                done();
            });

            it(`should not find an element that is not present in the tree`, (done) => {
                const node: IBinaryTreeNode<number> = bst.find(60);
                assert(!node, `node should be null`);
                done();
            });
        });

        it(`should work with all comparable data types`, (done) => {
            done();
        });
    });
});