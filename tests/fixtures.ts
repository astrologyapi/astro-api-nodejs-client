/**
 * Shared test fixtures — mirrors the canonical test data used across all AstrologyAPI SDKs.
 */

import type { BirthData, CoupleBirthData, MatchBirthData, NumerologyData, PDFBranding } from "../src/types.js";

// ─────────────────────────────────────────────────────────────────────────────
// Standard birth data
// ─────────────────────────────────────────────────────────────────────────────

/** Mumbai — primary test fixture used across all AstrologyAPI SDKs. */
export const mumbai: BirthData = {
  day: 10, month: 5, year: 1990,
  hour: 19, min: 55,
  lat: 19.20, lon: 72.83,
  tzone: 5.5,
};

/** Delhi — secondary test fixture. */
export const delhi: BirthData = {
  day: 15, month: 8, year: 1990,
  hour: 14, min: 30,
  lat: 28.6139, lon: 77.2090,
  tzone: 5.5,
};

export const matchData: MatchBirthData = { male: mumbai, female: delhi };

export const coupleData: CoupleBirthData = { person1: mumbai, person2: delhi };

export const numeroData: NumerologyData = {
  day: 10, month: 5, year: 1990, name: "John Doe",
};

export const branding: PDFBranding = {
  companyName: "Test Corp",
  domainUrl: "https://example.com",
  chartStyle: "NORTH_INDIAN",
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock fetch helpers
// ─────────────────────────────────────────────────────────────────────────────

export interface MockResponseOptions {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
  /** Return binary data (ArrayBuffer) instead of JSON */
  binary?: boolean;
}

/**
 * Creates a minimal `Response`-compatible object that satisfies the fetch interface.
 * Use `vi.stubGlobal('fetch', mockFetch(...))` to inject it.
 */
export function makeFetchMock(options: MockResponseOptions = {}) {
  const { status = 200, body = {}, headers = {}, binary = false } = options;

  const responseHeaders = new Headers({
    "Content-Type": binary ? "application/pdf" : "application/json",
    ...headers,
  });

  const getBody = async () => {
    if (!binary) return body;
    return new ArrayBuffer(16); // fake PDF bytes
  };

  const mockResponse = {
    ok: status >= 200 && status < 300,
    status,
    statusText: statusText(status),
    headers: responseHeaders,
    json: async () => body,
    arrayBuffer: async () => new ArrayBuffer(16),
    text: async () => JSON.stringify(body),
  };

  return vi.fn().mockResolvedValue(mockResponse);
}

/** Convenience: stub fetch globally for a single test. Restores automatically via vi.unstubAllGlobals. */
export function stubFetch(options: MockResponseOptions = {}) {
  const mock = makeFetchMock(options);
  vi.stubGlobal("fetch", mock);
  return mock;
}

/** JSON error body used in API error responses. */
export function errorBody(message: string): Record<string, string> {
  return { message };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function statusText(status: number): string {
  const map: Record<number, string> = {
    200: "OK", 400: "Bad Request", 401: "Unauthorized",
    402: "Payment Required", 403: "Forbidden", 404: "Not Found",
    422: "Unprocessable Entity", 429: "Too Many Requests",
    500: "Internal Server Error",
  };
  return map[status] ?? "Unknown";
}
