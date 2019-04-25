'use strict';

require('barrkeep/pp');

const Parser = require('../parser');

describe('Parser Test', () => {
  let parser;

  it('should create a new parser instance', () => {
    parser = new Parser({
      Statement: 'AssignmentExpression | Expression | SYMBOL | Value',
      Expression: 'Value OPERATOR Value | Value',
      AssignmentExpression: 'SYMBOL ASSIGNMENT Expression',
      Value: 'Number | Boolean',
      Number: 'INTEGER | FLOAT',
      Boolean: 'TRUE | FALSE'
    }, 'Statement');
  });

  it('should parse a simple expression', () => {
    const tree = parser.parse([ {
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
    } ]);

    console.pp(tree);

    const simple = parser.simplify(tree);
    console.pp(simple);
  });
});
