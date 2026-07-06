// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useSiteStore } from '../stores/useSiteStore';
import type { Site } from '../types/site';
import DataPage from './DataPage';

const site = {
  id: 'test-site',
  name: 'Test sahası',
  region: 'Test bölgesi',
  concept: 'classic',
  pdhesType: 'CLOSED_LOOP',
  powerMW: 1000,
  energyGWh: 8,
  head: 400,
  tunnelKm: 5,
  capexBn: 2,
  revenueM: 200,
  score: 75,
  payback: 10,
  activeMcm: 10,
  gridDistKm: 4,
  lower: 'Alt',
  upper: 'Üst',
  thesis: 'Test açıklaması',
  risks: ['Jeoloji'],
  scores: { topo: 80, grid: 70, env: 60, geology: 50, access: 90, market: 70 },
} as Site;

describe('DataPage', () => {
  beforeEach(() => {
    useSiteStore.setState({ sites: [site], selectedId: site.id });
  });

  afterEach(cleanup);

  it('makes filters and site selection keyboard accessible', () => {
    render(<DataPage site={site} />);

    expect(screen.getByRole('button', { name: 'Tümü' }).getAttribute('aria-pressed')).toBe('true');
    const siteButton = screen.getByRole('button', { name: /test sahası/i });
    fireEvent.click(siteButton);
    expect(useSiteStore.getState().selectedId).toBe(site.id);
    expect(screen.getAllByText(/kaynak \/ senaryo skoru/i).length).toBeGreaterThan(0);
  });
});
