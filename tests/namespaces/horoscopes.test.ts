import { afterEach, describe, expect, it, vi } from "vitest";
import { AstrologyAPI } from "../../src/index.js";
import { mumbai, stubFetch } from "../fixtures.js";

const client = new AstrologyAPI({ userId: "u", apiKey: "k" });
const ok = () => stubFetch({ body: { ok: true } });

afterEach(() => vi.unstubAllGlobals());

describe("horoscopes namespace", () => {
  // ── Sun-Sign Predictions ──────────────────────────────────────────────────
  it("getDaily posts to sun_sign_prediction/daily/:zodiac", async () => {
    const mock = ok();
    await client.horoscopes.getDaily("aries");
    expect((mock.mock.calls[0] as [string])[0]).toContain("sun_sign_prediction/daily/aries");
  });

  it("getNext posts to sun_sign_prediction/next/:zodiac", async () => {
    const mock = ok();
    await client.horoscopes.getNext("scorpio");
    expect((mock.mock.calls[0] as [string])[0]).toContain("sun_sign_prediction/daily/next/scorpio");
  });

  it("getPrevious posts to sun_sign_prediction/previous/:zodiac", async () => {
    const mock = ok();
    await client.horoscopes.getPrevious("leo");
    expect((mock.mock.calls[0] as [string])[0]).toContain("sun_sign_prediction/daily/previous/leo");
  });

  it("getDailyConsolidated posts to sun_sign_consolidated/daily/:zodiac", async () => {
    const mock = ok();
    await client.horoscopes.getDailyConsolidated("taurus");
    expect((mock.mock.calls[0] as [string])[0]).toContain("sun_sign_consolidated/daily/taurus");
  });

  it("getMonthly posts to horoscope_prediction/monthly/:zodiac", async () => {
    const mock = ok();
    await client.horoscopes.getMonthly("virgo");
    expect((mock.mock.calls[0] as [string])[0]).toContain("horoscope_prediction/monthly/virgo");
  });

  // ── Nakshatra Prediction ──────────────────────────────────────────────────
  it("getDailyNakshatra posts to daily_nakshatra_prediction", async () => {
    const mock = ok();
    await client.horoscopes.getDailyNakshatra(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("daily_nakshatra_prediction");
  });

  it("getDailyNakshatra includes BirthData in request body", async () => {
    const mock = ok();
    await client.horoscopes.getDailyNakshatra(mumbai);
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.day).toBe(10);
    expect(body.lat).toBe(19.20);
    expect(body.tzone).toBe(5.5);
  });

  // ── Sign-only endpoints send empty body ───────────────────────────────────
  it("getDaily sends an empty body", async () => {
    const mock = ok();
    await client.horoscopes.getDaily("aries");
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({});
  });

  it("getNext accepts timezone and includes it in the request body", async () => {
    const mock = ok();
    await client.horoscopes.getNext("aries", 5.5);
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({ timezone: 5.5 });
  });

  // ── Language passthrough ──────────────────────────────────────────────────
  it("passes language as Accept-Language header", async () => {
    const mock = ok();
    await client.horoscopes.getDaily("aries", "hi");
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["Accept-Language"]).toBe("hi");
  });
});
