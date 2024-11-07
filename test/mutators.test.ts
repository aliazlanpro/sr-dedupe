import { mutatorsList } from '../src/index.js';
import { expect, describe, it } from 'vitest';

describe('Mutators', () => {
  it('alphaNumericOnly', () => {
    expect(mutatorsList.alphaNumericOnly.handler('one$two_three()')).toBe(
      'one two three ',
    );
  });

  it('noSpace', () => {
    expect(
      mutatorsList.noSpace.handler('Test 	title and there  is  spacing'),
    ).toBe('Testtitleandthereisspacing');
  });

  it('authorRewrite', () => {
    expect(mutatorsList.authorRewrite.handler('Bill Gates')).toBe('B. Gates');
    expect(mutatorsList.authorRewrite.handler('William Henry Gates')).toBe(
      'W. Gates',
    );
    expect(
      mutatorsList.authorRewrite.handler('Bill Gates, Steven Anthony Balmer'),
    ).toBe('B. Gates, S. Balmer');
    expect(mutatorsList.authorRewrite.handler('B Gates, S Balmer')).toBe(
      'B. Gates, S. Balmer',
    );
    expect(mutatorsList.authorRewrite.handler('Gates B., Balmer S.')).toBe(
      'B. Gates, S. Balmer',
    );
    expect(mutatorsList.authorRewrite.handler('Gates B., Balmer S.')).toBe(
      'B. Gates, S. Balmer',
    );
    expect(mutatorsList.authorRewrite.handler('Gates B, Balmer S')).toBe(
      'B. Gates, S. Balmer',
    );
    expect(mutatorsList.authorRewrite.handler('Gates BH, Balmer SF')).toBe(
      'B. Gates, S. Balmer',
    );
    expect(mutatorsList.authorRewrite.handler('W H Gates, S F Balmer')).toBe(
      'W. Gates, S. Balmer',
    );
    expect(
      mutatorsList.authorRewrite.handler(
        'William Henry Gates, Steven F. Balmer',
      ),
    ).toBe('W. Gates, S. Balmer');
    expect(mutatorsList.authorRewrite.handler('Gates, B; Balmer S')).toBe(
      'B. Gates, S. Balmer',
    );
    expect(
      mutatorsList.authorRewrite.handler('Gates, Bill; Balmer Steven'),
    ).toBe('B. Gates, S. Balmer');
    expect(mutatorsList.authorRewrite.handler('Gates, B. H; Balmer S F.')).toBe(
      'B. Gates, S. Balmer',
    );
    expect(
      mutatorsList.authorRewrite.handler('Gates, B. H.; Balmer S. F.'),
    ).toBe('B. Gates, S. Balmer');
  });

  it('authorRewriteSingle', () => {
    expect(mutatorsList.authorRewriteSingle.handler('Bill Gates')).toBe(
      'B. Gates',
    );
    expect(
      mutatorsList.authorRewriteSingle.handler('William Henry Gates'),
    ).toBe('W. Gates');
    expect(mutatorsList.authorRewriteSingle.handler('B Gates')).toBe(
      'B. Gates',
    );
    expect(mutatorsList.authorRewriteSingle.handler('Gates B.')).toBe(
      'B. Gates',
    );
    expect(mutatorsList.authorRewriteSingle.handler('Gates B')).toBe(
      'B. Gates',
    );
    expect(mutatorsList.authorRewriteSingle.handler('Gates BH')).toBe(
      'B. Gates',
    );
    expect(mutatorsList.authorRewriteSingle.handler('W H Gates')).toBe(
      'W. Gates',
    );
    expect(mutatorsList.authorRewriteSingle.handler('Gates, B')).toBe(
      'B. Gates',
    );
    expect(mutatorsList.authorRewriteSingle.handler('Gates, Bill')).toBe(
      'B. Gates',
    );
    expect(mutatorsList.authorRewriteSingle.handler('Gates, B. H')).toBe(
      'B. Gates',
    );
    expect(mutatorsList.authorRewriteSingle.handler('Gates, B. H.')).toBe(
      'B. Gates',
    );
    expect(mutatorsList.authorRewriteSingle.handler('Gates, B. H. M')).toBe(
      'B. Gates',
    );
    expect(mutatorsList.authorRewriteSingle.handler('De Arruda, L. H. F')).toBe(
      'L. De Arruda',
    );
    expect(mutatorsList.authorRewriteSingle.handler('de Arruda, L. H. F')).toBe(
      'L. De Arruda',
    );
  });

  it('deburr', () => {
    expect(mutatorsList.deburr.handler('ÕÑÎÔÑ')).toBe('ONION');
  });

  it('doiRewrite', () => {
    expect(mutatorsList.doiRewrite.handler('https://doi.org/10.1000/182')).toBe(
      'https://doi.org/10.1000/182',
    );
    expect(mutatorsList.doiRewrite.handler('http://doi.org/10.1000/182')).toBe(
      'https://doi.org/10.1000/182',
    );
    expect(mutatorsList.doiRewrite.handler('10.1000/182')).toBe(
      'https://doi.org/10.1000/182',
    );
    expect(
      mutatorsList.doiRewrite.handler('', {
        urls: ['https://doi.org/10.1000/182'],
      }),
    ).toBe('https://doi.org/10.1000/182');
    expect(
      mutatorsList.doiRewrite.handler('', {
        urls: ['http://doi.org/10.1000/182'],
      }),
    ).toBe('https://doi.org/10.1000/182');
  });

  it('noCase', () => {
    expect(mutatorsList.noCase.handler('Hello World')).toBe('hello world');
  });

  it('numericOnly', () => {
    expect(mutatorsList.numericOnly.handler('one1two2three3')).toBe('123');
  });

  it('removeEnclosingBrackets', () => {
    expect(mutatorsList.removeEnclosingBrackets.handler('(One)')).toBe('One');
  });

  it('stripHtmlTags', () => {
    expect(mutatorsList.stripHtmlTags.handler('CO<sup>2</sup>')).toBe('CO2');
  });

  it('consistentPageNumbering', () => {
    expect(mutatorsList.consistentPageNumbering.handler('244-58')).toBe(
      '244-258',
    );
    expect(mutatorsList.consistentPageNumbering.handler('244-258')).toBe(
      '244-258',
    );
    expect(mutatorsList.consistentPageNumbering.handler('244-8')).toBe(
      '244-248',
    );
    expect(mutatorsList.consistentPageNumbering.handler('1')).toBe('1');
    expect(mutatorsList.consistentPageNumbering.handler('')).toBe('');
    expect(mutatorsList.consistentPageNumbering.handler('445-59')).toBe(
      '445-459',
    );
    expect(mutatorsList.consistentPageNumbering.handler('445-459')).toBe(
      '445-459',
    );
  });
});
