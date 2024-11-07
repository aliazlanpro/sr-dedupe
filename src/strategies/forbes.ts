import type { Strategy } from '../types.js';

/**
 * Forbes Automated Deduplication Sweep (Balanced) with balanced false positives and false negatives
 */
export const forbes: Strategy = {
  title: 'Forbes Automated Deduplication Sweep (Balanced)',
  description:
    'Deduplication Sweep with balance between False Positives and False Negatives',
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
      fields: ['title', 'volume'],
      sort: 'title',
      comparison: 'exact',
    },
    {
      fields: ['title', 'year'],
      sort: 'title',
      comparison: 'exact',
    },
    {
      fields: ['pages', 'authors'],
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
