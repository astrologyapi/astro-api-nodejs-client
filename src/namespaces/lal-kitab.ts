import { HttpClient } from "../http";
import type { BirthData, Language, PlanetName } from "../types";

/**
 * Lal Kitab astrology namespace.
 *
 * Lal Kitab is an unconventional system of Vedic astrology and palmistry
 * originating in Punjab. It uses a unique house system and remedies.
 */
export class LalKitabNamespace {
  constructor(private readonly http: HttpClient) {}

  private post<T>(endpoint: string, body: Record<string, unknown>, language?: Language): Promise<T> {
    return this.http.post<T>({ endpoint, body, domain: "json", language });
  }

  /** Full Lal Kitab horoscope — planetary positions in the Lal Kitab house system. */
  getHoroscope(data: BirthData, language?: Language) {
    return this.post("lalkitab_horoscope", { ...data }, language);
  }

  /**
   * Lal Kitab debts (Rin) analysis.
   * Identifies karmic debts and their planetary indicators.
   */
  getDebts(data: BirthData, language?: Language) {
    return this.post("lalkitab_debts", { ...data }, language);
  }

  /**
   * Lal Kitab remedies for a specific planet.
   * @param planet - The planet to get remedies for (e.g. "saturn", "rahu")
   */
  getRemedies(planet: PlanetName, data: BirthData, language?: Language) {
    return this.post(`lalkitab_remedies/${planet}`, { ...data }, language);
  }

  /** Lal Kitab house analysis — significance and effects of each house. */
  getHouses(data: BirthData, language?: Language) {
    return this.post("lalkitab_houses", { ...data }, language);
  }

  /** Lal Kitab planetary positions with house-based interpretations. */
  getPlanets(data: BirthData, language?: Language) {
    return this.post("lalkitab_planets", { ...data }, language);
  }
}
