import { afterEach, describe, expect, it, vi } from "vitest";
import { AstrologyAPI } from "../../src/index.js";
import { mumbai, stubFetch } from "../fixtures.js";

const client = new AstrologyAPI({ userId: "u", apiKey: "k" });
const ok = () => stubFetch({ body: { ok: true } });

afterEach(() => vi.unstubAllGlobals());

describe("westernTransit namespace", () => {
  // ── Current-Sky Transits ──────────────────────────────────────────────────
  it("getDaily posts to tropical_transits/daily", async () => {
    const mock = ok();
    await client.westernTransit.getDaily(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("tropical_transits/daily");
  });

  it("getWeekly posts to tropical_transits/weekly", async () => {
    const mock = ok();
    await client.westernTransit.getWeekly(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("tropical_transits/weekly");
  });

  it("getMonthly posts to tropical_transits/monthly", async () => {
    const mock = ok();
    await client.westernTransit.getMonthly(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("tropical_transits/monthly");
  });

  // ── Natal Transits ────────────────────────────────────────────────────────
  it("getNatalDaily posts to natal_transits/daily", async () => {
    const mock = ok();
    await client.westernTransit.getNatalDaily(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("natal_transits/daily");
  });

  it("getNatalWeekly posts to natal_transits/weekly", async () => {
    const mock = ok();
    await client.westernTransit.getNatalWeekly(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("natal_transits/weekly");
  });

  // ── Body contains birth data ──────────────────────────────────────────────
  it("includes BirthData fields in request body", async () => {
    const mock = ok();
    await client.westernTransit.getDaily(mumbai);
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.day).toBe(10);
    expect(body.lat).toBe(19.20);
    expect(body.tzone).toBe(5.5);
  });
});
