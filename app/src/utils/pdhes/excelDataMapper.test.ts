import { describe, expect, it } from "vitest";

import { PDHES_CANDIDATE_EXCEL_DATA } from "../../data/generated/pdhesCandidateExcelData";
import baseData from "../../../public/data.json";
import { attachExcelCalculatedData } from "./excelDataMapper";

describe("PDHES Excel data mapper", () => {
  it("generates 15 Excel candidate rows and reads Gokcekaya score from Skor_Hesap", () => {
    expect(PDHES_CANDIDATE_EXCEL_DATA).toHaveLength(15);

    const gokcekaya = PDHES_CANDIDATE_EXCEL_DATA.find(
      (candidate) => candidate.normalizedName === "gokcekayapdhes",
    );

    expect(gokcekaya?.capacityMw).toBe(1400);
    expect(gokcekaya?.energyMwh).toBe(9800);
    expect(gokcekaya?.netHeadM).toBeCloseTo(368.6, 6);
    expect(gokcekaya?.totalScore).toBeCloseTo(58.9169702956853, 10);
    expect(gokcekaya).not.toHaveProperty("lowerLatitude");
    expect(gokcekaya).not.toHaveProperty("upperLongitude");
  });

  it("enriches sites by normalized name while preserving map and 3D geometry", () => {
    const baseSites = baseData;
    const enriched = attachExcelCalculatedData(baseSites);
    const matchedCount = enriched.filter((site) => site.excelCalculated).length;
    const baseGokcekaya = baseSites.find((site) => site.name === "Gökçekaya PDHES");
    const gokcekaya = enriched.find((site) => site.name === "Gökçekaya PDHES");

    expect(matchedCount).toBe(15);
    expect(gokcekaya?.excelCalculated?.totalScore).toBeCloseTo(58.9169702956853, 10);
    expect(gokcekaya?.coordinates).toEqual(baseGokcekaya?.coordinates);
    expect(gokcekaya?.layout).toEqual(baseGokcekaya?.layout);
    expect(gokcekaya?.layout3D).toEqual(baseGokcekaya?.layout3D);
  });
});
