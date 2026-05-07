import { afterEach, describe, expect, it, vi } from "vitest";
import { AstrologyAPI } from "../../src/index.js";
import { mumbai, matchData, coupleData, branding, stubFetch } from "../fixtures.js";

const client = new AstrologyAPI({ userId: "u", apiKey: "k" });
const pdfOk = () => stubFetch({ binary: true });

afterEach(() => vi.unstubAllGlobals());

describe("pdf namespace", () => {
  // ── Sub-namespace presence ────────────────────────────────────────────────
  it("pdf.vedic is defined", () => {
    expect(client.pdf.vedic).toBeDefined();
  });

  it("pdf.western is defined", () => {
    expect(client.pdf.western).toBeDefined();
  });

  // ── Vedic PDF endpoints ───────────────────────────────────────────────────
  it("pdf.vedic.getMiniKundli posts to mini_horoscope_pdf", async () => {
    const mock = pdfOk();
    await client.pdf.vedic.getMiniKundli(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("mini_horoscope_pdf");
  });

  it("pdf.vedic.getBasicHoroscope posts to basic_horoscope_pdf", async () => {
    const mock = pdfOk();
    await client.pdf.vedic.getBasicHoroscope(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("basic_horoscope_pdf");
  });

  it("pdf.vedic.getProfessionalHoroscope posts to pro_horoscope_pdf", async () => {
    const mock = pdfOk();
    await client.pdf.vedic.getProfessionalHoroscope(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("pro_horoscope_pdf");
  });

  it("pdf.vedic.getMatchMaking posts to match_making_pdf", async () => {
    const mock = pdfOk();
    await client.pdf.vedic.getMatchMaking(matchData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("match_making_pdf");
  });

  // ── Western PDF endpoints ─────────────────────────────────────────────────
  it("pdf.western.getNatalChart posts to natal_horoscope_report/tropical", async () => {
    const mock = pdfOk();
    await client.pdf.western.getNatalChart(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("natal_horoscope_report/tropical");
  });

  it("pdf.western.getLifeForecast posts to life_forecast_report/tropical", async () => {
    const mock = pdfOk();
    await client.pdf.western.getLifeForecast(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("life_forecast_report/tropical");
  });

  it("pdf.western.getSolarReturn posts to solar_return_report/tropical", async () => {
    const mock = pdfOk();
    await client.pdf.western.getSolarReturn(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("solar_return_report/tropical");
  });

  it("pdf.western.getSynastry posts to synastry_couple_report/tropical", async () => {
    const mock = pdfOk();
    await client.pdf.western.getSynastry(coupleData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("synastry_couple_report/tropical");
  });

  // ── PDF domain ────────────────────────────────────────────────────────────
  it("vedic PDF endpoints use pdf.astrologyapi.com domain", async () => {
    const mock = pdfOk();
    await client.pdf.vedic.getMiniKundli(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("pdf.astrologyapi.com");
  });

  it("western PDF endpoints use pdf.astrologyapi.com domain", async () => {
    const mock = pdfOk();
    await client.pdf.western.getNatalChart(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("pdf.astrologyapi.com");
  });

  // ── Branding fields are included ──────────────────────────────────────────
  it("getMiniKundli merges branding fields into request body", async () => {
    const mock = pdfOk();
    await client.pdf.vedic.getMiniKundli({ ...mumbai, place: "Mumbai" }, branding, "en");
    const body = getFormBody(mock);
    expect(body.company_name).toBe("Test Corp");
    expect(body.domain_url).toBe("https://example.com");
    expect(body.chart_style).toBe("NORTH_INDIAN");
    expect(body.language).toBe("en");
  });

  it("getMiniKundli still contains BirthData fields when branding is provided", async () => {
    const mock = pdfOk();
    await client.pdf.vedic.getMiniKundli({ ...mumbai, place: "Mumbai", gender: "male", name: "Ignored Name" }, branding, "en");
    const body = getFormBody(mock);
    expect(body.day).toBe("10");
    expect(body.lat).toBe("19.2");
    expect(body.tzone).toBe("5.5");
    expect(body.place).toBe("Mumbai");
    expect(body.gender).toBe("male");
    expect(body.name).toBeUndefined();
  });

  // ── Match Making body shape ───────────────────────────────────────────────
  it("getMatchMaking flattens match data with m_/f_ keys", async () => {
    const mock = pdfOk();
    await client.pdf.vedic.getMatchMaking(
      {
        ...matchData,
        name: "Aarav Mehta",
        partner_name: "Diya Kapoor",
        place: "Mumbai, Maharashtra, India",
      },
      branding,
      "en",
    );
    const body = getFormBody(mock);
    expect(body).toHaveProperty("m_day", "10");
    expect(body).toHaveProperty("f_day", "15");
    expect(body).toHaveProperty("m_timezone", "5.5");
    expect(body).toHaveProperty("f_latitude", "28.6139");
    expect(body).toHaveProperty("m_first_name", "Aarav");
    expect(body).toHaveProperty("m_last_name", "Mehta");
    expect(body).toHaveProperty("f_first_name", "Diya");
    expect(body).toHaveProperty("f_last_name", "Kapoor");
    expect(body).toHaveProperty("m_place", "Mumbai, Maharashtra, India");
    expect(body).toHaveProperty("language", "en");
    expect(body).toHaveProperty("ashtakoot", "true");
    expect(body).toHaveProperty("papasyam", "true");
    expect(body).toHaveProperty("dashakoot", "true");
  });

  // ── Synastry body shape ───────────────────────────────────────────────────
  it("getSynastry flattens couple data with p_/s_ keys", async () => {
    const mock = pdfOk();
    await client.pdf.western.getSynastry(
      {
        ...coupleData,
        name: "Aarav Mehta",
        partner_name: "Diya Kapoor",
        place: "Mumbai, Maharashtra, India",
      },
      branding,
      "en",
    );
    const body = getFormBody(mock);
    expect(body).toHaveProperty("p_day", "10");
    expect(body).toHaveProperty("s_day", "15");
    expect(body).toHaveProperty("p_timezone", "5.5");
    expect(body).toHaveProperty("p_first_name", "Aarav");
    expect(body).toHaveProperty("s_last_name", "Kapoor");
    expect(body).toHaveProperty("p_place", "Mumbai, Maharashtra, India");
    expect(body).toHaveProperty("s_place", "Mumbai, Maharashtra, India");
    expect(body.chart_style).toBeUndefined();
  });

  it("western PDF reports use minute/latitude/longitude/timezone body fields", async () => {
    const mock = pdfOk();
    await client.pdf.western.getNatalChart({ ...mumbai, name: "Aarav Mehta", place: "Mumbai" }, branding, "en");
    const body = getFormBody(mock);
    expect(body.name).toBe("Aarav Mehta");
    expect(body.minute).toBe("55");
    expect(body.latitude).toBe("19.2");
    expect(body.longitude).toBe("72.83");
    expect(body.timezone).toBe("5.5");
    expect(body.language).toBe("en");
  });

  it("solar return includes solar_year when provided", async () => {
    const mock = pdfOk();
    await client.pdf.western.getSolarReturn(
      { ...mumbai, name: "Aarav Mehta", place: "Mumbai", solar_year: 2026 },
      branding,
      "en",
    );
    const body = getFormBody(mock);
    expect(body.solar_year).toBe("2026");
  });

  it("pdf endpoints are form-urlencoded", async () => {
    const mock = pdfOk();
    await client.pdf.vedic.getMiniKundli({ ...mumbai, place: "Mumbai" }, branding, "en");
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    expect(new Headers(init.headers).get("content-type")).toBe("application/x-www-form-urlencoded");
    expect(init.body).toBeInstanceOf(URLSearchParams);
  });

  // ── Returns ArrayBuffer ───────────────────────────────────────────────────
  it("pdf endpoints return ArrayBuffer", async () => {
    pdfOk();
    const result = await client.pdf.vedic.getMiniKundli(mumbai);
    expect(result).toBeInstanceOf(ArrayBuffer);
  });
});

function getFormBody(mock: ReturnType<typeof pdfOk>): Record<string, string> {
  const [, init] = mock.mock.calls[0] as [string, RequestInit];
  const rawBody = init.body;

  if (!(rawBody instanceof URLSearchParams)) {
    throw new Error("Expected form-urlencoded body");
  }

  return Object.fromEntries(rawBody.entries());
}
