const parse = require('../');
const {tokenize} = require('excel-formula-tokenizer');
const {deepStrictEqual} = require('assert');

describe('parsing tokens', function () {
  it('1', function () {
    const tree = parse(tokenize('1'));

    deepStrictEqual(tree, numberNode(1));
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
        unaryExpressionNode(
          '-',
          numberNode(1)
        ),
        numberNode(2)
      )
    );
  });

  it('SUM()', function () {
    const tree = parse(tokenize('SUM()'));

    deepStrictEqual(tree,
      functionCallNode('SUM')
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
});

function functionCallNode(name, ...args) {
  return {
    type: 'function',
    name,
    arguments: args
  };
}

function numberNode(value) {
  return {
    type: 'number',
    value
  };
}

function textNode(value) {
  return {
    type: 'text',
    value
  };
}

function booleanNode(value) {
  return {
    type: 'boolean',
    value
  };
}

function binaryExpressionNode(operator, left, right) {
  return {
    type: 'binary-expression',
    operator,
    left,
    right
  };
}

function unaryExpressionNode(operator, expression) {
  return {
    type: 'unary-expression',
    operator,
    operand: expression
  };
}
