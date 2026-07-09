import type { PdhesType, Site } from '../types/site';

export type PdhesTypeFilter = 'ALL' | PdhesType;

export interface CandidateFilters {
  pdhesType: PdhesTypeFilter;
  minCapacityMW: number | null;
  maxCapacityMW: number | null;
  minHeadM: number | null;
  maxHeadM: number | null;
  minFlowCms: number | null;
  maxFlowCms: number | null;
}

export const DEFAULT_DATA_FILTERS: CandidateFilters = {
  pdhesType: 'ALL',
  minCapacityMW: null,
  maxCapacityMW: null,
  minHeadM: null,
  maxHeadM: null,
  minFlowCms: null,
  maxFlowCms: null,
};

export const PDHES_TYPE_FILTERS: Array<{ id: PdhesTypeFilter; label: string }> = [
  { id: 'ALL', label: 'Tümü' },
  { id: 'OPEN_LOOP', label: 'Açık Çevrim PDHES' },
  { id: 'CLOSED_LOOP', label: 'Kapalı Çevrim PDHES' },
  { id: 'SEA_WATER', label: 'Deniz Suyu PDHES' },
  { id: 'HYBRID', label: 'Hibrit (Şebeke Desteksiz) PDHES' },
  { id: 'MIXED', label: 'Karışık PDHES' },
];

function inRange(value: number | null | undefined, min: number | null, max: number | null): boolean {
  if (min === null && max === null) return true;
  if (value === null || value === undefined || !Number.isFinite(value)) return false;
  if (min !== null && value < min) return false;
  if (max !== null && value > max) return false;
  return true;
}

export function matchesCandidateFilters(site: Site, filters: CandidateFilters): boolean {
  if (filters.pdhesType !== 'ALL' && site.pdhesType !== filters.pdhesType) return false;
  if (!inRange(site.capacityMW, filters.minCapacityMW, filters.maxCapacityMW)) return false;
  if (!inRange(site.headM, filters.minHeadM, filters.maxHeadM)) return false;
  if (!inRange(site.projectFlowCms, filters.minFlowCms, filters.maxFlowCms)) return false;
  return true;
}
