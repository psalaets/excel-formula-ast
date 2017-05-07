class Operator {
  constructor(symbol, precendence, operandCount = 2, leftAssociative = true) {
    if (operandCount < 1 || operandCount > 2) {
      throw new Error(`operandCount cannot be ${operandCount}, must be 1 or 2`);
    }

    this.symbol = symbol;
    this.precendence = precendence;
    this.operandCount = operandCount;
    this.leftAssociative = leftAssociative;
  }

  isUnary() {
    return this.operandCount === 1;
  }

  isBinary() {
    return this.operandCount === 2;
  }

  evaluatesBefore(other) {
    if (this === Operator.SENTINEL) return false;
    if (other === Operator.SENTINEL) return true;
    if (other.isUnary()) return false;

    if (this.isUnary()) {
      return this.precendence >= other.precendence;
    } else if (this.isBinary()) {
      if (this.precendence === other.precendence) {
        return this.leftAssociative;
      } else {
        return this.precendence > other.precendence;
      }
    }
  }
}

// fake operator with lowest precendence
Operator.SENTINEL = new Operator('S', 0);

module.exports = Operator;
