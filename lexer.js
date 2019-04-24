#!/usr/bin/env node
'use strict';

function Lexer(rules, { ignoreWhitespace = true } = {}) {
  const keys = [];
  const patterns = [];
  for (const name in rules) {
    const pattern = `(${ rules[name].source })`;
    keys.push(name);
    patterns.push(pattern);
  }

  this.buffer = '';
  this.keys = keys;

  this.regexp = new RegExp(patterns.join('|'), 'g');
  this.regexp.lastIndex = 0;

  this.whitespace = ignoreWhitespace ? /\S/g : null;
}

Lexer.prototype.input = function(buffer) {
  this.buffer = buffer;
  this.regexp.lastIndex = 0;
};

Lexer.prototype.token = function() {
  if (this.regexp.lastIndex >= this.buffer.length) {
    return null;
  }

  if (this.whitespace) {
    this.whitespace.lastIndex = this.regexp.lastIndex;
    const match = this.whitespace.exec(this.buffer);
    if (match) {
      this.regexp.lastIndex = match.index;
    } else {
      return null;
    }
  }

  const result = this.regexp.exec(this.buffer);
  if (result === null) {
    throw Error(`Cannot match a token at position ${ this.regexp.lastIndex }`);
  } else {
    for (let i = 0; i < this.keys.length; i++) {
      if (result[i + 1] !== undefined) {
        return {
          type: this.keys[i],
          value: result[0],
          position: result.index
        };
      }
    }
    console.log(result);
    throw Error('Unknown lexical token at ${ result.index }');
  }
};

Lexer.prototype.parse = function(input) {
  this.input(input);

  const tokens = [];
  for (let token = this.token(); token !== null; token = this.token()) {
    tokens.push(token);
  }

  return tokens;
};

module.exports = Lexer;
