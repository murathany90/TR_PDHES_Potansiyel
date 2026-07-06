import { describe, expect, it } from 'vitest';
import type { Scores } from '../types/site';
import { calculateWeightedScore } from './scoring';

const scores: Scores = {
  topo: 80,
  grid: 60,
  env: 40,
  geology: 20,
  access: 100,
  market: 70,
};

describe('calculateWeightedScore', () => {
  it('normalizes all six configurable score weights', () => {
    expect(calculateWeightedScore(scores, {
      topo: 50,
      grid: 0,
      env: 0,
      geology: 0,
      access: 50,
      market: 0,
    })).toBe(90);
  });

  it('returns zero when every weight is disabled', () => {
    expect(calculateWeightedScore(scores, {
      topo: 0,
      grid: 0,
      env: 0,
      geology: 0,
      access: 0,
      market: 0,
    })).toBe(0);
  });
});
