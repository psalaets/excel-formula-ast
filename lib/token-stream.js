module.exports = create;

/**
* @param Object[] tokens - Tokens from excel-formula-tokenizer
*/
function create(tokens) {
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
    }
  };
}
