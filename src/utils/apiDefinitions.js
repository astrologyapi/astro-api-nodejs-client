module.exports = {
  vedic: {
    basic: [
      "birth_details",
      "astro_details",
      "planets",
      "ghat_chakra",
      "horo_chart/D1",
      "horo_chart_image/D1",
      "horo_chart/D9",
      "horo_chart_image/D9",
      "current_vdasha",
      "kalsarpa_details",
      "numero_table",
      "basic_panchang",
      "general_ascendant_report",
      "geo_details",
      "timezone",
    ],
    professional: [
      "basic_panchang",
      "advanced_panchang",
      "hora_muhurta",
      "match_birth_details",
      "match_ashtakoot_points",
      "match_obstructions",
      "match_astro_details",
      "match_planet_details",
      "match_manglik_report",
      "match_dashakoot_points",
      "birth_details",
      "astro_details",
      "planets",
      "ayanamsha",
      "ghat_chakra",
      "planet_ashtak/:planet_name",
      "horo_chart/:chartId",
      "horo_chart_image/:chartId",
      "kalsarpa_details",
      "manglik",
      "sadhesati_current_status",
      "basic_gem_suggestion",
      "numero_table",
      "numero_report",
      "daily_nakshatra_prediction",
      "general_house_report/:planet_name",
      "general_rashi_report/:planet_name",
      "general_ascendant_report",
      "major_vdasha",
      "current_vdasha",
      "current_chardasha",
      "current_yogini_dasha",
      "geo_details",
      "timezone_with_dst",
      "timezone",
    ],
    premium: [
      "lalkitab_horoscope",
      "lalkitab_debts",
      "lalkitab_remedies/:planet_name",
      "lalkitab_houses",
      "lalkitab_planets",
      "varshaphal_year_chart",
      "varshaphal_month_chart",
      "varshaphal_details",
      "varshaphal_planets",
      "varshaphal_muntha",
      "varshaphal_mudda_dasha",
      "varshaphal_panchavargeeya_bala",
      "varshaphal_harsha_bala",
      "varshaphal_saham_points",
      "varshaphal_yoga",
      "kp_planets",
      "kp_house_cusps",
      "kp_birth_chart",
      "kp_house_significator",
      "kp_planet_significator",
      "basic_panchang",
      "advanced_panchang",
      "hora_muhurta",
      "chaughadiya_muhurta",
      "planet_ashtak/:planet_name",
      "sarvashtak",
      "match_birth_details",
      "match_ashtakoot_points",
      "match_obstructions",
      "match_astro_details",
      "match_planet_details",
      "match_manglik_report",
      "match_dashakoot_points",
      "papasamyam_details",
      "match_making_detailed_report",
      "match_simple_report",
      "birth_details",
      "astro_details",
      "planets",
      "ayanamsha",
      "ghat_chakra",
      "horo_chart/:chartId",
      "horo_chart_image/:chartId",
      "kalsarpa_details",
      "manglik",
      "sadhesati_current_status",
      "sadhesati_life_details",
      "pitra_dosha_report",
      "basic_gem_suggestion",
      "rudraksha_suggestion",
      "numero_table",
      "numero_report",
      "numero_prediction/daily",
      "daily_nakshatra_prediction",
      "general_house_report/:planet_name",
      "general_rashi_report/:planet_name",
      "general_ascendant_report",
      "major_vdasha",
      "current_vdasha_date",
      "current_vdasha",
      "current_vdasha_all",
      "sub_vdasha/:md",
      "sub_sub_vdasha/:md/:ad",
      "sub_sub_sub_vdasha/:md/:ad/:pd",
      "sub_sub_sub_sub_vdasha/:md/:ad/:pd/:sd",
      "current_chardasha",
      "major_chardasha",
      "sub_chardasha/:rashi",
      "sub_sub_chardasha",
      "major_yogini_dasha",
      "sub_yogini_dasha/:dashaCycle/:dashaName",
      "sub_yogini_dasha",
      "current_yogini_dasha",
      "geo_details",
      "timezone_with_dst",
      "timezone",
      "",
    ],
  },

  western: {
    starter: [
      "planets/tropical",
      "house_cusps/tropical",
      "western_horoscope",
      "natal_wheel_chart",
      "moon_phase_report",
      "geo_details",
      "timezone_with_dst",
      "timezone",
    ],
    growth: [
      "western_chart_data",
      "general_sign_report/tropical/:planetName",
      "general_house_report/tropical/:planetName",
      "personality_report/tropical",
      "romantic_personality_report/tropical",
      "friendship_report\n",
      "karma_destiny_report\n",
      "synastry_horoscope",
      "tarot_predictions",
      "yes_no_tarot",
      "planets/tropical",
      "house_cusps/tropical",
      "natal_wheel_chart",
      "moon_phase_report",
      "geo_details",
      "timezone_with_dst",
      "timezone",
      "zodiac_compatibility/:zodiacName/:partnerZodiacName",
      " lunar_metrics",
      " numerological_numbers",
      "lifepath_number",
      "personality_number",
      "expression_number",
      "soul_urge_number",
      "challenge_numbers",
      "sub_conscious_self_number",
      "",
    ],
    business: [
      "sun_sign_prediction/daily/:zodiacName",
      "sun_sign_prediction/daily/next/:zodiacName",
      "sun_sign_prediction/daily/previous/:zodiacName",
      "sun_sign_consolidated/daily/:zodiacName",
      "horoscope_prediction/monthly/:zodiacName",
      "solar_return_details",
      "solar_return_planets",
      "solar_return_house_cusps",
      "solar_return_planet_report",
      "solar_return_planet_aspects",
      "solar_return_aspects_report",
      "composite_horoscope",
      "romantic_forecast_report/tropical",
      "synastry_horoscope",
      "tropical_transits/monthly",
      "tropical_transits/daily",
      "tropical_transits/weekly",
      "life_forecast_report/tropical",
      "custom_transits/daily",
      "natal_transits/daily",
      "natal_transits/weekly",
      "tarot_predictions",
      "yes_no_tarot",
      "western_chart_data",
      "general_sign_report/tropical/:planetName",
      "general_house_report/tropical/:planetName",
      "personality_report/tropical",
      "romantic_personality_report/tropical",
      "friendship_report\n",
      "karma_destiny_report\n",
      "planets/tropical",
      "house_cusps/tropical",
      "western_horoscope",
      "natal_wheel_chart",
      "moon_phase_report",
      "geo_details",
      "timezone_with_dst",
      "timezone",
      "zodiac_compatibility/:zodiacName/:partnerZodiacName",
      " lunar_metrics",
      " numerological_numbers",
      "lifepath_number",
      "personality_number",
      "expression_number",
      "soul_urge_number",
      "challenge_numbers",
      "sub_conscious_self_number",
      "chinese_zodiac",
      "chinese_year_forecast",
      "premium_plan_api",
      "",
    ],
  },
};
