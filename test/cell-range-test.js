const parse = require('../');
const {tokenize} = require('excel-formula-tokenizer');
const {deepStrictEqual} = require('assert');
const {
  cellRangeNode,
  cellNode,
  binaryExpressionNode
} = require('./node-builder');

describe('cell ranges', function () {
  it('A1', function () {
    const tree = parse(tokenize('A1'));

    deepStrictEqual(tree,
      cellNode('A1', 'relative')
    );
  });

  it('A$1', function () {
    const tree = parse(tokenize('A$1'));

    deepStrictEqual(tree,
      cellNode('A$1', 'mixed')
    );
  });

  it('$A1', function () {
    const tree = parse(tokenize('$A1'));

    deepStrictEqual(tree,
      cellNode('$A1', 'mixed')
    );
  });

  it('$A$1', function () {
    const tree = parse(tokenize('$A$1'));

    deepStrictEqual(tree,
      cellNode('$A$1', 'absolute')
    );
  });

  it('A1:A4', function () {
    const tree = parse(tokenize('A1:A4'));

    deepStrictEqual(tree,
      cellRangeNode(
        cellNode('A1', 'relative'),
        cellNode('A4', 'relative')
      )
    );
  });

  it('$A1:A$4', function () {
    const tree = parse(tokenize('$A1:A$4'));

    deepStrictEqual(tree,
      cellRangeNode(
        cellNode('$A1', 'mixed'),
        cellNode('A$4', 'mixed')
      )
    );
  });

  it('$A$1:$A$4', function () {
    const tree = parse(tokenize('$A$1:$A$4'));

    deepStrictEqual(tree,
      cellRangeNode(
        cellNode('$A$1', 'absolute'),
        cellNode('$A$4', 'absolute')
      )
    );
  });

  it('1:4', function () {
    const tree = parse(tokenize('1:4'));

    deepStrictEqual(tree,
      cellRangeNode(
        cellNode('1', 'relative'),
        cellNode('4', 'relative')
      )
    );
  });

  it('$1:4', function () {
    const tree = parse(tokenize('$1:4'));

    deepStrictEqual(tree,
      cellRangeNode(
        cellNode('$1', 'absolute'),
        cellNode('4', 'relative')
      )
    );
  });

  it('C:G', function () {
    const tree = parse(tokenize('C:G'));

    deepStrictEqual(tree,
      cellRangeNode(
        cellNode('C', 'relative'),
        cellNode('G', 'relative')
      )
    );
  });

  it('C:$G', function () {
    const tree = parse(tokenize('C:$G'));

    deepStrictEqual(tree,
      cellRangeNode(
        cellNode('C', 'relative'),
        cellNode('$G', 'absolute')
      )
    );
  });

  it('C:G5', function () {
    const tree = parse(tokenize('C:G5'));

    deepStrictEqual(tree,
      cellRangeNode(
        cellNode('C', 'relative'),
        cellNode('G5', 'relative')
      )
    );
  });

  it('5:D5', function () {
    const tree = parse(tokenize('5:D5'));

    deepStrictEqual(tree,
      cellRangeNode(
        cellNode('5', 'relative'),
        cellNode('D5', 'relative')
      )
    );
  });

  it('A1:B3,C1:D3', function () {
    const tree = parse(tokenize('A1:B3,C1:D3'));

    deepStrictEqual(tree,
      binaryExpressionNode(
        ',',
        cellRangeNode(
          cellNode('A1', 'relative'),
          cellNode('B3', 'relative')
        ),
        cellRangeNode(
          cellNode('C1', 'relative'),
          cellNode('D3', 'relative')
        )
      )
    );
  });

  it('A1:B3 B1:D3', function () {
    const tree = parse(tokenize('A1:B3 B1:D3'));

    deepStrictEqual(tree,
      binaryExpressionNode(
        ' ',
        cellRangeNode(
          cellNode('A1', 'relative'),
          cellNode('B3', 'relative')
        ),
        cellRangeNode(
          cellNode('B1', 'relative'),
          cellNode('D3', 'relative')
        )
      )
    );
  });
});
