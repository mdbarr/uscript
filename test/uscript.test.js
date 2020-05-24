'use strict';

const Uscript = require('../uscript');
const { bytes } = require('barrkeep/transforms');

describe('Scripting testing', () => {
  const environment = {
    foo: 'bar',
    i: { j: { k: 20 } },
    x: 10,
    _f: () => 30,
    bytes,
  };

  let uscript;

  it('should create a new uscript instance', () => {
    uscript = new Uscript({
      environment,
      shims: true,
    });
  });

  it('should evaluate a variable lookup', () => {
    const result = uscript.eval('x');

    expect(result).toBe(10);
  });

  it('should evaluate a literal values', () => {
    expect(λ('10')).toBe(10);
    expect(λ('true')).toBe(true);
    expect('false'.µ).toBe(false);
    expect('"true"'.µ).toBe('true');
  });

  it('should evaluate a variable update', () => {
    uscript.eval('x = 20');

    expect(environment).toHaveProperty('x', 20);
    expect(environment).toHaveProperty('foo', 'bar');
  });

  it('should evaluate a variable definition', () => {
    uscript.eval('y = 30');

    expect(environment).toHaveProperty('y', 30);
  });

  it('should evaluate an expression', () => {
    const result = uscript.eval('10 + 20');

    expect(result).toBe(30);
  });

  it('should evaluate a compound expression', () => {
    const result = uscript.eval('10 + 20 * 3');

    expect(result).toBe(70);
  });

  it('should evaluate a compound assignment', () => {
    const result = uscript.eval('z = 20 + 30 - 40');

    expect(result).toBe(10);
    expect(environment).toHaveProperty('z', 10);
  });

  it('should evaluate negation expressions', () => {
    expect('!false'.µ).toBe(true);
    expect('!true'.µ).toBe(false);
    expect('!10'.µ).toBe(false);
    expect('!!10'.µ).toBe(true);
  });

  it('should evaluate a compound dot expression', () => {
    expect('i.j.k'.µ).toBe(20);
  });

  it('should evaluate a function expression', () => {
    expect('_f()'.µ).toBe(30);
  });

  it('should evaluate a filter expression', () => {
    expect('2439673 | bytes'.µ).toBe('2.327 MB');
  });
});
