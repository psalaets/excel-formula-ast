const {deepStrictEqual} = require('assert');
const builder = require('../lib/node-builder');
const {visitor} = require('../');

describe('visiting', function () {
  it('cell node', function () {
    const recorder = createRecorder();
    const A1 = builder.cell('A1', 'relative');

    visitor(recorder).visit(A1);

    deepStrictEqual(recorder.calls, [
      ['enterCell', A1],
      ['exitCell', A1]
    ]);
  });

  it('cell range node', function () {
    const recorder = createRecorder();
    const A1 = builder.cell('A1', 'relative');
    const A2 = builder.cell('A2', 'relative');
    const cellRange = builder.cellRange(A1, A2);

    visitor(recorder).visit(cellRange);

    deepStrictEqual(recorder.calls, [
      ['enterCellRange', cellRange],
      ['enterCell', A1],
      ['exitCell', A1],
      ['enterCell', A2],
      ['exitCell', A2],
      ['exitCellRange', cellRange]
    ]);
  });

  it('number node', function () {
    const recorder = createRecorder();
    const number = builder.number(5);

    visitor(recorder).visit(number);

    deepStrictEqual(recorder.calls, [
      ['enterNumber', number],
      ['exitNumber', number]
    ]);
  });

  it('text node', function () {
    const recorder = createRecorder();
    const text = builder.text('asdf');

    visitor(recorder).visit(text);

    deepStrictEqual(recorder.calls, [
      ['enterText', text],
      ['exitText', text]
    ]);
  });

  it('logical node', function () {
    const recorder = createRecorder();
    const logical = builder.logical(true);

    visitor(recorder).visit(logical);

    deepStrictEqual(recorder.calls, [
      ['enterLogical', logical],
      ['exitLogical', logical]
    ]);
  });

  it('function node', function () {
    const recorder = createRecorder();
    const number = builder.number(3);
    const text = builder.text('dogs');
    const fn = builder.functionCall('get', number, text);

    visitor(recorder).visit(fn);

    deepStrictEqual(recorder.calls, [
      ['enterFunction', fn],
      ['enterNumber', number],
      ['exitNumber', number],
      ['enterText', text],
      ['exitText', text],
      ['exitFunction', fn],
    ]);
  });

  it('binary expression node', function () {
    const recorder = createRecorder();
    const number = builder.number(3);
    const text = builder.text('dogs');
    const expr = builder.binaryExpression('+', number, text);

    visitor(recorder).visit(expr);

    deepStrictEqual(recorder.calls, [
      ['enterBinaryExpression', expr],
      ['enterNumber', number],
      ['exitNumber', number],
      ['enterText', text],
      ['exitText', text],
      ['exitBinaryExpression', expr],
    ]);
  });

  it('unary expression node', function () {
    const recorder = createRecorder();
    const number = builder.number(3);
    const expr = builder.unaryExpression('-', number);

    visitor(recorder).visit(expr);

    deepStrictEqual(recorder.calls, [
      ['enterUnaryExpression', expr],
      ['enterNumber', number],
      ['exitNumber', number],
      ['exitUnaryExpression', expr],
    ]);
  });
});

function createRecorder() {
  const callbackNames = [
    'Cell',
    'CellRange',
    'Function',
    'Number',
    'Text',
    'Logical',
    'BinaryExpression',
    'UnaryExpression'
  ];

  const calls = [];

  return callbackNames
    .reduce((all, name) => {
      attach(all, `enter${name}`);
      attach(all, `exit${name}`);
      return all;
    }, {calls});

  function attach(callbacks, name) {
    callbacks[name] = function(node) {
      calls.push([name, node]);
    };
  }
}
