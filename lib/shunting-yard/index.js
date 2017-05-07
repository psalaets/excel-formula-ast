const Operator = require('./operator');
const Stack = require('./stack');

function create() {
  const operands = new Stack();
  const operators = new Stack();

  operators.push(Operator.SENTINEL);

  return {
    operands,
    operators
  };
}

function operator(symbol, precendence, operandCount, leftAssociative) {
  return new Operator(symbol, precendence, operandCount, leftAssociative);
}

module.exports.create = create;
module.exports.operator = operator;
module.exports.SENTINEL = Operator.SENTINEL;
