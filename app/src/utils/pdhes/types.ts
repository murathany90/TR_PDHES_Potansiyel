export interface PdhesCandidateExcelCalculatedData {
  no: number;
  candidateName: string;
  normalizedName: string;

  type?: string;
  region?: string;

  capacityMw?: number;
  storageHours?: number;
  energyMwh?: number;

  lowerReservoirName?: string;
  lowerReservoirElevationM?: number;
  upperReservoirElevationM?: number;
  grossHeadM?: number;
  netHeadM?: number;

  technicalScore?: number;
  economicScore?: number;
  dataConfidenceScore?: number;
  riskScore?: number;
  totalScore?: number;
  scoreClass?: string;
  scoreNote?: string;
  paybackYears?: number;

  designFlowCms?: number;
  upperActiveVolumeHm3?: number;
  roundTripEfficiencyPct?: number;
  pumpPowerMw?: number;
  pumpingEnergyPerCycleMwh?: number;
  annualCycles?: number;
  annualGenerationGwh?: number;

  peakPriceUsdMwh?: number;
  offPeakPriceUsdMwh?: number;

  grossGenerationRevenueMUsd?: number;
  pumpingEnergyCostMUsd?: number;
  netArbitrageRevenueMUsd?: number;
  ancillaryServiceRevenueMUsd?: number;
  capacityMechanismRevenueMUsd?: number;
  annualTotalRevenueMUsd?: number;

  capexIntensityUsdKw?: number;
  capexMUsd?: number;
  omMUsdPerYear?: number;
  netCashFlowMUsdPerYear?: number;

  dataSource?: string;
}

export interface PdhesExcelInputDefaults {
  waterDensityKgM3: number;
  gravityMps2: number;
  turbineGeneratorEfficiencyPct: number;
  pumpEfficiencyPct: number;
  roundTripEfficiencyPct: number;
  hydraulicLossPct: number;
  annualCycles: number;
  peakPriceUsdMwh: number;
  offPeakPriceUsdMwh: number;
  ancillaryServiceUnitRevenueUsdPerMwYear: number;
  capacityMechanismUnitRevenueUsdPerMwYear: number;
  capexIntensityUsdKw: number;
  omRatePct: number;
}

export type FixedOrUnitRevenueMode = "fixedMUsd" | "unitUsdPerMwYear";
export type CapexMode = "fixedMUsd" | "intensityUsdKw";

export interface PdhesCalculationInputs {
  capacityMw: number;
  netHeadM: number;
  storageHours: number;
  upperActiveVolumeHm3: number;
  roundTripEfficiencyPct: number;
  pumpEfficiencyPct: number;
  turbineGeneratorEfficiencyPct: number;
  annualCycles: number;
  peakPriceUsdMwh: number;
  offPeakPriceUsdMwh: number;

  ancillaryServiceRevenueMode: FixedOrUnitRevenueMode;
  ancillaryServiceRevenueMUsd: number;
  ancillaryServiceUnitRevenueUsdPerMwYear: number;

  capacityMechanismRevenueMode: FixedOrUnitRevenueMode;
  capacityMechanismRevenueMUsd: number;
  capacityMechanismUnitRevenueUsdPerMwYear: number;

  capexMode: CapexMode;
  fixedCapexMUsd: number;
  capexIntensityUsdKw: number;
  omRatePct: number;

  waterDensityKgM3: number;
  gravityMps2: number;
}

export interface PdhesCalculationOutputs {
  designFlowCms: number | null;
  cycleEnergyMwh: number | null;
  volumeBasedEnergyMwh: number | null;
  pumpingEnergyPerCycleMwh: number | null;
  pumpPowerMw: number | null;
  annualGenerationGwh: number | null;
  grossGenerationRevenueMUsd: number | null;
  pumpingEnergyCostMUsd: number | null;
  netArbitrageRevenueMUsd: number | null;
  ancillaryServiceRevenueMUsd: number | null;
  capacityMechanismRevenueMUsd: number | null;
  annualTotalRevenueMUsd: number | null;
  capexMUsd: number | null;
  omMUsdPerYear: number | null;
  netCashFlowMUsdPerYear: number | null;
  paybackYears: number | null;
}
