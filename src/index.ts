import { HttpClient } from "./http.js";
import { ChineseNamespace } from "./namespaces/chinese.js";
import { HoroscopesNamespace } from "./namespaces/horoscopes.js";
import { KPNamespace } from "./namespaces/kp.js";
import { LalKitabNamespace } from "./namespaces/lal-kitab.js";
import { LocationNamespace } from "./namespaces/location.js";
import { NumerologyNamespace } from "./namespaces/numerology.js";
import { PDFNamespace } from "./namespaces/pdf.js";
import { TarotNamespace } from "./namespaces/tarot.js";
import { VedicNamespace } from "./namespaces/vedic.js";
import { WesternNamespace } from "./namespaces/western.js";
import { WesternTransitNamespace } from "./namespaces/western-transit.js";
import type { AstrologyAPIConfig, Language } from "./types.js";

export { AstrologyAPIError, AuthenticationError, NetworkError, PlanRestrictedError, QuotaExceededError, RateLimitError, ServerError, ValidationError } from "./errors.js";
export type { AstrologyAPIConfig, BirthData, ChartId, CoupleBirthData, DashaPlanet, Language, MatchBirthData, MajorDashaPlanet, NumerologyData, PapasamyamData, PDFBranding, PlanetName, VarshaphalData, ZodiacSign } from "./types.js";

/**
 * Official AstrologyAPI.com Node.js / TypeScript SDK.
 *
 * Provides access to 140+ Vedic and Western astrology endpoints,
 * organised into 11 intuitive namespaces.
 *
 * @example
 * ```ts
 * import { AstrologyAPI } from 'astrologyapi';
 *
 * const client = new AstrologyAPI({
 *   userId: 'YOUR_USER_ID',
 *   apiKey: 'YOUR_API_KEY',
 * });
 *
 * const tokenClient = new AstrologyAPI({
 *   access_token: 'YOUR_ACCESS_TOKEN',
 * });
 *
 * const birthData = {
 *   day: 10, month: 5, year: 1990,
 *   hour: 19, min: 55,
 *   lat: 19.20, lon: 72.83, tzone: 5.5,
 * };
 *
 * const chart = await client.vedic.getChart('D1', birthData);
 * const daily = await client.horoscopes.getDaily('aries');
 * const planets = await client.western.getPlanets(birthData);
 * ```
 *
 * @see https://astrologyapi.com/docs
 */
export class AstrologyAPI {
  private readonly http: HttpClient;

  /** Vedic (Parashari & Jaimini) astrology — birth charts, dashas, doshas, panchang, matchmaking, varshaphal */
  readonly vedic: VedicNamespace;

  /** Krishnamurti Paddhati (KP) system — sub-lord theory, cusps, significators */
  readonly kp: KPNamespace;

  /** Lal Kitab system — horoscope, debts, remedies */
  readonly lalKitab: LalKitabNamespace;

  /** Daily, weekly, and monthly sun-sign & nakshatra predictions */
  readonly horoscopes: HoroscopesNamespace;

  /** Vedic and Western numerology — life path, expression, soul urge, and more */
  readonly numerology: NumerologyNamespace;

  /** Western (tropical) astrology — birth charts, solar return, synastry, personality, moon */
  readonly western: WesternNamespace;

  /** Western transit calculations — tropical and natal transits (daily, weekly, monthly) */
  readonly westernTransit: WesternTransitNamespace;

  /** Tarot card readings — general predictions and yes/no */
  readonly tarot: TarotNamespace;

  /** Chinese zodiac and annual forecast */
  readonly chinese: ChineseNamespace;

  /** PDF report generation — Vedic and Western branded reports */
  readonly pdf: PDFNamespace;

  /** Geographic lookup and timezone resolution */
  readonly location: LocationNamespace;

  constructor(config: AstrologyAPIConfig = {}) {
    const accessToken = config.access_token ?? process.env["ASTROLOGYAPI_ACCESS_TOKEN"];
    const userId = config.userId ?? process.env["ASTROLOGYAPI_USER_ID"];
    const apiKey = config.apiKey ?? process.env["ASTROLOGYAPI_API_KEY"];
    const version = config.version ?? "v1";

    if (accessToken) {
      const http = new HttpClient({
        apiKey: accessToken,
        version,
        forceHeaderAuth: true,
      });
      this.http = http;

      this.vedic = new VedicNamespace(http);
      this.kp = new KPNamespace(http);
      this.lalKitab = new LalKitabNamespace(http);
      this.horoscopes = new HoroscopesNamespace(http);
      this.numerology = new NumerologyNamespace(http);
      this.western = new WesternNamespace(http);
      this.westernTransit = new WesternTransitNamespace(http);
      this.tarot = new TarotNamespace(http);
      this.chinese = new ChineseNamespace(http);
      this.pdf = new PDFNamespace(http);
      this.location = new LocationNamespace(http);
      return;
    }

    if (!userId) {
      throw new Error(
        "AstrologyAPI: userId is required unless access_token is provided. Pass it as config.userId or set ASTROLOGYAPI_USER_ID.",
      );
    }
    if (!apiKey) {
      throw new Error(
        "AstrologyAPI: apiKey is required unless access_token is provided. Pass it as config.apiKey or set ASTROLOGYAPI_API_KEY.",
      );
    }

    const http = new HttpClient({
      userId,
      apiKey,
      version,
    });
    this.http = http;

    this.vedic = new VedicNamespace(http);
    this.kp = new KPNamespace(http);
    this.lalKitab = new LalKitabNamespace(http);
    this.horoscopes = new HoroscopesNamespace(http);
    this.numerology = new NumerologyNamespace(http);
    this.western = new WesternNamespace(http);
    this.westernTransit = new WesternTransitNamespace(http);
    this.tarot = new TarotNamespace(http);
    this.chinese = new ChineseNamespace(http);
    this.pdf = new PDFNamespace(http);
    this.location = new LocationNamespace(http);
  }

  /**
   * Make a custom request to any AstrologyAPI endpoint not yet covered
   * by the SDK. Useful for accessing new endpoints before the SDK is updated.
   *
   * @example
   * ```ts
   * const result = await client.customRequest({
   *   endpoint: 'some_new_endpoint',
   *   body: { day: 10, month: 5, year: 1990, ... },
   * });
   * ```
   */
  customRequest<T = unknown>(options: {
    endpoint: string;
    body?: Record<string, unknown>;
    domain?: "json" | "pdf";
    language?: Language;
  }): Promise<T> {
    return this.http.post<T>({
      endpoint: options.endpoint,
      body: options.body ?? {},
      domain: options.domain ?? "json",
      language: options.language,
    });
  }
}

export default AstrologyAPI;
