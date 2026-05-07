import { afterEach, describe, expect, it, vi } from "vitest";
import { AstrologyAPI } from "../../src/index.js";
import { stubFetch } from "../fixtures.js";

const client = new AstrologyAPI({ userId: "u", apiKey: "k" });
const ok = () => stubFetch({ body: { ok: true } });

afterEach(() => vi.unstubAllGlobals());

describe("location namespace", () => {
  // ── Endpoints ─────────────────────────────────────────────────────────────
  it("getGeoDetails posts to geo_details", async () => {
    const mock = ok();
    await client.location.getGeoDetails("Mumbai");
    expect((mock.mock.calls[0] as [string])[0]).toContain("geo_details");
  });

  it("getTimezone posts to timezone_with_dst", async () => {
    const mock = ok();
    await client.location.getTimezone({
      day: 15, month: 8, year: 1990,
      hour: 14, min: 30,
      lat: 28.6139, lon: 77.2090,
    });
    expect((mock.mock.calls[0] as [string])[0]).toContain("timezone_with_dst");
  });

  // ── Body shape ────────────────────────────────────────────────────────────
  it("getGeoDetails sends place and maxRows in body", async () => {
    const mock = ok();
    await client.location.getGeoDetails("Mumbai", 10);
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.place).toBe("Mumbai");
    expect(body.maxRows).toBe(10);
  });

  it("getGeoDetails defaults maxRows to 6", async () => {
    const mock = ok();
    await client.location.getGeoDetails("Delhi");
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.maxRows).toBe(6);
  });

  it("getTimezone sends all date/coordinate fields in body", async () => {
    const mock = ok();
    await client.location.getTimezone({
      day: 15, month: 8, year: 1990,
      hour: 14, min: 30,
      lat: 28.6139, lon: 77.2090,
    });
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.day).toBe(15);
    expect(body.month).toBe(8);
    expect(body.year).toBe(1990);
    expect(body.lat).toBe(28.6139);
    expect(body.lon).toBe(77.2090);
  });

  // ── Language passthrough ──────────────────────────────────────────────────
  it("getGeoDetails passes language as Accept-Language header", async () => {
    const mock = ok();
    await client.location.getGeoDetails("Mumbai", 6, "hi");
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["Accept-Language"]).toBe("hi");
  });
});
