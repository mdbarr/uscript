'use strict';

require('barrkeep/pp');

const Lexer = require('../lexer');

describe('Lexer Test', () => {
  let lex;

  it('should create a new lexer instance', () => {
    lex = new Lexer([
      {
        type: 'STRING',
        pattern: /"[^"]+"/,
        transform: x => x.substring(1, x.length - 1),
      }, {
        type: 'INTEGER',
        pattern: /\d+/,
        transform: x => parseInt(x, 10),
      }, {
        type: 'FLOAT',
        pattern: /\d+\.\d+/,
        transform: x => parseFloat(x, 10),
      }, {
        type: 'TRUE',
        pattern: /true/,
        transform: () => true,
      }, {
        type: 'FALSE',
        pattern: /false/,
        transform: () => false,
      }, {
        type: 'INCREMENT',
        pattern: /\+\+/,
      }, {
        type: 'DECREMENT',
        pattern: /--/,
      }, {
        type: 'EQUALITY',
        pattern: /==/,
      }, {
        type: 'ASSIGNMENT',
        pattern: /=/,
      }, {
        type: 'OPERATOR',
        pattern: /[+*/-]/,
      }, {
        type: 'SYMBOL',
        pattern: /[a-zA-Z]\w*/,
      }, {
        type: 'EOS',
        pattern: /(;*$|;)/,
      },
    ]);

    expect(lex).toBeInstanceOf(Lexer);
  });

  it('should set the lexer input', () => {
    lex.input('x = 10;');

    expect(lex.buffer).toBe('x = 10;');
    expect(lex.position).toBe(0);
  });

  it('should get a token', () => {
    const token = lex.token();

    expect(token).toHaveProperty('type', 'SYMBOL');
    expect(token).toHaveProperty('value', 'x');
    expect(token).toHaveProperty('position', 0);
  });

  it('should get a second token', () => {
    const token = lex.token();

    expect(token).toHaveProperty('type', 'ASSIGNMENT');
    expect(token).toHaveProperty('value', '=');
    expect(token).toHaveProperty('position', 2);
  });

  it('should get a third token', () => {
    const token = lex.token();

    expect(token).toHaveProperty('type', 'INTEGER');
    expect(token).toHaveProperty('value', 10);
    expect(token).toHaveProperty('position', 4);
  });

  it('should get a fourth token', () => {
    const token = lex.token();

    expect(token).toHaveProperty('type', 'EOS');
    expect(token).toHaveProperty('value', ';');
    expect(token).toHaveProperty('position', 6);
  });

  it('should attempt to get a fifth token', () => {
    const token = lex.token();

    expect(token).toBe(null);
  });

  it('should parse a complex string', () => {
    const tokens = lex.tokenize('x = "fooooo" + y++ 10');

    expect(tokens).toHaveLength(7);
    // console.pp(tokens);
  });
});
