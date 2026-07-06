// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Site } from '../types/site';
import ThreeDPage from './ThreeDPage';

vi.mock('../components/ui/ThreeDModel', () => ({
  default: () => <div data-testid="three-d-model" />,
}));

const site = {
  id: 'test-site',
  name: 'Test sahası',
  confidence: 'reference_based',
  locationConfidence: 'medium',
  verifiedAt: '2026-01-01',
  components_detail: {
    powerhouse: { units: 2 },
    upper_reservoir: { elevation_m: 900 },
  },
} as unknown as Site;

describe('ThreeDPage controls', () => {
  afterEach(cleanup);

  it('uses consistent icons and exposes toggle states', () => {
    render(<ThreeDPage site={site} />);

    expect(screen.getByRole('button', { name: 'Üretim modu' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Pompalama modu' }).getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('button', { name: 'Simülasyonu başlat' }).getAttribute('aria-pressed')).toBe('false');
    expect(document.body.textContent).not.toMatch(/[⚡💧⛰️🏷️▶️⏹⚠️]/u);
    expect(screen.getByRole('alert').textContent).toMatch(/3D konumlar temsilidir/i);
  });
});
