import { describe, expect, it } from "vitest";

import {
  formatCurrencyMUsd,
  formatMeters,
  formatMwh,
  formatMw,
  formatScore,
  formatYears,
} from "./formatters";

describe("PDHES formatters", () => {
  it("formats Excel-derived values with Turkish number separators", () => {
    expect(formatMw(1400)).toBe("1.400 MW");
    expect(formatMwh(9800)).toBe("9.800 MWh");
    expect(formatMeters(368.6)).toBe("368,6 m");
    expect(formatScore(58.9169702956853)).toBe("58,9");
    expect(formatYears(10.668597634564327)).toBe("10,7 yıl");
    expect(formatCurrencyMUsd(258.78461538461534)).toBe("258,8 M USD");
  });

  it("renders missing numeric values as an em dash placeholder", () => {
    expect(formatMw(null)).toBe("—");
    expect(formatMwh(undefined)).toBe("—");
    expect(formatMeters(Number.NaN)).toBe("—");
    expect(formatYears(null)).toBe("—");
  });
});
