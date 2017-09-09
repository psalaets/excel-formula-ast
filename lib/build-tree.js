// https://www.engr.mun.ca/~theo/Misc/exp_parsing.htm

const {
  create: createShuntingYard,
  operator: createOperator,
  SENTINEL
} = require('./shunting-yard');
const tokenStream = require('./token-stream');
const builder = require('./node-builder');

module.exports = parseFormula;

function parseFormula(tokens) {
  const stream = tokenStream(tokens);
  const shuntingYard = createShuntingYard();

  parseExpression(stream, shuntingYard);

  const retVal = shuntingYard.operands.top();
  if (!retVal) {
    throw new Error('Syntax error');
  }
  return retVal;
}

function parseExpression(stream, shuntingYard) {
  parseOperandExpression(stream, shuntingYard);

  let pos;
  while (true) {
    if (!stream.nextIsBinaryOperator()) {
      break;
    }
    if (pos === stream.pos()) {
      throw new Error('Invalid syntax!');
    }
    pos = stream.pos();
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
    stream.consume(); // open paren
    withinSentinel(shuntingYard, function () {
      parseExpression(stream, shuntingYard);
    });
    stream.consume(); // close paren
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
  stream.consume(); // consume start of function call

  const args = parseFunctionArgList(stream, shuntingYard);
  shuntingYard.operands.push(builder.functionCall(name, args));

  stream.consume(); // consume end of function call
}

function parseFunctionArgList(stream, shuntingYard) {
  const reverseArgs = [];

  withinSentinel(shuntingYard, function () {
    let arity = 0;
    let pos;
    while (true) {
      if (stream.nextIsEndOfFunctionCall())
        break;
      if (pos === stream.pos()) {
        throw new Error('Invalid syntax');
      }
      pos = stream.pos();
      parseExpression(stream, shuntingYard);
      arity += 1;

      if (stream.nextIsFunctionArgumentSeparator()) {
        stream.consume();
      }
    }

    for (let i = 0; i < arity; i++) {
      reverseArgs.push(shuntingYard.operands.pop());
    }
  });

  return reverseArgs.reverse();
}

function withinSentinel(shuntingYard, fn) {
  shuntingYard.operators.push(SENTINEL);
  fn();
  shuntingYard.operators.pop();
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
    operands.push(builder.binaryExpression(operator.symbol, left, right));
  } else if (operators.top().isUnary()) {
    const operand = operands.pop();
    const operator = operators.pop();
    operands.push(builder.unaryExpression(operator.symbol, operand));
  }
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
  return createCellRange(next.value);
}

function createCellRange(value) {
  const parts = value.split(':');

  if (parts.length == 2) {
    return builder.cellRange(
      builder.cell(parts[0], cellRefType(parts[0])),
      builder.cell(parts[1], cellRefType(parts[1]))
    );
  } else {
    return builder.cell(value, cellRefType(value));
  }
}

function cellRefType(key) {
  if (/^\$[A-Z]+\$\d+$/.test(key)) return 'absolute';
  if (/^\$[A-Z]+$/     .test(key)) return 'absolute';
  if (/^\$\d+$/        .test(key)) return 'absolute';
  if (/^\$[A-Z]+\d+$/  .test(key)) return 'mixed';
  if (/^[A-Z]+\$\d+$/  .test(key)) return 'mixed';
  if (/^[A-Z]+\d+$/    .test(key)) return 'relative';
  if (/^\d+$/          .test(key)) return 'relative';
  if (/^[A-Z]+$/       .test(key)) return 'relative';
}

function parseText(stream) {
  const next = stream.getNext();
  stream.consume();
  return builder.text(next.value);
}

function parseLogical(stream) {
  const next = stream.getNext();
  stream.consume();
  return builder.logical(next.value === 'TRUE');
}

function parseNumber(stream) {
  let value = Number(stream.getNext().value);
  stream.consume();

  if (stream.nextIsPostfixOperator()) {
    value *= 0.01;
    stream.consume();
  }

  return builder.number(value);
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
