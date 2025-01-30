// src/apis/western.js

class WesternAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * "planets/tropical" (POST)
   * @param {Object} params - Required parameters for planets/tropical
   * @param {string} [language] - Optional language parameter
   */
  async getTropicalPlanets(params = {}, language = null) {
    const additionalHeaders = language ? { "Accept-Language": language } : {};
    return this.client.request({
      method: "POST",
      endpoint: "planets/tropical",
      params,
      additionalHeaders,
    });
  }

  /**
   * "house_cusps/tropical" (POST)
   * @param {Object} params - Required parameters for house_cusps/tropical
   * @param {string} [language] - Optional language parameter
   */
  async getHouseCusps(params = {}, language = null) {
    const additionalHeaders = language ? { "Accept-Language": language } : {};
    return this.client.request({
      method: "POST",
      endpoint: "house_cusps/tropical",
      params,
      additionalHeaders,
    });
  }

  /**
   * "synastry_horoscope" (POST)
   * @param {Object} params - Required parameters for synastry_horoscope
   * @param {string} [language] - Optional language parameter
   */
  async getSynastryHoroscope(params = {}, language = null) {
    const additionalHeaders = language ? { "Accept-Language": language } : {};
    return this.client.request({
      method: "POST",
      endpoint: "synastry_horoscope",
      params,
      additionalHeaders,
    });
  }

  /**
   * "sun_sign_prediction/daily/:zodiacName" (GET)
   * @param {string} zodiacName - Zodiac name to replace in the endpoint
   * @param {Object} params - Query parameters
   * @param {string} [language] - Optional language parameter
   */
  async getSunSignPredictionDaily(params = {}, language = null, zodiacName) {
    const endpoint = `sun_sign_prediction/daily/${zodiacName}`;
    const additionalHeaders = language ? { "Accept-Language": language } : {};
    return this.client.request({
      method: "POST",
      endpoint,
      params,
      additionalHeaders,
    });
  }

  /**
   * "horoscope_prediction/monthly/:zodiacName" (GET)
   * @param {string} zodiacName - Zodiac name to replace in the endpoint
   * @param {Object} params - Query parameters
   * @param {string} [language] - Optional language parameter
   */
  async getMonthlyHoroscopePrediction(
    params = {},
    language = null,
    zodiacName
  ) {
    const endpoint = `horoscope_prediction/monthly/${zodiacName}`;
    const additionalHeaders = language ? { "Accept-Language": language } : {};
    return this.client.request({
      method: "POST",
      endpoint,
      params,
      additionalHeaders,
    });
  }

  /**
   * natal_wheel_chart  (POST)
   * @param {Object} params - Query parameters
   */
  async getNatalWheelChart(params = {}) {
    return this.client.request({
      method: "POST",
      endpoint: "natal_wheel_chart",
      params,
    });
  }
}

module.exports = WesternAPI;
