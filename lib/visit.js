module.exports = visit;

function visit(node, visitor) {
  visitNode(node, visitor);
}

function visitNode(node, visitor) {
  switch (node.type) {
    case 'cell':
      visitCell(node, visitor);
      break;
    case 'cell-range':
      visitCellRange(node, visitor);
      break;
    case 'function':
      visitFunction(node, visitor);
      break;
    case 'number':
      visitNumber(node, visitor);
      break;
    case 'text':
      visitText(node, visitor);
      break;
    case 'logical':
      visitLogical(node, visitor);
      break;
    case 'binary-expression':
      visitBinaryExpression(node, visitor);
      break;
    case 'unary-expression':
      visitUnaryExpression(node, visitor);
      break;
  }
}

function visitCell(node, visitor) {
  if (visitor.enterCell) visitor.enterCell(node);
  if (visitor.exitCell) visitor.exitCell(node);
}

function visitCellRange(node, visitor) {
  if (visitor.enterCellRange) visitor.enterCellRange(node);

  visitNode(node.left, visitor);
  visitNode(node.right, visitor);

  if (visitor.exitCellRange) visitor.exitCellRange(node);
}

function visitFunction(node, visitor) {
  if (visitor.enterFunction) visitor.enterFunction(node);

  node.arguments.forEach(arg => visitNode(arg, visitor));

  if (visitor.exitFunction) visitor.exitFunction(node);
}

function visitNumber(node, visitor) {
  if (visitor.enterNumber) visitor.enterNumber(node);
  if (visitor.exitNumber) visitor.exitNumber(node);
}

function visitText(node, visitor) {
  if (visitor.enterText) visitor.enterText(node);
  if (visitor.exitText) visitor.exitText(node);
}

function visitLogical(node, visitor) {
  if (visitor.enterLogical) visitor.enterLogical(node);
  if (visitor.exitLogical) visitor.exitLogical(node);
}

function visitBinaryExpression(node, visitor) {
  if (visitor.enterBinaryExpression) visitor.enterBinaryExpression(node);

  visitNode(node.left, visitor);
  visitNode(node.right, visitor);

  if (visitor.exitBinaryExpression) visitor.exitBinaryExpression(node);
}

function visitUnaryExpression(node, visitor) {
  if (visitor.enterUnaryExpression) visitor.enterUnaryExpression(node);

  visitNode(node.operand, visitor);

  if (visitor.exitUnaryExpression) visitor.exitUnaryExpression(node);
}
