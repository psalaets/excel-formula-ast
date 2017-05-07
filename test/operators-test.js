const parse = require('../');
const {tokenize} = require('excel-formula-tokenizer');
const {deepStrictEqual} = require('assert');
const {
  numberNode,
  textNode,
  binaryExpressionNode,
  unaryExpressionNode
} = require('./node-builder');

describe('operators', function () {
  describe('precendence', function () {
    it('1 + 2 >= 3 - 4', function () {
      const tree = parse(tokenize('1 + 2 >= 3 - 4'));

      deepStrictEqual(tree,
        binaryExpressionNode(
          '>=',
          binaryExpressionNode(
            '+',
            numberNode(1),
            numberNode(2)
          ),
          binaryExpressionNode(
            '-',
            numberNode(3),
            numberNode(4)
          )
        )
      );
    });

    it('1 + 2 & "a"', function () {
      const tree = parse(tokenize('1 + 2 & "a"'));

      deepStrictEqual(tree,
        binaryExpressionNode(
          '&',
          binaryExpressionNode(
            '+',
            numberNode(1),
            numberNode(2)
          ),
          textNode('a')
        )
      );
    });

    it('1 + 2 * 3', function () {
      const tree = parse(tokenize('1 + 2 * 3'));

      deepStrictEqual(tree,
        binaryExpressionNode(
          '+',
          numberNode(1),
          binaryExpressionNode(
            '*',
            numberNode(2),
            numberNode(3)
          )
        )
      );
    });

    it('1 * 2 ^ 3', function () {
      const tree = parse(tokenize('1 * 2 ^ 3'));

      deepStrictEqual(tree,
        binaryExpressionNode(
          '*',
          numberNode(1),
          binaryExpressionNode(
            '^',
            numberNode(2),
            numberNode(3)
          )
        )
      );
    });

    it('(1 * 2) ^ 3', function () {
      const tree = parse(tokenize('(1 * 2) ^ 3'));

      deepStrictEqual(tree,
        binaryExpressionNode(
          '^',
          binaryExpressionNode(
            '*',
            numberNode(1),
            numberNode(2)
          ),
          numberNode(3)
        )
      );
    });
  });

  // everything is left associative
  describe('associativity', function () {
    it('1 + 2 + 3', function () {
      const tree = parse(tokenize('1 + 2 + 3'));

      deepStrictEqual(tree,
        binaryExpressionNode(
          '+',
          binaryExpressionNode(
            '+',
            numberNode(1),
            numberNode(2)
          ),
          numberNode(3)
        )
      );
    });

    it('1 + (2 + 3)', function () {
      const tree = parse(tokenize('1 + (2 + 3)'));

      deepStrictEqual(tree,
        binaryExpressionNode(
          '+',
          numberNode(1),
          binaryExpressionNode(
            '+',
            numberNode(2),
            numberNode(3)
          )
        )
      );
    });

    it('1 / 2 / 3', function () {
      const tree = parse(tokenize('1 / 2 / 3'));

      deepStrictEqual(tree,
        binaryExpressionNode(
          '/',
          binaryExpressionNode(
            '/',
            numberNode(1),
            numberNode(2)
          ),
          numberNode(3)
        )
      );
    });
  });
});
