'use strict';

function Lexer (rules, { ignoreWhitespace = true } = {}) {
  this.patterns = [];

  for (const item of rules) {
    const pattern = {
      type: item.type || item.name,
      pattern: item.pattern,
      transform: item.transform,
    };

    if (item.pattern instanceof RegExp) {
      let source = item.pattern.source;
      if (!source.startsWith('^')) {
        source = `^${ source }`;
      }
      pattern.regexp = new RegExp(source, item.pattern.flags);
    } else {
      pattern.regexp = new RegExp(pattern.pattern);
    }

    this.patterns.push(pattern);
  }

  this.whitespace = ignoreWhitespace ? /^\s+/ : null;

  this.input('');
}

Lexer.prototype.input = function(buffer) {
  this.buffer = buffer;
  this.position = 0;
};

Lexer.prototype.token = function() {
  if (this.position >= this.buffer.length) {
    return null;
  }

  const string = this.buffer.substring(this.position);

  if (this.whitespace) {
    const match = string.match(this.whitespace);
    if (Array.isArray(match)) {
      this.position += match[0].length;
      return this.token();
    }
  }

  for (const pattern of this.patterns) {
    const match = string.match(pattern.regexp);
    if (Array.isArray(match)) {
      const value = pattern.transform ? pattern.transform(match[0], match) : match[0];
      const result = {
        type: pattern.type,
        value,
        position: this.position,
      };
      this.position += match[0].length;

      return result;
    }
  }

  throw Error(`Unknown lexical token at pos ${ this.position }: "${ string }"`);
};

Lexer.prototype.tokenize = function(input) {
  this.input(input);

  const tokens = [];
  for (let token = this.token(); token !== null; token = this.token()) {
    tokens.push(token);
  }

  return tokens;
};

module.exports = Lexer;
