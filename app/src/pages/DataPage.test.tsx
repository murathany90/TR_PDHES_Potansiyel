// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useSiteStore } from "../stores/useSiteStore";
import { makeTestSite } from "../test-utils/makeTestSite";
import DataPage from "./DataPage";

const gokcekaya = makeTestSite({
  id: "kamu-gokcekaya-pspp",
  name: "Gökçekaya PDHES",
  province: "Eskişehir",
  order: 1,
  excelCalculated: {
    no: 1,
    candidateName: "Gökçekaya PDHES",
    normalizedName: "gokcekayapdhes",
    type: "Açık Çevrim PDHES",
    region: "Eskişehir",
    capacityMw: 1400,
    storageHours: 7,
    energyMwh: 9800,
    lowerReservoirName: "Gökçekaya Barajı",
    lowerReservoirElevationM: 389,
    upperReservoirElevationM: 769,
    grossHeadM: 380,
    netHeadM: 368.6,
    totalScore: 58.9169702956853,
    paybackYears: 10.668597634564327,
    designFlowCms: 430.19086892840136,
    upperActiveVolumeHm3: 10.840809896995713,
    roundTripEfficiencyPct: 78,
    pumpPowerMw: 1794.871794871795,
    pumpingEnergyPerCycleMwh: 12564.102564102564,
    annualCycles: 300,
    annualGenerationGwh: 2940,
    peakPriceUsdMwh: 110,
    offPeakPriceUsdMwh: 45,
    grossGenerationRevenueMUsd: 323.4,
    pumpingEnergyCostMUsd: 169.61538461538464,
    netArbitrageRevenueMUsd: 153.78461538461534,
    ancillaryServiceRevenueMUsd: 63,
    capacityMechanismRevenueMUsd: 42,
    annualTotalRevenueMUsd: 258.78461538461534,
    capexIntensityUsdKw: 1700,
    capexMUsd: 2380,
    omMUsdPerYear: 35.7,
    netCashFlowMUsdPerYear: 223.08461538461535,
    dataSource: "PDHES_Aday_Verileri_Koordinatli_Dinamik_Hesap.xlsx",
  },
} as any);

const altinkaya = makeTestSite({
  id: "altinkaya",
  name: "Altınkaya PDHES",
  province: "Samsun",
  order: 2,
  excelCalculated: {
    no: 3,
    candidateName: "Altınkaya PDHES",
    normalizedName: "altinkayapdhes",
    type: "Açık Çevrim PDHES",
    region: "Samsun",
    capacityMw: 1200,
    storageHours: 6,
    energyMwh: 7200,
    lowerReservoirName: "Altınkaya Barajı",
    lowerReservoirElevationM: 188,
    upperReservoirElevationM: 520,
    grossHeadM: 332,
    netHeadM: 322,
    totalScore: 76.2,
    paybackYears: 8.4,
    annualTotalRevenueMUsd: 220,
    capexMUsd: 1900,
    dataSource: "PDHES_Aday_Verileri_Koordinatli_Dinamik_Hesap.xlsx",
  },
} as any);

describe("DataPage", () => {
  beforeEach(() => {
    useSiteStore.setState({ sites: [gokcekaya, altinkaya], selectedId: gokcekaya.id });
  });

  afterEach(cleanup);

  it("renders the Excel-derived candidate columns and summary cards", () => {
    render(
      <MemoryRouter>
        <DataPage site={gokcekaya} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("columnheader", { name: "No" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Aday Adı" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Kapasite (MW)" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Enerji (MWh)" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Net Düşü (m)" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Toplam Skor/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Geri Ödeme/i })).toBeTruthy();

    expect(screen.getByText("Toplam Kurulu Güç")).toBeTruthy();
    expect(screen.getByText("2.600 MW")).toBeTruthy();
    expect(screen.getByText("Toplam Depolama Enerjisi")).toBeTruthy();
    expect(screen.getByText("17.000 MWh")).toBeTruthy();
  });

  it("sorts score and payback columns with null-safe Excel values", () => {
    render(
      <MemoryRouter>
        <DataPage site={gokcekaya} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Toplam Skor/i }));
    const firstDataRowAfterScoreSort = screen.getAllByRole("row")[1];
    expect(within(firstDataRowAfterScoreSort).getByText("Altınkaya PDHES")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Geri Ödeme/i }));
    const firstDataRowAfterPaybackSort = screen.getAllByRole("row")[1];
    expect(within(firstDataRowAfterPaybackSort).getByText("Altınkaya PDHES")).toBeTruthy();
  });

  it("opens the grouped Excel detail panel from a candidate row", () => {
    render(
      <MemoryRouter>
        <DataPage site={gokcekaya} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Gökçekaya PDHES/i }));

    expect(screen.getByText("Teknik Parametreler")).toBeTruthy();
    expect(screen.getByText("Piyasa ve Gelir Parametreleri")).toBeTruthy();
    expect(screen.getByText("Yatırım ve Geri Ödeme")).toBeTruthy();
    expect(screen.getByText("430,2 m³/s")).toBeTruthy();
    expect(screen.getByText("258,8 M USD")).toBeTruthy();
    expect(screen.getByText("2.380 M USD")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Gökçekaya PDHES/i }));
    expect(screen.queryByText("Teknik Parametreler")).toBeNull();
  });

  it("shows a helpful empty state when the selected filter has no matches", () => {
    render(
      <MemoryRouter>
        <DataPage site={gokcekaya} />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "CLOSED_LOOP" },
    });

    const emptyCell = document.querySelector('[data-empty-state="candidate-filter"]');
    expect(emptyCell).toBeTruthy();
    expect(emptyCell?.textContent).toContain("filtreyle");
    expect(emptyCell?.getAttribute("colspan")).toBe("14");
  });
});
