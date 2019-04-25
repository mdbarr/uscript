'use strict';

//////////

function Node(type) {
  this.type = type;
}

//////////

function Parser(grammar, base, options = {}) {
  const self = this;

  self.base = base;

  for (const type in grammar) {
    self[type] = function() {
      console.log('evaluating', type);
      const node = new Node(type);
      const acceptors = grammar[type].split('|').map((x) => { return x.trim(); });

      console.log(type, acceptors);

      const state = self.tokens.slice();
      const current = self.current;

      for (const acceptor of acceptors) {
        const items = acceptor.split(/\s+/).map((x) => { return x.trim(); });

        console.log('state', state);

        const values = items.map(item => {
          const token = self.current;

          console.log('token', token);

          if (self[item]) {
            console.log('subtype', item);
            const value = self[item]();
            if (!value) {
              console.log('nope');
              return false;
            } else {
              console.log('yup');
              return value
            }
          } else {
            console.log('implicit type', item, self.current);
            if (self.accept(item)) {
              console.log('yup', item);
              return token;
            } else {
              console.log('nope', item);
              return false;
            }
          }
        });

        console.log('values', values);

        if (!values || values.includes(false)) {
          self.tokens = state;
          self.current = current;
        } else {
          if (values.length === 1) {
            node.value = values[0];
          } else {
            node.values = values;
          }
          return node;
        }
      }
      return false;
    };
  }
}

Parser.prototype.next = function() {
  if (this.tokens && this.tokens.length) {
    this.current = this.tokens.shift();
    return this.current;
  }
  return null;
};

Parser.prototype.accept = function(type) {
  if (this.current && this.current.type === type) {
    this.next();
    return true;
  }
  return false;
};

Parser.prototype.parse = function(tokens) {
  this.tokens = tokens;
  this.next();
  if (this[this.base]) {
    return this[this.base]();
  } else {
    return null;
  }
};

Parser.prototype.simplify = function(tree) {
  if (tree.value) {
    tree = this.simplify(tree.value);
  } else if (tree.values) {
    for (let i = 0; i < tree.values.length; i++) {
      tree.values[i] = this.simplify(tree.values[i]);
    }
  }
  return tree;
}

module.exports = Parser;
