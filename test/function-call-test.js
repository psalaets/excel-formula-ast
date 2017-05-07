const parse = require('../');
const {tokenize} = require('excel-formula-tokenizer');
const {deepStrictEqual} = require('assert');
const {
  numberNode,
  functionCallNode,
  binaryExpressionNode,
  prefixExpressionNode
} = require('./node-builder');

describe('function calls', function () {
  it('SUM()', function () {
    const tree = parse(tokenize('SUM()'));

    deepStrictEqual(tree,
      functionCallNode('SUM')
    );
  });

  it('-SUM()', function () {
    const tree = parse(tokenize('-SUM()'));

    deepStrictEqual(tree,
      prefixExpressionNode(
        '-',
        functionCallNode('SUM')
      )
    );
  });

  it('SUM(1)', function () {
    const tree = parse(tokenize('SUM(1)'));

    deepStrictEqual(tree,
      functionCallNode(
        'SUM',
        numberNode(1)
      )
    );
  });

  it('SUM(1, 2)', function () {
    const tree = parse(tokenize('SUM(1, 2)'));

    deepStrictEqual(tree,
      functionCallNode(
        'SUM',
        numberNode(1),
        numberNode(2)
      )
    );
  });

  it('SUM(1, SUM(2, 3))', function () {
    const tree = parse(tokenize('SUM(1, SUM(2, 3))'));

    deepStrictEqual(tree,
      functionCallNode(
        'SUM',
        numberNode(1),
        functionCallNode(
          'SUM',
          numberNode(2),
          numberNode(3)
        )
      )
    );
  });

  it('SUM(10 / 4, SUM(2, 3))', function () {
    const tree = parse(tokenize('SUM(10 / 4, SUM(2, 3))'));

    deepStrictEqual(tree,
      functionCallNode(
        'SUM',
        binaryExpressionNode(
          '/',
          numberNode(10),
          numberNode(4)
        ),
        functionCallNode(
          'SUM',
          numberNode(2),
          numberNode(3)
        )
      )
    );
  });

  it('2 + SUM(1)', function () {
    const tree = parse(tokenize('2 + SUM(1)'));

    deepStrictEqual(tree,
      binaryExpressionNode(
        '+',
        numberNode(2),
        functionCallNode(
          'SUM',
          numberNode(1)
        )
      )
    );
  });

  it('2 + SUM(1, 2, 3, 4)', function () {
    const tree = parse(tokenize('2 + SUM(1, 2, 3, 4)'));

    deepStrictEqual(tree,
      binaryExpressionNode(
        '+',
        numberNode(2),
        functionCallNode(
          'SUM',
          numberNode(1),
          numberNode(2),
          numberNode(3),
          numberNode(4)
        )
      )
    );
  });

  it('SUM(2) + SUM(1)', function () {
    const tree = parse(tokenize('SUM(2) + SUM(1)'));

    deepStrictEqual(tree,
      binaryExpressionNode(
        '+',
        functionCallNode(
          'SUM',
          numberNode(2)
        ),
        functionCallNode(
          'SUM',
          numberNode(1)
        )
      )
    );
  });

  it('SUM(SUM(1), 2 + 3)', function () {
    const tree = parse(tokenize('SUM(SUM(1), 2 + 3)'));

    deepStrictEqual(tree,
      functionCallNode(
        'SUM',
        functionCallNode(
          'SUM',
          numberNode(1)
        ),
        binaryExpressionNode(
          '+',
          numberNode(2),
          numberNode(3)
        )
      )
    );
  });
});
