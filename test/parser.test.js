'use strict';

require('barrkeep/pp');

const Parser = require('../parser');

describe('Parser Test', () => {
  let parser;

  it('should create a new parser instance', () => {
    parser = new Parser({
      Expression: 'AssignmentExpression | SYMBOL | Value',
      AssignmentExpression: 'SYMBOL ASSIGNMENT Value',
      Value: 'Number | Boolean',
      Number: 'INTEGER | FLOAT',
      Boolean: 'TRUE | FALSE'
    }, 'Expression');
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
    } ]);

    console.pp(tree);
  });
});
