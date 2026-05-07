import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { BirthScenario, CoupleScenario, MatchScenario, NumerologyScenario, PDFBrandingScenario, TestScenarios, ZodiacScenarioSet } from "./models.js";
import { TEST_DATA_DIR } from "./paths.js";

export async function loadTestScenarios(): Promise<TestScenarios> {
  const [
    birthStandard,
    birthNegativeTimezone,
    birthFractionalTimezone,
    birthDstSensitive,
    birthEdgeDate,
    matchBasic,
    coupleBasic,
    numerologyBasic,
    numerologyAlternate,
    pdfBranding,
    zodiacPairs,
  ] = await Promise.all([
    readJson<BirthScenario>("birth", "standard.json"),
    readJson<BirthScenario>("birth", "negative-timezone.json"),
    readJson<BirthScenario>("birth", "fractional-timezone.json"),
    readJson<BirthScenario>("birth", "dst-sensitive.json"),
    readJson<BirthScenario>("birth", "edge-date.json"),
    readJson<MatchScenario>("match", "basic-match.json"),
    readJson<CoupleScenario>("couple", "basic-couple.json"),
    readJson<NumerologyScenario>("numerology", "basic.json"),
    readJson<NumerologyScenario>("numerology", "alternate-name.json"),
    readJson<PDFBrandingScenario>("pdf", "basic-branding.json"),
    readJson<ZodiacScenarioSet>("zodiac", "basic-sign-pairs.json"),
  ]);

  return {
    birthStandard,
    birthNegativeTimezone,
    birthFractionalTimezone,
    birthDstSensitive,
    birthEdgeDate,
    matchBasic,
    coupleBasic,
    numerologyBasic,
    numerologyAlternate,
    pdfBranding,
    zodiacPairs,
  };
}

async function readJson<T>(...segments: string[]): Promise<T> {
  const filePath = join(TEST_DATA_DIR, ...segments);
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}
