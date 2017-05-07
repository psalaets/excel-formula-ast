module.exports = {
  functionCall,
  number,
  text,
  logical,
  cell,
  cellRange,
  binaryExpression,
  unaryExpression
};

function cell(key, refType) {
  return {
    type: 'cell',
    refType,
    key
  };
}

function cellRange(leftCell, rightCell) {
  return {
    type: 'cell-range',
    left: leftCell,
    right: rightCell
  };
}

function functionCall(name, ...args) {
  const argArray = Array.isArray(args[0]) ? args[0] : args;

  return {
    type: 'function',
    name,
    arguments: argArray
  };
}

function number(value) {
  return {
    type: 'number',
    value
  };
}

function text(value) {
  return {
    type: 'text',
    value
  };
}

function logical(value) {
  return {
    type: 'logical',
    value
  };
}

function binaryExpression(operator, left, right) {
  return {
    type: 'binary-expression',
    operator,
    left,
    right
  };
}

function unaryExpression(operator, expression) {
  return {
    type: 'unary-expression',
    operator,
    operand: expression
  };
}
