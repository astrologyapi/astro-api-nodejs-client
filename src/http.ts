import {
  AstrologyAPIError,
  AuthenticationError,
  NetworkError,
  PlanRestrictedError,
  QuotaExceededError,
  RateLimitError,
  ServerError,
  ValidationError,
} from "./errors.js";
import { SDK_VERSION } from "./version.js";

const BASE_JSON_URL = "https://json.astrologyapi.com";
const BASE_PDF_URL = "https://pdf.astrologyapi.com";

export type ApiDomain = "json" | "pdf";

export interface RequestOptions {
  endpoint: string;
  body?: Record<string, unknown>;
  domain?: ApiDomain;
  language?: string | undefined;
  encoding?: "json" | "form-urlencoded";
}

export interface HttpClientConfig {
  userId?: string;
  apiKey: string;
  version: string;
  forceHeaderAuth?: boolean;
}

/**
 * Internal HTTP client. Handles auth, base URL selection,
 * and maps API error codes to typed SDK errors.
 */
export class HttpClient {
  private readonly userId?: string;
  private readonly apiKey: string;
  private readonly version: string;
  private readonly useHeaderAuth: boolean;

  constructor(userId: string, apiKey: string, version: string);
  constructor(config: HttpClientConfig);
  constructor(
    userIdOrConfig: string | HttpClientConfig,
    apiKey?: string,
    version?: string,
  ) {
    const resolved = typeof userIdOrConfig === "string"
      ? {
          userId: userIdOrConfig,
          apiKey: apiKey ?? "",
          version: version ?? "v1",
        }
      : userIdOrConfig;

    this.userId = resolved.userId;
    this.apiKey = resolved.apiKey;
    this.version = resolved.version;
    this.useHeaderAuth = resolved.forceHeaderAuth ?? shouldUseHeaderAuth(resolved.apiKey);
  }

  async post<T = unknown>(options: RequestOptions): Promise<T> {
    const { endpoint, body = {}, domain = "json", language, encoding = "json" } = options;

    const baseUrl = domain === "pdf" ? BASE_PDF_URL : BASE_JSON_URL;
    const url = `${baseUrl}/${this.version}/${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": encoding === "form-urlencoded"
        ? "application/x-www-form-urlencoded"
        : "application/json",
      "User-Agent": `astrologyapi-node/${SDK_VERSION}`,
    };

    if (this.useHeaderAuth) {
      headers["x-astrologyapi-key"] = this.apiKey;
    } else {
      if (!this.userId) {
        throw new Error("HttpClient: userId is required when using Basic Authorization.");
      }
      headers["Authorization"] = `Basic ${Buffer.from(`${this.userId}:${this.apiKey}`).toString("base64")}`;
    }

    if (language) {
      headers["Accept-Language"] = language;
    }

    let response: Response;

    try {
      const requestBody = encoding === "form-urlencoded"
        ? buildFormEncodedBody(body)
        : JSON.stringify(body);

      response = await fetch(url, {
        method: "POST",
        headers,
        body: requestBody,
      });
    } catch (cause) {
      throw new NetworkError(
        `Network request failed for ${endpoint}. Check your internet connection.`,
        cause,
      );
    }

    // Parse body regardless of status so we can include it in errors
    let data: unknown;
    const contentType = response.headers.get("content-type") ?? "";

    try {
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else if (contentType.includes("application/pdf") || domain === "pdf") {
        data = await response.arrayBuffer();
      } else {
        data = await response.text();
      }
    } catch {
      data = null;
    }

    if (response.ok) {
      return data as T;
    }

    // Map HTTP status → typed error
    const message = extractMessage(data) ?? response.statusText;

    switch (response.status) {
      case 400:
      case 422:
        throw new ValidationError(message, undefined, data);
      case 401:
        throw new AuthenticationError(
          message || "Authentication failed. Check your credentials.",
          401,
          data,
        );
      case 402:
        throw new QuotaExceededError(
          message || "API quota exceeded. Please upgrade your plan at astrologyapi.com.",
          data,
        );
      case 403:
        throw new PlanRestrictedError(
          message || "This endpoint is not available on your current plan.",
          data,
        );
      case 429: {
        const retryAfter = parseRetryAfter(response);
        throw new RateLimitError(
          message || "Rate limit exceeded. Please wait before retrying.",
          retryAfter,
          data,
        );
      }
      default:
        if (response.status >= 500) {
          throw new ServerError(
            message || `AstrologyAPI server error (${response.status}). Please try again later.`,
            response.status,
            data,
          );
        }
        throw new AstrologyAPIError(message, response.status, data);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function extractMessage(data: unknown): string | undefined {
  if (typeof data === "string") return data;
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    const candidate = obj["message"] ?? obj["error"] ?? obj["msg"];
    if (typeof candidate === "string") return candidate;
  }
  return undefined;
}

function parseRetryAfter(response: Response): number | undefined {
  const header = response.headers.get("retry-after");
  if (header === null) return undefined;
  const seconds = parseInt(header, 10);
  return isNaN(seconds) ? undefined : seconds;
}

function shouldUseHeaderAuth(apiKey: string): boolean {
  return apiKey.includes("ak-");
}

function buildFormEncodedBody(body: Record<string, unknown>): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(body)) {
    if (value === undefined || value === null) {
      continue;
    }

    params.set(key, String(value));
  }

  return params;
}
