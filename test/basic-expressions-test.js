const parse = require('../');
const {tokenize} = require('excel-formula-tokenizer');
const {deepStrictEqual} = require('assert');
const {
  numberNode,
  textNode,
  booleanNode,
  binaryExpressionNode,
  prefixExpressionNode
} = require('./node-builder');

describe('basic expressions', function () {
  it('1', function () {
    const tree = parse(tokenize('1'));

    deepStrictEqual(tree, numberNode(1));
  });

  it('1E-2', function () {
    const tree = parse(tokenize('1E-2'));

    deepStrictEqual(tree, numberNode(0.01));
  });

  it('10%', function () {
    const tree = parse(tokenize('10%'));

    deepStrictEqual(tree, numberNode(0.1));
  });

  it('-1', function () {
    const tree = parse(tokenize('-1'));

    deepStrictEqual(tree,
      prefixExpressionNode(
        '-',
        numberNode(1)
      )
    );
  });

  it('"abc"', function () {
    const tree = parse(tokenize('"abc"'));

    deepStrictEqual(tree, textNode('abc'));
  });

  it('TRUE', function () {
    const tree = parse(tokenize('TRUE'));

    deepStrictEqual(tree, booleanNode(true));
  });

  it('1 + 2', function () {
    const tree = parse(tokenize('1 + 2'));

    deepStrictEqual(tree,
      binaryExpressionNode(
        '+',
        numberNode(1),
        numberNode(2)
      )
    );
  });

  it('-1 + 2', function () {
    const tree = parse(tokenize('-1 + 2'));

    deepStrictEqual(tree,
      binaryExpressionNode(
        '+',
        prefixExpressionNode(
          '-',
          numberNode(1)
        ),
        numberNode(2)
      )
    );
  });

  it('"a" & "b"', function () {
    const tree = parse(tokenize('"a" & "b"'));

    deepStrictEqual(tree,
      binaryExpressionNode(
        '&',
        textNode('a'),
        textNode('b')
      )
    );
  });

  it('1 <> "b"', function () {
    const tree = parse(tokenize('1 <> "b"'));

    deepStrictEqual(tree,
      binaryExpressionNode(
        '<>',
        numberNode(1),
        textNode('b')
      )
    );
  });
});
