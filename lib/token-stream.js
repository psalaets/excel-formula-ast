module.exports = create;

/**
* @param Object[] tokens - Tokens from excel-formula-tokenizer
*/
function create(tokens) {
  const end = {};
  const arr = [...tokens, end];
  let index = 0;

  return {
    consume() {
      index += 1;
    },
    getNext() {
      return arr[index];
    },
    nextIs(type, subtype) {
      if (this.getNext().type !== type) return false;
      if (subtype && this.getNext().subtype !== subtype) return false;
      return true;
    },
    nextIsOpenParen() {
      return this.nextIs('subexpression', 'start');
    },
    nextIsTerminal() {
      if (this.nextIs('operand', 'number')) return true;
      if (this.nextIs('operand', 'text')) return true;
      if (this.nextIs('operand', 'logical')) return true;
      if (this.nextIs('operand', 'range')) return true;
      return false;
    },
    nextIsFunctionCall() {
      return this.nextIs('function', 'start');
    },
    nextIsFunctionArgumentSeparator() {
      return this.nextIs('argument');
    },
    nextIsEndOfFunctionCall() {
      return this.nextIs('function', 'stop');
    },
    nextIsBinaryOperator() {
      return this.nextIs('operator-infix');
    },
    nextIsPrefixOperator() {
      return this.nextIs('operator-prefix');
    },
    nextIsPostfixOperator() {
      return this.nextIs('operator-postfix');
    }
  };
}
