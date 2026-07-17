// @vitest-environment jsdom

import type React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeTestSite } from '../../test-utils/makeTestSite';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useSiteStore } from '../../stores/useSiteStore';
import ThreeDModel from './ThreeDModel';

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children?: React.ReactNode }) => <div data-testid="mock-canvas">{children}</div>,
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Line: () => <div data-testid="mock-line" />,
  MeshDistortMaterial: () => null,
  OrbitControls: () => null,
  Sky: () => null,
}));

describe('ThreeDModel footprint source', () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.setState({ theme: 'dark' });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders footprint data from the explicit site prop instead of stale store data', () => {
    const storeSite = makeTestSite({
      id: 'same-site',
      layout3D: {
        scale: 'macro',
        preferredBearing: 0,
        terrainExaggeration: 1,
        reservoirSurfaceMode: 'polygon',
        useFootprintPolygons: true,
        hideLegacySquareReservoir: true,
      },
    });
    const propSite = makeTestSite({
      ...storeSite,
      layout3D: {
        ...storeSite.layout3D!,
        componentFootprints: [{
          id: 'editorCustomFootprint',
          component: 'editor_custom_component',
          kind: 'polygon',
          material: 'concrete',
          closed: true,
          coords: [[32, 40], [32.01, 40], [32.01, 40.01], [32, 40.01], [32, 40]],
          baseElevationM: 100,
          topElevationM: 105,
        }],
      },
    });

    useSiteStore.setState({ sites: [storeSite], selectedId: storeSite.id, worldExampleFocusId: null });

    render(
      <ThreeDModel
        siteId={storeSite.id}
        activeComponent="editor_custom_component"
        onSelectComponent={vi.fn()}
        layers={{}}
        mode="generate"
        componentsDetail={{
          upper_reservoir: {
            elevation_m: 100,
            active_volume_mcm: 1,
            dam_height_m: 10,
            lining: '',
            geology_note: '',
          },
          lower_reservoir: { elevation_m: 50, min_level_m: 40, note: '' },
          penstock: { diameter_m: 4, length_m: 100, material: '', pressure_class: '', count: 1 },
          powerhouse: { cavern_width_m: 10, cavern_length_m: 20, cavern_height_m: 15, units: 1, turbine_type: '' },
          surge_tank: { type: '', height_m: 20, diameter_m: 5 },
          switchyard: { voltage_kv: 154, transformer_count: 1, connection_line_km: 1 },
          tunnel: { length_m: 100, diameter_m: 4, excavation_type: '' },
          intake_outfall: null,
        }}
        site={propSite}
        isPlaying={false}
        activeUnits={1}
        maxUnits={1}
        showTerrain={false}
        showLabels={true}
        terrainOpacity={0.7}
      />,
    );

    expect(screen.getByText('editor_custom_component')).toBeTruthy();
  });

  it('renders simulation layers over footprint geometry when footprint mode is active', () => {
    const site = makeTestSite({
      id: 'footprint-simulation-site',
      capacityMW: 600,
      projectFlowCms: 150,
      layout3D: {
        scale: 'macro',
        preferredBearing: 0,
        terrainExaggeration: 1,
        reservoirSurfaceMode: 'polygon',
        useFootprintPolygons: true,
        hideLegacySquareReservoir: true,
        componentFootprints: [
          {
            id: 'upper',
            component: 'upper_reservoir',
            kind: 'polygon',
            material: 'water',
            closed: true,
            coords: [[32, 40.04], [32.01, 40.04], [32.01, 40.05], [32, 40.05], [32, 40.04]],
            elevationM: 500,
            activeVolumeHm3: 2,
          },
          {
            id: 'headrace',
            component: 'headrace_tunnel',
            kind: 'polyline',
            material: 'tunnel_axis',
            coords: [[32.005, 40.04], [32.015, 40.025]],
            profileElevationM: [500, 250],
          },
          {
            id: 'penstock-a',
            component: 'penstock',
            kind: 'polyline',
            material: 'shaft',
            coords: [[32.015, 40.025], [32.02, 40.015]],
            profileElevationM: [250, 100],
          },
          {
            id: 'tailrace',
            component: 'tailrace_tunnel',
            kind: 'polyline',
            material: 'tailrace_channel',
            coords: [[32.02, 40.015], [32.025, 40.01]],
            profileElevationM: [100, 90],
          },
          {
            id: 'lower',
            component: 'lower_reservoir',
            kind: 'polygon',
            material: 'water',
            closed: true,
            coords: [[32.02, 40.005], [32.03, 40.005], [32.03, 40.015], [32.02, 40.015], [32.02, 40.005]],
            elevationM: 90,
          },
          {
            id: 'powerhouse',
            component: 'powerhouse',
            kind: 'polygon',
            material: 'industrial',
            closed: true,
            coords: [[32.018, 40.014], [32.022, 40.014], [32.022, 40.018], [32.018, 40.018], [32.018, 40.014]],
            elevationM: 110,
          },
          {
            id: 'switchyard',
            component: 'switchyard',
            kind: 'polygon',
            material: 'switchyard',
            closed: true,
            coords: [[32.026, 40.018], [32.03, 40.018], [32.03, 40.022], [32.026, 40.022], [32.026, 40.018]],
            elevationM: 130,
          },
        ],
      },
    });

    render(
      <ThreeDModel
        siteId={site.id}
        activeComponent="powerhouse"
        onSelectComponent={vi.fn()}
        layers={{}}
        mode="generate"
        componentsDetail={{
          upper_reservoir: {
            elevation_m: 500,
            active_volume_mcm: 2,
            dam_height_m: 10,
            lining: '',
            geology_note: '',
          },
          lower_reservoir: { elevation_m: 90, min_level_m: 80, note: '' },
          penstock: { diameter_m: 4, length_m: 100, material: '', pressure_class: '', count: 1 },
          powerhouse: { cavern_width_m: 10, cavern_length_m: 20, cavern_height_m: 15, units: 2, turbine_type: '' },
          surge_tank: { type: '', height_m: 20, diameter_m: 5 },
          switchyard: { voltage_kv: 154, transformer_count: 1, connection_line_km: 1 },
          tunnel: { length_m: 100, diameter_m: 4, excavation_type: '' },
          intake_outfall: null,
        }}
        site={site}
        isPlaying={true}
        activeUnits={1}
        activeUnitIds={['G1']}
        simulationState="GENERATING"
        quality="high"
        upperSoc={0.72}
        lowerSoc={0.28}
        maxUnits={2}
        showTerrain={true}
        showLabels={true}
        terrainOpacity={0.7}
      />,
    );

    expect(screen.getByTestId('hydraulic-flow-layer').textContent).toMatch(/üretim|generation/i);
    expect(screen.getByTestId('electrical-flow-layer').textContent).toMatch(/\+300\.0 MW|\+300 MW/);
    expect(screen.getByTestId('reservoir-level-layer').textContent).toMatch(/SOC/i);
    expect(screen.getByTestId('equipment-animation-layer').textContent).toMatch(/G1/);
    expect(screen.getByTestId('simulation-status-layer').textContent).toMatch(/GENERATING/);
  });

  it('keeps footprint simulation flows inactive when no unit is selected', () => {
    const site = makeTestSite({
      layout3D: {
        scale: 'macro',
        preferredBearing: 0,
        terrainExaggeration: 1,
        reservoirSurfaceMode: 'polygon',
        useFootprintPolygons: true,
        hideLegacySquareReservoir: true,
        componentFootprints: [{
          id: 'penstock-a',
          component: 'penstock',
          kind: 'polyline',
          material: 'shaft',
          coords: [[32.015, 40.025], [32.02, 40.015]],
          profileElevationM: [250, 100],
        }],
      },
    });

    render(
      <ThreeDModel
        siteId={site.id}
        activeComponent="penstock"
        onSelectComponent={vi.fn()}
        layers={{}}
        mode="pump"
        componentsDetail={{
          upper_reservoir: {
            elevation_m: 500,
            active_volume_mcm: 2,
            dam_height_m: 10,
            lining: '',
            geology_note: '',
          },
          lower_reservoir: { elevation_m: 90, min_level_m: 80, note: '' },
          penstock: { diameter_m: 4, length_m: 100, material: '', pressure_class: '', count: 1 },
          powerhouse: { cavern_width_m: 10, cavern_length_m: 20, cavern_height_m: 15, units: 2, turbine_type: '' },
          surge_tank: { type: '', height_m: 20, diameter_m: 5 },
          switchyard: { voltage_kv: 154, transformer_count: 1, connection_line_km: 1 },
          tunnel: { length_m: 100, diameter_m: 4, excavation_type: '' },
          intake_outfall: null,
        }}
        site={site}
        isPlaying={true}
        activeUnits={0}
        activeUnitIds={[]}
        simulationState="PUMPING"
        quality="low"
        upperSoc={0.5}
        lowerSoc={0.5}
        maxUnits={2}
        showTerrain={false}
        showLabels={true}
        terrainOpacity={0.7}
      />,
    );

    expect(screen.getByTestId('hydraulic-flow-layer').getAttribute('data-flow-active')).toBe('false');
    expect(screen.getByTestId('electrical-flow-layer').getAttribute('data-flow-active')).toBe('false');
  });
});
