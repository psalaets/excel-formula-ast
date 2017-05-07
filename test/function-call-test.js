const parse = require('../');
const {tokenize} = require('excel-formula-tokenizer');
const {deepStrictEqual} = require('assert');
const builder = require('../lib/node-builder');

describe('function calls', function () {
  it('SUM()', function () {
    const tree = parse(tokenize('SUM()'));

    deepStrictEqual(tree,
      builder.functionCall('SUM')
    );
  });

  it('-SUM()', function () {
    const tree = parse(tokenize('-SUM()'));

    deepStrictEqual(tree,
      builder.unaryExpression(
        '-',
        builder.functionCall('SUM')
      )
    );
  });

  it('SUM(1)', function () {
    const tree = parse(tokenize('SUM(1)'));

    deepStrictEqual(tree,
      builder.functionCall(
        'SUM',
        builder.number(1)
      )
    );
  });

  it('SUM(1, 2)', function () {
    const tree = parse(tokenize('SUM(1, 2)'));

    deepStrictEqual(tree,
      builder.functionCall(
        'SUM',
        builder.number(1),
        builder.number(2)
      )
    );
  });

  it('SUM(1, SUM(2, 3))', function () {
    const tree = parse(tokenize('SUM(1, SUM(2, 3))'));

    deepStrictEqual(tree,
      builder.functionCall(
        'SUM',
        builder.number(1),
        builder.functionCall(
          'SUM',
          builder.number(2),
          builder.number(3)
        )
      )
    );
  });

  it('SUM(10 / 4, SUM(2, 3))', function () {
    const tree = parse(tokenize('SUM(10 / 4, SUM(2, 3))'));

    deepStrictEqual(tree,
      builder.functionCall(
        'SUM',
        builder.binaryExpression(
          '/',
          builder.number(10),
          builder.number(4)
        ),
        builder.functionCall(
          'SUM',
          builder.number(2),
          builder.number(3)
        )
      )
    );
  });

  it('2 + SUM(1)', function () {
    const tree = parse(tokenize('2 + SUM(1)'));

    deepStrictEqual(tree,
      builder.binaryExpression(
        '+',
        builder.number(2),
        builder.functionCall(
          'SUM',
          builder.number(1)
        )
      )
    );
  });

  it('2 + SUM(1, 2, 3, 4)', function () {
    const tree = parse(tokenize('2 + SUM(1, 2, 3, 4)'));

    deepStrictEqual(tree,
      builder.binaryExpression(
        '+',
        builder.number(2),
        builder.functionCall(
          'SUM',
          builder.number(1),
          builder.number(2),
          builder.number(3),
          builder.number(4)
        )
      )
    );
  });

  it('SUM(2) + SUM(1)', function () {
    const tree = parse(tokenize('SUM(2) + SUM(1)'));

    deepStrictEqual(tree,
      builder.binaryExpression(
        '+',
        builder.functionCall(
          'SUM',
          builder.number(2)
        ),
        builder.functionCall(
          'SUM',
          builder.number(1)
        )
      )
    );
  });

  it('SUM(SUM(1), 2 + 3)', function () {
    const tree = parse(tokenize('SUM(SUM(1), 2 + 3)'));

    deepStrictEqual(tree,
      builder.functionCall(
        'SUM',
        builder.functionCall(
          'SUM',
          builder.number(1)
        ),
        builder.binaryExpression(
          '+',
          builder.number(2),
          builder.number(3)
        )
      )
    );
  });
});
