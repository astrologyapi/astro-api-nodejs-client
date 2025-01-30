// src/index.js
const AstrologyApiClient = require("./client");
const VedicAPI = require("./apis/vedic");
const WesternAPI = require("./apis/western");

class AstrologyAPI {
  /**
   * @param {Object} config
   * @param {string} config.userId
   * @param {string} config.apiKey
   * @param {string} [config.version="v1"]
   */
  constructor(config) {
    // 1. Validate presence

    if (!config.userId) {
      throw new Error("userId is required.");
    }
    if (!config.apiKey) {
      throw new Error("apiKey is required.");
    }

    // 4. If all validations pass, create the client
    this.client = new AstrologyApiClient(config);

    // 5. Optionally attach a domain-specific module (Vedic or Western)
    this.vedic = new VedicAPI(this.client);
    this.western = new WesternAPI(this.client);
  }

  /**
   * Fallback method to call any endpoint, even if it's not recognized in the plan’s definitions.
   * @param {Object} options
   */
  async customRequest({
    method = "POST",
    endpoint,
    params = {},
    language = "en",
  }) {
    return this.client.request({
      method,
      endpoint,
      params,
      additionalHeaders: { "Accept-Language": language },
    });
  }
}

module.exports = AstrologyAPI;
