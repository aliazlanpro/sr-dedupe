import _ from 'lodash';

export type MutatorName =
  | 'alphaNumericOnly'
  | 'noSpace'
  | 'authorRewrite'
  | 'authorRewriteSingle'
  | 'deburr'
  | 'noCase'
  | 'doiRewrite'
  | 'numericOnly'
  | 'removeEnclosingBrackets'
  | 'stripHtmlTags'
  | 'consistentPageNumbering';

type Mutator = {
  title: string;
  description: string;
  handler: (v: string, original?: any) => string;
};

/**
 * This module provides various mutators for strings.
 */
export const mutatorsList: Record<MutatorName, Mutator> = {
  alphaNumericOnly: {
    title: 'Alpha-Numeric only',
    description: 'Remove all punctuation except characters and numbers',
    handler: (v: string) => v.replace(/[^0-9A-Za-z\s]+/g, ' '),
  },
  noSpace: {
    title: 'Remove whitespace',
    description: 'Remove all whitespace e.g " "',
    handler: (v: string) => v.replace(/[\s]+/g, ''),
  },
  authorRewrite: {
    title: 'Rewrite author names',
    description:
      'Clean up various author specifications into one standard format',
    handler: (v: string) => {
      if (/;/.test(v)) {
        // Detect semi colon separators to search `Last, F. M.` format
        return _.chain(v)
          .split(/\s*;\s*/)
          .dropRightWhile((name) => /^et\.?\s*al/i.test(name)) // Looks like "Et. Al" from end
          .map((name) => {
            var format = /^(?<last>[A-Z][a-z]+),?\s+(?<first>[A-Z])/.exec(name);
            return format
              ? format.groups?.first?.slice(0, 1).toUpperCase() +
                  '. ' +
                  _.upperFirst(format.groups?.last)
              : name;
          })
          .join(', ')
          .value();
      } else {
        return _.chain(v)
          .split(/\s*,\s*/) // Split into names
          .dropRightWhile((name) => /^et\.?\s*al/i.test(name)) // Looks like "Et. Al" from end
          .map((name) => {
            // Reparse all names
            let format = [
              /^(?<first>[A-Z][a-z]+)\s+(?<last>[A-Z][a-z]+)$/, //~= First Last
              /^(?<first>[A-Z])\.?\s+(?<middle>.*?)\s*(?<last>[A-Z][a-z]+)$/, //~= F. Last
              /^(?<first>[A-Z][a-z]+?)\s+(?<middle>.*?)\s*(?<last>[A-Z][a-z]+)$/, //~= First Middle Last
              /^(?<last>[A-Z][a-z]+)\s+(?<middle>.*?)\s*(?<first>[A-Z]\.?)/, //~= Last F.
            ].reduce<RegExpExecArray | null>(
              (matchingFormat, re) =>
                matchingFormat || // Already found a match
                re.exec(name), // Attempt to match this element
              null,
            );

            return format
              ? (format.groups?.first || '').slice(0, 1).toUpperCase() +
                  '. ' +
                  _.upperFirst(format.groups?.last)
              : name;
          })
          .join(', ') // Join as comma-delimited strings
          .value();
      }
    },
  },
  authorRewriteSingle: {
    title: 'Rewrite singular author name',
    description:
      'Clean up various author specifications into one standard format',
    handler: (v: string) => {
      const name = v;
      let format = [
        /^(?<last>[A-Za-z\s]+),+\s+(?<first>[A-Z])/, // Last, F. M.
        /^(?<first>[A-Z][a-z]+)\s+(?<last>[A-Z][a-z]+)$/, //~= First Last
        /^(?<first>[A-Z])\.?\s+(?<middle>.*?)\s*(?<last>[A-Z][a-z]+)$/, //~= F. Last
        /^(?<first>[A-Z][a-z]+?)\s+(?<middle>.*?)\s*(?<last>[A-Z][a-z]+)$/, //~= First Middle Last
        /^(?<last>[A-Z][a-z]+)\s+(?<middle>.*?)\s*(?<first>[A-Z]\.?)/, //~= Last F.
      ].reduce<RegExpExecArray | null>(
        (matchingFormat, re) =>
          matchingFormat || // Already found a match
          re.exec(name), // Attempt to match this element
        null,
      );

      return format
        ? (format.groups?.first || '').slice(0, 1).toUpperCase() +
            '. ' +
            _.upperFirst(format.groups?.last)
        : name;
    },
  },
  deburr: {
    title: 'Deburr',
    description:
      'Convert all <a href="https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table">latin-1 supplementary letters</a> to basic latin letters and also remove <a href="https://en.wikipedia.org/wiki/Combining_Diacritical_Marks">combining diacritical marks</a>. e.g. <code>ÕÑÎÔÑ</code> becomes <code>ONION</code>',
    handler: (v: string) => _.deburr(v),
  },
  noCase: {
    title: 'Case insenstive',
    description: 'Convert all upper-case alpha characters to lower case',
    handler: (v: string) => v.toLowerCase(),
  },
  doiRewrite: {
    title: 'Rewrite DOIs',
    description:
      'Attempt to tidy up mangled DOI fields from partial DOIs to full URLs',
    handler(v: string, ref?: { urls: string[] }) {
      if (v) {
        return /^https:\/\//.test(v)
          ? v // Already ok
          : /^http:\/\//.test(v)
            ? v.replace(/^http:/, 'https:') // using HTTP instead of HTTPS
            : 'https://doi.org/' + v;
      } else {
        // Look in ref.urls to try and find a misfiled DOI
        let foundDoi = (ref?.urls ?? []).find((u) =>
          /^https?:\/\/doi.org\//.test(u),
        ); // Find first DOI looking URL
        if (foundDoi) return foundDoi.replace(/^http:/, 'https:');
        return ''; // Give up and return an empty string
      }
    },
  },
  numericOnly: {
    title: 'Numeric only',
    description: 'Remove all non-numeric characters',
    handler: (v: string) => v.replace(/[^0-9]+/g, ''),
  },
  removeEnclosingBrackets: {
    title: 'Remove enclosing brackets',
    description:
      'Remove all wrapping brackets or other parenthesis, useful for translated titles',
    handler: (v: string) => _.trim(v, '()[]{}'),
  },
  stripHtmlTags: {
    title: 'Remove html/xml tags from title',
    description: 'Remove html tag',
    handler: (v: string) => v.replace(/(<([^>]+)>)/gi, ''),
  },
  consistentPageNumbering: {
    title: 'Mutate PubMed page numbering into consistent format',
    description: 'E.g. 244-58 => 244-258',
    handler: (v: string) => {
      // Find page numbers
      let pages = /^(?<from>\d+)\s*(\p{Pd}+(?<to>\d+)\s*)?$/u.exec(v)?.groups;
      if (pages && pages.from && pages.to) {
        // Find the difference in length of the page number strings
        const offset = pages.from.length - pages.to.length;
        // Take the prefix that is missing from the 2nd page number
        const prefix = pages.from.substring(0, offset);
        // Prepend the prefix to the page number
        return `${pages.from}-${prefix + pages.to}`;
      } else if (pages && pages.from) {
        return pages.from;
      } else {
        return '';
      }
    },
  },
};
