import { afterEach, describe, expect, it, vi } from "vitest";
import { AstrologyAPI } from "../../src/index.js";
import { mumbai, matchData, stubFetch } from "../fixtures.js";

const client = new AstrologyAPI({ userId: "u", apiKey: "k" });
const ok = () => stubFetch({ body: { ok: true } });

afterEach(() => vi.unstubAllGlobals());

describe("vedic namespace", () => {
  // ── Birth data ──────────────────────────────────────────────────────────
  it("getBirthDetails posts to birth_details", async () => {
    const mock = ok();
    await client.vedic.getBirthDetails(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("birth_details");
  });

  it("getAstroDetails posts to astro_details", async () => {
    const mock = ok();
    await client.vedic.getAstroDetails(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("astro_details");
  });

  it("getAyanamsha posts to ayanamsha", async () => {
    const mock = ok();
    await client.vedic.getAyanamsha(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("ayanamsha");
  });

  // ── Planets ─────────────────────────────────────────────────────────────
  it("getPlanets posts to planets", async () => {
    const mock = ok();
    await client.vedic.getPlanets(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("/planets");
  });

  it("getPlanetAshtak posts to planet_ashtak/:planet", async () => {
    const mock = ok();
    await client.vedic.getPlanetAshtak("saturn", mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("planet_ashtak/saturn");
  });

  it("getSarvashtak posts to sarvashtak", async () => {
    const mock = ok();
    await client.vedic.getSarvashtak(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("sarvashtak");
  });

  // ── Charts ──────────────────────────────────────────────────────────────
  it("getChart posts to horo_chart/:chartId", async () => {
    const mock = ok();
    await client.vedic.getChart("D9", mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("horo_chart/D9");
  });

  it("getChartImage posts to horo_chart_image/:chartId", async () => {
    const mock = ok();
    await client.vedic.getChartImage("D1", mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("horo_chart_image/D1");
  });

  it("getExtendedChart defaults to horo_chart_extended/D1", async () => {
    const mock = ok();
    await client.vedic.getExtendedChart(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("horo_chart_extended/D1");
  });

  it("getExtendedChart accepts an explicit chartId", async () => {
    const mock = ok();
    await client.vedic.getExtendedChart("D9", mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("horo_chart_extended/D9");
  });

  // ── Vimshottari Dasha ───────────────────────────────────────────────────
  it("getCurrentDasha posts to current_vdasha", async () => {
    const mock = ok();
    await client.vedic.getCurrentDasha(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("current_vdasha");
  });

  it("getMajorDasha posts to major_vdasha", async () => {
    const mock = ok();
    await client.vedic.getMajorDasha(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("major_vdasha");
  });

  it("getSubDasha posts to sub_vdasha/:md", async () => {
    const mock = ok();
    await client.vedic.getSubDasha("sun", mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("sub_vdasha/sun");
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.ayanamsha).toBe("LAHIRI");
  });

  it("getSubSubDasha posts to sub_sub_vdasha/:md/:ad", async () => {
    const mock = ok();
    await client.vedic.getSubSubDasha("sun", "moon", mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("sub_sub_vdasha/sun/moon");
  });

  it("getSubSubSubDasha posts to sub_sub_sub_vdasha/:md/:ad/:pd", async () => {
    const mock = ok();
    await client.vedic.getSubSubSubDasha("sun", "moon", "mars", mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("sub_sub_sub_vdasha/sun/moon/mars");
  });

  it("getSubSubSubSubDasha posts to sub_sub_sub_sub_vdasha/:md/:ad/:pd/:sd", async () => {
    const mock = ok();
    await client.vedic.getSubSubSubSubDasha("sun", "moon", "mars", "venus", mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("sub_sub_sub_sub_vdasha/sun/moon/mars/venus");
  });

  // ── Char Dasha ──────────────────────────────────────────────────────────
  it("getCurrentCharDasha posts to current_chardasha", async () => {
    const mock = ok();
    await client.vedic.getCurrentCharDasha(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("current_chardasha");
  });

  it("getSubCharDasha posts to sub_chardasha/:mahaDasha", async () => {
    const mock = ok();
    await client.vedic.getSubCharDasha("aries", mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("sub_chardasha/aries");
  });

  // ── Doshas ──────────────────────────────────────────────────────────────
  it("getKalsarpaDosha posts to kalsarpa_details", async () => {
    const mock = ok();
    await client.vedic.getKalsarpaDosha(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("kalsarpa_details");
  });

  it("getSadhesatiStatus posts to sadhesati_current_status", async () => {
    const mock = ok();
    await client.vedic.getSadhesatiStatus(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("sadhesati_current_status");
  });

  it("getPitraDosha posts to pitra_dosha_report", async () => {
    const mock = ok();
    await client.vedic.getPitraDosha(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("pitra_dosha_report");
  });

  // ── Remedies ────────────────────────────────────────────────────────────
  it("getGemSuggestion posts to basic_gem_suggestion", async () => {
    const mock = ok();
    await client.vedic.getGemSuggestion(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("basic_gem_suggestion");
  });

  it("getRudrakshaSuggestion posts to rudraksha_suggestion", async () => {
    const mock = ok();
    await client.vedic.getRudrakshaSuggestion(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("rudraksha_suggestion");
  });

  // ── Panchang ────────────────────────────────────────────────────────────
  it("getBasicPanchang posts to basic_panchang", async () => {
    const mock = ok();
    await client.vedic.getBasicPanchang(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("basic_panchang");
  });

  it("getHoraMuhurta posts to hora_muhurta", async () => {
    const mock = ok();
    await client.vedic.getHoraMuhurta(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("hora_muhurta");
  });

  // ── Matchmaking ─────────────────────────────────────────────────────────
  it("getAshtakootPoints flattens match data with m_/f_ keys", async () => {
    const mock = ok();
    await client.vedic.getAshtakootPoints(matchData);
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body).toHaveProperty("m_day", 10);
    expect(body).toHaveProperty("f_day", 15);
    expect(body).toHaveProperty("m_tzone", 5.5);
    expect(body).toHaveProperty("f_lat", 28.6139);
  });

  it("getDetailedMatchReport posts to match_making_detailed_report", async () => {
    const mock = ok();
    await client.vedic.getDetailedMatchReport(matchData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("match_making_detailed_report");
  });

  it("getPapasamyam posts the single-profile curl-style body", async () => {
    const mock = ok();
    await client.vedic.getPapasamyam({ ...mumbai, name: "Rahul Swami" }, "fr");
    expect((mock.mock.calls[0] as [string])[0]).toContain("papasamyam_details");
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({
      full_name: "Rahul Swami",
      lat: 19.2,
      year: 1990,
      month: 5,
      min: 55,
      hour: 19,
      ayanamsha: "LAHIRI",
      date: 10,
      lon: 72.83,
      day: 10,
      tzone: 5.5,
    });
    const headers = init.headers as Record<string, string>;
    expect(headers["Accept-Language"]).toBe("fr");
  });

  // ── Varshaphal ──────────────────────────────────────────────────────────
  it("getVarshaphalDetails posts to varshaphal_details", async () => {
    const mock = ok();
    await client.vedic.getVarshaphalDetails({ ...mumbai, varshaphal_year: 2026 });
    expect((mock.mock.calls[0] as [string])[0]).toContain("varshaphal_details");
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({
      day: 10,
      month: 5,
      year: 1990,
      hour: 19,
      min: 55,
      lat: 19.2,
      lon: 72.83,
      tzone: 5.5,
      varshaphal_year: 2026,
      ayanamsha: "LAHIRI",
    });
  });

  it("getVarshaphalYoga posts to varshaphal_yoga", async () => {
    const mock = ok();
    await client.vedic.getVarshaphalYoga({ ...mumbai, year_count: 36 });
    expect((mock.mock.calls[0] as [string])[0]).toContain("varshaphal_yoga");
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.varshaphal_year).toBe(2026);
    expect(body.ayanamsha).toBe("LAHIRI");
  });

  // ── Reports ─────────────────────────────────────────────────────────────
  it("getHouseReport posts to general_house_report/:planet", async () => {
    const mock = ok();
    await client.vedic.getHouseReport("sun", mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("general_house_report/sun");
  });

  it("getRashiReport posts to general_rashi_report/:planet", async () => {
    const mock = ok();
    await client.vedic.getRashiReport("moon", mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("general_rashi_report/moon");
  });

  // ── Biorhythm ───────────────────────────────────────────────────────────
  it("getBiorhythm posts to biorhythm", async () => {
    const mock = ok();
    await client.vedic.getBiorhythm(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("biorhythm");
  });

  // ── Language passthrough ────────────────────────────────────────────────
  it("passes language as Accept-Language header", async () => {
    const mock = ok();
    await client.vedic.getBirthDetails(mumbai, "hi");
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["Accept-Language"]).toBe("hi");
  });

  // ── Body contains birth data ─────────────────────────────────────────────
  it("includes all BirthData fields in request body", async () => {
    const mock = ok();
    await client.vedic.getBirthDetails(mumbai);
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.day).toBe(10);
    expect(body.month).toBe(5);
    expect(body.year).toBe(1990);
    expect(body.lat).toBe(19.20);
    expect(body.tzone).toBe(5.5);
  });
});
