// https://www.engr.mun.ca/~theo/Misc/exp_parsing.htm

module.exports = parseFormula;

function parseFormula(tokens) {
  const wrapped = wrap(tokens);

  let expr = parseExpression(wrapped);
  return expr;
}

function parseExpression(wrapped) {
  const single = parseSingleOperandExpression(wrapped);

  if (single) {
    if (wrapped.nextIsBinaryOperator()) {
      const operator = parseBinaryOperator(wrapped);
      const rightSide = parseSingleOperandExpression(wrapped);

      return {
        type: 'binary-expression',
        left: single,
        operator: operator,
        right: rightSide
      };
    }

    return single;
  }

  const fn = parseFunctionCall(wrapped);
  return fn;
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

function parseBinaryOperator(wrapped) {
  const next = wrapped.getNext();
  if (next.type == 'operator-infix') {
    wrapped.consume();
    return next.value;
  }
}

function parseSingleOperandExpression(wrapped) {
  const prefixExpression = parsePrefixExpression(wrapped);
  if (prefixExpression) return prefixExpression;

  const parenExpression = parseParenExpression(wrapped);
  if (parenExpression) return parenExpression;

  const literal = parseLiteral(wrapped);
  if (literal) return literal;
}

function parseLiteral(wrapped) {
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

function parsePrefixExpression(wrapped) {
  if (wrapped.nextIsPrefixOperator()) {
    const operator = wrapped.getNext().value;
    wrapped.consume();
    const operand = parseSingleOperandExpression(wrapped);
    return {
      type: 'prefix-expression',
      operator: operator,
      operand: operand
    };
  }
}

function parseParenExpression(wrapped) {
  const next = wrapped.getNext();
  if (next.type == 'subexpression' && next.subtype == 'start') {
    wrapped.consume();
    const expression = parseExpression(wrapped);
    wrapped.consume(); // close paren
    return expression;
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

function wrap(tokens) {
  const end = {};
  const arr = [...tokens, end];
  let index = 0;

  return {
    getNext() {
      return arr[index];
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
