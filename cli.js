#!/usr/bin/env node
'use strict';

require('barrkeep/pp');
const Uscript = require('./uscript');
const uscript = new Uscript();

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'uscript> ',
});

rl.prompt();

rl.on('line', (line) => {
  try {
    const result = uscript.eval(line);
    console.pp(result);
  } catch (error) {
    console.log(error);
  }

  rl.prompt();
}).on('close', () => {
  console.log('EOF');
  process.exit(0);
});
