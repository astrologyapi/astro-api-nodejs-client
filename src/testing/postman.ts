import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { InvocationContext, PostmanEndpointInventory, PostmanParameter, ResolvedAuthStyle } from "./models.js";
import { normalizePostmanEndpoint } from "./normalize.js";
import { MOCK_DIR, POSTMAN_COLLECTION_FILES } from "./paths.js";

interface RawPostmanItem {
  name: string;
  item?: RawPostmanItem[];
  request?: {
    method?: string;
    auth?: {
      type?: string;
    };
    header?: Array<{ key?: string }>;
    body?: {
      mode?: string;
      urlencoded?: Array<{ key?: string; value?: string; disabled?: boolean }>;
    };
    url?: {
      raw?: string;
    };
  };
}

interface RawPostmanCollection {
  info?: { name?: string };
  auth?: { type?: string };
  item: RawPostmanItem[];
}

export async function buildPostmanInventory(): Promise<PostmanEndpointInventory[]> {
  const inventories: PostmanEndpointInventory[] = [];

  for (const fileName of POSTMAN_COLLECTION_FILES) {
    const raw = await readFile(join(MOCK_DIR, fileName), "utf8");
    const collection = JSON.parse(raw) as RawPostmanCollection;
    walkCollectionItems(collection.item, (item) => {
      if (!item.request?.url?.raw) {
        return;
      }

      const endpoint = item.request.url.raw.replace(/^https?:\/\/[^/]+\/v\d+\//, "");
      const normalizedEndpoint = normalizePostmanEndpoint(endpoint);
      const authStyles = collectAuthStyles(collection.auth?.type, item.request.auth?.type, item.request.header ?? []);
      const parameters = (item.request.body?.urlencoded ?? []).map<PostmanParameter>((parameter) => ({
        key: parameter.key ?? "",
        value: parameter.value,
        disabled: Boolean(parameter.disabled),
      }));

      inventories.push({
        normalizedEndpoint,
        endpoint,
        domain: item.request.url.raw.includes("https://pdf.") ? "pdf" : "json",
        method: item.request.method ?? "POST",
        displayNames: [item.name],
        sourceFiles: [fileName],
        bodyMode: item.request.body?.mode ?? "none",
        bodyParameters: parameters,
        pathParameters: [...endpoint.matchAll(/:[^/]+/g)].map((match) => match[0]),
        authStyles,
        headerKeys: (item.request.header ?? []).map((header) => (header.key ?? "").toLowerCase()).filter(Boolean),
      });
    });
  }

  return mergeDuplicatePostmanEndpoints(inventories).sort((left, right) => left.normalizedEndpoint.localeCompare(right.normalizedEndpoint));
}

export function buildDirectRequestBody(entry: PostmanEndpointInventory, context: InvocationContext): Record<string, string> {
  const body: Record<string, string> = {};

  for (const parameter of entry.bodyParameters) {
    if (parameter.disabled) {
      continue;
    }

    const resolved = resolveParameterValue(parameter.key, entry, context);
    if (resolved !== undefined) {
      body[parameter.key] = String(resolved);
    }
  }

  return body;
}

export function materialiseDirectEndpoint(entry: PostmanEndpointInventory, context: InvocationContext): string {
  return entry.endpoint
    .replace(":chartId", context.chartId)
    .replace(":planet_name", context.planet)
    .replace(":planetName", context.planet)
    .replace(":zodiacName", context.zodiacPair.zodiac)
    .replace(":partnerZodiacName", context.zodiacPair.partnerZodiac)
    .replace(":md", context.vimshottariMahaDasha)
    .replace(":ad", context.vimshottariAntarDasha)
    .replace(":pd", context.vimshottariPratyantarDasha)
    .replace(":sd", context.vimshottariSookshmaDasha);
}

export function postmanAuthSummary(authStyles: ResolvedAuthStyle[]): string {
  return authStyles.length === 0 ? "unspecified in collection" : authStyles.join(", ");
}

function walkCollectionItems(items: RawPostmanItem[], visit: (item: RawPostmanItem) => void): void {
  for (const item of items) {
    if (item.item) {
      walkCollectionItems(item.item, visit);
      continue;
    }
    visit(item);
  }
}

function mergeDuplicatePostmanEndpoints(entries: PostmanEndpointInventory[]): PostmanEndpointInventory[] {
  const merged = new Map<string, PostmanEndpointInventory>();

  for (const entry of entries) {
    const existing = merged.get(entry.normalizedEndpoint);

    if (!existing) {
      merged.set(entry.normalizedEndpoint, {
        ...entry,
        displayNames: [...entry.displayNames],
        sourceFiles: [...entry.sourceFiles],
        bodyParameters: [...entry.bodyParameters],
        pathParameters: [...entry.pathParameters],
        authStyles: [...entry.authStyles],
        headerKeys: [...entry.headerKeys],
      });
      continue;
    }

    existing.displayNames = unique([...existing.displayNames, ...entry.displayNames]);
    existing.sourceFiles = unique([...existing.sourceFiles, ...entry.sourceFiles]);
    existing.bodyParameters = mergeParameters(existing.bodyParameters, entry.bodyParameters);
    existing.pathParameters = unique([...existing.pathParameters, ...entry.pathParameters]);
    existing.authStyles = unique([...existing.authStyles, ...entry.authStyles]);
    existing.headerKeys = unique([...existing.headerKeys, ...entry.headerKeys]);
  }

  return [...merged.values()];
}

function mergeParameters(current: PostmanParameter[], incoming: PostmanParameter[]): PostmanParameter[] {
  const merged = new Map<string, PostmanParameter>();

  for (const parameter of [...current, ...incoming]) {
    if (!parameter.key) {
      continue;
    }

    const existing = merged.get(parameter.key);
    if (!existing) {
      merged.set(parameter.key, { ...parameter });
      continue;
    }

    if (!existing.value && parameter.value) {
      existing.value = parameter.value;
    }

    existing.disabled = existing.disabled && parameter.disabled;
  }

  return [...merged.values()];
}

function collectAuthStyles(
  collectionAuthType: string | undefined,
  itemAuthType: string | undefined,
  headers: Array<{ key?: string }>,
): ResolvedAuthStyle[] {
  const authStyles = new Set<ResolvedAuthStyle>();

  if (collectionAuthType === "basic" || itemAuthType === "basic") {
    authStyles.add("basic");
  }

  if (headers.some((header) => (header.key ?? "").toLowerCase() === "x-astrologyapi-key")) {
    authStyles.add("header");
  }

  return [...authStyles];
}

function resolveParameterValue(
  key: string,
  entry: PostmanEndpointInventory,
  context: InvocationContext,
): string | number | undefined {
  const prefixedBirthMatch = key.match(
    /^([mfps])_(day|month|year|hour|min|minute|lat|latitude|lon|longitude|tzone|timezone)$/,
  );
  if (prefixedBirthMatch) {
    const [, prefix, field] = prefixedBirthMatch;
    const source = prefix === "m"
      ? context.match.male
      : prefix === "f"
        ? context.match.female
        : prefix === "p"
          ? context.couple.person1
          : context.couple.person2;
    return mapBirthField(source, field);
  }

  switch (key) {
    case "day":
    case "month":
    case "year":
    case "hour":
    case "min":
    case "lat":
    case "lon":
    case "tzone":
      return context.birth[key as keyof typeof context.birth] as string | number | undefined;
    case "minute":
      return context.birth.min;
    case "latitude":
      return context.birth.lat;
    case "longitude":
      return context.birth.lon;
    case "place":
      return context.placeQuery;
    case "maxRows":
      return context.maxRows;
    case "timezone":
      return context.birth.tzone;
    case "name":
      return entry.domain === "pdf" ? context.subjectName : context.numerology.name;
    case "full name":
    case "full_name":
      return context.numerology.name;
    case "partner_name":
      return context.partnerName;
    case "m_first_name":
      return splitFullName(context.subjectName).firstName;
    case "m_last_name":
      return splitFullName(context.subjectName).lastName;
    case "f_first_name":
      return splitFullName(context.partnerName).firstName;
    case "f_last_name":
      return splitFullName(context.partnerName).lastName;
    case "p_first_name":
      return splitFullName(context.subjectName).firstName;
    case "p_last_name":
      return splitFullName(context.subjectName).lastName;
    case "s_first_name":
      return splitFullName(context.partnerName).firstName;
    case "s_last_name":
      return splitFullName(context.partnerName).lastName;
    case "m_place":
    case "f_place":
    case "p_place":
    case "s_place":
      return context.subjectPlace;
    case "gender":
      return context.birth.gender ?? "female";
    case "language":
      return "en";
    case "chart_style":
      return context.branding.chart_style ?? "NORTH_INDIAN";
    case "footer_link":
      return context.branding.footer_link;
    case "logo_url":
      return context.branding.logo_url;
    case "company_name":
      return context.branding.company_name;
    case "company_info":
      return context.branding.company_info;
    case "domain_url":
      return context.branding.domain_url;
    case "company_email":
      return context.branding.company_email;
    case "company_landline":
      return context.branding.company_landline;
    case "company_mobile":
      return context.branding.company_mobile;
    case "ashtakoot":
    case "papasyam":
    case "dashakoot":
      return "true";
    case "varshaphal_year":
      return context.birth.year + 36;
    case "solar_year":
      return context.birth.year + 36;
    case "ayanamsha":
      return "LAHIRI";
    case "year_count":
      return 1;
    default:
      return undefined;
  }
}

function mapBirthField(
  source: InvocationContext["birth"] | InvocationContext["match"]["male"] | InvocationContext["couple"]["person1"],
  field: string,
): string | number | undefined {
  switch (field) {
    case "day":
    case "month":
    case "year":
    case "hour":
    case "min":
    case "lat":
    case "lon":
    case "tzone":
      return source[field as keyof typeof source] as string | number | undefined;
    case "minute":
      return source.min;
    case "latitude":
      return source.lat;
    case "longitude":
      return source.lon;
    case "timezone":
      return source.tzone;
    default:
      return undefined;
  }
}

function splitFullName(name: string): { firstName?: string; lastName?: string } {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return {};
  }

  if (parts.length === 1) {
    return { firstName: parts[0] };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}
