import { HttpClient } from "../http.js";
import type { BirthData, Language } from "../types.js";

/**
 * KP (Krishnamurti Paddhati) astrology namespace.
 *
 * KP is a precision system of astrology developed by K.S. Krishnamurti,
 * based on the stellar / sub-lord theory using Placidus house cusps.
 */
export class KPNamespace {
  constructor(private readonly http: HttpClient) {}

  private post<T>(endpoint: string, body: Record<string, unknown>, language?: Language): Promise<T> {
    return this.http.post<T>({ endpoint, body, domain: "json", language });
  }

  /** KP planetary positions with sub-lord, star-lord, and sign data. */
  getPlanets(data: BirthData, language?: Language) {
    return this.post("kp_planets", { ...data }, language);
  }

  /** KP house cusps with sub-lord and star-lord for each cusp. */
  getHouseCusps(data: BirthData, language?: Language) {
    return this.post("kp_house_cusps", { ...data }, language);
  }

  /** Full KP birth chart including planets and house cusps. */
  getBirthChart(data: BirthData, language?: Language) {
    return this.post("kp_birth_chart", { ...data }, language);
  }

  /**
   * KP significators for each house (1–12).
   * Shows which planets signify which houses based on KP rules.
   */
  getHouseSignificator(data: BirthData, language?: Language) {
    return this.post("kp_house_significator", { ...data }, language);
  }

  /**
   * KP significators for each planet.
   * Shows which houses each planet signifies.
   */
  getPlanetSignificator(data: BirthData, language?: Language) {
    return this.post("kp_planet_significator", { ...data }, language);
  }

  /** Complete KP horoscope combining all KP chart data. */
  getHoroscope(data: BirthData, language?: Language) {
    return this.post("kp_horoscope", { ...data }, language);
  }
}
