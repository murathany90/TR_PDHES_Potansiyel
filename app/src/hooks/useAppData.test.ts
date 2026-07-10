import { describe, expect, it, vi } from 'vitest';
import sites from '../../public/data.json';
import { loadAppData } from './useAppData';

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
});
