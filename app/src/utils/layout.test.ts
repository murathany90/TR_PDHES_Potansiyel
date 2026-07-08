import { describe, expect, it } from 'vitest';
import sites from '../../public/data.json';
import type { Site } from '../types/site';
import { buildLayout } from './layout';

const gokcekaya = (sites as Site[]).find((site) => site.id === 'jica-gokcekaya-pspp');

describe('buildLayout footprint geometry', () => {
  it('uses Gokcekaya polygon footprints instead of the legacy upper reservoir rectangle', () => {
    expect(gokcekaya).toBeTruthy();
    if (!gokcekaya) return;

    const layout = buildLayout(gokcekaya, 1);
    const blockKeys = layout.blocks.features.map((feature) => String(feature.properties?.key));
    const upperWater = layout.blocks.features.find((feature) => feature.properties?.key === 'upperReservoirWater');
    const headrace = layout.water.features.find((feature) => feature.properties?.key === 'penstock01');

    expect(blockKeys).toContain('upperReservoirWater');
    expect(blockKeys).toContain('upperReservoirEmbankment');
    expect(blockKeys).not.toContain('upper_reservoir');
    expect(upperWater?.geometry.coordinates[0]).toEqual(gokcekaya.coordinates.upperReservoirPolygon);
    expect(headrace?.geometry.coordinates).toEqual([
      [30.9817, 40.0706],
      [30.989, 40.0525],
      [30.9981, 40.0347],
      [31.0068, 40.0283],
    ]);
  });
});
