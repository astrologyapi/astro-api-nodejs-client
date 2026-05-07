import { HttpClient } from "../http";
import type { BirthData, Language } from "../types";

/**
 * Western Transit namespace — tropical transit calculations.
 *
 * Transits track how current planetary positions interact with the natal chart.
 * Both current sky (tropical) transits and personalised natal transits are covered.
 */
export class WesternTransitNamespace {
  constructor(private readonly http: HttpClient) {}

  private post<T>(endpoint: string, body: Record<string, unknown>, language?: Language): Promise<T> {
    return this.http.post<T>({ endpoint, body, domain: "json", language });
  }

  // ── Current-Sky Transits ───────────────────────────────────────────────────

  /** Daily tropical transit positions — where the planets are today. */
  getDaily(data: BirthData, language?: Language) {
    return this.post("tropical_transits/daily", { ...data }, language);
  }

  /** Weekly tropical transit overview. */
  getWeekly(data: BirthData, language?: Language) {
    return this.post("tropical_transits/weekly", { ...data }, language);
  }

  /** Monthly tropical transit positions and highlights. */
  getMonthly(data: BirthData, language?: Language) {
    return this.post("tropical_transits/monthly", { ...data }, language);
  }

  // ── Natal Transits ─────────────────────────────────────────────────────────

  /**
   * Daily natal transits — aspects current planets make to the natal chart.
   * Personalised based on birth data.
   */
  getNatalDaily(data: BirthData, language?: Language) {
    return this.post("natal_transits/daily", { ...data }, language);
  }

  /**
   * Weekly natal transits — personalised weekly transit aspects.
   */
  getNatalWeekly(data: BirthData, language?: Language) {
    return this.post("natal_transits/weekly", { ...data }, language);
  }
}
