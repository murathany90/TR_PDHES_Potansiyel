const EMPTY_VALUE = "—";

const integerFormatter = new Intl.NumberFormat("tr-TR", {
  maximumFractionDigits: 0,
});

const oneDecimalFormatter = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const twoDecimalFormatter = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function isUsableNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function formatNumber(
  value: number | null | undefined,
  formatter: Intl.NumberFormat,
  suffix = "",
): string {
  if (!isUsableNumber(value)) return EMPTY_VALUE;
  return `${formatter.format(value)}${suffix}`;
}

export function formatMw(value: number | null | undefined): string {
  return formatNumber(value, integerFormatter, " MW");
}

export function formatMwh(value: number | null | undefined): string {
  return formatNumber(value, integerFormatter, " MWh");
}

export function formatGwh(value: number | null | undefined): string {
  return formatNumber(value, oneDecimalFormatter, " GWh");
}

export function formatMeters(value: number | null | undefined): string {
  return formatNumber(value, oneDecimalFormatter, " m");
}

export function formatFlowCms(value: number | null | undefined): string {
  return formatNumber(value, oneDecimalFormatter, " m³/s");
}

export function formatVolumeHm3(value: number | null | undefined): string {
  return formatNumber(value, oneDecimalFormatter, " hm³");
}

export function formatCurrencyMUsd(value: number | null | undefined): string {
  return formatNumber(value, oneDecimalFormatter, " M USD");
}

export function formatUsdPerMwh(value: number | null | undefined): string {
  return formatNumber(value, oneDecimalFormatter, " $/MWh");
}

export function formatUsdPerKw(value: number | null | undefined): string {
  return formatNumber(value, integerFormatter, " $/kW");
}

export function formatPercent(value: number | null | undefined): string {
  return formatNumber(value, oneDecimalFormatter, "%");
}

export function formatYears(value: number | null | undefined, unavailable = EMPTY_VALUE): string {
  if (!isUsableNumber(value)) return unavailable;
  return `${oneDecimalFormatter.format(value)} yıl`;
}

export function formatScore(value: number | null | undefined): string {
  return formatNumber(value, oneDecimalFormatter);
}

export function formatCount(value: number | null | undefined): string {
  return formatNumber(value, twoDecimalFormatter);
}

export { EMPTY_VALUE };
