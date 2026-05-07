import { HttpClient } from "../http";
import type {
  BirthData,
  ChartId,
  DashaPlanet,
  Language,
  MatchBirthData,
  PapasamyamData,
  PlanetName,
  VarshaphalData,
} from "../types";

/**
 * Vedic astrology namespace — Parashari & Jaimini systems.
 *
 * Covers birth charts, divisional charts (D1–D60), all Dasha systems
 * (Vimshottari, Char, Yogini), Panchang, Muhurta, Matchmaking,
 * Varshaphal, Doshas, Remedies, and interpretive reports.
 */
export class VedicNamespace {
  constructor(private readonly http: HttpClient) {}

  private post<T>(endpoint: string, body: Record<string, unknown>, language?: Language): Promise<T> {
    return this.http.post<T>({ endpoint, body, domain: "json", language });
  }

  // ── Birth Data ─────────────────────────────────────────────────────────────

  /** Core birth chart summary: ascendant, sun sign, moon sign, nakshatra. */
  getBirthDetails(data: BirthData, language?: Language) {
    return this.post("birth_details", { ...data }, language);
  }

  /** Extended astrological details including yoga, karana, and tithi. */
  getAstroDetails(data: BirthData, language?: Language) {
    return this.post("astro_details", { ...data }, language);
  }

  /** Ayanamsha value for the given birth date and time. */
  getAyanamsha(data: BirthData, language?: Language) {
    return this.post("ayanamsha", { ...data }, language);
  }

  // ── Planets ────────────────────────────────────────────────────────────────

  /** Planetary positions with sign, nakshatra, house, and degree. */
  getPlanets(data: BirthData, language?: Language) {
    return this.post("planets", { ...data }, language);
  }

  /** Extended planetary data including retrograde status, speed, and dignity. */
  getExtendedPlanets(data: BirthData, language?: Language) {
    return this.post("planets/extended", { ...data }, language);
  }

  /** Ashtak Varga table for a specific planet. */
  getPlanetAshtak(planet: PlanetName, data: BirthData, language?: Language) {
    return this.post(`planet_ashtak/${planet}`, { ...data }, language);
  }

  /** Sarvashtakavarga (combined Ashtak Varga) table. */
  getSarvashtak(data: BirthData, language?: Language) {
    return this.post("sarvashtak", { ...data }, language);
  }

  /** Ghat Chakra calculation. */
  getGhatChakra(data: BirthData, language?: Language) {
    return this.post("ghat_chakra", { ...data }, language);
  }

  // ── Horoscope Charts ───────────────────────────────────────────────────────

  /**
   * Divisional chart data (D1 = Lagna, D9 = Navamsa, D10 = Dashamsa, etc.).
   * @param chartId - One of D1, D2, D3, D4, D5, D7, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45, D60
   */
  getChart(chartId: ChartId, data: BirthData, language?: Language) {
    return this.post(`horo_chart/${chartId}`, { ...data }, language);
  }

  /**
   * SVG/image representation of a divisional chart.
   * @param chartId - The chart to render (e.g. "D1", "D9")
   */
  getChartImage(chartId: ChartId, data: BirthData, language?: Language) {
    return this.post(`horo_chart_image/${chartId}`, { ...data }, language);
  }

  /** Extended Lagna chart with additional dignity and aspect data. */
  getExtendedChart(chartId: ChartId, data: BirthData, language?: Language): Promise<unknown>;
  getExtendedChart(data: BirthData, language?: Language): Promise<unknown>;
  getExtendedChart(
    chartId: ChartId | BirthData,
    data?: BirthData | Language,
    language?: Language,
  ) {
    const { chartId: resolvedChartId, data: resolvedData, resolvedLanguage } = resolveExtendedChartArgs(
      chartId,
      data,
      language,
    );
    return this.post(`horo_chart_extended/${resolvedChartId}`, {...resolvedData, ayanamsha: "LAHIRI"}, resolvedLanguage);
  }

  // ── Vimshottari Dasha ──────────────────────────────────────────────────────

  /** Current running Vimshottari Maha Dasha, Antardasha, and Pratyantardasha. */
  getCurrentDasha(data: BirthData, language?: Language) {
    return this.post("current_vdasha", { ...data }, language);
  }

  /** Full Vimshottari Maha Dasha sequence (all 120-year cycle). */
  getMajorDasha(data: BirthData, language?: Language) {
    return this.post("major_vdasha", { ...data }, language);
  }

  /** Sub-dashas (Antardasha) within a given Maha Dasha. */
  getSubDasha(mahaDasha: DashaPlanet, data: BirthData, language?: Language) {
    return this.post(`sub_vdasha/${mahaDasha}`, { ...data, ayanamsha: "LAHIRI" }, language);
  }

  /** Sub-sub-dashas (Pratyantardasha) for the current period. */
  getSubSubDasha(mahaDasha: DashaPlanet, antarDasha: DashaPlanet, data: BirthData, language?: Language) {
    return this.post(`sub_sub_vdasha/${mahaDasha}/${antarDasha}`, { ...data, ayanamsha: "LAHIRI" }, language);
  }

  /** Sub-sub-sub-dashas (Sookshma) for the current period. */
  getSubSubSubDasha(
    mahaDasha: DashaPlanet,
    antarDasha: DashaPlanet,
    pratyantarDasha: DashaPlanet,
    data: BirthData,
    language?: Language,
  ) {
    return this.post(
      `sub_sub_sub_vdasha/${mahaDasha}/${antarDasha}/${pratyantarDasha}`,
      { ...data, ayanamsha: "LAHIRI" },
      language,
    );
  }

  /** Sub-sub-sub-sub-dashas (Prana) for the current period. */
  getSubSubSubSubDasha(
    mahaDasha: DashaPlanet,
    antarDasha: DashaPlanet,
    pratyantarDasha: DashaPlanet,
    sookshmaDasha: DashaPlanet,
    data: BirthData,
    language?: Language,
  ) {
    return this.post(
      `sub_sub_sub_sub_vdasha/${mahaDasha}/${antarDasha}/${pratyantarDasha}/${sookshmaDasha}`,
      { ...data, ayanamsha: "LAHIRI" },
      language,
    );
  }

  // ── Char Dasha (Jaimini) ───────────────────────────────────────────────────

  /** Current running Char Dasha and Antardasha. */
  getCurrentCharDasha(data: BirthData, language?: Language) {
    return this.post("current_chardasha", { ...data }, language);
  }

  /** All Char Maha Dashas in sequence. */
  getMajorCharDasha(data: BirthData, language?: Language) {
    return this.post("major_chardasha", { ...data }, language);
  }

  /**
   * Sub-dashas within a specific Char Maha Dasha.
   * @param mahaDasha - The Maha Dasha sign to query (e.g. "aries")
   */
  getSubCharDasha(mahaDasha: string, data: BirthData, language?: Language) {
    return this.post(`sub_chardasha/${mahaDasha}`, { ...data }, language);
  }

  // ── Yogini Dasha ───────────────────────────────────────────────────────────

  /** Current running Yogini Dasha and sub-period. */
  getCurrentYoginiDasha(data: BirthData, language?: Language) {
    return this.post("current_yogini_dasha", { ...data }, language);
  }

  // ── Doshas ─────────────────────────────────────────────────────────────────

  /** Kalsarpa Dosha analysis — type, strength, and remedies. */
  getKalsarpaDosha(data: BirthData, language?: Language) {
    return this.post("kalsarpa_details", { ...data }, language);
  }

  /** Whether Mangal (Mars) Dosha is present and its effects. */
  getManglik(data: BirthData, language?: Language) {
    return this.post("manglik", { ...data }, language);
  }

  /** Current Sade Sati phase status (rising, peak, or setting). */
  getSadhesatiStatus(data: BirthData, language?: Language) {
    return this.post("sadhesati_current_status", { ...data }, language);
  }

  /** Full Sade Sati life timeline — all past and future occurrences. */
  getSadhesatiLifeDetails(data: BirthData, language?: Language) {
    return this.post("sadhesati_life_details", { ...data }, language);
  }

  /** Pitra Dosha analysis and significance. */
  getPitraDosha(data: BirthData, language?: Language) {
    return this.post("pitra_dosha_report", { ...data }, language);
  }

  // ── Remedies ───────────────────────────────────────────────────────────────

  /** Recommended gemstones based on the birth chart. */
  getGemSuggestion(data: BirthData, language?: Language) {
    return this.post("basic_gem_suggestion", { ...data }, language);
  }

  /** Suggested pujas and rituals for planetary improvement. */
  getPujaSuggestion(data: BirthData, language?: Language) {
    return this.post("puja_suggestion", { ...data }, language);
  }

  /** Rudraksha bead recommendations based on the birth chart. */
  getRudrakshaSuggestion(data: BirthData, language?: Language) {
    return this.post("rudraksha_suggestion", { ...data }, language);
  }

  /** Remedies to mitigate the effects of Sade Sati. */
  getSadhesatiRemedies(data: BirthData, language?: Language) {
    return this.post("sadhesati_remedies", { ...data }, language);
  }

  // ── Panchang ───────────────────────────────────────────────────────────────

  /** Basic Panchang: tithi, nakshatra, yoga, karana, vara. */
  getBasicPanchang(data: BirthData, language?: Language) {
    return this.post("basic_panchang", { ...data }, language);
  }

  /** Advanced Panchang including additional timings and planetary positions. */
  getAdvancedPanchang(data: BirthData, language?: Language) {
    return this.post("advanced_panchang", { ...data }, language);
  }

  /** Planetary positions at the time of Panchang calculation. */
  getPlanetPanchang(data: BirthData, language?: Language) {
    return this.post("planet_panchang", { ...data }, language);
  }

  /** Tamil Panchang for South Indian traditions. */
  getTamilPanchang(data: BirthData, language?: Language) {
    return this.post("tamil_panchang", { ...data }, language);
  }

  /** Hindu festivals and auspicious days for the given year/location. */
  getFestival(data: BirthData, language?: Language) {
    return this.post("panchang_festival", { ...data }, language);
  }

  // ── Muhurta ────────────────────────────────────────────────────────────────

  /** Hora Muhurta — planetary hour timings for the day. */
  getHoraMuhurta(data: BirthData, language?: Language) {
    return this.post("hora_muhurta", { ...data }, language);
  }

  /** Chaughadiya Muhurta — auspicious and inauspicious time blocks. */
  getChaughadiyaMuhurta(data: BirthData, language?: Language) {
    return this.post("chaughadiya_muhurta", { ...data }, language);
  }

  // ── Matchmaking ────────────────────────────────────────────────────────────

  /** Basic birth details comparison for two individuals. */
  getMatchBirthDetails(data: MatchBirthData, language?: Language) {
    return this.post("match_birth_details", flattenMatchData(data), language);
  }

  /** Compatibility obstructions (Dosha analysis for marriage matching). */
  getMatchObstructions(data: MatchBirthData, language?: Language) {
    return this.post("match_obstructions", flattenMatchData(data), language);
  }

  /** Astrological details for both individuals side by side. */
  getMatchAstroDetails(data: MatchBirthData, language?: Language) {
    return this.post("match_astro_details", flattenMatchData(data), language);
  }

  /** Planetary positions for both individuals. */
  getMatchPlanetDetails(data: MatchBirthData, language?: Language) {
    return this.post("match_planet_details", flattenMatchData(data), language);
  }

  /** Manglik Dosha compatibility report for both individuals. */
  getMatchManglikReport(data: MatchBirthData, language?: Language) {
    return this.post("match_manglik_report", flattenMatchData(data), language);
  }

  /** Ashtakoot Guna Milan points (maximum 36). */
  getAshtakootPoints(data: MatchBirthData, language?: Language) {
    return this.post("match_ashtakoot_points", flattenMatchData(data), language);
  }

  /** Dashakoot compatibility points. */
  getDashakootPoints(data: MatchBirthData, language?: Language) {
    return this.post("match_dashakoot_points", flattenMatchData(data), language);
  }

  /** Overall compatibility percentage. */
  getMatchPercentage(data: MatchBirthData, language?: Language) {
    return this.post("match_percentage", flattenMatchData(data), language);
  }

  /** Consolidated matchmaking summary report. */
  getMatchReport(data: MatchBirthData, language?: Language) {
    return this.post("match_making_report", flattenMatchData(data), language);
  }

  /** Comprehensive matchmaking report with detailed analysis. */
  getDetailedMatchReport(data: MatchBirthData, language?: Language) {
    return this.post("match_making_detailed_report", flattenMatchData(data), language);
  }

  /** Simplified matchmaking report for quick compatibility overview. */
  getSimpleMatchReport(data: MatchBirthData, language?: Language) {
    return this.post("match_simple_report", flattenMatchData(data), language);
  }

  /** Papasamyam (malefic equivalence) analysis for marriage compatibility. */
  getPapasamyam(data: PapasamyamData, language?: Language) {
    return this.post("papasamyam_details", normalizePapasamyamData(data), language);
  }

  // ── Varshaphal (Solar Return) ──────────────────────────────────────────────

  /** Varshaphal (annual) chart overview for a given year. */
  getVarshaphalDetails(data: VarshaphalData, language?: Language) {
    return this.post("varshaphal_details", normalizeVarshaphalData(data), language);
  }

  /** Annual (Varshapal) chart — whole-year divisional chart. */
  getVarshaphalYearChart(data: VarshaphalData, language?: Language) {
    return this.post("varshaphal_year_chart", normalizeVarshaphalData(data), language);
  }

  /** Monthly (Maasa) chart within the Varshaphal year. */
  getVarshaphalMonthChart(data: VarshaphalData, language?: Language) {
    return this.post("varshaphal_month_chart", normalizeVarshaphalData(data), language);
  }

  /** Planetary positions in the Varshaphal chart. */
  getVarshaphalPlanets(data: VarshaphalData, language?: Language) {
    return this.post("varshaphal_planets", normalizeVarshaphalData(data), language);
  }

  /** Muntha (annual ascendant) position and significance. */
  getVarshaphalMuntha(data: VarshaphalData, language?: Language) {
    return this.post("varshaphal_muntha", normalizeVarshaphalData(data), language);
  }

  /** Mudda Dasha (annual dasha) running during the Varshaphal year. */
  getVarshaphalMuddaDasha(data: VarshaphalData, language?: Language) {
    return this.post("varshaphal_mudda_dasha", normalizeVarshaphalData(data), language);
  }

  /** Panchavargeeya Bala (five-fold strength) in the Varshaphal. */
  getVarshaphalPanchavargeeya(data: VarshaphalData, language?: Language) {
    return this.post("varshaphal_panchavargeeya_bala", normalizeVarshaphalData(data), language);
  }

  /** Harsha Bala (strength indicator) in the Varshaphal. */
  getVarshaphalHarshaBala(data: VarshaphalData, language?: Language) {
    return this.post("varshaphal_harsha_bala", normalizeVarshaphalData(data), language);
  }

  /** Yoga formations present in the Varshaphal chart. */
  getVarshaphalYoga(data: VarshaphalData, language?: Language) {
    return this.post("varshaphal_yoga", normalizeVarshaphalData(data), language);
  }

  /** Saham (Arabic Parts equivalent) positions in the Varshaphal. */
  getVarshaphalSahamPoints(data: VarshaphalData, language?: Language) {
    return this.post("varshaphal_saham_points", normalizeVarshaphalData(data), language);
  }

  // ── Reports ────────────────────────────────────────────────────────────────

  /** Interpretive report for the birth ascendant (Lagna). */
  getAscendantReport(data: BirthData, language?: Language) {
    return this.post("general_ascendant_report", { ...data }, language);
  }

  /** Nakshatra (lunar mansion) analysis and characteristics. */
  getNakshatraReport(data: BirthData, language?: Language) {
    return this.post("general_nakshatra_report", { ...data }, language);
  }

  /**
   * Interpretive report for a planet's house placement.
   * @param planet - The planet to report on (e.g. "sun", "mars")
   */
  getHouseReport(planet: PlanetName, data: BirthData, language?: Language) {
    return this.post(`general_house_report/${planet}`, { ...data }, language);
  }

  /**
   * Interpretive report for a planet's sign placement.
   * @param planet - The planet to report on (e.g. "moon", "jupiter")
   */
  getRashiReport(planet: PlanetName, data: BirthData, language?: Language) {
    return this.post(`general_rashi_report/${planet}`, { ...data }, language);
  }

  // ── Biorhythm ──────────────────────────────────────────────────────────────

  /** Physical, emotional, and intellectual biorhythm cycles. */
  getBiorhythm(data: BirthData, language?: Language) {
    return this.post("biorhythm", { ...data }, language);
  }

  /** Lunar biorhythm cycle based on moon phase at birth. */
  getMoonBiorhythm(data: BirthData, language?: Language) {
    return this.post("moon_biorhythm", { ...data }, language);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Flatten MatchBirthData into the flat key structure the API expects. */
function flattenMatchData(data: MatchBirthData): Record<string, unknown> {
  const { male: m, female: f } = data;
  return {
    m_day: m.day, m_month: m.month, m_year: m.year,
    m_hour: m.hour, m_min: m.min,
    m_lat: m.lat, m_lon: m.lon, m_tzone: m.tzone,
    f_day: f.day, f_month: f.month, f_year: f.year,
    f_hour: f.hour, f_min: f.min,
    f_lat: f.lat, f_lon: f.lon, f_tzone: f.tzone,
  };
}

function normalizeVarshaphalData(data: VarshaphalData): Record<string, unknown> {
  return {
    day: data.day,
    month: data.month,
    year: data.year,
    hour: data.hour,
    min: data.min,
    lat: data.lat,
    lon: data.lon,
    tzone: data.tzone,
    varshaphal_year: resolveVarshaphalYear(data),
    ayanamsha: data.ayanamsha ?? "LAHIRI",
  };
}

function resolveExtendedChartArgs(
  chartIdOrData: ChartId | BirthData,
  dataOrLanguage?: BirthData | Language,
  language?: Language,
): {
  chartId: ChartId;
  data: BirthData;
  resolvedLanguage?: Language;
} {
  if (typeof chartIdOrData === "string") {
    if (!dataOrLanguage || typeof dataOrLanguage === "string") {
      throw new Error("getExtendedChart requires birth data when a chartId is provided.");
    }

    return {
      chartId: chartIdOrData,
      data: dataOrLanguage,
      resolvedLanguage: language,
    };
  }

  return {
    chartId: "D1",
    data: chartIdOrData,
    resolvedLanguage: typeof dataOrLanguage === "string" ? dataOrLanguage : undefined,
  };
}

function normalizePapasamyamData(data: PapasamyamData): Record<string, unknown> {
  return {
    full_name: data.full_name ?? data.name,
    lat: data.lat,
    year: data.year,
    month: data.month,
    min: data.min,
    hour: data.hour,
    ayanamsha: data.ayanamsha ?? "LAHIRI",
    date: data.date ?? data.day,
    lon: data.lon,
    day: data.day,
    tzone: data.tzone,
  };
}

function resolveVarshaphalYear(data: VarshaphalData): number {
  if (typeof data.varshaphal_year === "number") {
    return data.varshaphal_year;
  }

  if (typeof data.year_count === "number") {
    return data.year + data.year_count;
  }

  return new Date().getUTCFullYear();
}
