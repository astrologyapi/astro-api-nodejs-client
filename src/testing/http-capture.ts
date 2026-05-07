import type { ApiDomain, BodyEncoding, CapturedRequest, CapturedResponse } from "./models.js";
import { extractEndpointFromUrl } from "./normalize.js";

export function headersToObject(headersInit?: unknown): Record<string, string> {
  const headers = new Headers(headersInit as Headers);
  const out: Record<string, string> = {};

  headers.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();
    out[normalizedKey] = redactHeaderValue(normalizedKey, value);
  });

  return out;
}

export function captureRequest(input: string | URL | Request, init?: RequestInit): CapturedRequest {
  const rawUrl = typeof input === "string"
    ? input
    : input instanceof URL
      ? input.toString()
      : input.url;

  const headers = headersToObject(init?.headers ?? (input instanceof Request ? input.headers : undefined));
  const { body, encoding, rawBody } = decodeRequestBody(init?.body, headers["content-type"]);
  const { endpoint, domain } = extractEndpointFromUrl(rawUrl);

  return {
    url: rawUrl,
    endpoint,
    normalizedEndpoint: endpoint,
    domain,
    headers,
    body,
    rawBody,
    encoding,
  };
}

export async function captureResponse(response: Response, domainHint?: ApiDomain): Promise<CapturedResponse> {
  const headers = headersToObject(response.headers);
  const contentType = headers["content-type"] ?? "";

  try {
    if (contentType.includes("application/json")) {
      return {
        status: response.status,
        ok: response.ok,
        headers,
        body: await response.json(),
        bodyType: "json",
      };
    }

    if (contentType.includes("application/pdf") || domainHint === "pdf") {
      const bytes = await response.arrayBuffer();
      return {
        status: response.status,
        ok: response.ok,
        headers,
        body: { byteLength: bytes.byteLength, type: "pdf" },
        bodyType: "pdf",
      };
    }

    return {
      status: response.status,
      ok: response.ok,
      headers,
      body: await response.text(),
      bodyType: "text",
    };
  } catch {
    return {
      status: response.status,
      ok: response.ok,
      headers,
      body: null,
      bodyType: "unknown",
    };
  }
}

export function makeStubResponse(domain: ApiDomain): Response {
  if (domain === "pdf") {
    return new Response(new Uint8Array([1, 2, 3, 4]), {
      status: 200,
      headers: {
        "content-type": "application/pdf",
      },
    });
  }

  return new Response(JSON.stringify({ ok: true, generated_for: "sdk-introspection" }), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
}

function decodeRequestBody(body: unknown, contentType: string | undefined): {
  body: Record<string, unknown>;
  encoding: BodyEncoding;
  rawBody?: string;
} {
  if (body === undefined || body === null) {
    return { body: {}, encoding: "none" };
  }

  if (body instanceof URLSearchParams) {
    const rawBody = body.toString();
    return {
      body: Object.fromEntries(body.entries()),
      encoding: "form-urlencoded",
      rawBody,
    };
  }

  if (typeof body === "string") {
    if (contentType?.includes("application/json")) {
      try {
        return {
          body: JSON.parse(body) as Record<string, unknown>,
          encoding: "json",
          rawBody: body,
        };
      } catch {
        return { body: {}, encoding: "json", rawBody: body };
      }
    }

    if (contentType?.includes("application/x-www-form-urlencoded")) {
      return {
        body: Object.fromEntries(new URLSearchParams(body).entries()),
        encoding: "form-urlencoded",
        rawBody: body,
      };
    }

    return { body: {}, encoding: "unknown", rawBody: body };
  }

  if (body instanceof ArrayBuffer || body instanceof Uint8Array) {
    const length = body instanceof ArrayBuffer ? body.byteLength : body.byteLength;
    return { body: {}, encoding: "binary", rawBody: `[binary:${length}]` };
  }

  return { body: {}, encoding: "unknown", rawBody: String(body) };
}

function redactHeaderValue(key: string, value: string): string {
  if (key === "x-astrologyapi-key") {
    return "[REDACTED]";
  }

  if (key === "authorization") {
    return value.toLowerCase().startsWith("basic ") ? "Basic [REDACTED]" : "[REDACTED]";
  }

  return value;
}
