import { expect, describe, it } from 'vitest';
import { comparisons } from '../src/index.js';

describe('Comparisons', () => {
  it('exact', () => {
    expect(comparisons.exact.handler('one', 'one')).toBe(1);
    expect(comparisons.exact.handler('One', 'one')).toBe(0);
    expect(comparisons.exact.handler('one', 'on!')).toBe(0);
    expect(comparisons.exact.handler(' ne', 'one')).toBe(0);
  });

  it('exactTruncate', () => {
    expect(comparisons.exactTruncate.handler('one', 'one')).toBe(1);
    expect(comparisons.exactTruncate.handler('oneTwo', 'one')).toBe(1);
    expect(comparisons.exactTruncate.handler('abcde', 'ab')).toBe(1);
    expect(comparisons.exactTruncate.handler('oneTwoThree', 'oneTwoFour')).toBe(
      0,
    );
  });

  it('jaroWinkler', () => {
    expect(comparisons.jaroWinkler.handler('one', 'one')).toBe(1);
    expect(comparisons.jaroWinkler.handler('One', 'one')).toBe(
      0.7777777777777777,
    );
    expect(comparisons.jaroWinkler.handler('one', 'on!')).toBe(
      0.8222222222222222,
    );
    expect(comparisons.jaroWinkler.handler('one', 'two')).toBe(0);
    expect(comparisons.jaroWinkler.handler('onetwothree', 'onetXothree')).toBe(
      0.9636363636363636,
    );
  });
});
