import { useEffect, useState } from 'react';
import { getLegacyCustomSites, getPersistedSites, useSiteStore } from '../stores/useSiteStore';
import { publicAssetUrl } from '../utils/publicUrl';
import { attachExcelCalculatedData } from '../utils/pdhes/excelDataMapper';
import { validateSites } from '../utils/siteSchema';
import { isLocalWorkspaceEnabled } from '../utils/workspaceMode';

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

interface LoadedAppData {
  sites: ReturnType<typeof validateSites>['sites'];
}

type AppSite = LoadedAppData['sites'][number];

export function mergeAppSites(baseSites: AppSite[], localSites: AppSite[] | null | undefined, preferLocalSites: boolean): AppSite[] {
  if (!localSites?.length) return baseSites;
  if (preferLocalSites) {
    return [
      ...localSites,
      ...baseSites.filter((base) => !localSites.some((local) => local.id === base.id)),
    ];
  }
  return [
    ...baseSites,
    ...localSites.filter((local) => !baseSites.some((base) => base.id === local.id)),
  ];
}

export async function loadAppData(
  fetcher: FetchLike = fetch,
  base = import.meta.env.BASE_URL,
): Promise<LoadedAppData> {
  const dataResponse = await fetcher(publicAssetUrl(`data.json?v=${Date.now()}`, base), {
    cache: "no-store",
  });

  if (!dataResponse.ok) {
    throw new Error(
      `Uygulama verileri yüklenemedi (aday: ${dataResponse.status}).`,
    );
  }

  const siteJson = await dataResponse.json() as Promise<unknown>;
  const validation = validateSites(siteJson);
  if (!validation.ok) {
    throw new Error(`Aday veri sözleşmesi geçersiz: ${validation.errors.slice(0, 3).join(' ')}`);
  }

  return { sites: attachExcelCalculatedData(validation.sites) };
}

export function useAppData() {
  const [error, setError] = useState<string | null>(null);
  const setSites = useSiteStore((state) => state.setSites);
  const setBaseSites = useSiteStore((state) => state.setBaseSites);
  const setLoading = useSiteStore((state) => state.setLoading);

  useEffect(() => {
    let active = true;

    loadAppData()
      .then(({ sites: baseSites }) => {
        if (!active) return;
        const persistedSites = getPersistedSites();
        const legacySites = getLegacyCustomSites();
        const localSites = persistedSites ?? legacySites;
        const workspaceEnabled = typeof window !== 'undefined' && isLocalWorkspaceEnabled(window.location.search);
        const mergedSites = mergeAppSites(baseSites, localSites, workspaceEnabled);
        setBaseSites(baseSites);
        setSites(attachExcelCalculatedData(mergedSites));
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        const message = reason instanceof Error ? reason.message : 'Uygulama verileri yüklenemedi.';
        setError(message);
        console.error(message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [setBaseSites, setLoading, setSites]);

  return { error };
}
