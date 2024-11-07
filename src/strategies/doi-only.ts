import type { Strategy } from '../types.js';

/**
 * Compare references against DOI fields only
 */
export const doiOnly: Strategy = {
  title: 'DOI only',
  description: 'Compare references against DOI fields only',
  mutators: {
    doi: 'doiRewrite',
  },
  steps: [
    {
      sort: 'doi',
      fields: ['doi'],
      comparison: 'exact',
    },
  ],
};
