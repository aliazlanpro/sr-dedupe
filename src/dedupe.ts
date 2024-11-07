import _ from 'lodash';
import * as strategies from './strategies/index.js';
import {
  compareViaStepAvg,
  compareViaStepMin,
  validateStrategy,
} from './utils.js';
import { mutatorsList } from './mutators.js';
import type { Reference, Field } from './types.js';

type Strategy = keyof typeof strategies;

type Output = Reference & {
  dedupe?: {
    steps?: { score?: number; dupeOf?: number }[];
    score?: number;
  };
  recNumber?: number;
  index?: number;
};

// Add default settings object
const DEFAULT_SETTINGS = {
  strategy: 'clark' as Strategy,
  validateStrategy: true,
  action: 'STATS' as const,
  actionField: 'dedupe',
  threshold: 0.1,
  markOk: 'OK',
  markDupe: 'DUPE',
  dupeRef: 'INDEX' as const,
  fieldWeight: 'MINIMUM' as const,
  markOriginal: false,
} as const;

// Update the settings type to make all properties optional
type DedupeSettings = {
  strategy?: Strategy;
  action?: 'STATS' | 'MARK' | 'DELETE';
  dupeRef?: 'RECNUMBER' | 'INDEX';
  validateStrategy?: boolean;
  fieldWeight?: 'MINIMUM' | 'AVERAGE';
  markOriginal?: boolean;
  actionField?: string;
  threshold?: number;
  markDupe?: string | ((ref: Output) => string);
  markOk?: string | ((ref: Output) => string);
};

/**
 * Performs deduplication on an array of references using a specified strategy.
 *
 * @param options - The options for the deduplication process.
 * @returns A promise that resolves to the deduplicated array of references.
 */
export function dedupe({
  input,
  settings = {},
}: {
  input: Reference[];
  settings?: DedupeSettings;
}): Promise<Output[]> {
  // Merge provided settings with defaults
  const mergedSettings = { ...DEFAULT_SETTINGS, ...settings };

  let output: Output[];
  const strategy = strategies[mergedSettings.strategy];

  return (
    Promise.resolve()
      // Sanity checks {{{
      .then(() => {
        if (!_.isArray(input)) throw new Error('Input is not an array');
        if (!_.has(strategies, mergedSettings.strategy))
          throw new Error('Unknown strategy specified');
        if (!_.isArray(_.get(strategies, [mergedSettings.strategy, 'steps'])))
          throw new Error('Invalid strategy schema');
        return (output = input);
      })
      // }}}
      // Validate strategy {{{
      .then(() => {
        if (!mergedSettings.validateStrategy) return; // Checking disabled

        let sErrs = validateStrategy(strategy);
        if (sErrs === true) return;
        throw new Error('Invalid strategy - ' + sErrs.join(', '));
      })
      // }}}
      // Run mutators {{{
      .then(() => {
        let refs = output;
        return refs.map((original: Reference, index: number) => ({
          original,
          index,
          recNumber: original.refNumber || index + 1,
          dedupe: { steps: [] }, // Storage for future dedupe info
          ...original, // Import original reference fields
          ..._.mapValues(strategy.mutators, (mutators, field) =>
            _.castArray(mutators).reduce(
              (value, mutator) =>
                mutatorsList[mutator].handler(String(value), original),
              original[field as Field] || '',
            ),
          ),
        }));
      })
      // }}}
      .then((refs) => {
        let sortedBy: string; // Keep track of our sort so we don't repeat this
        let sortedRefs: Output[]; // Current state of refs

        strategy.steps.forEach((step, stepIndex) => {
          // For each step
          if (!sortedBy || sortedBy != step.sort) {
            // Sort if needed
            sortedRefs = _.sortBy(refs, step.sort) as Output[]; // Sort by the designated fields
            sortedBy = step.sort;
          }

          let i = 0;
          let n = i + 1;
          while (n < sortedRefs.length) {
            // Walk all elements of the array...

            const dupeScore =
              mergedSettings.fieldWeight == 'MINIMUM'
                ? compareViaStepMin(sortedRefs[i], sortedRefs[n], step)
                : compareViaStepAvg(sortedRefs[i], sortedRefs[n], step);
            if (dupeScore > 0) {
              // Hit a duplicate, `i` is now the index of the last unique ref
              // If score does not currently exist for record (i.e. original record) assign it a score of 0 (unless testing)
              if (!sortedRefs[i]?.dedupe?.steps?.[stepIndex]) {
                sortedRefs[i]!.dedupe!.steps![stepIndex] = {
                  score: mergedSettings.markOriginal ? dupeScore : 0,
                }; // Mark as duplicate if in testing mode
              }
              // If score does not exist for second record, update score
              if (!sortedRefs[n]?.dedupe?.steps?.[stepIndex]) {
                // Mark 2nd record as duplicate and link to original
                sortedRefs[n]!.dedupe!.steps![stepIndex] = {
                  score: dupeScore,
                  dupeOf:
                    mergedSettings.dupeRef == 'RECNUMBER'
                      ? sortedRefs[i]?.recNumber
                      : sortedRefs[i]?.index,
                };
              }
              // Else if new score is greater than or equal the one which exists, update score and dupeof
              else if (
                dupeScore >= sortedRefs[n]?.dedupe?.steps?.[stepIndex]?.score!
              ) {
                // Mark 2nd record as duplicate and link to original
                sortedRefs[n]!.dedupe!.steps![stepIndex] = {
                  score: dupeScore,
                  dupeOf:
                    mergedSettings.dupeRef == 'RECNUMBER'
                      ? sortedRefs[i]?.recNumber
                      : sortedRefs[i]?.index,
                };
              }
              n++; // Increment n by one to compare next record with original to check for multiple dupes
              if (n >= sortedRefs.length) {
                // If at last record increment i for consistent behaviour
                i++;
                n = i + 1;
              }
            } else {
              if (sortedRefs[i]?.[step.sort] === sortedRefs[n]?.[step.sort]) {
                // If still the same value for sorted value
                n++; // Increment n by one to compare next record with original to check for multiple dupes
                if (n >= sortedRefs.length) {
                  // If at last record increment i for consistent behaviour
                  i++;
                  n = i + 1;
                }
              } else {
                // The below may work better if some records are missing data but at the expense of time
                i++;
                n = i + 1;
                // i = n; // Set the new pointer to be the non-matching reference
                // n += 1; // Increment n to point to next reference
              }
            }
          }
        });
        return refs;
      })
      .then((refs) =>
        refs.map((ref) => ({
          ...ref,
          dedupe: {
            ...ref.dedupe,
            // Average score for dupes
            score:
              ref.dedupe.steps.length > 0
                ? _.sum(
                    ref.dedupe.steps.map(
                      (s: { score?: number; dupeOf?: number }) => s.score,
                    ),
                  ) / ref.dedupe.steps.length
                : 0,
          },
        })),
      )
      .then((refs) => {
        switch (mergedSettings.action) {
          case 'STATS': // Decorate refs with stats
            return output.map((ref, refIndex) => ({
              // Glue the stats back onto the input array
              ...ref,
              [mergedSettings.actionField]: {
                score: refs[refIndex]?.dedupe.score,
                dupeOf: _(refs[refIndex]?.dedupe.steps)
                  .map('dupeOf')
                  .uniq()
                  .filter((v) => v !== undefined)
                  .value(),
              },
            }));

          case 'MARK': // Set a simple field if the ref score is above the threshold
            return output.map((ref, refIndex) => ({
              // Glue the stats back onto the input array
              ...ref,
              [mergedSettings.actionField]:
                refs[refIndex]?.dedupe.score! >= mergedSettings.threshold
                  ? _.isFunction(mergedSettings.markDupe)
                    ? mergedSettings.markDupe(ref)
                    : mergedSettings.markDupe
                  : _.isFunction(mergedSettings.markOk)
                    ? mergedSettings.markOk(ref)
                    : mergedSettings.markOk,
            }));

          case 'DELETE': // Remove all refs above the threshold
            return output.filter(
              (ref, refIndex) =>
                refs[refIndex]?.dedupe.score! < mergedSettings.threshold,
            );
        }
      })
  );
}
