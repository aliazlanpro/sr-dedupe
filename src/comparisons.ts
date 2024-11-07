import jaroWinklerDistance from 'jaro-winkler';
import _ from 'lodash';

/**
 * This module provides various comparison methods for strings and arrays.
 *
 * Available comparison methods:
 * - exact: Performs a simple character-by-character exact comparison.
 * - exactTruncate: Performs an exact comparison but truncates strings to the shortest length.
 * - jaroWinkler: Calculates the string distance/difference using the Jaro-Winkler metric.
 * - random: Ignores comparisons and picks a random number between 0 and 1.
 */
export const comparisons = {
  exact: {
    title: 'Exact comparison',
    description: 'Simple character-by-character exact comparison',
    handler: (a: string | any[], b: string | any[]) => {
      if (Array.isArray(a) && Array.isArray(b)) {
        return JSON.stringify(a) == JSON.stringify(b) ? 1 : 0;
      }
      return a == b ? 1 : 0;
    },
  },
  exactTruncate: {
    title: 'Exact comparison with truncate',
    description: 'Exact comparison but truncate strings to the shortest',
    handler: (a: string, b: string) =>
      a.slice(0, Math.min(a.length, b.length)) ===
      b.slice(0, Math.min(a.length, b.length))
        ? 1
        : 0,
  },
  jaroWinkler: {
    title: 'Jaro-Winkler',
    description:
      'String distance / difference calculator using the [Jaro-Winkler metric](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance)',
    handler: (a: string, b: string) => jaroWinklerDistance(a, b),
  },
  random: {
    title: 'Random',
    description: 'Ignore comparisons and pick a number between 0 and 1',
    handler: (a: string, b: string) => _.random(0, 1, true),
  },
};
