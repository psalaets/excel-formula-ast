const { buildTree } = require('../');
const { tokenize } = require('excel-formula-tokenizer');
const assert = require('assert');
const builder = require('../lib/node-builder');

describe('invalid expressions', function () {
    it('SUM(', function () {
        assert.throws(function () {
            const tree = buildTree(tokenize('SUM('));
        });
    });
    it('+', function () {
        assert.throws(function () {
            const tree = buildTree(tokenize('+'));
        });
    });
    it('SUM(,,', function () {
        assert.throws(function () {
            const tree = buildTree(tokenize('SUM(,,'));
        });
    });
    it('>', function () {
        assert.throws(function () {
            const tree = buildTree(tokenize('>'));
        });
    });
    it('a >', function () {
        assert.throws(function () {
            const tree = buildTree(tokenize('a >'));
        });
    });
    it('> b', function () {
        assert.throws(function () {
            const tree = buildTree(tokenize('> b'));
        });
    });
});
