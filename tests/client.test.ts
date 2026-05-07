import { afterEach, describe, expect, it, vi } from "vitest";
import { AstrologyAPI } from "../src/index.js";
import { stubFetch, mumbai } from "./fixtures.js";

describe("AstrologyAPI client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env["ASTROLOGYAPI_USER_ID"];
    delete process.env["ASTROLOGYAPI_API_KEY"];
    delete process.env["ASTROLOGYAPI_ACCESS_TOKEN"];
  });

  // ── Constructor ──────────────────────────────────────────────────────────

  it("instantiates with explicit credentials", () => {
    expect(() => new AstrologyAPI({ userId: "u1", apiKey: "k1" })).not.toThrow();
  });

  it("instantiates with explicit access_token", () => {
    expect(() => new AstrologyAPI({ access_token: "plain-access-token" })).not.toThrow();
  });

  it("prefers access_token over userId/apiKey when both are provided", () => {
    expect(() => new AstrologyAPI({
      userId: "u1",
      apiKey: "k1",
      access_token: "plain-access-token",
    })).not.toThrow();
  });

  it("reads credentials from environment variables", () => {
    process.env["ASTROLOGYAPI_USER_ID"] = "env-user";
    process.env["ASTROLOGYAPI_API_KEY"] = "env-key";
    expect(() => new AstrologyAPI()).not.toThrow();
  });

  it("reads access token from environment variables", () => {
    process.env["ASTROLOGYAPI_ACCESS_TOKEN"] = "env-access-token";
    expect(() => new AstrologyAPI()).not.toThrow();
  });

  it("throws when userId is missing", () => {
    expect(() => new AstrologyAPI({ apiKey: "k1" })).toThrow(/userId/);
  });

  it("throws when apiKey is missing", () => {
    expect(() => new AstrologyAPI({ userId: "u1" })).toThrow(/apiKey/);
  });

  it("throws when both credentials are missing", () => {
    expect(() => new AstrologyAPI()).toThrow();
  });

  it("sends x-astrologyapi-key when access_token is used", async () => {
    const mock = stubFetch({ body: { result: "ok" } });
    const client = new AstrologyAPI({ access_token: "plain-access-token" });

    await client.customRequest({ endpoint: "some_endpoint", body: {} });

    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["x-astrologyapi-key"]).toBe("plain-access-token");
    expect(headers["Authorization"]).toBeUndefined();
  });

  // ── Namespace presence ───────────────────────────────────────────────────

  it("exposes all 11 namespaces", () => {
    const client = new AstrologyAPI({ userId: "u", apiKey: "k" });
    expect(client.vedic).toBeDefined();
    expect(client.kp).toBeDefined();
    expect(client.lalKitab).toBeDefined();
    expect(client.horoscopes).toBeDefined();
    expect(client.numerology).toBeDefined();
    expect(client.western).toBeDefined();
    expect(client.westernTransit).toBeDefined();
    expect(client.tarot).toBeDefined();
    expect(client.chinese).toBeDefined();
    expect(client.pdf).toBeDefined();
    expect(client.location).toBeDefined();
  });

  it("pdf namespace has vedic and western sub-namespaces", () => {
    const client = new AstrologyAPI({ userId: "u", apiKey: "k" });
    expect(client.pdf.vedic).toBeDefined();
    expect(client.pdf.western).toBeDefined();
  });

  // ── customRequest ────────────────────────────────────────────────────────

  it("customRequest calls the correct endpoint", async () => {
    const mock = stubFetch({ body: { result: "ok" } });
    const client = new AstrologyAPI({ userId: "u", apiKey: "k" });
    await client.customRequest({ endpoint: "some_endpoint", body: { day: 1 } });

    const [url] = mock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("some_endpoint");
  });

  it("customRequest defaults to json domain", async () => {
    const mock = stubFetch({ body: {} });
    const client = new AstrologyAPI({ userId: "u", apiKey: "k" });
    await client.customRequest({ endpoint: "test_endpoint" });

    const [url] = mock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("json.astrologyapi.com");
  });

  it("customRequest uses pdf domain when specified", async () => {
    const mock = stubFetch({ binary: true });
    const client = new AstrologyAPI({ userId: "u", apiKey: "k" });
    await client.customRequest({ endpoint: "some_pdf", domain: "pdf" });

    const [url] = mock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("pdf.astrologyapi.com");
  });

  // ── Integration — namespace method calls ─────────────────────────────────

  it("client.vedic.getBirthDetails resolves with API response", async () => {
    stubFetch({ body: { sun_sign: "Taurus", moon_sign: "Scorpio" } });
    const client = new AstrologyAPI({ userId: "u", apiKey: "k" });
    const result = await client.vedic.getBirthDetails(mumbai) as Record<string, string>;
    expect(result.sun_sign).toBe("Taurus");
  });

  it("client.horoscopes.getDaily resolves with API response", async () => {
    stubFetch({ body: { date: "2026-04-05", prediction: "Great day!" } });
    const client = new AstrologyAPI({ userId: "u", apiKey: "k" });
    const result = await client.horoscopes.getDaily("aries") as Record<string, string>;
    expect(result.prediction).toBe("Great day!");
  });

  it("client.tarot.getPredictions resolves with API response", async () => {
    stubFetch({ body: { cards: [] } });
    const client = new AstrologyAPI({ userId: "u", apiKey: "k" });
    const result = await client.tarot.getPredictions() as Record<string, unknown>;
    expect(result).toHaveProperty("cards");
  });
});
