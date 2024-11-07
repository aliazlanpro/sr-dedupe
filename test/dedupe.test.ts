import { expect, describe, it } from 'vitest';
import { dedupe } from '../src/index.js';
import _ from 'lodash';

describe('Basic dedupe functionality', () => {
  it('should correctly identify duplicate DOIs and provide stats (#1)', async () => {
    const output = await dedupe({
      input: [{ doi: 'https://doi.org/10.1000/182' }, { doi: '10.1000/182' }],
      settings: { strategy: 'doiOnly' },
    });

    expect(output).toEqual([
      { doi: 'https://doi.org/10.1000/182', dedupe: { score: 0, dupeOf: [] } },
      { doi: '10.1000/182', dedupe: { score: 1, dupeOf: [0] } },
    ]);
  });

  it('should correctly identify duplicate DOIs and provide stats (#2)', async () => {
    const output = await dedupe({
      input: [
        { recNumber: 1, doi: 'https://doi.org/10.1000/182' },
        { recNumber: 2, doi: '10.1234/123' },
        { recNumber: 3, doi: '10.1000/182' },
        { recNumber: 4, urls: ['https://doi.org/10.1000/182'] },
        { recNumber: 5, urls: ['https://doi.org/10.1234/123'] },
      ],
      settings: { strategy: 'doiOnly', dupeRef: 'RECNUMBER' },
    });

    expect(output).toEqual([
      {
        recNumber: 1,
        doi: 'https://doi.org/10.1000/182',
        dedupe: { score: 0, dupeOf: [] },
      },
      { recNumber: 2, doi: '10.1234/123', dedupe: { score: 0, dupeOf: [] } },
      { recNumber: 3, doi: '10.1000/182', dedupe: { score: 1, dupeOf: [1] } },
      {
        recNumber: 4,
        urls: ['https://doi.org/10.1000/182'],
        dedupe: { score: 1, dupeOf: [3] },
      },
      {
        recNumber: 5,
        urls: ['https://doi.org/10.1234/123'],
        dedupe: { score: 1, dupeOf: [2] },
      },
    ]);
  });

  it('should correctly identify duplicate DOIs and provide stats (missing fields)', async () => {
    const output = await dedupe({
      input: [
        { recNumber: 1, doi: 'https://doi.org/10.1000/182' },
        { recNumber: 2 }, // Intentionally omitted DoI data
        { recNumber: 3 },
        { recNumber: 4, urls: ['https://doi.org/10.1000/182'] },
        { recNumber: 5, doi: 'https://doi.org/10.1000/182' },
      ],
      settings: {
        strategy: 'doiOnly',
        dupeRef: 'RECNUMBER',
      },
    });

    expect(output).toEqual([
      {
        recNumber: 1,
        doi: 'https://doi.org/10.1000/182',
        dedupe: { score: 0, dupeOf: [] },
      },
      { recNumber: 2, dedupe: { score: 0, dupeOf: [] } },
      { recNumber: 3, dedupe: { score: 0, dupeOf: [] } },
      {
        recNumber: 4,
        urls: ['https://doi.org/10.1000/182'],
        dedupe: { score: 1, dupeOf: [1] },
      },
      {
        recNumber: 5,
        doi: 'https://doi.org/10.1000/182',
        dedupe: { score: 1, dupeOf: [4] },
      },
    ]);
  });

  it('should correctly mark duplicate DOIs', async () => {
    const output = await dedupe({
      input: [{ doi: 'https://doi.org/10.1000/182' }, { doi: '10.1000/182' }],
      settings: {
        strategy: 'doiOnly',
        action: 'MARK',
        markOk: () => 'OK!',
        markDupe: () => 'DUPE!',
      },
    });

    expect(output).toEqual([
      { doi: 'https://doi.org/10.1000/182', dedupe: 'OK!' },
      { doi: '10.1000/182', dedupe: 'DUPE!' },
    ]);
  });

  it('should correctly delete duplicate DOIs', async () => {
    const output = await dedupe({
      input: [{ doi: 'https://doi.org/10.1000/182' }, { doi: '10.1000/182' }],
      settings: {
        strategy: 'doiOnly',
        action: 'DELETE',
      },
    });

    expect(output).toEqual([{ doi: 'https://doi.org/10.1000/182' }]);
  });

  it('should correctly identify duplicate DOIs (randomized DOIs)', async () => {
    const originals = [
      { doi: 'https://doi.org/10.1000/182' },
      { doi: '10.1000/182' },
      { urls: ['https://doi.org/10.1000/182'] },
    ];

    // Create array of 100 random samples from originals
    const input = _(new Array(100))
      .map(() => _.sample(originals)!)
      .shuffle()
      .value();

    const output = await dedupe({
      input,
      settings: {
        strategy: 'doiOnly',
        action: 'DELETE',
      },
    });

    expect(output).toHaveLength(1);
  });
});
