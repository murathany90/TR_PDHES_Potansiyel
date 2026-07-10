import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const DATA_SOURCE_LABEL = "PDHES_Aday_Verileri_Koordinatli_Dinamik_Hesap.xlsx";
const appDir = process.cwd();
const repoRoot = path.resolve(appDir, "..");
const docsDir = path.join(repoRoot, "docs");
const generatedDir = path.join(appDir, "src", "data", "generated");
const outputPath = path.join(generatedDir, "pdhesCandidateExcelData.ts");

function normalizeName(value) {
  return String(value ?? "")
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function safeNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string") return undefined;

  const normalized = value
    .trim()
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  if (!normalized) return undefined;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toPercent(value) {
  const numeric = safeNumber(value);
  if (numeric === undefined) return undefined;
  return Math.abs(numeric) <= 1 ? numeric * 100 : numeric;
}

function findWorkbookPath() {
  const excelDir = fs
    .readdirSync(docsDir, { withFileTypes: true })
    .find((entry) => entry.isDirectory() && normalizeName(entry.name).includes("pdhesadaylariexcel"));

  if (!excelDir) {
    throw new Error("PDHES Excel klasörü docs altında bulunamadı.");
  }

  const excelPath = path.join(docsDir, excelDir.name);
  const workbookFile = fs
    .readdirSync(excelPath)
    .find((fileName) => fileName.endsWith(".xlsx") && normalizeName(fileName).includes("pdhesadayverileri"));

  if (!workbookFile) {
    throw new Error(`PDHES Excel dosyası bulunamadı: ${excelPath}`);
  }

  return path.join(excelPath, workbookFile);
}

function sheetRows(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Excel sayfası bulunamadı: ${sheetName}`);

  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: null,
    blankrows: false,
  });
  const [headers, ...body] = rows;
  const headerIndexes = new Map();

  headers.forEach((header, index) => {
    const normalized = normalizeName(header);
    if (normalized) headerIndexes.set(normalized, index);
  });

  return body
    .filter((row) => row.some((cell) => cell !== null && cell !== undefined && cell !== ""))
    .map((row) => ({ row, headerIndexes }));
}

function getCell(rowInfo, aliases) {
  for (const alias of aliases) {
    const index = rowInfo.headerIndexes.get(normalizeName(alias));
    if (index !== undefined) return rowInfo.row[index];
  }
  return undefined;
}

function getString(rowInfo, aliases) {
  const value = getCell(rowInfo, aliases);
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text || undefined;
}

function getNumber(rowInfo, aliases) {
  return safeNumber(getCell(rowInfo, aliases));
}

function buildScoreMap(workbook) {
  return new Map(sheetRows(workbook, "Skor_Hesap")
    .map((rowInfo) => {
      const name = getString(rowInfo, ["Aday Adı"]);
      if (!name) return null;

      return [
        normalizeName(name),
        {
          technicalScore: getNumber(rowInfo, ["Teknik Skor"]),
          economicScore: getNumber(rowInfo, ["Ekonomik Skor"]),
          dataConfidenceScore: getNumber(rowInfo, ["Veri Güven Skoru"]),
          riskScore: getNumber(rowInfo, ["Risk Skoru"]),
          totalScore: getNumber(rowInfo, ["Toplam Skor"]),
          scoreClass: getString(rowInfo, ["Sınıf"]),
          scoreNote: getString(rowInfo, ["Skor Açıklaması"]),
        },
      ];
    })
    .filter(Boolean));
}

function buildInputDefaults(workbook) {
  const parameterRows = sheetRows(workbook, "Input_Parametreleri");
  const parameterMap = new Map(parameterRows
    .map((rowInfo) => {
      const name = getString(rowInfo, ["Parametre"]);
      return name ? [normalizeName(name), getCell(rowInfo, ["Değer"])] : null;
    })
    .filter(Boolean));

  const get = (name) => parameterMap.get(normalizeName(name));
  const number = (name, fallback) => safeNumber(get(name)) ?? fallback;
  const percent = (name, fallback) => toPercent(get(name)) ?? fallback;

  return {
    waterDensityKgM3: number("Su yoğunluğu", 1000),
    gravityMps2: number("Yerçekimi ivmesi", 9.81),
    turbineGeneratorEfficiencyPct: percent("Türbin-jeneratör verimi", 90),
    pumpEfficiencyPct: percent("Pompa-motor verimi", 86),
    roundTripEfficiencyPct: percent("Çevrim verimi", 78),
    hydraulicLossPct: percent("Hidrolik kayıp oranı", 3),
    annualCycles: number("Yıllık çevrim sayısı", 300),
    peakPriceUsdMwh: number("Pik satış fiyatı", 110),
    offPeakPriceUsdMwh: number("Dip/pompaj alış fiyatı", 45),
    ancillaryServiceUnitRevenueUsdPerMwYear: number("Yan hizmet birim geliri", 45000),
    capacityMechanismUnitRevenueUsdPerMwYear: number("Kapasite mekanizması birim geliri", 30000),
    capexIntensityUsdKw: number("Baz CAPEX yoğunluğu", 1700),
    omRatePct: percent("Yıllık O&M oranı", 1.5),
  };
}

function buildCandidateRows(workbook) {
  const scores = buildScoreMap(workbook);

  return sheetRows(workbook, "Aday_Verileri")
    .map((rowInfo) => {
      const candidateName = getString(rowInfo, ["Aday Adı"]);
      const no = getNumber(rowInfo, ["No"]);
      if (!candidateName || no === undefined) return null;

      const normalizedName = normalizeName(candidateName);
      const score = scores.get(normalizedName) ?? {};

      return {
        no,
        candidateName,
        normalizedName,
        type: getString(rowInfo, ["Tip"]),
        region: getString(rowInfo, ["İl/Bölge"]),
        capacityMw: getNumber(rowInfo, ["Kapasite (MW)", "Kurulu Güç (MW)", "Güç (MW)"]),
        storageHours: getNumber(rowInfo, ["Depolama Süresi (saat)"]),
        energyMwh: getNumber(rowInfo, ["Enerji (MWh)", "Depolama Enerjisi (MWh)"]),
        lowerReservoirName: getString(rowInfo, ["Alt Rezervuar Adı"]),
        lowerReservoirElevationM: getNumber(rowInfo, ["Alt Rezervuar Kotu (m)"]),
        upperReservoirElevationM: getNumber(rowInfo, ["Üst Rezervuar Kotu (m)"]),
        grossHeadM: getNumber(rowInfo, ["Brüt Düşü (m)"]),
        netHeadM: getNumber(rowInfo, ["Net Düşü (m)"]),
        ...score,
        paybackYears: getNumber(rowInfo, ["Geri Ödeme (yıl)", "Basit Geri Ödeme (yıl)", "Geri Ödeme Süresi (yıl)"]),
        designFlowCms: getNumber(rowInfo, ["Proje Debisi (m³/s)"]),
        upperActiveVolumeHm3: getNumber(rowInfo, ["Üst Aktif Hacim (hm³)"]),
        roundTripEfficiencyPct: toPercent(getCell(rowInfo, ["Çevrim Verimi %"])),
        pumpPowerMw: getNumber(rowInfo, ["Pompa Gücü (MW)"]),
        pumpingEnergyPerCycleMwh: getNumber(rowInfo, ["Pompaj Enerjisi/Çevrim (MWh)"]),
        annualCycles: getNumber(rowInfo, ["Yıllık Çevrim"]),
        annualGenerationGwh: getNumber(rowInfo, ["Yıllık Üretim (GWh)"]),
        peakPriceUsdMwh: getNumber(rowInfo, ["Pik Fiyat ($/MWh)"]),
        offPeakPriceUsdMwh: getNumber(rowInfo, ["Dip Fiyat ($/MWh)"]),
        grossGenerationRevenueMUsd: getNumber(rowInfo, ["Brüt Üretim Geliri (M USD)"]),
        pumpingEnergyCostMUsd: getNumber(rowInfo, ["Pompaj Enerji Maliyeti (M USD)"]),
        netArbitrageRevenueMUsd: getNumber(rowInfo, ["Net Arbitraj Geliri (M USD)"]),
        ancillaryServiceRevenueMUsd: getNumber(rowInfo, ["Yan Hizmet Geliri (M USD)"]),
        capacityMechanismRevenueMUsd: getNumber(rowInfo, ["Kapasite Mekanizması Geliri (M USD)"]),
        annualTotalRevenueMUsd: getNumber(rowInfo, ["Yıllık Toplam Gelir (M USD)"]),
        capexIntensityUsdKw: getNumber(rowInfo, ["CAPEX Yoğunluğu ($/kW)"]),
        capexMUsd: getNumber(rowInfo, ["CAPEX (M USD)"]),
        omMUsdPerYear: getNumber(rowInfo, ["O&M (M USD/yıl)"]),
        netCashFlowMUsdPerYear: getNumber(rowInfo, ["Net Nakit Akımı (M USD/yıl)"]),
        dataSource: DATA_SOURCE_LABEL,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.no - b.no);
}

function removeUndefined(value) {
  if (Array.isArray(value)) return value.map(removeUndefined);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, removeUndefined(entryValue)]),
  );
}

const workbookPath = findWorkbookPath();
const workbook = XLSX.readFile(workbookPath, { cellDates: false });
const candidates = removeUndefined(buildCandidateRows(workbook));
const defaults = removeUndefined(buildInputDefaults(workbook));

if (candidates.length === 0) {
  throw new Error("Excel aday verisi üretilemedi.");
}

const source = `import type { PdhesCandidateExcelCalculatedData, PdhesExcelInputDefaults } from "../../utils/pdhes/types";

// Bu dosya app/scripts/generate-pdhes-candidate-data.mjs tarafından üretilir.
// Excel koordinat ve Google Earth/link kolonları bilinçli olarak export edilmez.
export const PDHES_EXCEL_INPUT_DEFAULTS: PdhesExcelInputDefaults = ${JSON.stringify(defaults, null, 2)};

export const PDHES_CANDIDATE_EXCEL_DATA: PdhesCandidateExcelCalculatedData[] = ${JSON.stringify(candidates, null, 2)};
`;

fs.mkdirSync(generatedDir, { recursive: true });
fs.writeFileSync(outputPath, source, "utf8");

console.log(`PDHES Excel data generated: ${path.relative(appDir, outputPath)} (${candidates.length} candidates)`);
