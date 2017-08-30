import * as TOKENS from 'excel-formula-tokenizer';
type Node = BinaryExpressionNode | UnaryExpressionNode | FunctionNode | NumberNode | CellNode | LogicalNode | TextNode | CellRangeNode;

interface BinaryExpressionNode {
  type: 'binary-expression',
  operator: '>' | '<' | '=' | '>=' | '<=' | '+' | '-' | '&',
  left: Node,
  right: Node
}
interface UnaryExpressionNode {
  type: 'unary-expression',
  operator: '+' | '-',
  operand: Node
}

interface FunctionNode {
  type: 'function',
  name: string,
  arguments: Node[]
}
interface NumberNode {
  type: 'number',
  value: number
}
interface CellNode {
  type: 'cell',
  refType?: 'relative' | 'mixed' | 'absolute',
  key: string
}
interface CellRangeNode {
  type: 'cell-range',
  left: Node,
  right: Node
}
interface LogicalNode {
  type: 'logical',
  value: boolean
}
interface TextNode {
  type: 'text',
  value: string
}
declare function buildTree(tokens: TOKENS.Token[]): Node;
interface Visitor {
  enterCell?(node: CellNode): void;
  exitCell?(node: CellNode): void;

  enterCellRange?(node: CellRangeNode): void;
  exitCellRange?(node: CellRangeNode): void;

  enterFunction?(node: FunctionNode): void;
  exitFunction?(node: FunctionNode): void;

  enterNumber?(node: NumberNode): void;
  exitNumber?(node: NumberNode): void;

  enterText?(node: TextNode): void;
  exitText?(node: TextNode): void;

  enterLogical?(node: LogicalNode): void;
  exitLogical?(node: LogicalNode): void;

  enterBinaryExpression?(node: BinaryExpressionNode): void;
  exitBinaryExpression?(node: BinaryExpressionNode): void;

  enterUnaryExpression?(node: UnaryExpressionNode): void;
  exitUnaryExpression?(node: UnaryExpressionNode): void;
}
declare function visit(tree: Node, visitor: Visitor): void;
