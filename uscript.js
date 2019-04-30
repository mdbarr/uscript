'use strict';

require('barrkeep/pp');
const Lexer = require('./lexer');
const Parser = require('./parser');

const rules = [
  {
    type: 'STRING',
    pattern: /"[^"]+"/,
    transform: x => { return x.substring(1, x.length - 1); }
  }, {
    type: 'INTEGER',
    pattern: /\d+/,
    transform: x => { return parseInt(x, 10); }
  }, {
    type: 'FLOAT',
    pattern: /\d+\.\d+/,
    transform: x => { return parseFloat(x, 10); }
  }, {
    type: 'TRUE',
    pattern: /true/,
    transform: () => { return true; }
  }, {
    type: 'FALSE',
    pattern: /false/,
    transform: () => { return false; }
  }, {
    type: 'INCREMENT',
    pattern: /\+\+/
  }, {
    type: 'DECREMENT',
    pattern: /--/
  }, {
    type: 'EQUALITY',
    pattern: /==/
  }, {
    type: 'ASSIGNMENT',
    pattern: /=/
  }, {
    type: 'NEGATION',
    pattern: /!/
  }, {
    type: 'DOT',
    pattern: /\./
  }, {
    type: 'OPERATOR',
    pattern: /[+*/-]/
  }, {
    type: 'SYMBOL',
    pattern: /[a-zA-Z]\w*/
  }
];

const grammar = {
  Statement: 'AssignmentExpression | NegationExpression | DotExpression | Expression | Term',
  Expression: 'Term OPERATOR Expression | Term',
  AssignmentExpression: 'SYMBOL ASSIGNMENT Expression',
  NegationExpression: 'NEGATION Statement',
  DotExpression: 'SYMBOL DOT DotExpression | SYMBOL',
  Term: 'SYMBOL | Value',
  Value: 'Number | Boolean | STRING',
  Number: 'INTEGER | FLOAT',
  Boolean: 'TRUE | FALSE'
};

function Uscript({
  environment = {}, shims = false
} = {}) {
  this.lexer = new Lexer(rules);
  this.parser = new Parser(grammar, 'Statement');

  this.environment = environment;
  if (!Array.isArray(this.environment)) {
    this.environment = [ this.environment ];
  }

  if (shims) {
    const λ = (x) => {
      return this.eval(x);
    };

    global.λ = λ;

    Object.defineProperty(String.prototype, 'µ', {
      get() { return λ(this); },
      enumerable: false,
      configurable: true
    });
  }
}

Uscript.add = function(a, b) {
  return a + b;
};

Uscript.subtract = function(a, b) {
  return a - b;
};

Uscript.divide = function(a, b) {
  return a / b;
};

Uscript.multiply = function(a, b) {
  return a * b;
};

Uscript.prototype.eval = function(script, environment) {
  const tokens = this.lexer.tokenize(script);
  // console.pp(tokens);
  const ast = this.parser.parse(tokens);
  const tree = this.parser.simplify(ast);

  const local = this.environment.slice();
  if (environment) {
    local.unshift(environment);
  }

  function findFrame(variable) {
    for (let i = 0; i < local.length; i++) {
      if (local[i].hasOwnProperty(variable)) {
        return local[0];
      }
    }
    return local[0];
  }

  function lookup(variable, frame) {
    if (frame) {
      return frame[variable];
    }

    for (let i = 0; i < local.length; i++) {
      if (local[i].hasOwnProperty(variable)) {
        return local[i][variable];
      }
    }
    return undefined;
  }

  function resolve(object, frame) {
    // "Native" type
    if (object.type === 'INTEGER' || object.type === 'FLOAT' ||
        object.type === 'STRING' || object.type === 'TRUE' ||
       object.type === 'FALSE' ) {
      return object.value;
    } else if (object.type === 'SYMBOL') {
      return lookup(object.value, frame);
    } else if (object.type === 'OPERATOR') {
      if (object.value === '+') {
        return Uscript.add;
      } else if (object.value === '-') {
        return Uscript.subtract;
      } else if (object.value === '/') {
        return Uscript.divide;
      } else if (object.value === '*') {
        return Uscript.multiply;
      }
    } else if (object.type === 'Expression') {
      const a = resolve(object.values[0]);
      const op = resolve(object.values[1]);
      const b = resolve(object.values[2]);
      return op(a, b);
    } else if (object.type === 'AssignmentExpression') {
      const variable = object.values[0].value;
      const value = resolve(object.values[2]);

      frame = findFrame(variable);
      frame[variable] = value;

      // console.log(variable, '=', value);
      // console.log(frame);
      return value;
    } else if (object.type === 'NegationExpression') {
      const value = resolve(object.values[1]);
      return !value;
    } else if (object.type === 'DotExpression') {
      // console.log('object');
      // console.pp(object);
      frame = lookup(object.values[0].value, frame);
      // console.log('frame');
      // console.pp(frame);
      const result = resolve(object.values[2], frame);
      // console.log('result');
      // console.pp(result);
      return result;
    }
    return false;
  }

  // console.pp(tree);

  const result = resolve(tree);
  // console.log(result);

  return result;
};

module.exports = Uscript;
