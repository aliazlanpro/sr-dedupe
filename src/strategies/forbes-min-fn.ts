import type { Strategy } from '../types.js';

/**
 * Forbes Automated Deduplication Sweep (Thorough) with minimal false negatives
 */
export const forbesMinFn: Strategy = {
  title: 'Forbes Automated Deduplication Sweep (Thorough)',
  description: 'Deduplication Sweep with Low Rate of False Negatives',
  mutators: {
    authors: 'authorRewriteSingle',
    doi: ['doiRewrite', 'noCase'],
    title: ['stripHtmlTags', 'alphaNumericOnly', 'noCase', 'noSpace'],
    abstract: ['stripHtmlTags', 'alphaNumericOnly', 'noCase', 'noSpace'],
    journal: 'noCase',
    year: 'numericOnly',
    pages: 'consistentPageNumbering',
  },
  steps: [
    {
      fields: ['doi', 'pages'],
      sort: 'doi',
      comparison: 'exact',
    },
    {
      fields: ['doi', 'title'],
      sort: 'doi',
      comparison: 'exact',
    },
    {
      fields: ['doi', 'authors'],
      sort: 'doi',
      comparison: 'exact',
    },
    {
      fields: ['abstract'],
      sort: 'abstract',
      comparison: 'exact',
    },
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
      fields: ['title', 'journal', 'year'],
      sort: 'title',
      comparison: 'exactTruncate',
    },
    {
      fields: ['pages', 'journal', 'volume', 'authors'],
      sort: 'pages',
      comparison: 'exact',
    },
  ],
};
