import { describe, expect, it } from 'vitest';
import sites from '../../public/data.json';
import { WORLD_EXAMPLES } from '../data/worldExamples';
import { buildComponentsDetail, getSiteLayout } from './siteDerived';
import { validateSites } from './siteSchema';

const GOKCEKAYA_UPPER_POLYGON = [
  [30.9627, 40.0749],
  [30.9662, 40.0766],
  [30.9728, 40.0772],
  [30.9796, 40.0764],
  [30.9837, 40.0740],
  [30.9843, 40.0708],
  [30.9826, 40.0681],
  [30.9780, 40.0664],
  [30.9715, 40.0660],
  [30.9658, 40.0668],
  [30.9626, 40.0690],
  [30.9619, 40.0720],
  [30.9627, 40.0749],
] as const;

describe('validateSites', () => {
  it('accepts the JICA 16 + seawater top4 candidate dataset', () => {
    const result = validateSites(sites);

    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.sites).toHaveLength(20);
    expect(new Set(result.sites.map((site) => site.id)).size).toBe(20);

    expect(result.sites.filter((site) => site.sourceGroup === 'JICA_EIE_16')).toHaveLength(17);
    expect(result.sites.filter((site) => site.sourceGroup === 'SEA_WATER_PROTOTYPE_TOP4')).toHaveLength(3);
    expect(result.sites.some((site) => site.id === 'presenzano')).toBe(false);
    expect(result.sites.map((site) => site.id).slice(16)).toEqual([
      'altinkaya',
      'tasucu',
      'bozyazi_anamur',
      'karaburun',
    ]);
  });

  it('keeps JICA technical values and approximate coordinate confidence explicit', () => {
    const result = validateSites(sites);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const sariyar = result.sites.find((site) => site.id === 'jica-sariyar-pspp');
    expect(sariyar).toMatchObject({
      name: 'Sarıyar PDHES',
      province: 'Ankara',
      capacityMW: 1000,
      projectFlowCms: 270,
      headM: 434,
      shaftLengthM: 387,
      penstockLengthM: 595,
      tailraceTunnelLengthM: 815,
      sourceGroup: 'JICA_EIE_16',
    });
    expect(sariyar?.coordinates.coordinateConfidence).toBe('fallback-approximate');
    expect(sariyar?.technicalClassification.primaryPurpose).toBe('PEAK_POWER');
  });

  it('keeps the updated Gokcekaya polygon footprint drawing coordinates', () => {
    const result = validateSites(sites);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const gokcekaya = result.sites.find((site) => site.id === 'jica-gokcekaya-pspp');
    expect(gokcekaya).toBeTruthy();
    if (!gokcekaya) return;

    expect(gokcekaya.coordinates.mapAnchor).toEqual([31.0225, 40.0354]);
    expect(gokcekaya.coordinates.lowerReservoir.point).toEqual([31.0225, 40.0354]);
    expect(gokcekaya.coordinates.upperReservoir.point).toEqual([30.9737, 40.0717]);
    expect(gokcekaya.coordinates.upperReservoirPolygon).toEqual(GOKCEKAYA_UPPER_POLYGON);
    expect(gokcekaya.coordinates.powerhouse.point).toEqual([31.0079, 40.0280]);
    expect(gokcekaya.coordinates.surgeTank.point).toEqual([30.9897, 40.0524]);
    expect(gokcekaya.coordinates.switchyard.point).toEqual([31.0134, 40.0274]);
    expect(gokcekaya.coordinates.gridConnection.point).toEqual([31.0134, 40.0274]);
    expect(gokcekaya.coordinates.bbox).toEqual([30.956, 40.022, 31.042, 40.08]);

    const layout = getSiteLayout(gokcekaya);
    expect(layout).toMatchObject({
      bearing: -34,
      upper: [30.9737, 40.0717],
      lower: [31.0225, 40.0354],
      power: [31.0079, 40.0280],
      surge: [30.9897, 40.0524],
      servicePortal: [30.9987, 40.0339],
      switchyard: [31.0134, 40.0274],
      gridA: [31.0134, 40.0274],
      gridB: [31.0204, 40.0258],
      risk: [31.0225, 40.0354],
      gridTap: [31.0134, 40.0274],
    });
    expect(layout.upperPolygon).toEqual(GOKCEKAYA_UPPER_POLYGON);

    expect(gokcekaya.layout3D?.useFootprintPolygons).toBe(true);
    expect(gokcekaya.layout3D?.hideLegacySquareReservoir).toBe(true);
    expect(gokcekaya.layout3D?.componentFootprints.map((footprint) => footprint.id)).toEqual([
      'lowerReservoirWater',
      'upperReservoirWater',
      'upperReservoirEmbankment',
      'upperIntakeStructure',
      'surgeTankFootprint',
      'serviceDrainPortal',
      'powerhouseFootprint',
      'switchyardFootprint',
      'penstock01',
      'penstock02',
      'penstock03',
      'penstock04',
      'tailraceOutfall',
      'lowerDamAxis',
    ]);

    const details = buildComponentsDetail(gokcekaya);
    expect(details.upper_reservoir).toMatchObject({
      elevation_m: 801,
      active_volume_mcm: 10.8,
      dam_height_m: 38,
      render_mode: 'polygon_footprint',
    });
  });

  it('classifies selected seawater prototypes with sea lower reservoir rules', () => {
    const result = validateSites(sites);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const seaSites = result.sites.filter((site) => site.sourceGroup === 'SEA_WATER_PROTOTYPE_TOP4');
    expect(seaSites.map((site) => site.score)).toEqual([79, 76, 72]);
    expect(seaSites.every((site) =>
      site.technicalClassification.cycleType === 'SEA_LOWER_RESERVOIR'
      && site.technicalClassification.infrastructureType === 'SEAWATER_COASTAL'
      && site.technicalClassification.conceptType === 'SEAWATER',
    )).toBe(true);
    expect(seaSites.every((site) => site.risks.includes('Deniz suyu korozyonu'))).toBe(true);
  });

  it('moves Presenzano to world examples without keeping it as a Turkey candidate', () => {
    const result = validateSites(sites);
    expect(result.ok).toBe(true);
    expect(result.sites.some((site) => site.id === 'presenzano')).toBe(false);

    const presenzano = WORLD_EXAMPLES.find((example) => example.id === 'presenzano');
    expect(presenzano).toMatchObject({
      name: 'Presenzano (Domenico Cimarosa) PSPP',
      country: 'İtalya',
      capacityMw: 1000,
      headM: 498,
      lat: 41.3878,
      lon: 14.073,
    });
  });

  it('rejects legacy type fields and malformed coordinates', () => {
    const invalid = [{
      ...sites[0],
      pdhesType: 'SEA_WATER',
      coordinates: { ...sites[0].coordinates, mapAnchor: [190, 95] },
    }];
    const result = validateSites(invalid);

    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('eski pdhesType'))).toBe(true);
    expect(result.errors.some((error) => error.includes('coordinates.mapAnchor'))).toBe(true);
  });

  it('rejects malformed Gokcekaya-style footprint geometry', () => {
    const invalid = [{
      ...sites[0],
      coordinates: {
        ...sites[0].coordinates,
        upperReservoirPolygon: [[30.1, 40.1], [30.2, 40.2], [30.3, 40.3]],
      },
      layout3D: {
        scale: 'macro',
        preferredBearing: -32,
        terrainExaggeration: 1.35,
        reservoirSurfaceMode: 'polygon',
        useFootprintPolygons: true,
        hideLegacySquareReservoir: true,
        componentFootprints: [{
          id: 'badFootprint',
          component: 'upper_reservoir',
          kind: 'polygon',
          material: 'bad_material',
          closed: true,
          coords: [[30.1, 40.1], [30.2, 40.2], [30.3, 40.3]],
          baseElevationM: 801,
          topElevationM: 801,
          extrudeM: 0,
        }],
      },
    }];
    const result = validateSites(invalid);

    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('upperReservoirPolygon'))).toBe(true);
    expect(result.errors.some((error) => error.includes('layout3D.componentFootprints'))).toBe(true);
    expect(result.errors.some((error) => error.includes('material'))).toBe(true);
  });

  it('rejects duplicate IDs', () => {
    const duplicate = [sites[0], { ...sites[1], id: sites[0].id }];
    const result = validateSites(duplicate);

    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('tekrar'))).toBe(true);
  });
});
