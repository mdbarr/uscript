#!/usr/bin/env node
'use strict';

const Lexer = require('./lexer');
const Parser = require('./parser');

Object.defineProperty(String.prototype, 'µ', {
  value() {
    return 'µscript';
  },
  enumerable: false,
  configurable: true
});

const λ = function() {
  return 'µscript';
};

module.exports = {
  Lexer,
  Parser,
  λ
};
