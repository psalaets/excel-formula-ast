# excel-formula-ast

Abstract syntax tree for excel formulas.

## Install

`npm install excel-formula-ast -S`

or

`yarn add excel-formula-ast`

## Usage

```js
const {tokenize} = require('excel-formula-tokenizer');
const {buildTree, visit} = require('excel-formula-ast');

const formula = 'SUM(1, 2)';
const tokens = tokenize(formula);

// build tree
const tree = buildTree(tokens);

// create visitor for parts of tree you're interested in
const visitor = {
  enterFunction(functionNode) {
    console.log(`function is ${functionNode.name}`);
  },
  enterNumber(numberNode) {
    console.log(`number is ${numberNode.value}`)
  }
};

// send visitor through tree
visit(tree, visitor);

// prints:
// function is SUM
// number is 1
// number is 2
```

## API

### buildTree(tokens)

Accepts tokens from `excel-formula-tokenizer` and builds expression tree.

### visit(tree, visitor)

Send a visitor through the tree nodes.

#### visitor

Object with any of these function properties:

```js
{
  enterCell(node) {},
  exitCell(node) {},

  enterCellRange(node) {},
  exitCellRange(node) {},

  enterFunction(node) {},
  exitFunction(node) {},

  enterNumber(node) {},
  exitNumber(node) {},

  enterText(node) {},
  exitText(node) {},

  enterLogical(node) {},
  exitLogical(node) {},

  enterBinaryExpression(node) {},
  exitBinaryExpression(node) {},

  enterUnaryExpression(node) {},
  exitUnaryExpression(node) {}
}
```

For any node type Foo, `enterFoo()` is called when the visitor gets to a Foo node. `exitFoo()` is called when the visitor has visited all of the Foo's children (if any) and is leaving the Foo.

##  License

MIT
