import type { ApiDomain } from "./models.js";

export function extractEndpointFromUrl(rawUrl: string): { endpoint: string; domain: ApiDomain } {
  const url = new URL(rawUrl);
  const endpoint = url.pathname.replace(/^\/v\d+\//, "").replace(/^\/+|\/+$/g, "");
  const domain: ApiDomain = url.hostname.startsWith("pdf.") ? "pdf" : "json";
  return { endpoint, domain };
}

export function normalizePostmanEndpoint(endpoint: string): string {
  return endpoint
    .replace(/^https?:\/\/[^/]+\/v\d+\//, "")
    .replace(/:chartId/g, "<chart>")
    .replace(/:planet_name/g, "<planet>")
    .replace(/:planetName/g, "<planet>")
    .replace(/:zodiacName/g, "<zodiac>")
    .replace(/:partnerZodiacName/g, "<zodiac2>")
    .replace(/:md/g, "<md>")
    .replace(/:ad/g, "<ad>")
    .replace(/:pd/g, "<pd>")
    .replace(/:sd/g, "<sd>")
    .replace(/^\/+|\/+$/g, "");
}

export function normalizeSdkEndpoint(endpoint: string, parameterNames: string[], invocationArgs: unknown[]): string {
  let normalized = endpoint.replace(/^\/+|\/+$/g, "");

  const placeholderCounts = new Map<string, number>();

  for (const parameterName of parameterNames) {
    const index = parameterNames.indexOf(parameterName);
    const value = invocationArgs[index];
    if (typeof value !== "string" && typeof value !== "number") {
      continue;
    }

    if (!isPathParameterName(parameterName)) {
      continue;
    }

    const nextCount = placeholderCounts.get(parameterName) ?? 0;
    placeholderCounts.set(parameterName, nextCount + 1);
    const placeholder = placeholderFromParameter(parameterName, nextCount);
    normalized = replacePathSegment(normalized, String(value), placeholder);
  }

  return normalizePostmanEndpoint(normalized);
}

export function extractPathParameters(endpoint: string): string[] {
  return [...endpoint.matchAll(/<[^>]+>/g)].map((match) => match[0]);
}

export function staticEndpointBase(endpoint: string): string {
  const segments = endpoint.split("/").filter(Boolean);
  const staticSegments: string[] = [];

  for (const segment of segments) {
    if (segment.startsWith("<")) {
      break;
    }
    staticSegments.push(segment);
  }

  return staticSegments.join("/");
}

export function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    const sortedValues = value.map((item) => sortDeep(item));
    if (sortedValues.every((item) => typeof item !== "object" || item === null)) {
      return [...sortedValues].sort(comparePrimitiveValues);
    }
    return sortedValues;
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortDeep(value[key])]),
    );
  }

  return value;
}

export function inferShape(value: unknown): unknown {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return ["unknown"];
    }
    return [inferShape(value[0])];
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, inferShape(value[key])]),
    );
  }

  if (value === null) {
    return "null";
  }

  return typeof value;
}

export function diffValues(left: unknown, right: unknown, path = "root", limit = 50): string[] {
  if (limit <= 0) {
    return [];
  }

  if (Object.is(left, right)) {
    return [];
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const diffs: string[] = [];
    if (left.length !== right.length) {
      diffs.push(`${path}: array length differs (${left.length} vs ${right.length})`);
    }

    const maxLength = Math.max(left.length, right.length);
    for (let index = 0; index < maxLength && diffs.length < limit; index += 1) {
      diffs.push(...diffValues(left[index], right[index], `${path}[${index}]`, limit - diffs.length));
    }
    return diffs.slice(0, limit);
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    const diffs: string[] = [];
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

    for (const key of [...keys].sort()) {
      diffs.push(...diffValues(left[key], right[key], `${path}.${key}`, limit - diffs.length));
      if (diffs.length >= limit) {
        break;
      }
    }

    return diffs.slice(0, limit);
  }

  return [`${path}: ${JSON.stringify(left)} !== ${JSON.stringify(right)}`];
}

export function formatJsonBlock(value: unknown): string {
  return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

export function serialiseResult(value: unknown): unknown {
  if (value instanceof ArrayBuffer) {
    return { byteLength: value.byteLength, type: "ArrayBuffer" };
  }

  return value;
}

export function isNotTestableStatus(status: number | undefined): boolean {
  return status === 402 || status === 403;
}

function isPathParameterName(name: string): boolean {
  return ["chartId", "planet", "zodiac", "partnerZodiac", "mahaDasha", "antarDasha", "pratyantarDasha", "sookshmaDasha"].includes(name);
}

function placeholderFromParameter(name: string, occurrence: number): string {
  switch (name) {
    case "chartId":
      return "<chart>";
    case "planet":
      return "<planet>";
    case "zodiac":
      return occurrence === 0 ? "<zodiac>" : "<zodiac2>";
    case "partnerZodiac":
      return "<zodiac2>";
    case "mahaDasha":
      return "<md>";
    case "antarDasha":
      return "<ad>";
    case "pratyantarDasha":
      return "<pd>";
    case "sookshmaDasha":
      return "<sd>";
    default:
      return "<string>";
  }
}

function replacePathSegment(endpoint: string, value: string, placeholder: string): string {
  return endpoint
    .split("/")
    .map((segment) => {
      if (segment === value || decodeURIComponent(segment) === value) {
        return placeholder;
      }
      return segment;
    })
    .join("/");
}

function comparePrimitiveValues(left: unknown, right: unknown): number {
  return JSON.stringify(left).localeCompare(JSON.stringify(right));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
