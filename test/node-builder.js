module.exports = {
  functionCallNode,
  numberNode,
  textNode,
  booleanNode,
  cellNode,
  cellRangeNode,
  binaryExpressionNode,
  prefixExpressionNode
};

function cellNode(key, refType) {
  return {
    type: 'cell',
    refType,
    key
  };
}

function cellRangeNode(leftNode, rightNode) {
  return {
    type: 'cell-range',
    left: leftNode,
    right: rightNode
  };
}

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

function prefixExpressionNode(operator, expression) {
  return {
    type: 'prefix-expression',
    operator,
    operand: expression
  };
}
