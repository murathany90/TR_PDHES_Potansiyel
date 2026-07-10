import { describe, expect, it } from "vitest";

import { PDHES_CANDIDATE_EXCEL_DATA } from "../../data/generated/pdhesCandidateExcelData";
import {
  calculatePdhesFinancials,
  createCalculationInputsFromExcel,
} from "./calculationEngine";

describe("PDHES calculation engine", () => {
  const gokcekaya = PDHES_CANDIDATE_EXCEL_DATA.find(
    (candidate) => candidate.normalizedName === "gokcekayapdhes",
  );

  it("reproduces the cached Gokcekaya Excel defaults", () => {
    expect(gokcekaya).toBeDefined();

    const inputs = createCalculationInputsFromExcel(gokcekaya!);
    const result = calculatePdhesFinancials(inputs);

    expect(result.cycleEnergyMwh).toBeCloseTo(9800, 6);
    expect(result.designFlowCms).toBeCloseTo(430.19, 2);
    expect(result.pumpingEnergyPerCycleMwh).toBeCloseTo(12564.1, 1);
    expect(result.annualTotalRevenueMUsd).toBeCloseTo(258.7846, 4);
    expect(result.capexMUsd).toBeCloseTo(2380, 6);
    expect(result.paybackYears).toBeCloseTo(10.6686, 4);
  });

  it("updates outputs dynamically when market and CAPEX assumptions change", () => {
    const inputs = createCalculationInputsFromExcel(gokcekaya!);
    const base = calculatePdhesFinancials(inputs);
    const changed = calculatePdhesFinancials({
      ...inputs,
      peakPriceUsdMwh: 120,
      capexMode: "intensityUsdKw",
      capexIntensityUsdKw: 1800,
    });

    expect(changed.annualTotalRevenueMUsd).toBeGreaterThan(base.annualTotalRevenueMUsd ?? 0);
    expect(changed.capexMUsd).toBeCloseTo(2520, 6);
    expect(changed.paybackYears).toBeCloseTo(10.06, 2);
  });

  it("marks payback as unavailable when net cash flow is not positive", () => {
    const inputs = createCalculationInputsFromExcel(gokcekaya!);
    const result = calculatePdhesFinancials({
      ...inputs,
      peakPriceUsdMwh: 0,
      offPeakPriceUsdMwh: 500,
      ancillaryServiceRevenueMUsd: 0,
      capacityMechanismRevenueMUsd: 0,
    });

    expect(result.netCashFlowMUsdPerYear).toBeLessThanOrEqual(0);
    expect(result.paybackYears).toBeNull();
  });
});
