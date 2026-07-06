// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Site } from '../types/site';
import { CALC_SCENARIO_STORAGE_KEY, useCalcEngine } from './useCalcEngine';

const site = {
  head: 400,
  activeMcm: 10,
  capexBn: 2,
  revenueM: 200,
  powerMW: 1000,
} as Site;

describe('useCalcEngine persistence', () => {
  beforeEach(() => localStorage.clear());

  it('restores and saves the calculation scenario', () => {
    localStorage.setItem(CALC_SCENARIO_STORAGE_KEY, JSON.stringify({
      capexFactor: 1.2,
      revenueFactor: 0.9,
      cycles: 280,
      reservePremium: 12,
    }));

    const { result } = renderHook(() => useCalcEngine(site));
    expect(result.current.scenario.capexFactor).toBe(1.2);

    act(() => result.current.setScenarioValue('cycles', 320));
    expect(JSON.parse(localStorage.getItem(CALC_SCENARIO_STORAGE_KEY) || '{}').cycles).toBe(320);
  });
});
