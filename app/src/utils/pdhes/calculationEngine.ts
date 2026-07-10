import { PDHES_EXCEL_INPUT_DEFAULTS } from "../../data/generated/pdhesCandidateExcelData";
import type {
  PdhesCalculationInputs,
  PdhesCalculationOutputs,
  PdhesCandidateExcelCalculatedData,
  PdhesExcelInputDefaults,
} from "./types";

function finiteOrNull(value: number): number | null {
  return Number.isFinite(value) ? value : null;
}

function valueOrDefault(value: number | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function percentToRatio(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return value > 1 ? value / 100 : value;
}

export function createCalculationInputsFromExcel(
  excel?: PdhesCandidateExcelCalculatedData,
  defaults: PdhesExcelInputDefaults = PDHES_EXCEL_INPUT_DEFAULTS,
): PdhesCalculationInputs {
  const capacityMw = valueOrDefault(excel?.capacityMw, 0);
  const storageHours = valueOrDefault(
    excel?.storageHours,
    excel?.energyMwh && capacityMw > 0 ? excel.energyMwh / capacityMw : 0,
  );

  return {
    capacityMw,
    netHeadM: valueOrDefault(excel?.netHeadM ?? excel?.grossHeadM, 0),
    storageHours,
    upperActiveVolumeHm3: valueOrDefault(excel?.upperActiveVolumeHm3, 0),
    roundTripEfficiencyPct: valueOrDefault(excel?.roundTripEfficiencyPct, defaults.roundTripEfficiencyPct),
    pumpEfficiencyPct: defaults.pumpEfficiencyPct,
    turbineGeneratorEfficiencyPct: defaults.turbineGeneratorEfficiencyPct,
    annualCycles: valueOrDefault(excel?.annualCycles, defaults.annualCycles),
    peakPriceUsdMwh: valueOrDefault(excel?.peakPriceUsdMwh, defaults.peakPriceUsdMwh),
    offPeakPriceUsdMwh: valueOrDefault(excel?.offPeakPriceUsdMwh, defaults.offPeakPriceUsdMwh),

    ancillaryServiceRevenueMode: "fixedMUsd",
    ancillaryServiceRevenueMUsd: valueOrDefault(excel?.ancillaryServiceRevenueMUsd, 0),
    ancillaryServiceUnitRevenueUsdPerMwYear: defaults.ancillaryServiceUnitRevenueUsdPerMwYear,

    capacityMechanismRevenueMode: "fixedMUsd",
    capacityMechanismRevenueMUsd: valueOrDefault(excel?.capacityMechanismRevenueMUsd, 0),
    capacityMechanismUnitRevenueUsdPerMwYear: defaults.capacityMechanismUnitRevenueUsdPerMwYear,

    capexMode: "fixedMUsd",
    fixedCapexMUsd: valueOrDefault(excel?.capexMUsd, 0),
    capexIntensityUsdKw: valueOrDefault(excel?.capexIntensityUsdKw, defaults.capexIntensityUsdKw),
    omRatePct: defaults.omRatePct,

    waterDensityKgM3: defaults.waterDensityKgM3,
    gravityMps2: defaults.gravityMps2,
  };
}

export function calculatePdhesFinancials(inputs: PdhesCalculationInputs): PdhesCalculationOutputs {
  const turbineRatio = percentToRatio(inputs.turbineGeneratorEfficiencyPct);
  const roundTripRatio = percentToRatio(inputs.roundTripEfficiencyPct);
  const denominator = inputs.waterDensityKgM3 * inputs.gravityMps2 * inputs.netHeadM * turbineRatio;

  const designFlowCms = denominator > 0
    ? (inputs.capacityMw * 1_000_000) / denominator
    : Number.NaN;
  const cycleEnergyMwh = inputs.capacityMw * inputs.storageHours;
  const upperActiveVolumeM3 = inputs.upperActiveVolumeHm3 * 1_000_000;
  const volumeBasedEnergyMwh = inputs.waterDensityKgM3
    * inputs.gravityMps2
    * inputs.netHeadM
    * upperActiveVolumeM3
    * turbineRatio
    / 3_600_000_000;

  const pumpingEnergyPerCycleMwh = roundTripRatio > 0 ? cycleEnergyMwh / roundTripRatio : Number.NaN;
  const pumpPowerMw = roundTripRatio > 0 ? inputs.capacityMw / roundTripRatio : Number.NaN;
  const annualGenerationGwh = cycleEnergyMwh * inputs.annualCycles / 1000;
  const grossGenerationRevenueMUsd = annualGenerationGwh * 1000 * inputs.peakPriceUsdMwh / 1_000_000;
  const pumpingEnergyCostMUsd = pumpingEnergyPerCycleMwh * inputs.annualCycles * inputs.offPeakPriceUsdMwh / 1_000_000;
  const netArbitrageRevenueMUsd = grossGenerationRevenueMUsd - pumpingEnergyCostMUsd;
  const ancillaryServiceRevenueMUsd = inputs.ancillaryServiceRevenueMode === "fixedMUsd"
    ? inputs.ancillaryServiceRevenueMUsd
    : inputs.capacityMw * inputs.ancillaryServiceUnitRevenueUsdPerMwYear / 1_000_000;
  const capacityMechanismRevenueMUsd = inputs.capacityMechanismRevenueMode === "fixedMUsd"
    ? inputs.capacityMechanismRevenueMUsd
    : inputs.capacityMw * inputs.capacityMechanismUnitRevenueUsdPerMwYear / 1_000_000;
  const annualTotalRevenueMUsd = netArbitrageRevenueMUsd
    + ancillaryServiceRevenueMUsd
    + capacityMechanismRevenueMUsd;
  const capexMUsd = inputs.capexMode === "fixedMUsd"
    ? inputs.fixedCapexMUsd
    : inputs.capacityMw * 1000 * inputs.capexIntensityUsdKw / 1_000_000;
  const omMUsdPerYear = capexMUsd * percentToRatio(inputs.omRatePct);
  const netCashFlowMUsdPerYear = annualTotalRevenueMUsd - omMUsdPerYear;
  const paybackYears = netCashFlowMUsdPerYear > 0 ? capexMUsd / netCashFlowMUsdPerYear : Number.NaN;

  return {
    designFlowCms: finiteOrNull(designFlowCms),
    cycleEnergyMwh: finiteOrNull(cycleEnergyMwh),
    volumeBasedEnergyMwh: finiteOrNull(volumeBasedEnergyMwh),
    pumpingEnergyPerCycleMwh: finiteOrNull(pumpingEnergyPerCycleMwh),
    pumpPowerMw: finiteOrNull(pumpPowerMw),
    annualGenerationGwh: finiteOrNull(annualGenerationGwh),
    grossGenerationRevenueMUsd: finiteOrNull(grossGenerationRevenueMUsd),
    pumpingEnergyCostMUsd: finiteOrNull(pumpingEnergyCostMUsd),
    netArbitrageRevenueMUsd: finiteOrNull(netArbitrageRevenueMUsd),
    ancillaryServiceRevenueMUsd: finiteOrNull(ancillaryServiceRevenueMUsd),
    capacityMechanismRevenueMUsd: finiteOrNull(capacityMechanismRevenueMUsd),
    annualTotalRevenueMUsd: finiteOrNull(annualTotalRevenueMUsd),
    capexMUsd: finiteOrNull(capexMUsd),
    omMUsdPerYear: finiteOrNull(omMUsdPerYear),
    netCashFlowMUsdPerYear: finiteOrNull(netCashFlowMUsdPerYear),
    paybackYears: finiteOrNull(paybackYears),
  };
}
