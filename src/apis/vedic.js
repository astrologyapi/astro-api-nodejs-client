// src/apis/vedic.js

class VedicAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * "birth_details" (POST)
   * @param {Object} params - Required parameters for birth_details
   * @param {string} [language] - Optional language parameter
   */
  async getBirthDetails(params = {}, language = null) {
    const additionalHeaders = language ? { "Accept-Language": language } : {};
    return this.client.request({
      method: "POST",
      endpoint: "birth_details",
      params,
      additionalHeaders,
    });
  }

  /**
   * "astro_details" (POST)
   * @param {Object} params - Required parameters for astro_details
   * @param {string} [language] - Optional language parameter
   */
  async getAstroDetails(params = {}, language = null) {
    const additionalHeaders = language ? { "Accept-Language": language } : {};
    return this.client.request({
      method: "POST",
      endpoint: "astro_details",
      params,
      additionalHeaders,
    });
  }

  /**
   * "planets" (POST)
   * @param {Object} params - Required parameters for planets
   * @param {string} [language] - Optional language parameter
   */
  async getPlanets(params = {}, language = null) {
    const additionalHeaders = language ? { "Accept-Language": language } : {};
    return this.client.request({
      method: "POST",
      endpoint: "planets",
      params,
      additionalHeaders,
    });
  }

  /**
   * "horo_chart/D1" (POST)
   * @param {Object} params - Required parameters for horo_chart/D1
   * @param {string} [language] - Optional language parameter
   */
  async getHoroChartD1(params = {}, language = null) {
    const additionalHeaders = language ? { "Accept-Language": language } : {};
    return this.client.request({
      method: "POST",
      endpoint: "horo_chart/D1",
      params,
      additionalHeaders,
    });
  }

  /**
   * "lalkitab_horoscope" (POST)
   * @param {Object} params - Required parameters for lalkitab_horoscope
   * @param {string} [language] - Optional language parameter
   */
  async getLalKitabHoroscope(params = {}, language = null) {
    const additionalHeaders = language ? { "Accept-Language": language } : {};
    return this.client.request({
      method: "POST",
      endpoint: "lalkitab_horoscope",
      params,
      additionalHeaders,
    });
  }

  /**
   * "basic_horoscope_pdf" (POST)
   * @param {Object} params - Required parameters for basic_horoscope_pdf
   * @param {string} [language] - Optional language parameter
   */
  async getBasicHoroscopePDF(params = {}) {
    return this.client.request({
      method: "POST",
      endpoint: "basic_horoscope_pdf",
      params,
    });
  }
}

module.exports = VedicAPI;
