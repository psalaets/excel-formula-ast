const {strictEqual, deepStrictEqual} = require('assert');
const nodeBuilder = require('../lib/node-builder');

describe('node builder', function () {
  it('cell', function () {
    const cell = nodeBuilder.cell('A1', 'relative');

    strictEqual(cell.type, 'cell');
    strictEqual(cell.key, 'A1');
    strictEqual(cell.refType, 'relative');
  });

  it('cellRange', function () {
    const left = nodeBuilder.cell('A1', 'relative');
    const right = nodeBuilder.cell('B1', 'relative');

    const cellRange = nodeBuilder.cellRange(left, right);

    strictEqual(cellRange.type, 'cell-range');
    strictEqual(cellRange.left, left);
    strictEqual(cellRange.right, right);
  });

  it('functionCall given args array', function () {
    const arg1 = nodeBuilder.number(1);
    const arg2 = nodeBuilder.number(2);

    const functionCall = nodeBuilder.functionCall('SUM', [arg1, arg2]);

    strictEqual(functionCall.type, 'function');
    strictEqual(functionCall.name, 'SUM');
    deepStrictEqual(functionCall.arguments, [arg1, arg2]);
  });

  it('functionCall given individual args', function () {
    const arg1 = nodeBuilder.number(1);
    const arg2 = nodeBuilder.number(2);

    const functionCall = nodeBuilder.functionCall('SUM', arg1, arg2);

    strictEqual(functionCall.type, 'function');
    strictEqual(functionCall.name, 'SUM');
    deepStrictEqual(functionCall.arguments, [arg1, arg2]);
  });

  it('functionCall given no args', function () {
    const functionCall = nodeBuilder.functionCall('SUM');

    strictEqual(functionCall.type, 'function');
    strictEqual(functionCall.name, 'SUM');
    deepStrictEqual(functionCall.arguments, []);
  });

  it('number', function () {
    const number = nodeBuilder.number(2);

    strictEqual(number.type, 'number');
    strictEqual(number.value, 2);
  });

  it('text', function () {
    const text = nodeBuilder.text('abc');

    strictEqual(text.type, 'text');
    strictEqual(text.value, 'abc');
  });

  it('logical', function () {
    const logical = nodeBuilder.logical(true);

    strictEqual(logical.type, 'logical');
    strictEqual(logical.value, true);
  });

  it('binary expression', function () {
    const op1 = nodeBuilder.number(1);
    const op2 = nodeBuilder.number(2);
    const expr = nodeBuilder.binaryExpression('+', op1, op2);

    strictEqual(expr.type, 'binary-expression');
    strictEqual(expr.operator, '+');
    strictEqual(expr.left, op1);
    strictEqual(expr.right, op2);
  });

  it('unary expression', function () {
    const operand = nodeBuilder.number(1);
    const expr = nodeBuilder.unaryExpression('-', operand);

    strictEqual(expr.type, 'unary-expression');
    strictEqual(expr.operator, '-');
    strictEqual(expr.operand, operand);
  });
});
