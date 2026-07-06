import type { Scores } from '../types/site';

export type ScoreWeights = Record<keyof Scores, number>;

export function calculateWeightedScore(scores: Scores, weights: ScoreWeights): number {
  const entries = Object.entries(weights) as Array<[keyof Scores, number]>;
  const totalWeight = entries.reduce((sum, [, weight]) => sum + Math.max(0, weight), 0);
  if (totalWeight === 0) return 0;

  const weightedTotal = entries.reduce(
    (sum, [key, weight]) => sum + scores[key] * Math.max(0, weight),
    0,
  );

  return Math.round(weightedTotal / totalWeight);
}
