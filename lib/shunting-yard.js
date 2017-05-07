class Stack {
  constructor() {
    this.items = [];
  }

  push(value) {
    this.items.push(value);
  }

  pop() {
    return this.items.pop();
  }

  top() {
    return this.items[this.items.length - 1];
  }
}

function create() {
  const operands = new Stack();
  const operators = new Stack();

  return {
    operands,
    operators
  };
}

function operator(symbol, precendence, operandCount, leftAssociative) {
  return new Operator(symbol, precendence, operandCount, leftAssociative);
}

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
    if (this === SENTINEL) return false;
    if (other === SENTINEL) return true;
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

module.exports.create = create;
module.exports.operator = operator;

// fake operator with lowest precendence
const SENTINEL = module.exports.SENTINEL = operator('S', 0);
