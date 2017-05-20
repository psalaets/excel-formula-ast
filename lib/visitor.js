module.exports = visitor;

function visitor(callbacks) {
  return {
    visit(node) {
      switch (node.type) {
        case 'cell':
          this.visitCell(node);
          break;
        case 'cell-range':
          this.visitCellRange(node);
          break;
        case 'function':
          this.visitFunction(node);
          break;
        case 'number':
          this.visitNumber(node);
          break;
        case 'text':
          this.visitText(node);
          break;
        case 'logical':
          this.visitLogical(node);
          break;
        case 'binary-expression':
          this.visitBinaryExpression(node);
          break;
        case 'unary-expression':
          this.visitUnaryExpression(node);
          break;
      }
    },
    visitCell(n) {
      if (callbacks.enterCell) callbacks.enterCell(n);
      if (callbacks.exitCell) callbacks.exitCell(n);
    },
    visitCellRange(n) {
      if (callbacks.enterCellRange) callbacks.enterCellRange(n);

      this.visit(n.left);
      this.visit(n.right);

      if (callbacks.exitCellRange) callbacks.exitCellRange(n);
    },
    visitFunction(n) {
      if (callbacks.enterFunction) callbacks.enterFunction(n);

      n.arguments.forEach(a => this.visit(a));

      if (callbacks.exitFunction) callbacks.exitFunction(n);
    },
    visitNumber(n) {
      if (callbacks.enterNumber) callbacks.enterNumber(n);
      if (callbacks.exitNumber) callbacks.exitNumber(n);
    },
    visitText(n) {
      if (callbacks.enterText) callbacks.enterText(n);
      if (callbacks.exitText) callbacks.exitText(n);
    },
    visitLogical(n) {
      if (callbacks.enterLogical) callbacks.enterLogical(n);
      if (callbacks.exitLogical) callbacks.exitLogical(n);
    },
    visitBinaryExpression(n) {
      if (callbacks.enterBinaryExpression) callbacks.enterBinaryExpression(n);

      this.visit(n.left);
      this.visit(n.right);

      if (callbacks.exitBinaryExpression) callbacks.exitBinaryExpression(n);
    },
    visitUnaryExpression(n) {
      if (callbacks.enterUnaryExpression) callbacks.enterUnaryExpression(n);

      this.visit(n.operand);

      if (callbacks.exitUnaryExpression) callbacks.exitUnaryExpression(n);
    }
  };
}
