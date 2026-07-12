// @vitest-environment jsdom

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ManualGeometryLayer from './ManualGeometryLayer';
import MeasurementUI from './MeasurementUI';
import { useManualGeometryStore } from '../stores/useManualGeometryStore';
import { useMapToolsStore } from '../stores/useMapToolsStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useSiteStore } from '../stores/useSiteStore';
import { makeTestSite } from '../test-utils/makeTestSite';

class FakeGeoJsonSource {
  data: unknown;
  setData = vi.fn((data: unknown) => {
    this.data = data;
  });

  constructor(data: unknown) {
    this.data = data;
  }
}

class FakeMap {
  styleLoaded = true;
  sources = new Map<string, FakeGeoJsonSource>();
  layers = new Set<string>();
  handlers = new Map<string, Set<(...args: any[]) => void>>();
  addSource = vi.fn((id: string, source: any) => this.sources.set(id, new FakeGeoJsonSource(source.data)));
  addLayer = vi.fn((layer: { id: string }) => this.layers.add(layer.id));
  removeLayer = vi.fn((id: string) => this.layers.delete(id));
  removeSource = vi.fn((id: string) => this.sources.delete(id));
  getSource = vi.fn((id: string) => this.sources.get(id));
  getLayer = vi.fn((id: string) => this.layers.has(id) ? { id } : undefined);
  getStyle = vi.fn(() => ({ version: 8 }));
  isStyleLoaded = vi.fn(() => this.styleLoaded);
  on = vi.fn((event: string, handler: (...args: any[]) => void) => {
    const set = this.handlers.get(event) ?? new Set();
    set.add(handler);
    this.handlers.set(event, set);
  });
  off = vi.fn((event: string, handler: (...args: any[]) => void) => {
    this.handlers.get(event)?.delete(handler);
  });
  fire(event: string) {
    this.styleLoaded = true;
    [...(this.handlers.get(event) ?? [])].forEach((handler) => handler());
  }
}

describe('dynamic map drawing layers', () => {
  beforeEach(() => {
    const site = makeTestSite();
    useSiteStore.setState({ sites: [site], selectedId: site.id, baseSites: [site] });
    useSettingsStore.setState({ heightScale: 1.1 });
    useManualGeometryStore.setState({
      features: [
        {
          type: 'Feature',
          id: 'manual-1',
          geometry: { type: 'LineString', coordinates: [[32, 40], [32.1, 40.1]] },
          properties: {
            siteId: site.id,
            siteName: site.name,
            featureType: 'penstock',
            displayName: 'Manual penstock',
            geometryType: 'LineString',
            material: 'penstock_axis',
            role: 'waterway',
            source: 'manual_map_drawing',
            confidence: 'B_SATELLITE_MANUAL',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        },
      ] as any,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('restores manual geometry layers when a style reload leaves only the source', () => {
    const map = new FakeMap();
    map.sources.set('manual-geometries', new FakeGeoJsonSource({ type: 'FeatureCollection', features: [] }));

    render(<ManualGeometryLayer map={map as any} siteId="test-site" />);

    expect(map.layers.has('manual-lines')).toBe(true);
    expect(map.layers.has('manual-polygons')).toBe(true);
    expect(map.layers.has('manual-points')).toBe(true);
  });

  it('restores measurement layers when a style reload leaves only the source', () => {
    const map = new FakeMap();
    map.sources.set('measure-points', new FakeGeoJsonSource({ type: 'FeatureCollection', features: [] }));
    useMapToolsStore.setState({
      map: map as any,
      mode: 'measure',
      isDrawing: false,
      measurementPoints: [[32, 40], [32.1, 40.1]],
    });

    render(<MeasurementUI />);

    expect(map.layers.has('measure-lines')).toBe(true);
    expect(map.layers.has('measure-circles')).toBe(true);
  });

  it('adds manual geometry layers after delayed style readiness', () => {
    const map = new FakeMap();
    map.styleLoaded = false;

    render(<ManualGeometryLayer map={map as any} siteId="test-site" />);
    expect(map.layers.has('manual-lines')).toBe(false);

    act(() => map.fire('styledata'));

    expect(map.layers.has('manual-lines')).toBe(true);
    expect(map.layers.has('manual-points')).toBe(true);
  });
});
