// https://www.engr.mun.ca/~theo/Misc/exp_parsing.htm

const {
  create: createShuntingYard,
  operator: createOperator,
  SENTINEL
} = require('./lib/shunting-yard');

module.exports = parseFormula;

function parseFormula(tokens) {
  const shuntingYard = createShuntingYard();
  const wrapped = wrap(tokens);

  parseExpression(wrapped, shuntingYard);

  return shuntingYard.operands.top();
}

function parseExpression(wrapped, shuntingYard) {
  parseSingleOperandExpression(wrapped, shuntingYard);

  while (wrapped.nextIsBinaryOperator()) {
    pushOperator(createBinaryOperator(wrapped.getNext().value), shuntingYard);
    wrapped.consume();
    parseSingleOperandExpression(wrapped, shuntingYard);
  }

  while (shuntingYard.operators.top() !== SENTINEL) {
    popOperator(shuntingYard);
  }
}

function parseFunctionCall(wrapped) {
  if (wrapped.nextIsFunctionCall()) {
    const next = wrapped.getNext();
    wrapped.consume();

    const fn = {
      type: 'function',
      name: next.value,
      arguments: parseFunctionArguments(wrapped)
    };

    return fn;
  }
}

function parseFunctionArguments(wrapped) {
  const args = [];

  while (!wrapped.nextIsEndOfFunctionCall()) {
    args.push(parseExpression(wrapped));
    if (wrapped.nextIsFunctionArgumentSeparator()) {
      wrapped.consume();
    }
  }

  return args;
}

function parseSingleOperandExpression(wrapped, shuntingYard) {
  if (wrapped.nextIsTerminal()) {
    shuntingYard.operands.push(parseTerminal(wrapped));
    // parseTerminal already consumes once so don't need to consume on line below
    // wrapped.consume()
  } else if (wrapped.nextIsOpenParen()) {
    wrapped.consume();
    shuntingYard.operators.push(SENTINEL);
    parseExpression(wrapped, shuntingYard);
    wrapped.consume(); // close paren
    shuntingYard.operators.pop();
  } else if (wrapped.nextIsPrefixOperator()) {
    let unaryOperator = createUnaryOperator(wrapped.getNext().value);
    pushOperator(unaryOperator, shuntingYard);
    wrapped.consume();
    parseSingleOperandExpression(wrapped, shuntingYard);
  }
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

function parseTerminal(wrapped) {
  const number = parseNumber(wrapped);
  if (number) return number;

  const text = parseText(wrapped);
  if (text) return text;

  const boolean = parseBoolean(wrapped);
  if (boolean) return boolean;

  const range = parseRange(wrapped);
  if (range) return range;
}

function parseRange(wrapped) {
  const next = wrapped.getNext();
  if (next.type == 'operand' && next.subtype == 'range') {
    wrapped.consume();
    return createCellRangeNode(next.value);
  }
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

function parseText(wrapped) {
  const next = wrapped.getNext();
  if (next.type == 'operand' && next.subtype == 'text') {
    wrapped.consume();
    return {
      type: 'text',
      value: next.value
    };
  }
}

function parseBoolean(wrapped) {
  const next = wrapped.getNext();
  if (next.type == 'operand' && next.subtype == 'logical') {
    wrapped.consume();
    return {
      type: 'boolean',
      value: next.value == 'TRUE'
    };
  }
}

function parseNumber(wrapped) {
  const next = wrapped.getNext();
  if (next.type == 'operand' && next.subtype == 'number') {
    const number = {
      type: 'number',
      value: Number(next.value)
    };
    wrapped.consume();

    if (wrapped.nextIsPostfixOperator()) {
      number.value *= 0.01;

      wrapped.consume();
    }

    return number;
  }
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

function wrap(tokens) {
  const end = {};
  const arr = [...tokens, end];
  let index = 0;

  return {
    getNext() {
      return arr[index];
    },
    nextIsOpenParen() {
      return this.getNext().type == 'subexpression' && this.getNext().subtype == 'start'
    },
    nextIsTerminal() {
      const next = this.getNext();
      if (next.type == 'operand' && next.subtype == 'number') return true;
      if (next.type == 'operand' && next.subtype == 'text') return true;
      if (next.type == 'operand' && next.subtype == 'logical') return true;
      if (next.type == 'operand' && next.subtype == 'range') return true;
      return false;
    },
    nextIsFunctionCall() {
      return this.getNext().type == 'function' && this.getNext().subtype == 'start';
    },
    nextIsFunctionArgumentSeparator() {
      return this.getNext().type == 'argument';
    },
    nextIsEndOfFunctionCall() {
      return this.getNext().type == 'function' && this.getNext().subtype == 'stop';
    },
    nextIsBinaryOperator() {
      return this.getNext().type == 'operator-infix';
    },
    nextIsPrefixOperator() {
      return this.getNext().type == 'operator-prefix';
    },
    nextIsPostfixOperator() {
      return this.getNext().type == 'operator-postfix';
    },
    consume() {
      index += 1;
    },
    hasEnded() {
      return index >= arr.length - 1;
    }
  };
}
