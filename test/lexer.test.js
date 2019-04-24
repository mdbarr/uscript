'use strict';

const Lexer = require('../lexer');

describe('Lexer Test', () => {
  let lex;

  it('should create a new lexer instance', () => {
    lex = new Lexer({
      STRING: /"[^"]+"/,
      INTEGER: /\d+/,
      FLOAT: /\d+\.\d+/,
      TRUE: /true/,
      FALSE: /false/,
      INCREMENT: /\+\+/,
      DECREMENT: /--/,
      EQUALITY: /==/,
      ASSIGNMENT: /=/,
      OPERATOR: /[+*/-]/,
      SYMBOL: /[a-zA-Z]\w*/
    });

    expect(lex).toBeInstanceOf(Lexer);
  });

  it('should set the lexer input', () => {
    lex.input('x = 10');

    expect(lex.buffer).toBe('x = 10');
  });

  it('should get a token', () => {
    const token = lex.token();

    expect(token).toHaveProperty('type', 'SYMBOL');
    expect(token).toHaveProperty('value', 'x');
    expect(token).toHaveProperty('position', 0);
  });

  it('should get a second token', () => {
    const token = lex.token();

    expect(token).toHaveProperty('type', 'INTEGER');
    expect(token).toHaveProperty('value', '10');
    expect(token).toHaveProperty('position', 4);
  });

  it('should parse a complex string', () => {
    const tokens = lex.parse('x = "fooooo" + y++');

    expect(tokens).toHaveLength(6);
  });
});
