import { afterEach, describe, expect, it, vi } from "vitest";
import { AstrologyAPI } from "../../src/index.js";
import { mumbai, numeroData, stubFetch } from "../fixtures.js";

const client = new AstrologyAPI({ userId: "u", apiKey: "k" });
const ok = () => stubFetch({ body: { ok: true } });

afterEach(() => vi.unstubAllGlobals());

describe("numerology namespace", () => {
  // ── Vedic Numerology ───────────────────────────────────────────────────────
  it("getTable posts to numero_table", async () => {
    const mock = ok();
    await client.numerology.getTable(numeroData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("numero_table");
  });

  it("getReport posts to numero_report", async () => {
    const mock = ok();
    await client.numerology.getReport(numeroData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("numero_report");
  });

  it("getFavTime posts to numero_fav_time", async () => {
    const mock = ok();
    await client.numerology.getFavTime(numeroData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("numero_fav_time");
  });

  it("getPlaceVastu posts to numero_place_vastu", async () => {
    const mock = ok();
    await client.numerology.getPlaceVastu(numeroData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("numero_place_vastu");
  });

  it("getFastsReport posts to numero_fasts_report", async () => {
    const mock = ok();
    await client.numerology.getFastsReport(numeroData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("numero_fasts_report");
  });

  it("getFavLord posts to numero_fav_lord", async () => {
    const mock = ok();
    await client.numerology.getFavLord(numeroData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("numero_fav_lord");
  });

  it("getFavMantra posts to numero_fav_mantra", async () => {
    const mock = ok();
    await client.numerology.getFavMantra(numeroData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("numero_fav_mantra");
  });

  it("getDailyPrediction posts to numero_prediction/daily", async () => {
    const mock = ok();
    await client.numerology.getDailyPrediction(numeroData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("numero_prediction/daily");
  });

  // ── Western Numerology ─────────────────────────────────────────────────────
  it("getNumerologicalNumbers posts to numerological_numbers", async () => {
    const mock = ok();
    await client.numerology.getNumerologicalNumbers(numeroData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("numerological_numbers");
  });

  it("getLifepathNumber posts to lifepath_number", async () => {
    const mock = ok();
    await client.numerology.getLifepathNumber(numeroData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("lifepath_number");
  });

  it("getPersonalityNumber posts to personality_number", async () => {
    const mock = ok();
    await client.numerology.getPersonalityNumber(numeroData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("personality_number");
  });

  it("getExpressionNumber posts to expression_number", async () => {
    const mock = ok();
    await client.numerology.getExpressionNumber(numeroData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("expression_number");
  });

  it("getSoulUrgeNumber posts to soul_urge_number", async () => {
    const mock = ok();
    await client.numerology.getSoulUrgeNumber(numeroData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("soul_urge_number");
  });

  it("getChallengeNumbers posts to challenge_numbers", async () => {
    const mock = ok();
    await client.numerology.getChallengeNumbers(numeroData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("challenge_numbers");
  });

  // ── BirthData-based personal cycle endpoints ───────────────────────────────
  it("getPersonalDay posts to personal_day_prediction", async () => {
    const mock = ok();
    await client.numerology.getPersonalDay(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("personal_day_prediction");
  });

  it("getPersonalMonth posts to personal_month_prediction", async () => {
    const mock = ok();
    await client.numerology.getPersonalMonth(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("personal_month_prediction");
  });

  it("getPersonalYear posts to personal_year_prediction", async () => {
    const mock = ok();
    await client.numerology.getPersonalYear(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("personal_year_prediction");
  });

  // ── NumerologyData body shape ──────────────────────────────────────────────
  it("getTable includes day, month, year and name in request body", async () => {
    const mock = ok();
    await client.numerology.getTable(numeroData);
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.day).toBe(10);
    expect(body.month).toBe(5);
    expect(body.year).toBe(1990);
    expect(body.name).toBe("John Doe");
  });
});
