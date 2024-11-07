import type { Strategy } from '../types.js';

/**
 * Forbes Automated Deduplication Sweep (Cautious) with minimal false positives
 */
export const forbesMinFp: Strategy = {
  title: 'Forbes Automated Deduplication Sweep (Cautious)',
  description: 'Deduplication Sweep with Low Rate of False Positives',
  mutators: {
    authors: 'authorRewriteSingle',
    doi: 'doiRewrite',
    title: ['stripHtmlTags', 'deburr', 'alphaNumericOnly', 'noCase', 'noSpace'],
    journal: 'noCase',
    year: 'numericOnly',
    pages: 'consistentPageNumbering',
  },
  steps: [
    // Higher accuracy without doi
    // {
    // 	fields: ['doi'],
    // 	sort: 'doi',
    // 	comparison: 'exact',
    // },
    {
      fields: ['title', 'volume', 'authors'],
      sort: 'title',
      comparison: 'exact',
    },
    {
      fields: ['title', 'doi'],
      sort: 'title',
      comparison: 'exact',
    },
    {
      fields: ['pages', 'authors', 'volume'],
      sort: 'pages',
      comparison: 'exact',
    },
    {
      fields: ['pages', 'title'],
      sort: 'pages',
      comparison: 'exact',
    },
    {
      fields: ['pages', 'journal', 'volume', 'authors'],
      sort: 'pages',
      comparison: 'exact',
    },
  ],
};
