'use strict';

require('barrkeep/pp');

const Parser = require('../parser');

describe('Parser Test', () => {
  let parser;
  let tree;

  it('should create a new parser instance', () => {
    parser = new Parser({
      Statement: 'AssignmentExpression | Expression | SYMBOL | Value',
      Expression: 'Value OPERATOR Expression | Value OPERATOR Value | Value',
      AssignmentExpression: 'SYMBOL ASSIGNMENT Expression',
      Value: 'Number | Boolean | STRING',
      Number: 'INTEGER | FLOAT',
      Boolean: 'TRUE | FALSE'
    }, 'Statement');
  });

  it('should parse a simple expression', () => {
    tree = parser.parse([ {
      type: 'SYMBOL',
      value: 'x'
    }, {
      type: 'ASSIGNMENT',
      value: '='
    }, {
      type: 'INTEGER',
      value: 10
    }, {
      type: 'OPERATOR',
      value: '+'
    }, {
      type: 'INTEGER',
      value: 20
    }, {
      type: 'OPERATOR',
      value: '-'
    }, {
      type: 'INTEGER',
      value: 30
    } ]);

    expect(tree).toHaveProperty('type', 'Statement');
  });

  it('should simplify the parse tree', () => {
    const simple = parser.simplify(tree);

    expect(simple).toHaveProperty('type', 'AssignmentExpression');
  });
});
