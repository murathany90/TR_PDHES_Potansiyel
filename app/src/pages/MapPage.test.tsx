// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useSiteStore } from '../stores/useSiteStore';
import type { Site } from '../types/site';
import MapPage from './MapPage';

vi.mock('../hooks/useMapLibre', () => ({
  useMapLibre: vi.fn(),
}));

const site = {
  id: 'test-site',
  name: 'Test sahası',
  region: 'Test bölgesi',
  concept: 'classic',
  score: 75,
  powerMW: 1000,
  energyGWh: 8,
  head: 400,
  tunnelKm: 5,
  capexBn: 2,
  revenueM: 200,
  payback: 10,
  thesis: 'Test açıklaması',
  timeline: [],
} as unknown as Site;

describe('MapPage controls', () => {
  beforeEach(() => {
    useSiteStore.setState({
      sites: [site],
      selectedId: site.id,
      gridAssets: null,
      fetchGridAssets: vi.fn().mockResolvedValue(undefined),
    });
    useSettingsStore.setState({ mapStyle: 'satellite', heightScale: 1.3 });
  });

  afterEach(cleanup);

  it('exposes candidate, panel, and view state controls to assistive technology', () => {
    render(<MapPage />);

    expect(screen.getByRole('button', { name: /test sahası/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /saha keşfi panelini kapat/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /kapasite özeti panelini kapat/i })).toBeTruthy();
    const dimensionControls = within(screen.getByRole('group', { name: 'Harita boyutu' }));
    expect(dimensionControls.getByRole('button', { name: '2D Düz' }).getAttribute('aria-pressed')).toBe('false');
    expect(dimensionControls.getByRole('button', { name: '3D Arazi' }).getAttribute('aria-pressed')).toBe('true');
    const qualityControls = within(screen.getByRole('group', { name: '3D arazi kalitesi' }));
    expect(qualityControls.getByRole('button', { name: /orta/i }).getAttribute('aria-pressed')).toBe('true');
  });
});
