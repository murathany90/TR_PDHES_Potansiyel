import { PDHES_CANDIDATE_EXCEL_DATA } from "../../data/generated/pdhesCandidateExcelData";
import type { Site } from "../../types/site";
import { normalizeName } from "./normalize";

const excelDataByNormalizedName = new Map(
  PDHES_CANDIDATE_EXCEL_DATA.map((candidate) => [candidate.normalizedName, candidate]),
);

export function findExcelCalculatedDataByName(name: string) {
  return excelDataByNormalizedName.get(normalizeName(name));
}

export function attachExcelCalculatedData<T extends Pick<Site, "name">>(sites: T[]): Array<T & Pick<Site, "excelCalculated">> {
  return sites.map((site) => {
    const excelCalculated = findExcelCalculatedDataByName(site.name);
    if (!excelCalculated) return site;

    return {
      ...site,
      excelCalculated,
    };
  });
}
