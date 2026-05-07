// ─────────────────────────────────────────────────────────────────────────────
// Core input types shared across all namespaces
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Birth data required by most Vedic and Western astrology endpoints.
 */
export interface BirthData {
  /** Day of birth (1–31) */
  day: number;
  /** Month of birth (1–12) */
  month: number;
  /** Year of birth (e.g. 1990) */
  year: number;
  /** Hour of birth in 24-hour format (0–23) */
  hour: number;
  /** Minute of birth (0–59) */
  min: number;
  /** Latitude of birth place (e.g. 19.20 for Mumbai) */
  lat: number;
  /** Longitude of birth place (e.g. 72.83 for Mumbai) */
  lon: number;
  /** Timezone offset from UTC (e.g. 5.5 for IST) */
  tzone: number;
}

/**
 * Two birth data objects for matchmaking / compatibility endpoints.
 */
export interface MatchBirthData {
  male: BirthData;
  female: BirthData;
}

/**
 * Birth data required by Western compatibility endpoints (person 1 & person 2).
 */
export interface CoupleBirthData {
  person1: BirthData;
  person2: BirthData;
}

/**
 * Input for Vedic numerology endpoints.
 */
export interface NumerologyData {
  day: number;
  month: number;
  year: number;
  /** Full name of the person */
  name: string;
}

/**
 * Input for Varshaphal (annual chart) endpoints.
 * `varshaphal_year` is the preferred field.
 * `year_count` is kept for backward compatibility and is converted to `birthYear + year_count`.
 */
export interface VarshaphalData extends BirthData {
  /** Target calendar year for the Varshaphal chart/report (preferred). */
  varshaphal_year?: number;
  /** Legacy year offset from birth year. */
  year_count?: number;
  /** Ayanamsha system. Defaults to LAHIRI when omitted. */
  ayanamsha?: string;
}

/**
 * Input for Papasamyam details.
 * The live API expects a single profile plus `full_name`, `day`/`date`, and `ayanamsha`.
 */
export interface PapasamyamData extends BirthData {
  /** Full name used by the API. If omitted, SDK will reuse `name` when available. */
  full_name?: string;
  /** Compatibility alias retained for callers already using `name`. */
  name?: string;
  /** Some examples include both `day` and `date`; defaults to `day`. */
  date?: number;
  /** Ayanamsha system. Defaults to LAHIRI when omitted. */
  ayanamsha?: string;
}

/**
 * White-label branding options for PDF report endpoints.
 * All fields are optional — only provided values are sent to the API.
 */
export interface PDFBranding {
  /** URL of company logo to embed in the PDF */
  logoUrl?: string;
  /** Company or brand name printed on the report */
  companyName?: string;
  /** Short company description */
  companyInfo?: string;
  /** Company website URL shown in the footer */
  domainUrl?: string;
  /** Contact email shown in the report */
  companyEmail?: string;
  /** Landline number shown in the report */
  companyLandline?: string;
  /** Mobile number shown in the report */
  companyMobile?: string;
  /** Custom footer link */
  footerLink?: string;
  /** Chart rendering style: "NORTH_INDIAN" | "SOUTH_INDIAN" | "EAST_INDIAN" */
  chartStyle?: "NORTH_INDIAN" | "SOUTH_INDIAN" | "EAST_INDIAN";
}

// ─────────────────────────────────────────────────────────────────────────────
// Domain-specific literal types
// ─────────────────────────────────────────────────────────────────────────────

/** Divisional (Varga) chart identifiers. D1 is the Lagna (main) chart. */
export type ChartId =
  | "D1"
  | "D2"
  | "D3"
  | "D4"
  | "D5"
  | "D7"
  | "D9"
  | "D10"
  | "D12"
  | "D16"
  | "D20"
  | "D24"
  | "D27"
  | "D30"
  | "D40"
  | "D45"
  | "D60";

/** Western / tropical zodiac sign names (lowercase). */
export type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

/** Planet names used in parameterised endpoints. */
export type PlanetName =
  | "sun"
  | "moon"
  | "mars"
  | "mercury"
  | "jupiter"
  | "venus"
  | "saturn"
  | "rahu"
  | "ketu"
  | "ascendant";

/** Vimshottari major-dasha planet names (used in sub-dasha endpoints). */
export type MajorDashaPlanet =
  | "sun"
  | "moon"
  | "mars"
  | "rahu"
  | "jupiter"
  | "saturn"
  | "mercury"
  | "ketu"
  | "venus";

/** Backward-compatible alias for Vimshottari dasha path parameters. */
export type DashaPlanet = MajorDashaPlanet;

/** Language codes accepted by the API for localised responses. */
export type Language =
  | "en"
  | "hi"
  | "te"
  | "ta"
  | "ml"
  | "kn"
  | "mr"
  | "bn"
  | "gu"
  | "or"
  | "pa";

// ─────────────────────────────────────────────────────────────────────────────
// SDK configuration
// ─────────────────────────────────────────────────────────────────────────────

export interface AstrologyAPIConfig {
  /**
   * Your AstrologyAPI user ID.
   * Falls back to the ASTROLOGYAPI_USER_ID environment variable.
   */
  userId?: string;
  /**
   * Your AstrologyAPI key.
   * Falls back to the ASTROLOGYAPI_API_KEY environment variable.
   */
  apiKey?: string;
  /**
   * Access token for direct header-based authentication.
   * Falls back to the ASTROLOGYAPI_ACCESS_TOKEN environment variable.
   * When provided, userId is not required and the SDK sends x-astrologyapi-key.
   */
  access_token?: string;
  /**
   * API version string. Defaults to "v1".
   */
  version?: string;
}
