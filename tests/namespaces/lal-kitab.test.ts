import { afterEach, describe, expect, it, vi } from "vitest";
import { AstrologyAPI } from "../../src/index.js";
import { mumbai, stubFetch } from "../fixtures.js";

const client = new AstrologyAPI({ userId: "u", apiKey: "k" });
const ok = () => stubFetch({ body: { ok: true } });

afterEach(() => vi.unstubAllGlobals());

describe("lalKitab namespace", () => {
  it("getHoroscope posts to lalkitab_horoscope", async () => {
    const mock = ok();
    await client.lalKitab.getHoroscope(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("lalkitab_horoscope");
  });

  it("getDebts posts to lalkitab_debts", async () => {
    const mock = ok();
    await client.lalKitab.getDebts(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("lalkitab_debts");
  });

  it("getRemedies posts to lalkitab_remedies/:planet", async () => {
    const mock = ok();
    await client.lalKitab.getRemedies("saturn", mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("lalkitab_remedies/saturn");
  });

  it("getRemedies uses the provided planet name in the URL", async () => {
    const mock = ok();
    await client.lalKitab.getRemedies("rahu", mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("lalkitab_remedies/rahu");
  });

  it("getHouses posts to lalkitab_houses", async () => {
    const mock = ok();
    await client.lalKitab.getHouses(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("lalkitab_houses");
  });

  it("getPlanets posts to lalkitab_planets", async () => {
    const mock = ok();
    await client.lalKitab.getPlanets(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("lalkitab_planets");
  });

  // ── Body contains birth data ──────────────────────────────────────────────
  it("includes BirthData fields in request body", async () => {
    const mock = ok();
    await client.lalKitab.getHoroscope(mumbai);
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.day).toBe(10);
    expect(body.month).toBe(5);
    expect(body.year).toBe(1990);
  });
});
