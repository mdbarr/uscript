'use strict';

//////////

function Node(type) {
  this.type = type;
  this.object = 'ast-node';
}

//////////

function Parser(grammar, base) {
  const self = this;

  self.base = base;

  self.$rules = {};

  self.rules = {
    has: (type) => {
      return Boolean(self.$rules.hasOwnProperty(type));
    },
    register: (type, acceptor) => {
      self.$rules[type] = acceptor;
    },
    run: (type) => {
      return self.$rules[type]();
    }
  };

  for (const type in grammar) {
    self.rules.register(type, () => {
      if (self.$depth > self.$maxDepth) {
        return false;
      }
      self.$depth++;

      // console.log(self.$indent(), 'evaluating', type);
      const node = new Node(type);
      const acceptors = grammar[type].split('|').map((x) => { return x.trim(); });

      // console.log(self.$indent(), type, acceptors);

      if (self.remaining() === 0) {
        // console.log(self.$indent(), 'none remaining');
        return false;
      }

      for (const acceptor of acceptors) {
        const items = acceptor.split(/\s+/).map((x) => { return x.trim(); });

        // console.log(self.$indent(), 'acceptor', acceptor);
        // console.log(self.$indent(), 'items', items.length);
        // console.log(self.$indent(), 'remaining', self.remaining());

        const values = [];

        for (const item of items) {
          const token = self.token();
          // console.log(self.$indent(), `acceptor-${ self.$depth }`, item, token);

          if (self.rules.has(item)) {
            // console.log(self.$indent(), 'subtype', item);
            const value = self.rules.run(item);
            if (!value) {
              // console.log(self.$indent(), 'subtype - nope', value);
              break;
            } else {
              // console.log(self.$indent(), 'subtype - yup');
              values.push(value);
              continue;
            }
          }
          // console.log(self.$indent(), 'implicit type', item, self.token());
          if (self.accept(item)) {
            // console.log(self.$indent(), 'implicit type - yup', item);
            values.push(token);
          } else {
            // console.log(self.$indent(), 'implicit type - nope', item);
            break;
          }
        }
        // console.log(self.$indent(), 'item loop done');

        // console.log(self.$indent(), 'done - values', values.length, items.length);
        if (values.length !== items.length) {
          for (const value of values) {
            self.reject(value);
          }
        } else if (values.length !== 0) {
          if (values.length === 1) {
            node.value = values[0];
          } else {
            node.values = values;
          }
          self.$depth--;
          return node;
        }
      }
      // console.log(self.$indent(), 'acceptor loop done');
      self.$depth--;
      return false;
    });
  }
}

Parser.prototype.remaining = function() {
  return this.$tokens.length - this.$index;
};

Parser.prototype.next = function() {
  this.$index++;
};

Parser.prototype.token = function() {
  return this.$tokens[this.$index];
};

Parser.prototype.$indent = function() {
  return '  '.repeat(this.$depth - 1);
};

Parser.prototype.accept = function(type) {
  if (this.$index < this.$tokens.length) {
    const token = this.$tokens[this.$index];
    if (token.type === type || token.value === type) {
      // console.log(this.$indent(), 'accept', this.$index, this.$tokens.length - 1);
      this.next();
      return true;
    }
  }
  return false;
};

Parser.prototype.reject = function() {
  if (this.$index > 0) {
    this.$index--;
  }
};

Parser.prototype.$maxDepth = 1000;

Parser.prototype.parse = function(tokens) {
  this.$tokens = tokens;
  this.$index = 0;

  this.$depth = 0;

  if (this.rules.has(this.base)) {
    const result = this.rules.run(this.base);
    // console.log('remaining', this.remaining(), this.token());
    return result;
  }

  return null;
};

Parser.prototype.simplify = function(tree) {
  if (!tree) {
    return null;
  } else if (tree.value && tree.object === 'ast-node') {
    tree = this.simplify(tree.value);
  } else if (tree.values) {
    for (let i = 0; i < tree.values.length; i++) {
      if (tree.values[i].object === 'ast-node') {
        tree.values[i] = this.simplify(tree.values[i]);
      }
    }
  }
  return tree;
};

module.exports = Parser;
