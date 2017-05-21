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

```js
const {buildTree, visit} = require('excel-formula-ast');
```

### buildTree(tokens)

Build expression tree from tokens.

- tokens: Array of objects - Tokens from `excel-formula-tokenizer` ([github](https://github.com/psalaets/excel-formula-tokenizer) | [npm](https://www.npmjs.com/package/excel-formula-tokenizer))

Returns: [ast node](https://github.com/psalaets/excel-formula-ast#node-types)

### visit(tree, visitor)

Send a visitor through the tree nodes.

- tree: [ast node](https://github.com/psalaets/excel-formula-ast#node-types)
- visitor: object

#### visitor

Visitor is an object with any of these function properties:

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

For any node type Foo

- `enterFoo()` is called when the visitor gets to a Foo node.
- `exitFoo()` is called when the visitor has visited all of the Foo's child nodes (if any) and is leaving the Foo.

## Node Types

### cell

Passed to visitor methods: `enterCell`, `exitCell`

Properties:

- type: string - `'cell'`
- key: string - Excel cell number. Example: `'A1'`
- refType: string - `'relative' | 'mixed' | 'absolute'`

### cell range

Passed to visitor methods: `enterCellRange`, `exitCellRange`

Properties:

- type: string - `'cell-range'`
- left: cell node
- right: cell node

### function

Passed to visitor methods: `enterFunction`, `exitFunction`

Properties:

- type: string - `'function'`
- name: string - function name
- arguments: Array of node

### number

Passed to visitor methods: `enterNumber`, `exitNumber`

Properties:

- type: string - `'number'`
- value: number

### text

Passed to visitor methods: `enterText`, `exitText`

Properties:

- type: string - `'text'`
- value: string

### logical

Passed to visitor methods `enterLogical`, `exitLogical`

Properties:

- type: string - `'logical'`
- value: boolean

### binary expression

Passed to visitor methods: `enterBinaryExpression`, `exitBinaryExpression`

Properties:

- type: string - `binary-expression`
- operator: string
- left: node
- right: node

### unary expression

Passed to visitor methods: `'enterUnaryExpression'`, `'exitUnaryExpression'`

Properties:

- type: string - `'unary-expression'`
- operator: string
- operand: node

##  License

MIT
