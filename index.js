// https://www.engr.mun.ca/~theo/Misc/exp_parsing.htm

const {
  create: createShuntingYard,
  operator: createOperator,
  SENTINEL
} = require('./lib/shunting-yard');
const tokenStream = require('./lib/token-stream');

module.exports = parseFormula;

function parseFormula(tokens) {
  const stream = tokenStream(tokens);
  const shuntingYard = createShuntingYard();

  parseExpression(stream, shuntingYard);

  return shuntingYard.operands.top();
}

function parseExpression(stream, shuntingYard) {
  parseOperandExpression(stream, shuntingYard);

  while (stream.nextIsBinaryOperator()) {
    pushOperator(createBinaryOperator(stream.getNext().value), shuntingYard);
    stream.consume();
    parseOperandExpression(stream, shuntingYard);
  }

  while (shuntingYard.operators.top() !== SENTINEL) {
    popOperator(shuntingYard);
  }
}

function parseOperandExpression(stream, shuntingYard) {
  if (stream.nextIsTerminal()) {
    shuntingYard.operands.push(parseTerminal(stream));
    // parseTerminal already consumes once so don't need to consume on line below
    // stream.consume()
  } else if (stream.nextIsOpenParen()) {
    stream.consume();
    shuntingYard.operators.push(SENTINEL);
    parseExpression(stream, shuntingYard);
    stream.consume(); // close paren
    shuntingYard.operators.pop();
  } else if (stream.nextIsPrefixOperator()) {
    let unaryOperator = createUnaryOperator(stream.getNext().value);
    pushOperator(unaryOperator, shuntingYard);
    stream.consume();
    parseOperandExpression(stream, shuntingYard);
  } else if (stream.nextIsFunctionCall()) {
    parseFunctionCall(stream, shuntingYard);
  }
}

function parseFunctionCall(stream, shuntingYard) {
  const name = stream.getNext().value;
  stream.consume();

  shuntingYard.operators.push(SENTINEL);

  let arity = 0;
  while (!stream.nextIsEndOfFunctionCall()) {
    parseExpression(stream, shuntingYard);
    arity += 1;

    if (stream.nextIsFunctionArgumentSeparator()) {
      stream.consume();
    }
  }

  stream.consume(); // consume end of function call

  const reverseArgs = [];
  for (let i = 0; i < arity; i++) {
    reverseArgs.push(shuntingYard.operands.pop());
  }

  shuntingYard.operators.pop();

  shuntingYard.operands.push(createFunctionCallNode(name, reverseArgs.reverse()));
}

function createFunctionCallNode(name, args) {
  return {
    type: 'function',
    name,
    arguments: args
  };
}

function pushOperator(operator, shuntingYard) {
  while (shuntingYard.operators.top().evaluatesBefore(operator)) {
    popOperator(shuntingYard);
  }
  shuntingYard.operators.push(operator);
}

function popOperator({operators, operands}) {
  if (operators.top().isBinary()) {
    const right = operands.pop();
    const left = operands.pop();
    const operator = operators.pop();
    operands.push(makeBinaryExpressionNode(operator.symbol, left, right));
  } else if (operators.top().isUnary()) {
    const operand = operands.pop();
    const operator = operators.pop();
    operands.push(makeUnaryExpression(operator.symbol, operand));
  }
}

function makeUnaryExpression(symbol, operand) {
  return {
    type: 'unary-expression',
    operator: symbol,
    operand
  };
}

function makeBinaryExpressionNode(symbol, left, right) {
  return {
    type: 'binary-expression',
    operator: symbol,
    left,
    right
  };
}

function parseTerminal(stream) {
  if (stream.nextIsNumber()) {
    return parseNumber(stream);
  }

  if (stream.nextIsText()) {
    return parseText(stream);
  }

  if (stream.nextIsLogical()) {
    return parseLogical(stream);
  }

  if (stream.nextIsRange()) {
    return parseRange(stream);
  }
}

function parseRange(stream) {
  const next = stream.getNext();
  stream.consume();
  return createCellRangeNode(next.value);
}

function createCellRangeNode(value) {
  const parts = value.split(':');

  if (parts.length == 2) {
    return {
      type: 'cell-range',
      left: cellNode(parts[0]),
      right: cellNode(parts[1])
    };
  } else {
    return cellNode(value);
  }
}

function cellNode(value) {
  return {
    type: 'cell',
    key: value,
    refType: cellRefType(value)
  };
}

function cellRefType(cell) {
  if (/^\$[A-Z]+\$\d+$/.test(cell)) return 'absolute';
  if (/^\$[A-Z]+$/     .test(cell)) return 'absolute';
  if (/^\$\d+$/        .test(cell)) return 'absolute';
  if (/^\$[A-Z]+\d+$/  .test(cell)) return 'mixed';
  if (/^[A-Z]+\$\d+$/  .test(cell)) return 'mixed';
  if (/^[A-Z]+\d+$/    .test(cell)) return 'relative';
  if (/^\d+$/          .test(cell)) return 'relative';
  if (/^[A-Z]+$/       .test(cell)) return 'relative';
}

function parseText(stream) {
  const next = stream.getNext();
  stream.consume();
  return {
    type: 'text',
    value: next.value
  };
}

function parseLogical(stream) {
  const next = stream.getNext();
  stream.consume();
  return {
    type: 'boolean',
    value: next.value == 'TRUE'
  };
}

function parseNumber(stream) {
  const next = stream.getNext();
  const number = {
    type: 'number',
    value: Number(next.value)
  };
  stream.consume();

  if (stream.nextIsPostfixOperator()) {
    number.value *= 0.01;

    stream.consume();
  }

  return number;
}

function createUnaryOperator(symbol) {
  const precendence = {
    // negation
    '-': 7
  }[symbol];

  return createOperator(symbol, precendence, 1, true);
}

function createBinaryOperator(symbol) {
  const precendence = {
    // cell range union and intersect
    ' ': 8,
    ',': 8,
    // raise to power
    '^': 5,
    // multiply, divide
    '*': 4,
    '/': 4,
    // add, subtract
    '+': 3,
    '-': 3,
    // string concat
    '&': 2,
    // comparison
    '=': 1,
    '<>': 1,
    '<=': 1,
    '>=': 1,
    '>': 1,
    '<': 1
  }[symbol];

  return createOperator(symbol, precendence, 2, true);
}
