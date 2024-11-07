import type { MutatorName } from './mutators.js';

export interface Strategy {
  title: string;
  description: string;
  mutators?: StrategyMutators;
  steps: Step[];
}

export interface Step {
  fields: Field[];
  sort: Field;
  comparison: 'exact' | 'exactTruncate' | 'jaroWinkler' | 'random';
  skipOmitted?: boolean;
}

export type Field =
  | 'authors'
  | 'title'
  | 'abstract'
  | 'doi'
  | 'year'
  | 'volume'
  | 'issue'
  | 'type'
  | 'pages'
  | 'journal'
  | 'refNumber';

type StrategyMutators = Partial<Record<Field, MutatorName | MutatorName[]>>;

export type Reference = Partial<Record<Field, string | number>> & {
  recNumber?: number;
  urls?: string[];
};
