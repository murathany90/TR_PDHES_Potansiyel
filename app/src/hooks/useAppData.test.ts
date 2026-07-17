import { describe, expect, it, vi } from 'vitest';
import sites from '../../public/data.json';
import type { Site } from '../types/site';
import { loadAppData, mergeAppSites } from './useAppData';

describe('loadAppData', () => {
  it('loads and validates site data', async () => {
    const fetcher = vi.fn(async () => {
      return new Response(JSON.stringify(sites), { status: 200 });
    });

    const result = await loadAppData(fetcher, '/pdhes/');

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result.sites).toHaveLength(15);
    expect(result.sites.find((site) => site.name === 'Gökçekaya PDHES')?.excelCalculated?.totalScore)
      .toBeCloseTo(58.9169702956853, 10);
  });

  it('returns an actionable error for failed requests', async () => {
    const fetcher = vi.fn(async () => new Response('missing', { status: 404 }));

    await expect(loadAppData(fetcher, '/')).rejects.toThrow('yüklenemedi');
  });
  it('uses canonical base data over stale local storage in public mode', () => {
    const baseGokcekaya = structuredClone(sites.find((site) => site.id === 'kamu-gokcekaya-pspp')!) as Site;
    const staleLocalGokcekaya = structuredClone(baseGokcekaya);
    staleLocalGokcekaya.components_detail!.powerhouse.units = 6;
    delete (staleLocalGokcekaya.components_detail!.powerhouse as { unitPowerMW?: number }).unitPowerMW;
    const customLocalSite = { ...structuredClone(baseGokcekaya), id: 'local-custom-site', name: 'Yerel Özel Saha' } as Site;

    const publicMerged = mergeAppSites([baseGokcekaya], [staleLocalGokcekaya, customLocalSite], false);
    expect(publicMerged.find((site) => site.id === baseGokcekaya.id)?.components_detail?.powerhouse.units).toBe(4);
    expect(publicMerged.find((site) => site.id === baseGokcekaya.id)?.components_detail?.powerhouse.unitPowerMW).toBe(350);
    expect(publicMerged.some((site) => site.id === customLocalSite.id)).toBe(true);

    const editorMerged = mergeAppSites([baseGokcekaya], [staleLocalGokcekaya], true);
    expect(editorMerged.find((site) => site.id === baseGokcekaya.id)?.components_detail?.powerhouse.units).toBe(6);
  });
});
