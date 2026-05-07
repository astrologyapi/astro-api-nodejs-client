import {HttpClient} from "../http.js";
import type {BirthData, Language, NumerologyData} from "../types.js";

/**
 * Numerology namespace — Vedic and Western numerological calculations.
 *
 * Combines Vedic (Pythagorean/Indian) numerology endpoints with Western
 * numerological number calculations in one unified namespace.
 */
export class NumerologyNamespace {
  constructor(private readonly http: HttpClient) {}

  private post<T>(
    endpoint: string,
    body: Record<string, unknown>,
    language?: Language,
  ): Promise<T> {
    return this.http.post<T>({endpoint, body, domain: "json", language});
  }

  // ── Vedic Numerology ───────────────────────────────────────────────────────

  /**
   * Vedic numerology table — Psychic, Destiny, Name, and Kua numbers.
   * Requires birth date and full name.
   */
  getTable(data: NumerologyData, language?: Language) {
    const {day, month, year, name} = data;
    return this.post(
      "numero_table",
      {day, month, year, name, full_name: name, date: day},
      language,
    );
  }

  /**
   * Comprehensive Vedic numerology report with personality and life analysis.
   */
  getReport(data: NumerologyData, language?: Language) {
    const {day, month, year, name} = data;
    return this.post(
      "numero_report",
      {day, month, year, name, full_name: name, date: day},
      language,
    );
  }

  /**
   * Favourable time periods based on numerological cycles.
   */
  getFavTime(data: NumerologyData, language?: Language) {
    const {day, month, year, name} = data;
    return this.post(
      "numero_fav_time",
      {day, month, year, name, full_name: name, date: day},
      language,
    );
  }

  /**
   * Vastu and place suitability based on numerology.
   */
  getPlaceVastu(data: NumerologyData, language?: Language) {
    const {day, month, year, name} = data;
    return this.post(
      "numero_place_vastu",
      {day, month, year, name, full_name: name, date: day},
      language,
    );
  }

  /**
   * Recommended fasts (vrats) based on numerological analysis.
   */
  getFastsReport(data: NumerologyData, language?: Language) {
    const {day, month, year, name} = data;
    return this.post(
      "numero_fasts_report",
      {day, month, year, name, full_name: name, date: day},
      language,
    );
  }

  /**
   * Favourable deity / ruling lord based on numerology.
   */
  getFavLord(data: NumerologyData, language?: Language) {
    const {day, month, year, name} = data;
    return this.post(
      "numero_fav_lord",
      {day, month, year, name, full_name: name, date: day},
      language,
    );
  }

  /**
   * Recommended mantras based on numerological profile.
   */
  getFavMantra(data: NumerologyData, language?: Language) {
    const {day, month, year, name} = data;
    return this.post(
      "numero_fav_mantra",
      {day, month, year, name, full_name: name, date: day},
      language,
    );
  }

  /**
   * Daily numerology prediction based on personal number cycles.
   */
  getDailyPrediction(data: NumerologyData, language?: Language) {
    const {day, month, year, name} = data;
    return this.post(
      "numero_prediction/daily",
      {day, month, year, name, full_name: name, date: day},
      language,
    );
  }

  // ── Western Numerology ─────────────────────────────────────────────────────

  /**
   * All core Western numerological numbers in one response:
   * Life Path, Expression, Soul Urge, Personality, and Birth Day numbers.
   */
  getNumerologicalNumbers(data: NumerologyData, language?: Language) {
    const {day, month, year, name} = data;
    return this.post(
      "numerological_numbers",
      {day, month, year, name, full_name: name, date: day},
      language,
    );
  }

  /** Life Path Number — the most significant number in Western numerology. */
  getLifepathNumber(data: NumerologyData, language?: Language) {
    const {day, month, year, name} = data;
    return this.post(
      "lifepath_number",
      {day, month, year, name, full_name: name, date: day},
      language,
    );
  }

  /**
   * Personality Number (derived from consonants in the name).
   * Represents the outward personality as perceived by others.
   */
  getPersonalityNumber(data: NumerologyData, language?: Language) {
    const {day, month, year, name} = data;
    return this.post(
      "personality_number",
      {day, month, year, name, full_name: name, date: day},
      language,
    );
  }

  /**
   * Expression (Destiny) Number — derived from the full name.
   * Represents natural talents and life's purpose.
   */
  getExpressionNumber(data: NumerologyData, language?: Language) {
    const {day, month, year, name} = data;
    return this.post(
      "expression_number",
      {day, month, year, name, full_name: name, date: day},
      language,
    );
  }

  /**
   * Soul Urge (Heart's Desire) Number — derived from vowels in the name.
   * Represents inner motivations and desires.
   */
  getSoulUrgeNumber(data: NumerologyData, language?: Language) {
    const {day, month, year, name} = data;
    return this.post(
      "soul_urge_number",
      {day, month, year, name, full_name: name, date: day},
      language,
    );
  }

  /** Challenge Numbers — obstacles to overcome in each life stage. */
  getChallengeNumbers(data: NumerologyData, language?: Language) {
    const {day, month, year, name} = data;
    return this.post(
      "challenge_numbers",
      {day, month, year, name, full_name: name, date: day},
      language,
    );
  }

  /** Personal Day Number — the numerological energy of a specific day. */
  getPersonalDay(data: NumerologyData, language?: Language) {
    return this.post(
      "personal_day_prediction",
      {...data, full_name: data.name, date: data.day},
      language,
    );
  }

  /** Personal Month Number — the numerological theme for the current month. */
  getPersonalMonth(data: NumerologyData, language?: Language) {
    return this.post(
      "personal_month_prediction",
      {...data, full_name: data.name, date: data.day},
      language,
    );
  }

  /** Personal Year Number — the overarching theme and energy for the current year. */
  getPersonalYear(data: NumerologyData, language?: Language) {
    return this.post(
      "personal_year_prediction",
      {...data, full_name: data.name, date: data.day},
      language,
    );
  }
}
