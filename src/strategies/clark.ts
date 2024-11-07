import type { Strategy } from '../types.js';

/**
 * IEBH recommended deduplication four step sweep method
 */
export const clark: Strategy = {
  title: 'IEBH Deduplication Sweep',
  description: 'IEBH recommended deduplication four step sweep method',
  mutators: {
    authors: 'authorRewrite',
    doi: 'doiRewrite',
    title: ['deburr', 'alphaNumericOnly', 'noCase'],
    year: 'numericOnly',
  },
  steps: [
    {
      fields: ['doi'],
      sort: 'doi',
      comparison: 'exact',
    },
    {
      fields: ['authors', 'year', 'title', 'volume', 'issue', 'type'],
      sort: 'title',
      comparison: 'exact',
    },
    {
      fields: ['title'],
      sort: 'title',
      comparison: 'exact',
    },
    {
      fields: ['authors', 'year'],
      sort: 'authors',
      comparison: 'exact',
    },
  ],
};
