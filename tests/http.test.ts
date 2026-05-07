import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HttpClient } from "../src/http.js";
import {
  AuthenticationError,
  NetworkError,
  PlanRestrictedError,
  QuotaExceededError,
  RateLimitError,
  ServerError,
  ValidationError,
} from "../src/errors.js";
import { errorBody, stubFetch } from "./fixtures.js";
import { SDK_VERSION } from "../src/version.js";

const makeClient = () => new HttpClient("user123", "ak-key-abc", "v1");
const makeBasicClient = () => new HttpClient("user123", "plain-key-abc", "v1");
const makeAccessTokenClient = () => new HttpClient({
  apiKey: "plain-access-token",
  version: "v1",
  forceHeaderAuth: true,
});

describe("HttpClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ── Successful requests ──────────────────────────────────────────────────

  it("sends POST to the correct JSON base URL", async () => {
    const mock = stubFetch({ body: { sun_sign: "Taurus" } });
    const client = makeClient();
    await client.post({ endpoint: "birth_details", body: { day: 10 } });

    const [url, init] = mock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://json.astrologyapi.com/v1/birth_details");
    expect(init.method).toBe("POST");
  });

  it("sends POST to the PDF base URL when domain=pdf", async () => {
    const mock = stubFetch({ binary: true });
    const client = makeClient();
    await client.post({ endpoint: "mini_horoscope_pdf", body: {}, domain: "pdf" });

    const [url] = mock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://pdf.astrologyapi.com/v1/mini_horoscope_pdf");
  });

  it("sets x-astrologyapi-key header", async () => {
    const mock = stubFetch({ body: {} });
    await makeClient().post({ endpoint: "planets", body: {} });

    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["x-astrologyapi-key"]).toBe("ak-key-abc");
  });

  it("sets x-astrologyapi-key header for access-token auth even when the token does not include ak-", async () => {
    const mock = stubFetch({ body: {} });
    await makeAccessTokenClient().post({ endpoint: "planets", body: {} });

    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["x-astrologyapi-key"]).toBe("plain-access-token");
    expect(headers["Authorization"]).toBeUndefined();
  });

  it("sets Basic Authorization header when the apiKey does not include ak-", async () => {
    const mock = stubFetch({ body: {} });
    await makeBasicClient().post({ endpoint: "planets", body: {} });

    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe(`Basic ${Buffer.from("user123:plain-key-abc").toString("base64")}`);
    expect(headers["x-astrologyapi-key"]).toBeUndefined();
  });

  it("sets User-Agent header with SDK version", async () => {
    const mock = stubFetch({ body: {} });
    await makeClient().post({ endpoint: "planets", body: {} });

    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["User-Agent"]).toBe(`astrologyapi-node/${SDK_VERSION}`);
  });

  it("sets Content-Type: application/json", async () => {
    const mock = stubFetch({ body: {} });
    await makeClient().post({ endpoint: "planets", body: {} });

    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("serialises body as JSON", async () => {
    const mock = stubFetch({ body: {} });
    const payload = { day: 10, month: 5, year: 1990 };
    await makeClient().post({ endpoint: "birth_details", body: payload });

    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual(payload);
  });

  it("sets Accept-Language when language is provided", async () => {
    const mock = stubFetch({ body: {} });
    await makeClient().post({ endpoint: "birth_details", body: {}, language: "hi" });

    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["Accept-Language"]).toBe("hi");
  });

  it("does not set Accept-Language when language is omitted", async () => {
    const mock = stubFetch({ body: {} });
    await makeClient().post({ endpoint: "birth_details", body: {} });

    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["Accept-Language"]).toBeUndefined();
  });

  it("returns parsed JSON for a 200 response", async () => {
    stubFetch({ body: { ascendant: "Scorpio" } });
    const result = await makeClient().post({ endpoint: "birth_details", body: {} });
    expect(result).toEqual({ ascendant: "Scorpio" });
  });

  it("returns ArrayBuffer for a PDF response", async () => {
    stubFetch({ binary: true });
    const result = await makeClient().post<ArrayBuffer>({ endpoint: "mini_horoscope_pdf", body: {}, domain: "pdf" });
    expect(result).toBeInstanceOf(ArrayBuffer);
  });

  // ── Error mapping ────────────────────────────────────────────────────────

  it("throws ValidationError on 400", async () => {
    stubFetch({ status: 400, body: errorBody("Missing field: day") });
    await expect(makeClient().post({ endpoint: "x", body: {} }))
      .rejects.toBeInstanceOf(ValidationError);
  });

  it("throws ValidationError on 422", async () => {
    stubFetch({ status: 422, body: errorBody("Invalid lat") });
    await expect(makeClient().post({ endpoint: "x", body: {} }))
      .rejects.toBeInstanceOf(ValidationError);
  });

  it("throws AuthenticationError on 401", async () => {
    stubFetch({ status: 401, body: errorBody("Invalid API key") });
    await expect(makeClient().post({ endpoint: "x", body: {} }))
      .rejects.toBeInstanceOf(AuthenticationError);
  });

  it("throws QuotaExceededError on 402", async () => {
    stubFetch({ status: 402, body: errorBody("Quota exceeded") });
    await expect(makeClient().post({ endpoint: "x", body: {} }))
      .rejects.toBeInstanceOf(QuotaExceededError);
  });

  it("throws PlanRestrictedError on 403", async () => {
    stubFetch({ status: 403, body: errorBody("Not in your plan") });
    await expect(makeClient().post({ endpoint: "x", body: {} }))
      .rejects.toBeInstanceOf(PlanRestrictedError);
  });

  it("throws RateLimitError on 429", async () => {
    stubFetch({ status: 429, body: errorBody("Too many requests") });
    await expect(makeClient().post({ endpoint: "x", body: {} }))
      .rejects.toBeInstanceOf(RateLimitError);
  });

  it("RateLimitError carries retryAfter from Retry-After header", async () => {
    stubFetch({ status: 429, body: errorBody("slow down"), headers: { "Retry-After": "60" } });
    try {
      await makeClient().post({ endpoint: "x", body: {} });
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect((err as RateLimitError).retryAfter).toBe(60);
    }
  });

  it("throws ServerError on 500", async () => {
    stubFetch({ status: 500, body: errorBody("Server crashed") });
    await expect(makeClient().post({ endpoint: "x", body: {} }))
      .rejects.toBeInstanceOf(ServerError);
  });

  it("throws ServerError on 503", async () => {
    stubFetch({ status: 503, body: errorBody("Service unavailable") });
    const err = await makeClient().post({ endpoint: "x", body: {} }).catch(e => e);
    expect(err).toBeInstanceOf(ServerError);
    expect((err as ServerError).status).toBe(503);
  });

  it("throws NetworkError when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(makeClient().post({ endpoint: "x", body: {} }))
      .rejects.toBeInstanceOf(NetworkError);
  });

  // ── Message extraction ───────────────────────────────────────────────────

  it("extracts message from API error response body", async () => {
    stubFetch({ status: 401, body: { message: "Your key is wrong" } });
    const err = await makeClient().post({ endpoint: "x", body: {} }).catch(e => e);
    expect(err.message).toContain("Your key is wrong");
  });

  it("falls back to statusText when no message in body", async () => {
    stubFetch({ status: 401, body: {} });
    const err = await makeClient().post({ endpoint: "x", body: {} }).catch(e => e);
    expect(typeof err.message).toBe("string");
    expect(err.message.length).toBeGreaterThan(0);
  });
});
