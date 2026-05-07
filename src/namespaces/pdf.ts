import { HttpClient } from "../http";
import type { BirthData, CoupleBirthData, Language, MatchBirthData, PDFBranding } from "../types";

type VedicPDFData = BirthData & {
  gender?: string;
  name?: string;
  place?: string;
};

type VedicMatchMakingPDFData = MatchBirthData & {
  name?: string;
  partner_name?: string;
  place?: string;
  m_first_name?: string;
  m_last_name?: string;
  m_place?: string;
  f_first_name?: string;
  f_last_name?: string;
  f_place?: string;
  ashtakoot?: boolean;
  dashakoot?: boolean;
  papasyam?: boolean;
};

type WesternPDFData = BirthData & {
  name?: string;
  place?: string;
  solar_year?: number;
};

type WesternSynastryPDFData = CoupleBirthData & {
  name?: string;
  partner_name?: string;
  place?: string;
  p_first_name?: string;
  p_last_name?: string;
  p_place?: string;
  s_first_name?: string;
  s_last_name?: string;
  s_place?: string;
};

/**
 * PDF namespace — generate branded PDF astrology reports.
 *
 * All endpoints return an ArrayBuffer containing the PDF binary.
 * Write this to a file or send as a download response.
 *
 * Branding fields (logo, company name, etc.) are optional — only
 * provided values are forwarded to the API.
 */
export class PDFNamespace {
  /** Vedic PDF reports */
  readonly vedic: VedicPDF;
  /** Western PDF reports */
  readonly western: WesternPDF;

  constructor(http: HttpClient) {
    this.vedic = new VedicPDF(http);
    this.western = new WesternPDF(http);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Vedic PDF Reports
// ─────────────────────────────────────────────────────────────────────────────

class VedicPDF {
  constructor(private readonly http: HttpClient) {}

  private post(endpoint: string, body: Record<string, unknown>, language?: Language): Promise<ArrayBuffer> {
    return this.http.post<ArrayBuffer>({
      endpoint,
      body,
      domain: "pdf",
      language,
      encoding: "form-urlencoded",
    });
  }

  /**
   * Mini Kundli PDF — compact birth chart summary (1–2 pages).
   */
  getMiniKundli(data: VedicPDFData, branding?: PDFBranding, language?: Language) {
    return this.post("mini_horoscope_pdf", buildVedicSingleReportBody(data, branding, language), language);
  }

  /**
   * Basic horoscope PDF — standard birth chart with planetary positions and dasha table.
   */
  getBasicHoroscope(data: VedicPDFData, branding?: PDFBranding, language?: Language) {
    return this.post("basic_horoscope_pdf", buildVedicSingleReportBody(data, branding, language), language);
  }

  /**
   * Professional horoscope PDF — comprehensive report with charts, dashas,
   * doshas, and interpretations.
   */
  getProfessionalHoroscope(data: VedicPDFData, branding?: PDFBranding, language?: Language) {
    return this.post("pro_horoscope_pdf", buildVedicSingleReportBody(data, branding, language), language);
  }

  /**
   * Match Making PDF — compatibility report for two individuals.
   */
  getMatchMaking(data: VedicMatchMakingPDFData, branding?: PDFBranding, language?: Language) {
    return this.post("match_making_pdf", buildVedicMatchMakingBody(data, branding, language), language);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Western PDF Reports
// ─────────────────────────────────────────────────────────────────────────────

class WesternPDF {
  constructor(private readonly http: HttpClient) {}

  private post(endpoint: string, body: Record<string, unknown>, language?: Language): Promise<ArrayBuffer> {
    return this.http.post<ArrayBuffer>({
      endpoint,
      body,
      domain: "pdf",
      language,
      encoding: "form-urlencoded",
    });
  }

  /**
   * Western natal chart PDF — birth chart with aspects, house positions, and interpretation.
   */
  getNatalChart(data: WesternPDFData, branding?: PDFBranding, language?: Language) {
    return this.post("natal_horoscope_report/tropical", buildWesternSingleReportBody(data, branding, language), language);
  }

  /**
   * Life forecast PDF — transit-based annual forecast report.
   */
  getLifeForecast(data: WesternPDFData, branding?: PDFBranding, language?: Language) {
    return this.post("life_forecast_report/tropical", buildWesternSingleReportBody(data, branding, language), language);
  }

  /**
   * Solar Return PDF — annual solar return chart and interpretation.
   */
  getSolarReturn(data: WesternPDFData, branding?: PDFBranding, language?: Language) {
    return this.post(
      "solar_return_report/tropical",
      buildWesternSingleReportBody(data, branding, language),
      language,
    );
  }

  /**
   * Synastry couple PDF — relationship compatibility report for two people.
   */
  getSynastry(data: WesternSynastryPDFData, branding?: PDFBranding, language?: Language) {
    return this.post("synastry_couple_report/tropical", buildWesternSynastryBody(data, branding, language), language);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildVedicSingleReportBody(
  data: VedicPDFData,
  branding?: PDFBranding,
  language?: Language,
): Record<string, unknown> {
  return compactBody({
    day: data.day,
    month: data.month,
    year: data.year,
    hour: data.hour,
    min: data.min,
    lat: data.lat,
    lon: data.lon,
    tzone: data.tzone,
    gender: data.gender,
    place: data.place,
    language,
    ...flattenReportBranding(branding),
    ...flattenChartStyle(branding),
  });
}

function buildVedicMatchMakingBody(
  data: VedicMatchMakingPDFData,
  branding?: PDFBranding,
  language?: Language,
): Record<string, unknown> {
  const { male, female } = data;
  const maleName = splitFullName(data.m_first_name || data.m_last_name ? [data.m_first_name, data.m_last_name].filter(Boolean).join(" ") : data.name);
  const femaleName = splitFullName(
    data.f_first_name || data.f_last_name ? [data.f_first_name, data.f_last_name].filter(Boolean).join(" ") : data.partner_name,
  );

  return compactBody({
    m_first_name: data.m_first_name ?? maleName.firstName,
    m_last_name: data.m_last_name ?? maleName.lastName,
    m_day: male.day,
    m_month: male.month,
    m_year: male.year,
    m_hour: male.hour,
    m_minute: male.min,
    m_latitude: male.lat,
    m_longitude: male.lon,
    m_timezone: male.tzone,
    m_place: data.m_place ?? data.place,
    f_first_name: data.f_first_name ?? femaleName.firstName,
    f_last_name: data.f_last_name ?? femaleName.lastName,
    f_day: female.day,
    f_month: female.month,
    f_year: female.year,
    f_hour: female.hour,
    f_minute: female.min,
    f_latitude: female.lat,
    f_longitude: female.lon,
    f_timezone: female.tzone,
    f_place: data.f_place ?? data.place,
    language,
    ashtakoot: data.ashtakoot ?? true,
    papasyam: data.papasyam ?? true,
    dashakoot: data.dashakoot ?? true,
    ...flattenMatchMakingBranding(branding),
    ...flattenChartStyle(branding),
  });
}

function buildWesternSingleReportBody(
  data: WesternPDFData,
  branding?: PDFBranding,
  language?: Language,
): Record<string, unknown> {
  return compactBody({
    name: data.name,
    day: data.day,
    month: data.month,
    year: data.year,
    hour: data.hour,
    minute: data.min,
    latitude: data.lat,
    longitude: data.lon,
    timezone: data.tzone,
    place: data.place,
    solar_year: data.solar_year,
    language,
    ...flattenReportBranding(branding),
  });
}

function buildWesternSynastryBody(
  data: WesternSynastryPDFData,
  branding?: PDFBranding,
  language?: Language,
): Record<string, unknown> {
  const { person1, person2 } = data;
  const primaryName = splitFullName(
    data.p_first_name || data.p_last_name ? [data.p_first_name, data.p_last_name].filter(Boolean).join(" ") : data.name,
  );
  const secondaryName = splitFullName(
    data.s_first_name || data.s_last_name ? [data.s_first_name, data.s_last_name].filter(Boolean).join(" ") : data.partner_name,
  );

  return compactBody({
    p_first_name: data.p_first_name ?? primaryName.firstName,
    p_last_name: data.p_last_name ?? primaryName.lastName,
    p_day: person1.day,
    p_month: person1.month,
    p_year: person1.year,
    p_hour: person1.hour,
    p_minute: person1.min,
    p_latitude: person1.lat,
    p_longitude: person1.lon,
    p_timezone: person1.tzone,
    p_place: data.p_place ?? data.place,
    s_first_name: data.s_first_name ?? secondaryName.firstName,
    s_last_name: data.s_last_name ?? secondaryName.lastName,
    s_day: person2.day,
    s_month: person2.month,
    s_year: person2.year,
    s_hour: person2.hour,
    s_minute: person2.min,
    s_latitude: person2.lat,
    s_longitude: person2.lon,
    s_timezone: person2.tzone,
    s_place: data.s_place ?? data.place,
    language,
    ...flattenReportBranding(branding),
  });
}

function flattenReportBranding(branding?: PDFBranding): Record<string, unknown> {
  if (!branding) return {};
  return compactBody({
    logo_url: branding.logoUrl,
    company_name: branding.companyName,
    company_info: branding.companyInfo,
    domain_url: branding.domainUrl,
    company_email: branding.companyEmail,
    company_landline: branding.companyLandline,
    company_mobile: branding.companyMobile,
    footer_link: branding.footerLink,
  });
}

function flattenMatchMakingBranding(branding?: PDFBranding): Record<string, unknown> {
  if (!branding) return {};
  return compactBody({
    logo_url: branding.logoUrl,
    domain_url: branding.domainUrl,
    footer_link: branding.footerLink,
  });
}

function flattenChartStyle(branding?: PDFBranding): Record<string, unknown> {
  const chartStyle = toPdfChartStyle(branding?.chartStyle);
  return chartStyle ? { chart_style: chartStyle } : {};
}

function toPdfChartStyle(chartStyle: PDFBranding["chartStyle"] | string | undefined): string | undefined {
  switch (chartStyle) {
    case "NORTH_INDIAN":
    case "north-indian":
      return "NORTH_INDIAN";
    case "SOUTH_INDIAN":
    case "south-indian":
      return "SOUTH_INDIAN";
    case "EAST_INDIAN":
    case "east-indian":
      return "EAST_INDIAN";
    default:
      return undefined;
  }
}

function splitFullName(name: string | undefined): { firstName?: string; lastName?: string } {
  if (!name) {
    return {};
  }

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

function compactBody(body: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined && value !== null),
  );
}
