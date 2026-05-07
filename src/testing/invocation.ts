import { AstrologyAPI } from "../index.js";
import type { PDFBranding } from "../types.js";
import type { InvocationContext, InvocationPlan, ModuleDescriptor, SDKMethodDescriptor, TestScenarios } from "./models.js";

const PLANET_POOL = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"];
const CHART_ID_POOL = ["D1", "D9", "D10"];
const DASHA_POOL = ["sun", "moon", "mars", "rahu", "jupiter", "saturn", "mercury", "ketu", "venus"];

export const MODULE_DESCRIPTORS: ModuleDescriptor[] = [
  { module: "vedic", getTarget: (client) => (client as AstrologyAPI).vedic as unknown as Record<string, unknown> },
  { module: "kp", getTarget: (client) => (client as AstrologyAPI).kp as unknown as Record<string, unknown> },
  { module: "lalKitab", getTarget: (client) => (client as AstrologyAPI).lalKitab as unknown as Record<string, unknown> },
  { module: "horoscopes", getTarget: (client) => (client as AstrologyAPI).horoscopes as unknown as Record<string, unknown> },
  { module: "numerology", getTarget: (client) => (client as AstrologyAPI).numerology as unknown as Record<string, unknown> },
  { module: "western", getTarget: (client) => (client as AstrologyAPI).western as unknown as Record<string, unknown> },
  { module: "westernTransit", getTarget: (client) => (client as AstrologyAPI).westernTransit as unknown as Record<string, unknown> },
  { module: "tarot", getTarget: (client) => (client as AstrologyAPI).tarot as unknown as Record<string, unknown> },
  { module: "chinese", getTarget: (client) => (client as AstrologyAPI).chinese as unknown as Record<string, unknown> },
  { module: "pdf.vedic", getTarget: (client) => (client as AstrologyAPI).pdf.vedic as unknown as Record<string, unknown> },
  { module: "pdf.western", getTarget: (client) => (client as AstrologyAPI).pdf.western as unknown as Record<string, unknown> },
  { module: "location", getTarget: (client) => (client as AstrologyAPI).location as unknown as Record<string, unknown> },
];

export function createClient(userId: string, apiKey: string): AstrologyAPI {
  return new AstrologyAPI({ userId, apiKey });
}

export function listSdkMethodDescriptors(client: AstrologyAPI): SDKMethodDescriptor[] {
  const methods: SDKMethodDescriptor[] = [];

  for (const descriptor of MODULE_DESCRIPTORS) {
    const target = descriptor.getTarget(client);
    const prototype = Object.getPrototypeOf(target) as Record<string, unknown>;

    for (const methodName of Object.getOwnPropertyNames(prototype)) {
      if (methodName === "constructor" || methodName === "post" || !methodName.startsWith("get")) {
        continue;
      }

      const method = prototype[methodName];
      if (typeof method !== "function") {
        continue;
      }

      methods.push({
        module: descriptor.module,
        method: methodName,
        parameterNames: extractParameterNames(method),
      });
    }
  }

  return methods.sort((left, right) => {
    const moduleOrder = MODULE_DESCRIPTORS.findIndex((descriptor) => descriptor.module === left.module)
      - MODULE_DESCRIPTORS.findIndex((descriptor) => descriptor.module === right.module);
    if (moduleOrder !== 0) {
      return moduleOrder;
    }
    return left.method.localeCompare(right.method);
  });
}

export function getClientMethod(client: AstrologyAPI, moduleName: string, methodName: string): (...args: unknown[]) => Promise<unknown> {
  const descriptor = MODULE_DESCRIPTORS.find((item) => item.module === moduleName);
  if (!descriptor) {
    throw new Error(`Unsupported module: ${moduleName}`);
  }

  const target = descriptor.getTarget(client);
  const method = target[methodName];
  if (typeof method !== "function") {
    throw new Error(`Method ${moduleName}.${methodName} is not callable`);
  }

  return method.bind(target) as (...args: unknown[]) => Promise<unknown>;
}

export function buildInvocationPlan(
  moduleName: string,
  methodName: string,
  parameterNames: string[],
  scenarios: TestScenarios,
  strategy: "deterministic" | "random" = "deterministic",
): InvocationPlan {
  const context = buildInvocationContext(moduleName, methodName, scenarios, strategy);
  const args = parameterNames.map((parameterName) => resolveParameterValue(parameterName, moduleName, methodName, context));

  while (args.length > 0 && args[args.length - 1] === undefined) {
    args.pop();
  }

  return { args, context };
}

function buildInvocationContext(
  moduleName: string,
  methodName: string,
  scenarios: TestScenarios,
  strategy: "deterministic" | "random",
): InvocationContext {
  const birthPool = [
    scenarios.birthStandard,
    scenarios.birthNegativeTimezone,
    scenarios.birthFractionalTimezone,
    scenarios.birthDstSensitive,
    scenarios.birthEdgeDate,
  ];

  const baseBirth = strategy === "random"
    ? randomFromArray(birthPool)
    : selectDeterministicBirth(moduleName, methodName, scenarios);

  const zodiacPair = strategy === "random"
    ? randomFromArray([scenarios.zodiacPairs.primary, ...scenarios.zodiacPairs.alternates])
    : scenarios.zodiacPairs.primary;

  return {
    birth: baseBirth,
    match: scenarios.matchBasic,
    couple: scenarios.coupleBasic,
    numerology: strategy === "random" ? randomFromArray([scenarios.numerologyBasic, scenarios.numerologyAlternate]) : scenarios.numerologyBasic,
    branding: scenarios.pdfBranding,
    zodiacPair,
    planet: strategy === "random" ? randomFromArray(PLANET_POOL) : PLANET_POOL[0],
    chartId: strategy === "random" ? randomFromArray(CHART_ID_POOL) : CHART_ID_POOL[0],
    mahaDasha: "aries",
    vimshottariMahaDasha: strategy === "random" ? randomFromArray(DASHA_POOL) : "sun",
    vimshottariAntarDasha: strategy === "random" ? randomFromArray(DASHA_POOL) : "moon",
    vimshottariPratyantarDasha: strategy === "random" ? randomFromArray(DASHA_POOL) : "mars",
    vimshottariSookshmaDasha: strategy === "random" ? randomFromArray(DASHA_POOL) : "venus",
    placeQuery: baseBirth.place ?? "Mumbai",
    maxRows: 6,
    subjectName: baseBirth.name ?? "QA Test Subject",
    partnerName: scenarios.coupleBasic.person2.name ?? "QA Partner",
    subjectPlace: baseBirth.place ?? "Mumbai, Maharashtra, India",
  };
}

function resolveParameterValue(
  parameterName: string,
  moduleName: string,
  methodName: string,
  context: InvocationContext,
): unknown {
  switch (parameterName) {
    case "data":
      return resolveDataArgument(moduleName, methodName, context);
    case "planet":
      return context.planet;
    case "zodiac":
      return context.zodiacPair.zodiac;
    case "partnerZodiac":
      return context.zodiacPair.partnerZodiac;
    case "chartId":
      return context.chartId;
    case "mahaDasha":
      return methodName === "getSubCharDasha" ? context.mahaDasha : context.vimshottariMahaDasha;
    case "antarDasha":
      return context.vimshottariAntarDasha;
    case "pratyantarDasha":
      return context.vimshottariPratyantarDasha;
    case "sookshmaDasha":
      return context.vimshottariSookshmaDasha;
    case "place":
      return context.placeQuery;
    case "maxRows":
      return context.maxRows;
    case "branding":
      return buildSdkBranding(context.branding);
    case "language":
      return moduleName.startsWith("pdf.") ? "en" : undefined;
    case "timezone":
      return context.birth.tzone;
    default:
      return undefined;
  }
}

function resolveDataArgument(moduleName: string, methodName: string, context: InvocationContext): Record<string, unknown> {
  if (moduleName === "numerology" && !["getPersonalDay", "getPersonalMonth", "getPersonalYear"].includes(methodName)) {
    return { ...context.numerology };
  }

  if (moduleName === "western" && ["getSynastry", "getComposite", "getFriendship", "getKarmaDestiny"].includes(methodName)) {
    return { ...context.couple };
  }

  if (moduleName === "pdf.western" && methodName === "getSynastry") {
    return {
      ...context.couple,
      name: context.subjectName,
      partner_name: context.partnerName,
      place: context.subjectPlace,
    };
  }

  if (moduleName === "pdf.western") {
    const base = {
      ...context.birth,
      name: context.subjectName,
      place: context.subjectPlace,
    };
    if (methodName === "getSolarReturn") {
      return {
        ...base,
        solar_year: context.birth.year + 36,
      };
    }
    return base;
  }

  if (moduleName === "vedic" && isVedicMatchMethod(methodName)) {
    return { ...context.match };
  }

  if (moduleName === "vedic" && methodName === "getPapasamyam") {
    return {
      ...context.birth,
      full_name: context.subjectName,
      ayanamsha: "LAHIRI",
      date: context.birth.day,
    };
  }

  if (moduleName === "pdf.vedic" && methodName === "getMatchMaking") {
    return {
      ...context.match,
      name: context.subjectName,
      partner_name: context.partnerName,
      place: context.subjectPlace,
    };
  }

  if (moduleName === "pdf.vedic") {
    return {
      ...context.birth,
      name: context.subjectName,
      place: context.subjectPlace,
    };
  }

  if (moduleName === "vedic" && methodName.startsWith("getVarshaphal")) {
    return {
      day: context.birth.day,
      month: context.birth.month,
      year: context.birth.year,
      hour: context.birth.hour,
      min: context.birth.min,
      lat: context.birth.lat,
      lon: context.birth.lon,
      tzone: context.birth.tzone,
      varshaphal_year: context.birth.year + 36,
      ayanamsha: "LAHIRI",
    };
  }

  if (moduleName === "location" && methodName === "getTimezone") {
    return {
      day: context.birth.day,
      month: context.birth.month,
      year: context.birth.year,
      hour: context.birth.hour,
      min: context.birth.min,
      lat: context.birth.lat,
      lon: context.birth.lon,
    };
  }

  return { ...context.birth };
}

function isVedicMatchMethod(methodName: string): boolean {
  return methodName.startsWith("getMatch")
    || [
      "getAshtakootPoints",
      "getDashakootPoints",
      "getDetailedMatchReport",
      "getSimpleMatchReport",
    ].includes(methodName);
}

function buildSdkBranding(branding: InvocationContext["branding"]): PDFBranding {
  return {
    logoUrl: branding.logo_url,
    companyName: branding.company_name,
    companyInfo: branding.company_info,
    domainUrl: branding.domain_url,
    companyEmail: branding.company_email,
    companyLandline: branding.company_landline,
    companyMobile: branding.company_mobile,
    footerLink: branding.footer_link,
    chartStyle: normaliseChartStyle(branding.chart_style),
  };
}

function normaliseChartStyle(chartStyle: string | undefined): PDFBranding["chartStyle"] | undefined {
  switch (chartStyle) {
    case "NORTH_INDIAN":
      return "NORTH_INDIAN";
    case "SOUTH_INDIAN":
      return "SOUTH_INDIAN";
    case "EAST_INDIAN":
      return "EAST_INDIAN";
    default:
      return undefined;
  }
}

function selectDeterministicBirth(moduleName: string, methodName: string, scenarios: TestScenarios) {
  if (moduleName === "location" && methodName === "getTimezone") {
    return scenarios.birthDstSensitive;
  }

  if (moduleName === "westernTransit") {
    return scenarios.birthNegativeTimezone;
  }

  if (moduleName.startsWith("pdf.")) {
    return scenarios.birthFractionalTimezone;
  }

  if (methodName.includes("Panchang") || methodName.includes("Festival")) {
    return scenarios.birthEdgeDate;
  }

  return scenarios.birthStandard;
}

function extractParameterNames(fn: Function): string[] {
  const source = fn.toString();
  const startIndex = source.indexOf("(");

  if (startIndex === -1) {
    return [];
  }

  let depth = 0;
  let endIndex = -1;

  for (let index = startIndex; index < source.length; index += 1) {
    const character = source[index];
    if (character === "(") {
      depth += 1;
    } else if (character === ")") {
      depth -= 1;
      if (depth === 0) {
        endIndex = index;
        break;
      }
    }
  }

  if (endIndex === -1) {
    return [];
  }

  const insideParentheses = source.slice(startIndex + 1, endIndex).trim();
  if (!insideParentheses) {
    return [];
  }

  return insideParentheses
    .split(",")
    .map((parameter) => parameter.trim())
    .filter(Boolean)
    .map((parameter) => parameter.replace(/=.*/, "").trim());
}

function randomFromArray<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
