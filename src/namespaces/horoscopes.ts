import { HttpClient } from "../http.js";
import type { BirthData, Language, ZodiacSign } from "../types.js";

/**
 * Horoscopes namespace — daily, weekly, and monthly sun-sign predictions.
 *
 * All sun-sign endpoints accept a zodiac sign name. The nakshatra prediction
 * additionally requires birth data for personalisation.
 */
export class HoroscopesNamespace {
  constructor(private readonly http: HttpClient) {}

  private post<T>(endpoint: string, body: Record<string, unknown>, language?: Language): Promise<T> {
    return this.http.post<T>({ endpoint, body, domain: "json", language });
  }

  // ── Sun-Sign Predictions ───────────────────────────────────────────────────

  /**
   * Today's sun-sign horoscope prediction.
   * @param zodiac - The zodiac sign (e.g. "aries", "scorpio")
   */
  getDaily(zodiac: ZodiacSign, language?: Language) {
    return this.post(`sun_sign_prediction/daily/${zodiac}`, {}, language);
  }

  /**
   * Tomorrow's sun-sign horoscope prediction.
   * @param zodiac - The zodiac sign
   */
  getNext(zodiac: ZodiacSign, timezone?: number | Language, language?: Language) {
    const resolved = resolveSunSignRequest(timezone, language);
    return this.post(`sun_sign_prediction/daily/next/${zodiac}`, resolved.body, resolved.language);
  }

  /**
   * Yesterday's sun-sign horoscope prediction.
   * @param zodiac - The zodiac sign
   */
  getPrevious(zodiac: ZodiacSign, timezone?: number | Language, language?: Language) {
    const resolved = resolveSunSignRequest(timezone, language);
    return this.post(`sun_sign_prediction/daily/previous/${zodiac}`, resolved.body, resolved.language);
  }

  /**
   * Consolidated daily horoscope covering all life areas (love, career, health, etc.).
   * @param zodiac - The zodiac sign
   */
  getDailyConsolidated(zodiac: ZodiacSign, timezone?: number | Language, language?: Language) {
    const resolved = resolveSunSignRequest(timezone, language);
    return this.post(`sun_sign_consolidated/daily/${zodiac}`, resolved.body, resolved.language);
  }

  /**
   * Monthly sun-sign horoscope prediction.
   * @param zodiac - The zodiac sign
   */
  getMonthly(zodiac: ZodiacSign, timezone?: number | Language, language?: Language) {
    const resolved = resolveSunSignRequest(timezone, language);
    return this.post(`horoscope_prediction/monthly/${zodiac}`, resolved.body, resolved.language);
  }

  // ── Nakshatra Prediction ───────────────────────────────────────────────────

  /**
   * Daily prediction based on the birth Nakshatra (lunar mansion).
   * Requires full birth data for personalised results.
   */
  getDailyNakshatra(data: BirthData, language?: Language) {
    return this.post("daily_nakshatra_prediction", { ...data }, language);
  }
}

function resolveSunSignRequest(
  timezone?: number | Language,
  language?: Language,
): {body: Record<string, unknown>; language?: Language} {
  if (typeof timezone === "number") {
    return {
      body: {timezone},
      language,
    };
  }

  return {
    body: {},
    language: timezone,
  };
}
