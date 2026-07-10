// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useSiteStore } from "../stores/useSiteStore";
import { makeTestSite } from "../test-utils/makeTestSite";
import SettingsPage from "./SettingsPage";

const gokcekaya = makeTestSite({
  id: "kamu-gokcekaya-pspp",
  name: "Gökçekaya PDHES",
  province: "Eskişehir",
  excelCalculated: {
    no: 1,
    candidateName: "Gökçekaya PDHES",
    normalizedName: "gokcekayapdhes",
    capacityMw: 1400,
    storageHours: 7,
    energyMwh: 9800,
    netHeadM: 368.6,
    upperActiveVolumeHm3: 10.840809896995713,
    roundTripEfficiencyPct: 78,
    annualCycles: 300,
    peakPriceUsdMwh: 110,
    offPeakPriceUsdMwh: 45,
    ancillaryServiceRevenueMUsd: 63,
    capacityMechanismRevenueMUsd: 42,
    capexIntensityUsdKw: 1700,
    capexMUsd: 2380,
    paybackYears: 10.668597634564327,
    dataSource: "PDHES_Aday_Verileri_Koordinatli_Dinamik_Hesap.xlsx",
  },
} as any);

const sariyar = makeTestSite({
  id: "kamu-sariyar-pspp",
  name: "Sarıyar PDHES",
  province: "Ankara",
  excelCalculated: {
    no: 2,
    candidateName: "Sarıyar PDHES",
    normalizedName: "sariyarpdhes",
    capacityMw: 1000,
    storageHours: 6,
    energyMwh: 6000,
    netHeadM: 421,
    upperActiveVolumeHm3: 7,
    roundTripEfficiencyPct: 78,
    annualCycles: 300,
    peakPriceUsdMwh: 110,
    offPeakPriceUsdMwh: 45,
    ancillaryServiceRevenueMUsd: 45,
    capacityMechanismRevenueMUsd: 30,
    capexIntensityUsdKw: 1700,
    capexMUsd: 1700,
    paybackYears: 11,
    dataSource: "PDHES_Aday_Verileri_Koordinatli_Dinamik_Hesap.xlsx",
  },
} as any);

describe("SettingsPage", () => {
  beforeEach(() => {
    useSiteStore.setState({
      selectedId: gokcekaya.id,
      sites: [gokcekaya, sariyar],
    });
  });

  afterEach(cleanup);

  it("labels preferences and Excel calculation engine controls", () => {
    render(<SettingsPage />);

    expect(screen.getByRole("combobox", { name: "Tema" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Harita görünümü" })).toBeTruthy();
    expect(screen.getByRole("slider", { name: "3D yükseklik ölçeği" })).toBeTruthy();

    expect(screen.getByRole("combobox", { name: "Aktif tesis" })).toBeTruthy();
    expect(screen.getByRole("spinbutton", { name: "Kurulu Güç (MW)" })).toBeTruthy();
    expect(screen.getByRole("spinbutton", { name: "Net Düşü (m)" })).toBeTruthy();
    expect(screen.getByRole("spinbutton", { name: "Üst Aktif Hacim (hm³)" })).toBeTruthy();
    expect(screen.getByRole("spinbutton", { name: "Pik Fiyat ($/MWh)" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "CAPEX modu" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Yan hizmet modu" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Kapasite mekanizması modu" })).toBeTruthy();

    expect(screen.getByRole("link", { name: /yerel çalışma alanını etkinleştir/i })).toBeTruthy();
  });

  it("loads Gokcekaya defaults from Excel and recalculates dynamically", () => {
    render(<SettingsPage />);

    expect(screen.getByDisplayValue("1400")).toBeTruthy();
    expect(screen.getByDisplayValue("368.6")).toBeTruthy();
    expect(screen.getAllByText("258,8 M USD").length).toBeGreaterThan(0);
    expect(screen.getByText("10,7 yıl")).toBeTruthy();

    fireEvent.change(screen.getByRole("spinbutton", { name: "Pik Fiyat ($/MWh)" }), {
      target: { value: "120" },
    });

    expect(screen.getAllByText("288,2 M USD").length).toBeGreaterThan(0);
    expect(screen.getByText("9,4 yıl")).toBeTruthy();
  });

  it("refreshes calculation defaults when the active site changes", () => {
    render(<SettingsPage />);

    fireEvent.change(screen.getByRole("combobox", { name: "Aktif tesis" }), {
      target: { value: "kamu-sariyar-pspp" },
    });

    expect(useSiteStore.getState().selectedId).toBe("kamu-sariyar-pspp");
    expect(screen.getByDisplayValue("1000")).toBeTruthy();
    expect(screen.getByDisplayValue("421")).toBeTruthy();
  });
});
