import { afterEach, describe, expect, it, vi } from "vitest";
import { AstrologyAPI } from "../../src/index.js";
import { mumbai, stubFetch } from "../fixtures.js";

const client = new AstrologyAPI({ userId: "u", apiKey: "k" });
const ok = () => stubFetch({ body: { ok: true } });

afterEach(() => vi.unstubAllGlobals());

describe("kp namespace", () => {
  it("getPlanets posts to kp_planets", async () => {
    const mock = ok();
    await client.kp.getPlanets(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("kp_planets");
  });

  it("getHouseCusps posts to kp_house_cusps", async () => {
    const mock = ok();
    await client.kp.getHouseCusps(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("kp_house_cusps");
  });

  it("getBirthChart posts to kp_birth_chart", async () => {
    const mock = ok();
    await client.kp.getBirthChart(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("kp_birth_chart");
  });

  it("getHouseSignificator posts to kp_house_significator", async () => {
    const mock = ok();
    await client.kp.getHouseSignificator(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("kp_house_significator");
  });

  it("getPlanetSignificator posts to kp_planet_significator", async () => {
    const mock = ok();
    await client.kp.getPlanetSignificator(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("kp_planet_significator");
  });

  it("getHoroscope posts to kp_horoscope", async () => {
    const mock = ok();
    await client.kp.getHoroscope(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("kp_horoscope");
  });

  // ── Body contains birth data ──────────────────────────────────────────────
  it("includes BirthData fields in request body", async () => {
    const mock = ok();
    await client.kp.getPlanets(mumbai);
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.day).toBe(10);
    expect(body.lat).toBe(19.20);
    expect(body.tzone).toBe(5.5);
  });
});
