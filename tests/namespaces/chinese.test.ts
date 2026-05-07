import { afterEach, describe, expect, it, vi } from "vitest";
import { AstrologyAPI } from "../../src/index.js";
import { mumbai, stubFetch } from "../fixtures.js";

const client = new AstrologyAPI({ userId: "u", apiKey: "k" });
const ok = () => stubFetch({ body: { ok: true } });

afterEach(() => vi.unstubAllGlobals());

describe("chinese namespace", () => {
  it("getZodiac posts to chinese_zodiac", async () => {
    const mock = ok();
    await client.chinese.getZodiac(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("chinese_zodiac");
  });

  it("getYearForecast posts to chinese_year_forecast", async () => {
    const mock = ok();
    await client.chinese.getYearForecast(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("chinese_year_forecast");
  });

  // ── Body contains birth data ──────────────────────────────────────────────
  it("includes BirthData fields in request body", async () => {
    const mock = ok();
    await client.chinese.getZodiac(mumbai);
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.day).toBe(10);
    expect(body.year).toBe(1990);
    expect(body.tzone).toBe(5.5);
  });

  // ── Language passthrough ──────────────────────────────────────────────────
  it("passes language as Accept-Language header", async () => {
    const mock = ok();
    await client.chinese.getZodiac(mumbai, "hi");
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["Accept-Language"]).toBe("hi");
  });
});
