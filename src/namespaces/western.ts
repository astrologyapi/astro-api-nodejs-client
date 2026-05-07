import { HttpClient } from "../http.js";
import type { BirthData, CoupleBirthData, Language, PlanetName, ZodiacSign } from "../types.js";

/**
 * Western (Tropical) astrology namespace.
 *
 * Covers birth charts, house systems, solar return, synastry,
 * personality reports, moon phases, and compatibility — all using
 * the tropical zodiac.
 *
 * Note: Western transit endpoints are in the `westernTransit` namespace.
 * Tarot, Chinese, and Numerology each have their own namespaces.
 */
export class WesternNamespace {
  constructor(private readonly http: HttpClient) {}

  private post<T>(endpoint: string, body: Record<string, unknown>, language?: Language): Promise<T> {
    return this.http.post<T>({ endpoint, body, domain: "json", language });
  }

  // ── Core Birth Chart ───────────────────────────────────────────────────────

  /** Tropical (Western) planetary positions with sign, house, and degree. */
  getPlanets(data: BirthData, language?: Language) {
    return this.post("planets/tropical", { ...data }, language);
  }

  /** Tropical house cusps using the default (Placidus) house system. */
  getHouseCusps(data: BirthData, language?: Language) {
    return this.post("house_cusps/tropical", { ...data }, language);
  }

  /** Complete Western horoscope — planets, houses, aspects, and highlights. */
  getHoroscope(data: BirthData, language?: Language) {
    return this.post("western_horoscope", { ...data }, language);
  }

  /** SVG natal wheel chart for embedding or display. */
  getNatalWheelChart(data: BirthData, language?: Language) {
    return this.post("natal_wheel_chart", { ...data }, language);
  }

  /** Narrative interpretation of the natal chart. */
  getNatalInterpretation(data: BirthData, language?: Language) {
    return this.post("natal_chart_interpretation", { ...data }, language);
  }

  // ── House Reports ──────────────────────────────────────────────────────────

  /** Interpretive descriptions for all house cusps. */
  getHouseCuspsReport(data: BirthData, language?: Language) {
    return this.post("house_cusps_report/tropical", { ...data }, language);
  }

  /** Natal house cusp report with planetary influence. */
  getNatalHouseCuspReport(data: BirthData, language?: Language) {
    return this.post("natal_house_cusp_report", { ...data }, language);
  }

  /** Interpretive report for the Western ascendant sign. */
  getAscendantReport(data: BirthData, language?: Language) {
    return this.post("general_ascendant_report/tropical", { ...data }, language);
  }

  /**
   * Report for a planet's sign placement in the tropical zodiac.
   * @param planet - Planet name (e.g. "sun", "venus")
   */
  getSignReport(planet: PlanetName, data: BirthData, language?: Language) {
    return this.post(`general_sign_report/tropical/${planet}`, { ...data }, language);
  }

  /**
   * Report for a planet's house placement in the tropical chart.
   * @param planet - Planet name (e.g. "mars", "saturn")
   */
  getHouseReport(planet: PlanetName, data: BirthData, language?: Language) {
    return this.post(`general_house_report/tropical/${planet}`, { ...data }, language);
  }

  // ── Moon ───────────────────────────────────────────────────────────────────

  /** Current moon phase and its astrological significance. */
  getMoonPhase(data: BirthData, language?: Language) {
    return this.post("moon_phase_report", { ...data }, language);
  }

  /** Lunar metrics — moon sign, nakshatra, tithi, and more. */
  getLunarMetrics(data: BirthData, language?: Language) {
    return this.post("lunar_metrics", { ...data }, language);
  }

  // ── Solar Return ───────────────────────────────────────────────────────────

  /** Solar Return chart details — the chart for the moment the Sun returns to its natal position. */
  getSolarReturnDetails(data: BirthData & { year?: number }, language?: Language) {
    return this.post("solar_return_details", { ...data }, language);
  }

  /** Planetary positions in the Solar Return chart. */
  getSolarReturnPlanets(data: BirthData & { year?: number }, language?: Language) {
    return this.post("solar_return_planets", { ...data }, language);
  }

  /** House cusps in the Solar Return chart. */
  getSolarReturnHouseCusps(data: BirthData & { year?: number }, language?: Language) {
    return this.post("solar_return_house_cusps", { ...data }, language);
  }

  /** Interpretive report for each planet in the Solar Return chart. */
  getSolarReturnPlanetReport(data: BirthData & { year?: number }, language?: Language) {
    return this.post("solar_return_planet_report", { ...data }, language);
  }

  /** Aspects formed between Solar Return planets and natal planets. */
  getSolarReturnPlanetAspects(data: BirthData & { year?: number }, language?: Language) {
    return this.post("solar_return_planet_aspects", { ...data }, language);
  }

  /** Comprehensive aspects report for the Solar Return chart. */
  getSolarReturnAspectsReport(data: BirthData & { year?: number }, language?: Language) {
    return this.post("solar_return_aspects_report", { ...data }, language);
  }

  // ── Personality & Life Reports ─────────────────────────────────────────────

  /** Personality analysis based on the tropical natal chart. */
  getPersonality(data: BirthData, language?: Language) {
    return this.post("personality_report/tropical", { ...data }, language);
  }

  /** Romantic personality — how the person behaves in love and relationships. */
  getRomanticPersonality(data: BirthData, language?: Language) {
    return this.post("romantic_personality_report/tropical", { ...data }, language);
  }

  /** Friendship profile — social style and compatible friend types. */
  getFriendship(data: CoupleBirthData, language?: Language) {
    return this.post("friendship_report/tropical", flattenCoupleData(data), language);
  }

  /** Romantic forecast for the current period. */
  getRomanticForecast(data: BirthData, language?: Language) {
    return this.post("romantic_forecast_report/tropical", { ...data }, language);
  }

  /** Karma and destiny report — life lessons and past-life influences. */
  getKarmaDestiny(data: CoupleBirthData, language?: Language) {
    return this.post("karma_destiny_report/tropical", flattenCoupleData(data), language);
  }

  // ── Compatibility ──────────────────────────────────────────────────────────

  /**
   * Sun-sign compatibility score and analysis between two zodiac signs.
   * @param zodiac - First person's zodiac sign
   * @param partnerZodiac - Second person's zodiac sign
   */
  getZodiacCompatibility(zodiac: ZodiacSign, partnerZodiac: ZodiacSign, language?: Language) {
    return this.post(`zodiac_compatibility/${zodiac}/${partnerZodiac}`, {}, language);
  }

  /** Synastry horoscope — aspect analysis between two natal charts. */
  getSynastry(data: CoupleBirthData, language?: Language) {
    return this.post("synastry_horoscope", flattenCoupleData(data), language);
  }

  /** Composite chart — the midpoint chart representing the relationship itself. */
  getComposite(data: CoupleBirthData, language?: Language) {
    return this.post("composite_horoscope", flattenCoupleData(data), language);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function flattenCoupleData(data: CoupleBirthData): Record<string, unknown> {
  const { person1: p, person2: s } = data;
  return {
    p_day: p.day, p_month: p.month, p_year: p.year,
    p_hour: p.hour, p_min: p.min,
    p_lat: p.lat, p_lon: p.lon, p_tzone: p.tzone,
    s_day: s.day, s_month: s.month, s_year: s.year,
    s_hour: s.hour, s_min: s.min,
    s_lat: s.lat, s_lon: s.lon, s_tzone: s.tzone,
  };
}
