import _ from 'lodash';
import type { Strategy, Step } from './types.js';
import { comparisons } from './comparisons.js';

export function validateStrategy(strategy: Strategy) {
  const errs: string[] = [];
  (['title', 'description', 'mutators', 'steps'] as const).forEach((f) => {
    if (!strategy[f]) errs.push(`Field ${f} is missing`);
  });

  if (!strategy.steps?.length) errs.push('Should contain at least one step');

  if (strategy.steps)
    strategy.steps.forEach((step, stepIndex) => {
      if (!step.fields || !step.fields.length)
        errs.push(`Step #${stepIndex + 1} contains no fields`);
      if (!step.sort)
        errs.push(`Step #${stepIndex + 1} contains no sort field(s)`);
      if (_.isArray(step.sort) && !step.sort.length)
        errs.push(`Step #${stepIndex + 1} contains a blank sort field list`);
      if (!step.comparison)
        errs.push(`Step #${stepIndex + 1} contains no comparison`);
    });

  return errs.length > 0 ? errs : true;
}

export function compareViaStepAvg(a: any, b: any, step: Step) {
  const total = step.fields.reduce((result, field) => {
    if ((step.skipOmitted ?? true) && (!a[field] || !b[field])) {
      return 0;
    }
    return comparisons[step.comparison].handler(a[field], b[field]);
  }, 0);

  return total / step.fields.length;
}

export function compareViaStepMin(a: any, b: any, step: Step) {
  let minimum = 1;
  step.fields.forEach((field) => {
    let score =
      (step.skipOmitted ?? true) && (!a[field] || !b[field])
        ? 0
        : comparisons[step.comparison].handler(a[field], b[field]);
    if (score < minimum) minimum = score;
  });
  return minimum;
}
